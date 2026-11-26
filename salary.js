/**
 * Azad SEO All-In-One Web Suite - Salary & Commission Module (salary.js)
 * Enhanced Multi-Staff Attendance System:
 * - Dynamic single or multi-person attendance tracking (e.g. Harris Irfan vs. Mehrooz & Zain)
 * - Individual person attendance controls with live color coding
 * - Per-member KPI metrics and attendance summaries
 * - Official A4 Salary Slip with separate staff attendance breakdowns and individual signature lines
 * - Robust PDF generation with Base64 brand assets and native print fallback
 */

let salaryUsers = [];
let selectedUserId = null;
let currentSalaryYear = new Date().getFullYear();
let currentSalaryMonth = new Date().getMonth() + 1; // 1-12
let currentMonthEntries = {}; // day -> entry object
let saveDebounceTimer = null;

// Initialize Salary Module
async function initSalaryModule() {
    await loadSalaryUsers();
    setupSalaryControls();
    await loadMonthData();
}

// Load Employees from DB
async function loadSalaryUsers() {
    salaryUsers = await db.salary_users.toArray();
    if (!salaryUsers || salaryUsers.length === 0) {
        await initDatabase();
        salaryUsers = await db.salary_users.toArray();
    }

    const select = document.getElementById('salary-user-select');
    if (select) {
        select.innerHTML = salaryUsers.map(user => {
            const members = getShiftMembers(user);
            const memberBadge = members.length > 1 ? ` [${members.length} Staff: ${members.join(' & ')}]` : '';
            return `<option value="${user.id}">${escapeHtml(user.name)} (${escapeHtml(user.shift)})${memberBadge}</option>`;
        }).join('');

        if (salaryUsers.length > 0) {
            if (!selectedUserId || !salaryUsers.some(u => u.id === selectedUserId)) {
                selectedUserId = salaryUsers[0].id;
            }
            select.value = selectedUserId;
        }
    }
}

// Setup controls (Month / Year / Employee changes)
function setupSalaryControls() {
    const userSelect = document.getElementById('salary-user-select');
    if (userSelect) {
        userSelect.addEventListener('change', async (e) => {
            selectedUserId = parseInt(e.target.value, 10);
            await loadMonthData();
        });
    }

    const monthSelect = document.getElementById('salary-month-select');
    if (monthSelect) {
        monthSelect.value = currentSalaryMonth;
        monthSelect.addEventListener('change', async (e) => {
            currentSalaryMonth = parseInt(e.target.value, 10);
            await loadMonthData();
        });
    }

    const yearSelect = document.getElementById('salary-year-select');
    if (yearSelect) {
        yearSelect.value = currentSalaryYear;
        yearSelect.addEventListener('change', async (e) => {
            currentSalaryYear = parseInt(e.target.value, 10) || new Date().getFullYear();
            await loadMonthData();
        });
    }

    const baseSalaryInput = document.getElementById('salary-base-input');
    if (baseSalaryInput) {
        baseSalaryInput.addEventListener('input', () => {
            updateSalaryKPIs();
        });
    }
}

// Load month's data from IndexedDB
async function loadMonthData() {
    if (!selectedUserId) return;

    const currentUser = salaryUsers.find(u => u.id === selectedUserId);
    if (currentUser) {
        const baseInput = document.getElementById('salary-base-input');
        if (baseInput && currentUser.base_salary !== undefined) {
            baseInput.value = currentUser.base_salary || 0;
        }
    }

    // Fetch all entries for this user, year, month
    const entries = await db.salary_entries
        .where('user_id')
        .equals(selectedUserId)
        .filter(item => item.year === currentSalaryYear && item.month === currentSalaryMonth)
        .toArray();

    currentMonthEntries = {};
    entries.forEach(entry => {
        currentMonthEntries[entry.day] = entry;
    });

    renderSalaryGrid();
    updateSalaryKPIs();
}

// Get number of days in month
function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

// Render the 1-31 Spreadsheet Grid with Individual Multi-Staff Attendance
function renderSalaryGrid() {
    const tableBody = document.getElementById('salary-grid-body');
    const headerAttendanceCol = document.getElementById('salary-header-attendance-col');
    if (!tableBody) return;

    const currentUser = salaryUsers.find(u => u.id === selectedUserId) || { name: 'Staff', shift: 'All Day' };
    const members = getShiftMembers(currentUser);
    const defaultCommRate = currentUser.commission_rate || 2.0;
    const daysCount = getDaysInMonth(currentSalaryYear, currentSalaryMonth);

    // Update column header title
    if (headerAttendanceCol) {
        if (members.length === 1) {
            headerAttendanceCol.innerHTML = `Attendance <span class="text-sky-600 font-normal">(${escapeHtml(members[0])})</span>`;
        } else {
            headerAttendanceCol.innerHTML = `Staff Attendance <span class="text-sky-600 font-normal">(${members.map(m => escapeHtml(m)).join(' & ')})</span>`;
        }
    }

    let html = '';

    for (let day = 1; day <= daysCount; day++) {
        const dateObj = new Date(currentSalaryYear, currentSalaryMonth - 1, day);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const isWeekend = (dateObj.getDay() === 0 || dateObj.getDay() === 6);

        const entry = currentMonthEntries[day] || {
            sales: 0,
            commission_percent: defaultCommRate,
            advance: 0,
            status: isWeekend ? 'Off' : 'Present',
            attendance: {},
            note: ''
        };

        if (!entry.attendance) entry.attendance = {};

        const sales = parseFloat(entry.sales) || 0;
        const commRate = parseFloat(entry.commission_percent) || defaultCommRate;
        const commAmount = (sales * commRate) / 100;
        const advance = parseFloat(entry.advance) || 0;
        const rowBg = isWeekend ? 'bg-slate-50/70' : 'bg-white';

        // Render Attendance Column based on number of persons in shift
        let attendanceHtml = '';
        if (members.length === 1) {
            // Single person shift
            const singleMember = members[0];
            const currentStatus = entry.attendance[singleMember] || entry.status || (isWeekend ? 'Off' : 'Present');
            const statusColor = getStatusColorClass(currentStatus);

            attendanceHtml = `
                <div class="flex items-center gap-1.5">
                    <select onchange="updateMemberAttendance(${day}, '${escapeHtml(singleMember)}', this.value)" 
                            class="w-full text-xs font-bold px-2 py-1.5 rounded-lg border transition-all ${statusColor}">
                        <option value="Present" ${currentStatus === 'Present' ? 'selected' : ''}>🟢 Present</option>
                        <option value="Absent" ${currentStatus === 'Absent' ? 'selected' : ''}>🔴 Absent</option>
                        <option value="Leave" ${currentStatus === 'Leave' ? 'selected' : ''}>🟡 Leave</option>
                        <option value="Half Day" ${currentStatus === 'Half Day' ? 'selected' : ''}>🔵 Half Day</option>
                        <option value="Off" ${currentStatus === 'Off' ? 'selected' : ''}>⚪ Off Day</option>
                    </select>
                </div>
            `;
        } else {
            // Multi-person shift (e.g. Mehrooz & Zain or 3+ people)
            attendanceHtml = `
                <div class="flex flex-col gap-1.5 py-1">
                    ${members.map(member => {
                        const mStatus = entry.attendance[member] || entry.status || (isWeekend ? 'Off' : 'Present');
                        const statusColor = getStatusColorClass(mStatus);
                        return `
                            <div class="flex items-center justify-between gap-2 p-1.5 rounded-lg border ${statusColor} transition-all">
                                <span class="text-[11px] font-extrabold truncate max-w-[85px] text-slate-800" title="${escapeHtml(member)}">
                                    ${escapeHtml(member)}:
                                </span>
                                <select onchange="updateMemberAttendance(${day}, '${escapeHtml(member)}', this.value)" 
                                        class="text-[11px] font-bold px-2 py-1 rounded bg-white border border-slate-200 shadow-sm focus:ring-1 focus:ring-sky-500">
                                    <option value="Present" ${mStatus === 'Present' ? 'selected' : ''}>Present</option>
                                    <option value="Absent" ${mStatus === 'Absent' ? 'selected' : ''}>Absent</option>
                                    <option value="Leave" ${mStatus === 'Leave' ? 'selected' : ''}>Leave</option>
                                    <option value="Half Day" ${mStatus === 'Half Day' ? 'selected' : ''}>Half Day</option>
                                    <option value="Off" ${mStatus === 'Off' ? 'selected' : ''}>Off Day</option>
                                </select>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        html += `
            <tr class="${rowBg} hover:bg-sky-50/40 transition-colors border-b border-slate-100">
                <td class="text-center font-bold text-slate-700 w-16 sticky-col-day">
                    <span class="inline-block px-2 py-0.5 rounded text-xs font-mono-code ${isWeekend ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}">
                        ${String(day).padStart(2, '0')} ${dayName}
                    </span>
                </td>
                <td class="${members.length > 1 ? 'min-w-[210px]' : 'min-w-[140px]'}">
                    ${attendanceHtml}
                </td>
                <td>
                    <div class="relative">
                        <input type="number" min="0" step="100" value="${sales || ''}" placeholder="0"
                               oninput="updateDailyEntryField(${day}, 'sales', this.value)"
                               class="w-full text-right font-mono-code text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-sky-500">
                        <span class="absolute left-2.5 top-2 text-[10px] text-slate-400 font-semibold pointer-events-none">PKR</span>
                    </div>
                </td>
                <td class="w-24">
                    <div class="relative">
                        <input type="number" min="0" max="100" step="0.5" value="${commRate}"
                               oninput="updateDailyEntryField(${day}, 'commission_percent', this.value)"
                               class="w-full text-center font-mono-code text-xs font-bold px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-sky-500">
                        <span class="absolute right-2 top-2 text-[10px] text-slate-400 font-semibold pointer-events-none">%</span>
                    </div>
                </td>
                <td class="text-right font-mono-code font-bold text-sky-700 text-xs w-32" id="comm-cell-${day}">
                    ${commAmount.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </td>
                <td>
                    <div class="relative">
                        <input type="number" min="0" step="50" value="${advance || ''}" placeholder="0"
                               oninput="updateDailyEntryField(${day}, 'advance', this.value)"
                               class="w-full text-right font-mono-code text-xs font-semibold px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 bg-rose-50/20 focus:ring-1 focus:ring-rose-500">
                        <span class="absolute left-2.5 top-2 text-[10px] text-rose-400 font-semibold pointer-events-none">PKR</span>
                    </div>
                </td>
                <td>
                    <input type="text" value="${escapeHtml(entry.note || '')}" placeholder="Note / Shift memo"
                           oninput="updateDailyEntryField(${day}, 'note', this.value)"
                           class="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-sky-500">
                </td>
            </tr>
        `;
    }

    tableBody.innerHTML = html;
}

// Status Color Helper
function getStatusColorClass(status) {
    switch (status) {
        case 'Present': return 'bg-emerald-50 text-emerald-800 border-emerald-300';
        case 'Absent': return 'bg-rose-50 text-rose-800 border-rose-300';
        case 'Leave': return 'bg-amber-50 text-amber-800 border-amber-300';
        case 'Half Day': return 'bg-sky-50 text-sky-800 border-sky-300';
        case 'Off': return 'bg-slate-100 text-slate-700 border-slate-300';
        default: return 'bg-white text-slate-700 border-slate-200';
    }
}

// Update Individual Member Attendance
function updateMemberAttendance(day, memberName, status) {
    ensureDayEntryExists(day);
    if (!currentMonthEntries[day].attendance) {
        currentMonthEntries[day].attendance = {};
    }
    currentMonthEntries[day].attendance[memberName] = status;

    // Determine overall shift status: if any member is Present/Half Day, shift was active
    const currentUser = salaryUsers.find(u => u.id === selectedUserId);
    const members = getShiftMembers(currentUser);
    const anyPresent = members.some(m => {
        const s = currentMonthEntries[day].attendance[m];
        return s === 'Present' || s === 'Half Day';
    });
    currentMonthEntries[day].status = anyPresent ? 'Present' : status;

    updateSalaryKPIs();
    triggerAutoSave(day);
}

// Ensure day object exists
function ensureDayEntryExists(day) {
    if (!currentMonthEntries[day]) {
        const currentUser = salaryUsers.find(u => u.id === selectedUserId);
        const defaultCommRate = currentUser?.commission_rate || 2.0;
        currentMonthEntries[day] = {
            day: day,
            user_id: selectedUserId,
            year: currentSalaryYear,
            month: currentSalaryMonth,
            sales: 0,
            commission_percent: defaultCommRate,
            advance: 0,
            status: 'Present',
            attendance: {},
            note: ''
        };
    }
}

// Update single entry field (sales, advance, etc.)
function updateDailyEntryField(day, field, value) {
    ensureDayEntryExists(day);

    if (field === 'sales' || field === 'commission_percent' || field === 'advance') {
        currentMonthEntries[day][field] = parseFloat(value) || 0;
    } else {
        currentMonthEntries[day][field] = value;
    }

    // Recalculate row commission cell
    const sales = currentMonthEntries[day].sales || 0;
    const commRate = currentMonthEntries[day].commission_percent || 0;
    const commAmount = (sales * commRate) / 100;
    
    const commCell = document.getElementById(`comm-cell-${day}`);
    if (commCell) {
        commCell.innerText = commAmount.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }

    updateSalaryKPIs();
    triggerAutoSave(day);
}

// Debounced Autosave to Dexie IndexedDB
function triggerAutoSave(day) {
    const badge = document.getElementById('salary-autosave-badge');
    if (badge) {
        badge.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-amber-500"></i> Saving...';
    }

    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(async () => {
        try {
            const entry = currentMonthEntries[day];
            entry.day = day;
            entry.user_id = selectedUserId;
            entry.year = currentSalaryYear;
            entry.month = currentSalaryMonth;

            const existing = await db.salary_entries
                .where('user_id')
                .equals(selectedUserId)
                .filter(item => item.year === currentSalaryYear && item.month === currentSalaryMonth && item.day === day)
                .first();

            if (existing) {
                await db.salary_entries.update(existing.id, entry);
            } else {
                await db.salary_entries.add(entry);
            }

            // Trigger debounced cloud synchronization to GitHub repository
            if (window.GitHubLiveDB?.triggerAutoSync) {
                window.GitHubLiveDB.triggerAutoSync('Salary attendance updated');
            }

            if (badge) {
                badge.innerHTML = '<i class="fa-solid fa-cloud-check text-emerald-500"></i> Auto-saved';
                badge.classList.add('save-pulse');
                setTimeout(() => badge.classList.remove('save-pulse'), 500);
            }
        } catch (err) {
            console.error('Error autosaving salary entry:', err);
            if (badge) {
                badge.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-rose-500"></i> Save Error';
            }
        }
    }, 350);
}

// Calculate Member Attendance Statistics
function getMemberAttendanceStats(currentUser, daysCount) {
    const members = getShiftMembers(currentUser);
    const stats = {};
    members.forEach(m => {
        stats[m] = { present: 0, absent: 0, leave: 0, halfDay: 0, off: 0 };
    });

    for (let day = 1; day <= daysCount; day++) {
        const entry = currentMonthEntries[day];
        members.forEach(m => {
            let st = (entry && entry.attendance && entry.attendance[m]) ? entry.attendance[m] : (entry ? entry.status : null);
            if (!st) {
                const dateObj = new Date(currentSalaryYear, currentSalaryMonth - 1, day);
                st = (dateObj.getDay() === 0 || dateObj.getDay() === 6) ? 'Off' : 'Present';
            }
            if (st === 'Present') stats[m].present++;
            else if (st === 'Absent') stats[m].absent++;
            else if (st === 'Leave') stats[m].leave++;
            else if (st === 'Half Day') { stats[m].halfDay++; stats[m].present += 0.5; }
            else if (st === 'Off') stats[m].off++;
        });
    }

    return stats;
}

// Update KPI cards and calculations
function updateSalaryKPIs() {
    let totalSales = 0;
    let totalCommission = 0;
    let totalAdvance = 0;
    let daysWithSales = 0;

    const daysCount = getDaysInMonth(currentSalaryYear, currentSalaryMonth);
    const currentUser = salaryUsers.find(u => u.id === selectedUserId) || { name: 'Staff' };
    const members = getShiftMembers(currentUser);
    const stats = getMemberAttendanceStats(currentUser, daysCount);

    for (let day = 1; day <= daysCount; day++) {
        const entry = currentMonthEntries[day];
        if (entry) {
            const sales = parseFloat(entry.sales) || 0;
            const commRate = parseFloat(entry.commission_percent) || 0;
            const advance = parseFloat(entry.advance) || 0;

            totalSales += sales;
            totalCommission += (sales * commRate) / 100;
            totalAdvance += advance;

            if (sales > 0) daysWithSales++;
        }
    }

    const baseInput = document.getElementById('salary-base-input');
    const baseSalary = baseInput ? (parseFloat(baseInput.value) || 0) : 0;
    const netPayable = Math.max(0, (baseSalary + totalCommission) - totalAdvance);
    const avgDailySales = daysWithSales > 0 ? (totalSales / daysWithSales) : 0;

    const setElem = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    };

    setElem('kpi-total-sales', `${Math.round(totalSales).toLocaleString()} PKR`);
    setElem('kpi-total-commission', `${Math.round(totalCommission).toLocaleString()} PKR`);
    setElem('kpi-total-advance', `-${Math.round(totalAdvance).toLocaleString()} PKR`);
    setElem('kpi-net-payable', `${Math.round(netPayable).toLocaleString()} PKR`);
    setElem('kpi-avg-sales', `${Math.round(avgDailySales).toLocaleString()} PKR`);

    // Dynamic Attendance KPI rendering
    const attendanceKpiEl = document.getElementById('kpi-days-present');
    if (attendanceKpiEl) {
        if (members.length === 1) {
            const m = members[0];
            attendanceKpiEl.innerHTML = `
                <span class="text-emerald-700 font-extrabold">${stats[m].present}</span> / ${daysCount} Days
                <span class="block text-[10px] font-bold text-slate-400 mt-0.5">(${stats[m].absent} Absent, ${stats[m].leave} Leave)</span>
            `;
        } else {
            attendanceKpiEl.innerHTML = members.map(m => `
                <div class="text-[11px] leading-tight mb-1 flex items-center justify-between border-b border-slate-100 pb-0.5 last:border-none">
                    <span class="font-extrabold text-slate-800">${escapeHtml(m)}:</span>
                    <span class="font-mono-code text-emerald-700 font-bold ml-1">${stats[m].present}P <span class="text-rose-500 font-normal">(${stats[m].absent}A)</span></span>
                </div>
            `).join('');
        }
    }
}

// Open Printable Salary Statement Slip Modal
function openSalarySlipModal() {
    const currentUser = salaryUsers.find(u => u.id === selectedUserId) || { name: 'Staff', shift: 'All Day' };
    const members = getShiftMembers(currentUser);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthTitle = `${monthNames[currentSalaryMonth - 1]} ${currentSalaryYear}`;
    const daysCount = getDaysInMonth(currentSalaryYear, currentSalaryMonth);
    const stats = getMemberAttendanceStats(currentUser, daysCount);

    let totalSales = 0;
    let totalCommission = 0;
    let totalAdvance = 0;

    let rowsHtml = '';
    for (let day = 1; day <= daysCount; day++) {
        const entry = currentMonthEntries[day];
        if (entry && (entry.sales > 0 || entry.advance > 0 || entry.status !== 'Off' || Object.keys(entry.attendance || {}).length > 0)) {
            const sales = parseFloat(entry.sales) || 0;
            const commRate = parseFloat(entry.commission_percent) || 2.0;
            const commAmount = (sales * commRate) / 100;
            const advance = parseFloat(entry.advance) || 0;

            totalSales += sales;
            totalCommission += commAmount;
            totalAdvance += advance;

            // Attendance column formatting
            let attDisplay = '';
            if (members.length === 1) {
                const s = (entry.attendance && entry.attendance[members[0]]) || entry.status || 'Present';
                attDisplay = `<span class="font-bold ${s === 'Present' ? 'text-emerald-700' : (s === 'Absent' ? 'text-rose-600' : 'text-slate-600')}">${s}</span>`;
            } else {
                attDisplay = members.map(m => {
                    const s = (entry.attendance && entry.attendance[m]) || entry.status || 'Present';
                    const color = s === 'Present' ? 'text-emerald-700 font-bold' : (s === 'Absent' ? 'text-rose-600 font-bold' : 'text-slate-600');
                    return `<span class="inline-block mr-2">${escapeHtml(m)}: <span class="${color}">${s}</span></span>`;
                }).join(' | ');
            }

            rowsHtml += `
                <tr class="border-b border-slate-200 text-xs">
                    <td class="py-1.5 px-2 text-center font-bold font-mono">${day}</td>
                    <td class="py-1.5 px-2">${attDisplay}</td>
                    <td class="py-1.5 px-2 text-right font-mono">${sales > 0 ? sales.toLocaleString() : '-'}</td>
                    <td class="py-1.5 px-2 text-center font-mono">${commRate}%</td>
                    <td class="py-1.5 px-2 text-right font-mono font-bold">${commAmount > 0 ? Math.round(commAmount).toLocaleString() : '-'}</td>
                    <td class="py-1.5 px-2 text-right font-mono text-rose-600">${advance > 0 ? advance.toLocaleString() : '-'}</td>
                    <td class="py-1.5 px-2 text-slate-500 truncate max-w-[130px]">${escapeHtml(entry.note || '')}</td>
                </tr>
            `;
        }
    }

    const baseInput = document.getElementById('salary-base-input');
    const baseSalary = baseInput ? (parseFloat(baseInput.value) || 0) : 0;
    const netPayable = Math.max(0, (baseSalary + totalCommission) - totalAdvance);

    const container = document.getElementById('salary-slip-content');
    if (!container) return;

    // Use embedded Base64 logo to prevent any canvas tainting/CORS error
    const logoSrc = (typeof AZAD_LOGO_B64 !== 'undefined') ? AZAD_LOGO_B64 : 'logo.png';

    container.innerHTML = `
        <div id="salary-statement-sheet" class="a4-sheet p-8 font-sans">
            <!-- Header -->
            <div class="flex items-center justify-between border-b-2 border-sky-600 pb-4 mb-5">
                <div class="flex items-center gap-3">
                    <img src="${logoSrc}" alt="Azad SEO" class="h-12 w-auto object-contain">
                    <div>
                        <h2 class="text-xl font-extrabold text-slate-900 tracking-tight">AZAD SEO</h2>
                        <p class="text-xs text-slate-500 font-medium">Digital Marketing & SEO Solutions</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="inline-block px-3 py-1 rounded bg-sky-100 text-sky-800 text-xs font-black uppercase tracking-wider">Official Salary Statement</span>
                    <p class="text-xs font-mono font-bold text-slate-700 mt-1">Period: ${monthTitle}</p>
                </div>
            </div>

            <!-- Employee & Shift Staff Breakdown Meta -->
            <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5 text-xs">
                <div>
                    <p class="text-slate-400 font-bold uppercase text-[10px]">Shift & Assigned Staff:</p>
                    <p class="font-black text-slate-800 text-sm mt-0.5">${escapeHtml(currentUser.name)}</p>
                    <p class="text-slate-600 font-semibold mt-1">Hours: <span class="font-bold text-slate-800">${escapeHtml(currentUser.shift)}</span></p>
                </div>
                <div class="text-right">
                    <p class="text-slate-400 font-bold uppercase text-[10px]">Statement Date:</p>
                    <p class="font-semibold text-slate-700 mt-0.5">${new Date().toLocaleDateString('en-GB')}</p>
                    <p class="text-slate-400 font-bold uppercase text-[10px] mt-1">Month Duration:</p>
                    <p class="font-bold text-slate-800">${daysCount} Calendar Days</p>
                </div>

                <!-- Per-Staff Attendance Summary Cards -->
                <div class="col-span-2 pt-2 border-t border-slate-200">
                    <p class="text-slate-500 font-bold uppercase text-[10px] mb-1.5">Staff Duty & Attendance Records:</p>
                    <div class="grid grid-cols-1 sm:grid-cols-${members.length > 1 ? 2 : 1} gap-2">
                        ${members.map(m => `
                            <div class="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                                <span class="font-extrabold text-slate-800 text-xs">${escapeHtml(m)}</span>
                                <div class="flex items-center gap-2 font-mono text-[11px]">
                                    <span class="text-emerald-700 font-bold">${stats[m].present} Present</span>
                                    <span class="text-rose-600 font-bold">${stats[m].absent} Absent</span>
                                    <span class="text-amber-600 font-semibold">${stats[m].leave} Leave</span>
                                    <span class="text-slate-400">${stats[m].off} Off</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Detailed Monthly Log Table -->
            <h4 class="font-bold text-slate-800 text-xs mb-2 uppercase tracking-wider">Detailed Shift Log & Commission Register</h4>
            <div class="border border-slate-200 rounded-lg overflow-hidden mb-5">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-100 text-[11px] text-slate-600 font-bold border-b border-slate-200">
                            <th class="py-1.5 px-2 text-center w-10">Day</th>
                            <th class="py-1.5 px-2">Attendance Status</th>
                            <th class="py-1.5 px-2 text-right">Sales (PKR)</th>
                            <th class="py-1.5 px-2 text-center">Comm %</th>
                            <th class="py-1.5 px-2 text-right">Commission</th>
                            <th class="py-1.5 px-2 text-right">Advance</th>
                            <th class="py-1.5 px-2">Shift Remarks</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        ${rowsHtml || '<tr><td colspan="7" class="text-center py-4 text-slate-400">No activity recorded for this period</td></tr>'}
                    </tbody>
                </table>
            </div>

            <!-- Financial Calculation Box -->
            <div class="flex justify-end mb-6">
                <div class="w-80 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div class="flex justify-between">
                        <span class="text-slate-600 font-medium">Total Shift Sales:</span>
                        <span class="font-mono font-bold text-slate-800">${Math.round(totalSales).toLocaleString()} PKR</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-600 font-medium">Base Salary:</span>
                        <span class="font-mono font-bold text-slate-800">${Math.round(baseSalary).toLocaleString()} PKR</span>
                    </div>
                    <div class="flex justify-between text-sky-700 font-semibold">
                        <span>Sales Commission:</span>
                        <span class="font-mono font-bold">+${Math.round(totalCommission).toLocaleString()} PKR</span>
                    </div>
                    <div class="flex justify-between text-rose-600 font-semibold">
                        <span>Total Advance / Deductions:</span>
                        <span class="font-mono font-bold">-${Math.round(totalAdvance).toLocaleString()} PKR</span>
                    </div>
                    <div class="border-t-2 border-slate-300 pt-2 flex justify-between items-baseline font-bold text-slate-900">
                        <span class="text-sm">Net Payable Amount:</span>
                        <span class="text-base font-black text-sky-700">${Math.round(netPayable).toLocaleString()} PKR</span>
                    </div>
                </div>
            </div>

            <!-- Signatures: Accommodates Both Accounts, Manager, and Each Individual Staff Member -->
            <div class="grid grid-cols-${2 + members.length} gap-4 pt-6 border-t border-slate-200 text-center text-xs">
                <div>
                    <div class="border-b border-slate-300 pb-1 mb-2"></div>
                    <p class="font-semibold text-slate-700">Prepared By</p>
                    <p class="text-[10px] text-slate-400">Accounts Department</p>
                </div>
                <div>
                    <div class="border-b border-slate-300 pb-1 mb-2"></div>
                    <p class="font-semibold text-slate-700">Approved By</p>
                    <p class="text-[10px] text-slate-400">Operations Manager</p>
                </div>
                ${members.map(m => `
                    <div>
                        <div class="border-b border-slate-300 pb-1 mb-2"></div>
                        <p class="font-semibold text-slate-700">${escapeHtml(m)}</p>
                        <p class="text-[10px] text-slate-400">Staff Signature</p>
                    </div>
                `).join('')}
            </div>

            <!-- Footer -->
            <div class="mt-6 text-center text-[10px] text-slate-400">
                © Copyrights Azad Seo 2026. Confidential Document generated by Azad SEO All-in-One Suite.
            </div>
        </div>
    `;

    document.getElementById('salary-slip-modal').classList.remove('hidden');
}

// Universal High-Reliability PDF Download Function
async function downloadSalarySlipPDF() {
    const currentUser = salaryUsers.find(u => u.id === selectedUserId) || { name: 'Staff' };
    const cleanName = currentUser.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Salary_Slip_${cleanName}_${currentSalaryMonth}_${currentSalaryYear}.pdf`;

    await generateAndSavePDF('salary-statement-sheet', filename);
}

// Export Month Data to CSV
function exportSalaryCSV() {
    const currentUser = salaryUsers.find(u => u.id === selectedUserId) || { name: 'Staff' };
    const members = getShiftMembers(currentUser);
    const daysCount = getDaysInMonth(currentSalaryYear, currentSalaryMonth);

    let csv = `Day,Staff_Attendance,Sales_PKR,Commission_Percent,Commission_Amount_PKR,Advance_PKR,Notes\n`;

    for (let day = 1; day <= daysCount; day++) {
        const entry = currentMonthEntries[day] || {};
        const sales = parseFloat(entry.sales) || 0;
        const commRate = parseFloat(entry.commission_percent) || 2.0;
        const commAmount = (sales * commRate) / 100;
        const advance = parseFloat(entry.advance) || 0;
        const note = (entry.note || '').replace(/"/g, '""');

        let attStr = '';
        if (members.length === 1) {
            attStr = (entry.attendance && entry.attendance[members[0]]) || entry.status || 'Present';
        } else {
            attStr = members.map(m => `${m}: ${(entry.attendance && entry.attendance[m]) || entry.status || 'Present'}`).join('; ');
        }

        csv += `${day},"${attStr}",${sales},${commRate},${commAmount.toFixed(1)},${advance},"${note}"\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Salary_${currentUser.name.replace(/\s+/g, '_')}_${currentSalaryMonth}_${currentSalaryYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported Month Sales & Attendance to CSV', 'success');
}
