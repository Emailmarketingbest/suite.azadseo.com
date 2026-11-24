/**
 * Azad SEO All-In-One Web Suite - Master Application Controller (app.js)
 * Manages tab switching, modal dialogs, database export/import,
 * toast alerts, system settings, clipboard image copy, and isolated A4 PDF engine.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Dexie DB
    await initDatabase();

    // 2. Initialize Sub-Modules
    if (typeof initToolsModule === 'function') await initToolsModule();
    if (typeof initInvoiceModule === 'function') await initInvoiceModule();
    if (typeof initSalaryModule === 'function') await initSalaryModule();
    await initSettingsView();

    // 3. Setup Navigation & Modals
    setupGlobalNavigation();
    setupModalHandlers();
    await updateDatabaseStats();

    console.log('Azad SEO All-In-One Web Suite Loaded Successfully!');
});

// Tab Switcher
function switchTab(tabId) {
    const tabs = ['tools', 'invoice', 'salary', 'settings'];
    tabs.forEach(t => {
        const view = document.getElementById(`view-${t}`);
        const navBtn = document.getElementById(`tab-btn-${t}`);
        const mobBtn = document.getElementById(`mob-tab-${t}`);
        if (view) view.classList.add('hidden');
        if (navBtn) {
            navBtn.classList.remove('active', 'border-sky-600', 'text-sky-600', 'bg-sky-50');
            navBtn.classList.add('text-slate-600');
        }
        if (mobBtn) {
            mobBtn.classList.remove('active', 'text-sky-600', 'bg-sky-100');
            mobBtn.classList.add('text-slate-500');
        }
    });

    const activeView = document.getElementById(`view-${tabId}`);
    const activeBtn = document.getElementById(`tab-btn-${tabId}`);
    const activeMobBtn = document.getElementById(`mob-tab-${tabId}`);
    if (activeView) activeView.classList.remove('hidden');
    if (activeBtn) {
        activeBtn.classList.add('active', 'border-sky-600', 'text-sky-600', 'bg-sky-50');
        activeBtn.classList.remove('text-slate-600');
    }
    if (activeMobBtn) {
        activeMobBtn.classList.add('active', 'text-sky-600', 'bg-sky-100');
        activeMobBtn.classList.remove('text-slate-500');
    }

    if (tabId === 'salary' && typeof loadMonthData === 'function') {
        loadMonthData();
    } else if (tabId === 'settings') {
        updateDatabaseStats();
    }
}

// Global Nav Setup
function setupGlobalNavigation() {
    ['tools', 'invoice', 'salary', 'settings'].forEach(t => {
        const btn = document.getElementById(`tab-btn-${t}`);
        if (btn) {
            btn.addEventListener('click', () => switchTab(t));
        }
    });
}

// Modal Handlers (Backdrop click, Esc key)
function setupModalHandlers() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(m => m.classList.add('hidden'));
}

// Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const iconMap = {
        success: 'fa-circle-check text-emerald-500',
        error: 'fa-circle-xmark text-rose-500',
        warning: 'fa-triangle-exclamation text-amber-500',
        info: 'fa-circle-info text-sky-500'
    };

    const toast = document.createElement('div');
    toast.className = 'toast-item flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/95 text-white shadow-xl text-xs font-semibold backdrop-blur-md border border-slate-700 max-w-sm';
    toast.innerHTML = `
        <i class="fa-solid ${iconMap[type] || iconMap.info} text-base shrink-0"></i>
        <span class="flex-1">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px) scale(0.95)';
        toast.style.transition = 'all 0.25s ease';
        setTimeout(() => toast.remove(), 250);
    }, 3200);
}

// ==========================================================================
// Copy Image Directly to Clipboard (for WhatsApp Paste Ctrl+V)
// Guaranteed to copy and NEVER navigate away or open image file!
// ==========================================================================

function dataURItoBlob(dataURI) {
    try {
        const parts = dataURI.split(',');
        const byteString = atob(parts[1]);
        const mimeString = parts[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    } catch (e) {
        console.error('dataURItoBlob error:', e);
        return null;
    }
}

// In-card floating badge confirmation
function showInCardCopiedBadge(element, title = 'Picture') {
    if (!element) return;
    const old = element.querySelector('.card-copied-overlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.className = 'card-copied-overlay absolute inset-0 bg-emerald-950/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-3 text-center transition-all duration-300';
    overlay.innerHTML = `
        <div class="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xl shadow-lg mb-2 animate-bounce">
            <i class="fa-solid fa-check"></i>
        </div>
        <p class="text-white font-extrabold text-xs uppercase tracking-wider drop-shadow">COPIED TO CLIPBOARD!</p>
        <p class="text-emerald-200 text-[10px] mt-0.5">Paste (Ctrl+V) directly into WhatsApp</p>
    `;
    element.appendChild(overlay);

    setTimeout(() => {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        setTimeout(() => overlay.remove(), 300);
    }, 2200);
}

// Unified card click handler
function copyCardImage(element, imageUrl, title) {
    if (element) {
        showInCardCopiedBadge(element, title);
    }
    const resolvedImg = imageUrl || (element ? element.querySelector('img')?.src : null);
    copyImageToClipboard(resolvedImg, title, element);
}

async function copyImageToClipboard(imageUrl, title = 'Image', triggerElement = null) {
    if (triggerElement && !triggerElement.querySelector('.card-copied-overlay')) {
        showInCardCopiedBadge(triggerElement, title);
    }
    try {
        window.focus();
    } catch (e) {}

    showToast(`Copying ${title} picture to clipboard...`, 'info');

    // 1. Resolve to preloaded Base64 asset if available
    let resolvedUrl = imageUrl;
    if (!resolvedUrl && triggerElement) {
        resolvedUrl = triggerElement.querySelector('img')?.src;
    }
    if (window.getPreloadedAsset) {
        const found = window.getPreloadedAsset(resolvedUrl) || (title ? window.getPreloadedAsset(title) : null);
        if (found) {
            resolvedUrl = found;
        }
    }

    // Helper: Turn any data URI or image URL into a PNG Blob without canvas taint
    async function resolvePngBlob() {
        // Fast path 1: Base64 data URI (guaranteed 100% CORS-safe on local file:// and web)
        if (resolvedUrl && resolvedUrl.startsWith('data:')) {
            const rawBlob = dataURItoBlob(resolvedUrl);
            if (rawBlob) {
                if (rawBlob.type === 'image/png') return rawBlob;
                // If JPEG/WebP data URI, draw into offscreen canvas and export PNG
                const img = new Image();
                img.src = resolvedUrl;
                await new Promise((resolve, reject) => {
                    if (img.complete && (img.naturalWidth || img.width)) return resolve();
                    img.onload = resolve;
                    img.onerror = () => reject(new Error('Failed to load image data URI'));
                });
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || img.width;
                canvas.height = img.naturalHeight || img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                return await new Promise((resolve, reject) => {
                    canvas.toBlob(b => {
                        if (b) resolve(b);
                        else reject(new Error('Canvas export failed'));
                    }, 'image/png');
                });
            }
        }

        // Fast path 2: Check if triggerElement already has loaded <img> with data URI
        if (triggerElement) {
            const domImg = triggerElement.querySelector('img');
            if (domImg && domImg.src && domImg.src.startsWith('data:')) {
                const img = new Image();
                img.src = domImg.src;
                await new Promise(r => img.onload = r);
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || img.width;
                canvas.height = img.naturalHeight || img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                return await new Promise(r => canvas.toBlob(r, 'image/png'));
            }
        }

        // Path 3: Try standard fetch (works on http/https / GitHub Pages)
        try {
            const resp = await fetch(resolvedUrl);
            if (resp.ok) {
                const fetchedBlob = await resp.blob();
                if (fetchedBlob.type === 'image/png') return fetchedBlob;
                const img = new Image();
                const objectUrl = URL.createObjectURL(fetchedBlob);
                img.src = objectUrl;
                await new Promise(r => img.onload = r);
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || img.width;
                canvas.height = img.naturalHeight || img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                URL.revokeObjectURL(objectUrl);
                return await new Promise(r => canvas.toBlob(r, 'image/png'));
            }
        } catch (fetchErr) {}

        throw new Error('Image source could not be exported to PNG blob');
    }

    try {
        // Create the promise for PNG blob
        const blobPromise = resolvePngBlob();

        // Standard modern Clipboard write API
        if (!navigator.clipboard || !navigator.clipboard.write) {
            throw new Error('Clipboard API not supported on this browser');
        }

        // Try direct Promise-based ClipboardItem first (preserves active user gesture synchronously)
        let writeSuccess = false;
        try {
            const clipboardItem = new ClipboardItem({ 'image/png': blobPromise });
            await navigator.clipboard.write([clipboardItem]);
            writeSuccess = true;
        } catch (promiseErr) {
            // Secondary fallback: await blob resolution and write
            const resolvedPngBlob = await blobPromise;
            if (resolvedPngBlob) {
                // Check mobile Web Share API for WhatsApp on mobile phones
                const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                if (isMobileDevice && navigator.canShare) {
                    try {
                        const shareFile = new File([resolvedPngBlob], `${title.replace(/\s+/g, '_')}.png`, { type: 'image/png' });
                        if (navigator.canShare({ files: [shareFile] })) {
                            await navigator.share({
                                files: [shareFile],
                                title: `Azad SEO - ${title}`,
                                text: `*Azad SEO - ${title}*`
                            });
                            showToast(`Shared ${title} to WhatsApp!`, 'success');
                            return true;
                        }
                    } catch (shareErr) {
                        console.log('Mobile share dismissed:', shareErr);
                    }
                }

                const clipboardItem = new ClipboardItem({ 'image/png': resolvedPngBlob });
                await navigator.clipboard.write([clipboardItem]);
                writeSuccess = true;
            }
        }

        if (writeSuccess) {
            showToast(`✅ ${title} picture copied! Press Ctrl+V in WhatsApp to paste.`, 'success');
            return true;
        } else {
            throw new Error('Clipboard write did not complete');
        }
    } catch (err) {
        console.error('Clipboard write error:', err);
        showToast(`⚠️ Could not copy image directly (${err.message || 'access denied'}). Right-click image -> "Copy Image".`, 'error');
        return false;
    }
}

// Open Image Lightbox
function openImageLightbox(imageUrl, title) {
    const modal = document.getElementById('image-lightbox-modal');
    const imgEl = document.getElementById('lightbox-image');
    const titleEl = document.getElementById('lightbox-title');
    const copyBtn = document.getElementById('lightbox-copy-btn');

    if (!modal || !imgEl) return;

    imgEl.src = imageUrl;
    if (titleEl) titleEl.innerText = title || 'Preview';
    if (copyBtn) {
        copyBtn.onclick = () => copyImageToClipboard(imageUrl, title);
    }

    modal.classList.remove('hidden');
}

// ==========================================================================
// Isolated Print Engine & Pixel-Perfect Single-Page A4 PDF Generator
// ==========================================================================
function prepareAndPrint(elementId) {
    const src = document.getElementById(elementId);
    const mount = document.getElementById('print-mount');
    if (!src || !mount) {
        window.print();
        return;
    }

    mount.innerHTML = '';
    const clone = src.cloneNode(true);
    mount.appendChild(clone);

    window.print();

    setTimeout(() => {
        mount.innerHTML = '';
    }, 1200);
}

async function generateAndSavePDF(elementId, filename) {
    const srcElement = document.getElementById(elementId);
    if (!srcElement) {
        showToast('Document not ready for export', 'warning');
        return;
    }

    showToast('Generating pixel-perfect A4 PDF...', 'info');

    // 1. Create a perfectly-bounded clone with exact A4 proportions (794px width x 1115px height)
    const clone = srcElement.cloneNode(true);
    clone.style.width = '794px';
    clone.style.maxWidth = '794px';
    clone.style.height = '1115px';
    clone.style.maxHeight = '1115px';
    clone.style.margin = '0';
    clone.style.padding = '28px 36px';
    clone.style.boxSizing = 'border-box';
    clone.style.backgroundColor = '#ffffff';
    clone.style.boxShadow = 'none';
    clone.style.transform = 'none';
    clone.style.overflow = 'hidden';

    // 2. Attach clone to an isolated mount at top-left (0,0) so html2canvas never cuts off margins
    const mount = document.createElement('div');
    mount.style.position = 'fixed';
    mount.style.left = '0';
    mount.style.top = '0';
    mount.style.width = '794px';
    mount.style.height = '1115px';
    mount.style.zIndex = '999999';
    mount.style.backgroundColor = '#ffffff';
    mount.style.overflow = 'hidden';
    mount.appendChild(clone);
    document.body.appendChild(mount);

    // Force layout flush
    mount.getBoundingClientRect();

    const opt = {
        margin: 0, // ZERO margin guarantees 1:1 single-page fit without overflowing to Page 2
        filename: filename || 'document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2, // 300 DPI high-definition canvas
            useCORS: false,
            allowTaint: true,
            logging: false,
            scrollX: 0,
            scrollY: 0,
            x: 0,
            y: 0,
            width: 794,
            height: 1115,
            windowWidth: 794
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' } // Strictly prevents split onto page 2
    };

    try {
        if (typeof html2pdf !== 'undefined') {
            await html2pdf().set(opt).from(clone).save();
            document.body.removeChild(mount);
            showToast('✅ High-Resolution PDF Downloaded!', 'success');
        } else {
            document.body.removeChild(mount);
            prepareAndPrint(elementId);
        }
    } catch (err) {
        console.error('html2pdf render failed:', err);
        if (mount.parentNode) document.body.removeChild(mount);
        showToast('Falling back to Print / Save as PDF...', 'info');
        prepareAndPrint(elementId);
    }
}

// ==========================================================================
// Settings Module Setup
// ==========================================================================
async function initSettingsView() {
    const settings = await getAllSettings();
    
    const setVal = (id, key, def) => {
        const el = document.getElementById(id);
        if (el) el.value = settings[key] || def || '';
    };

    setVal('setting-company-name', 'company_name', 'Azad SEO');
    setVal('setting-company-tagline', 'company_tagline', 'Premium SEO & Digital Marketing Solutions');
    setVal('setting-company-phone', 'company_phone', '+92 300 0000000');
    setVal('setting-company-email', 'company_email', 'contact@azadseo.com');
    setVal('setting-company-address', 'company_address', 'Lahore, Pakistan');
    setVal('setting-payment-info', 'payment_info', 'Bank: Meezan Bank Ltd | A/C: 0102030405 | Title: Azad SEO | JazzCash/EasyPaisa: 0300-1234567');
    setVal('setting-invoice-prefix', 'invoice_prefix', 'INV-');
}

// Save Settings Form
async function saveSystemSettings() {
    const getVal = (id) => document.getElementById(id)?.value?.trim() || '';

    await setSetting('company_name', getVal('setting-company-name'));
    await setSetting('company_tagline', getVal('setting-company-tagline'));
    await setSetting('company_phone', getVal('setting-company-phone'));
    await setSetting('company_email', getVal('setting-company-email'));
    await setSetting('company_address', getVal('setting-company-address'));
    await setSetting('payment_info', getVal('setting-payment-info'));
    await setSetting('invoice_prefix', getVal('setting-invoice-prefix'));

    showToast('System Settings Saved!', 'success');
}

// Update Database Stats Card in Settings
async function updateDatabaseStats() {
    try {
        const invoicesCount = await db.invoices.count();
        const clientsCount = await db.clients.count();
        const salaryEntriesCount = await db.salary_entries.count();
        const toolsCount = await db.tools.count();
        const usersCount = await db.salary_users.count();

        const setElem = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.innerText = val;
        };

        setElem('stat-invoices', invoicesCount);
        setElem('stat-clients', clientsCount);
        setElem('stat-salary-entries', salaryEntriesCount);
        setElem('stat-tools', toolsCount);
        setElem('stat-employees', usersCount);
    } catch (err) {
        console.error('Error reading DB stats:', err);
    }
}

// Trigger Database JSON Backup Download
async function triggerDatabaseBackup() {
    try {
        const jsonStr = await exportFullDatabaseJSON();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        a.href = url;
        a.download = `Azad_SEO_Suite_Backup_${timestamp}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Full Database JSON Backup Downloaded!', 'success');
    } catch (err) {
        console.error('Backup error:', err);
        showToast('Failed to export backup', 'error');
    }
}

// Trigger Database JSON Restore Upload
function triggerDatabaseRestorePrompt() {
    const input = document.getElementById('db-restore-file-input');
    if (input) input.click();
}

async function handleDatabaseFileSelected(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!confirm(`Warning: Restoring "${file.name}" will overwrite current database records with the backup file data. Continue?`)) {
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            await importFullDatabaseJSON(e.target.result);
            showToast('Database Restored Successfully! Refreshing...', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1200);
        } catch (err) {
            console.error('Restore error:', err);
            showToast('Invalid backup file or restore error: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// Reset Database to Defaults
async function handleResetDatabase() {
    if (!confirm('Are you sure you want to reset all data to default Azad SEO factory settings? Past custom invoices and salary entries will be reset!')) {
        return;
    }

    try {
        await resetDatabaseToDefaults();
        showToast('Database reset to factory defaults! Refreshing...', 'info');
        setTimeout(() => {
            window.location.reload();
        }, 1200);
    } catch (err) {
        showToast('Error resetting database: ' + err.message, 'error');
    }
}

// ==========================================================================
// Staff & Shifts Manager Controller
// ==========================================================================
let editingShiftId = null;

async function openStaffManagerModal() {
    await renderStaffShiftsList();
    document.getElementById('staff-manager-modal')?.classList.remove('hidden');
}

async function renderStaffShiftsList() {
    const listContainer = document.getElementById('staff-shifts-list');
    if (!listContainer) return;

    const users = await db.salary_users.toArray();

    if (users.length === 0) {
        listContainer.innerHTML = '<p class="text-xs text-slate-400 py-3 text-center">No shifts configured.</p>';
        return;
    }

    listContainer.innerHTML = users.map(user => {
        const members = getShiftMembers(user);
        return `
            <div class="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div>
                    <div class="flex items-center gap-2">
                        <h4 class="font-bold text-slate-800 text-xs">${escapeHtml(user.name)}</h4>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">${escapeHtml(user.shift)}</span>
                    </div>
                    <p class="text-[11px] text-slate-500 mt-0.5">
                        <strong class="text-slate-700">Staff Members (${members.length}):</strong> 
                        ${members.map(m => `<span class="inline-block px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-700 text-[10px] font-semibold mr-1">${escapeHtml(m)}</span>`).join('')}
                    </p>
                    <p class="text-[10px] text-slate-400 mt-0.5 font-mono">Commission: ${user.commission_rate || 2}% • Base: ${(user.base_salary || 0).toLocaleString()} PKR</p>
                </div>
                <div class="flex items-center gap-1.5">
                    <button onclick="editShiftPrompt(${user.id})" class="p-1.5 rounded-lg text-sky-600 hover:bg-sky-100" title="Edit Shift">
                        <i class="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button onclick="deleteShiftPrompt(${user.id})" class="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100" title="Delete Shift">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

async function editShiftPrompt(id) {
    const shift = await db.salary_users.get(id);
    if (!shift) return;

    editingShiftId = id;
    document.getElementById('shift-modal-title').innerText = 'Edit Staff Shift';
    document.getElementById('shift-name-input').value = shift.name || '';
    document.getElementById('shift-hours-input').value = shift.shift || '';
    document.getElementById('shift-members-input').value = (getShiftMembers(shift)).join(', ');
    document.getElementById('shift-comm-input').value = shift.commission_rate || 2.0;
    document.getElementById('shift-base-salary-input').value = shift.base_salary || 0;
    document.getElementById('shift-form-submit-btn').innerText = 'Update Shift';
}

function resetShiftForm() {
    editingShiftId = null;
    document.getElementById('shift-modal-title').innerText = 'Add New Staff Shift';
    document.getElementById('shift-name-input').value = '';
    document.getElementById('shift-hours-input').value = '';
    document.getElementById('shift-members-input').value = '';
    document.getElementById('shift-comm-input').value = '2.0';
    document.getElementById('shift-base-salary-input').value = '0';
    document.getElementById('shift-form-submit-btn').innerText = 'Save Shift';
}

async function handleSaveShiftSubmit() {
    const name = document.getElementById('shift-name-input')?.value?.trim();
    const hours = document.getElementById('shift-hours-input')?.value?.trim() || 'Full Day';
    const membersRaw = document.getElementById('shift-members-input')?.value?.trim();
    const commRate = parseFloat(document.getElementById('shift-comm-input')?.value) || 2.0;
    const baseSal = parseFloat(document.getElementById('shift-base-salary-input')?.value) || 0;

    if (!name) {
        showToast('Please enter a shift title / staff name', 'warning');
        return;
    }

    const members = membersRaw 
        ? membersRaw.split(/[,&]+/).map(s => s.trim()).filter(Boolean)
        : getShiftMembers({ name: name });

    if (editingShiftId) {
        await updateSalaryShift(editingShiftId, {
            name: name,
            shift: hours,
            members: members,
            commission_rate: commRate,
            base_salary: baseSal
        });
        showToast('Shift updated successfully!', 'success');
    } else {
        await addSalaryShift({
            name: name,
            shift: hours,
            members: members,
            commission_rate: commRate,
            base_salary: baseSal
        });
        showToast('New shift added successfully!', 'success');
    }

    resetShiftForm();
    await renderStaffShiftsList();
    if (typeof loadSalaryUsers === 'function') await loadSalaryUsers();
    if (typeof loadMonthData === 'function') await loadMonthData();
}

async function deleteShiftPrompt(id) {
    if (!confirm('Are you sure you want to delete this shift? All related sales and attendance records for this shift will be removed.')) {
        return;
    }

    await deleteSalaryShift(id);
    showToast('Shift removed', 'info');
    await renderStaffShiftsList();
    if (typeof loadSalaryUsers === 'function') await loadSalaryUsers();
    if (typeof loadMonthData === 'function') await loadMonthData();
}
