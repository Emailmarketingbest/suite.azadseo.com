/**
 * Azad SEO All-In-One Web Suite - Professional Invoice Generator (invoice.js)
 * Full recreation and enhancement of Azad SEO Invoice Professional:
 * Line items table, 5 designer templates, QR code verification,
 * client auto-saving, A4 live preview, html2pdf export, and invoice history.
 */

let invoiceItems = [];
let savedClients = [];
let currentInvoiceNumber = '';
let currentTemplate = 'tpl-modern-blue';

// Initialize Invoice Module
async function initInvoiceModule() {
    await loadClientsList();
    await setupInvoiceDefaults();
    setupInvoiceEventListeners();
    renderInvoiceItems();
    recalculateInvoiceTotals();
    await loadInvoiceHistory();
}

// Setup Invoice Defaults
async function setupInvoiceDefaults() {
    const today = new Date().toISOString().split('T')[0];
    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + 7);
    const dueDate = dueDateObj.toISOString().split('T')[0];

    const dateInput = document.getElementById('inv-date');
    if (dateInput) dateInput.value = today;

    const dueInput = document.getElementById('inv-due-date');
    if (dueInput) dueInput.value = dueDate;

    // Fetch next invoice number
    currentInvoiceNumber = await peekNextInvoiceNumber();
    const invNoEl = document.getElementById('inv-number-display');
    if (invNoEl) invNoEl.innerText = currentInvoiceNumber;

    // If no items, add a starter item
    if (invoiceItems.length === 0) {
        invoiceItems.push({
            id: Date.now(),
            name: 'SEMrush Shared Access',
            description: 'Shared Access For 30 Days (500 Domain & Keyword Limits)',
            qty: 1,
            days: 30,
            unitPrice: 800
        });
    }
}

// Load Clients for Autocomplete
async function loadClientsList() {
    savedClients = await db.clients.toArray();
    const datalist = document.getElementById('clients-datalist');
    if (datalist) {
        datalist.innerHTML = savedClients.map(c => `
            <option value="${escapeHtml(c.name)}">${escapeHtml(c.email || '')} ${c.phone ? '• ' + c.phone : ''}</option>
        `).join('');
    }
}

// Setup Event Listeners
function setupInvoiceEventListeners() {
    const clientNameInput = document.getElementById('inv-client-name');
    if (clientNameInput) {
        clientNameInput.addEventListener('change', (e) => {
            const client = savedClients.find(c => c.name.toLowerCase() === e.target.value.toLowerCase().trim());
            if (client) {
                if (client.email) document.getElementById('inv-client-email').value = client.email;
                if (client.phone) document.getElementById('inv-client-phone').value = client.phone;
                if (client.address) document.getElementById('inv-client-address').value = client.address;
            }
        });
    }

    // Calculation inputs
    ['inv-tax-rate', 'inv-discount-amount', 'inv-currency-select'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', recalculateInvoiceTotals);
    });

    // Template Selector
    const tplSelect = document.getElementById('inv-template-select');
    if (tplSelect) {
        tplSelect.addEventListener('change', (e) => {
            currentTemplate = e.target.value;
        });
    }
}

// Add Item Row
function addInvoiceItem(itemData = null) {
    const newItem = itemData ? {
        id: Date.now() + Math.random(),
        name: itemData.name || '',
        description: itemData.description || '',
        qty: itemData.qty || 1,
        days: itemData.days || 30,
        unitPrice: itemData.unitPrice || 0
    } : {
        id: Date.now(),
        name: '',
        description: 'Shared Access For 30 Days',
        qty: 1,
        days: 30,
        unitPrice: 0
    };

    invoiceItems.push(newItem);
    renderInvoiceItems();
    recalculateInvoiceTotals();
}

// Remove Item Row
function removeInvoiceItem(id) {
    invoiceItems = invoiceItems.filter(item => item.id !== id);
    if (invoiceItems.length === 0) {
        addInvoiceItem();
    } else {
        renderInvoiceItems();
        recalculateInvoiceTotals();
    }
}

// Update Item Field
function updateInvoiceItemField(id, field, value) {
    const item = invoiceItems.find(i => i.id === id);
    if (!item) return;

    if (field === 'qty' || field === 'days' || field === 'unitPrice') {
        item[field] = parseFloat(value) || 0;
    } else {
        item[field] = value;
    }

    const rowTotal = (item.qty || 1) * (item.unitPrice || 0);
    const totalCell = document.getElementById(`item-total-${id}`);
    const currency = document.getElementById('inv-currency-select')?.value || 'PKR';
    if (totalCell) {
        totalCell.innerText = `${rowTotal.toLocaleString()} ${currency}`;
    }

    recalculateInvoiceTotals();
}

// Render Line Items Table
function renderInvoiceItems() {
    const container = document.getElementById('invoice-items-body');
    if (!container) return;

    const currency = document.getElementById('inv-currency-select')?.value || 'PKR';

    container.innerHTML = invoiceItems.map((item, index) => {
        const rowTotal = (item.qty || 1) * (item.unitPrice || 0);
        return `
            <tr class="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                <td class="text-center font-bold text-slate-400 text-xs w-10">${index + 1}</td>
                <td class="p-2">
                    <input type="text" value="${escapeHtml(item.name)}" placeholder="Item or Service Name (e.g. Canva Pro)"
                           oninput="updateInvoiceItemField(${item.id}, 'name', this.value)"
                           class="w-full text-xs font-bold text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-sky-500 mb-1">
                    <input type="text" value="${escapeHtml(item.description)}" placeholder="Description / Specs (e.g. 30 Days Shared Access)"
                           oninput="updateInvoiceItemField(${item.id}, 'description', this.value)"
                           class="w-full text-[11px] text-slate-500 px-2.5 py-1 rounded border border-slate-100 bg-slate-50/50 focus:ring-1 focus:ring-sky-500">
                </td>
                <td class="w-20 p-2">
                    <input type="number" min="1" value="${item.qty}" 
                           oninput="updateInvoiceItemField(${item.id}, 'qty', this.value)"
                           class="w-full text-center font-mono-code text-xs font-bold px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-sky-500">
                </td>
                <td class="w-24 p-2">
                    <input type="number" min="1" value="${item.days}" 
                           oninput="updateInvoiceItemField(${item.id}, 'days', this.value)"
                           class="w-full text-center font-mono-code text-xs font-medium px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-sky-500">
                </td>
                <td class="w-32 p-2">
                    <div class="relative">
                        <input type="number" min="0" step="50" value="${item.unitPrice}" 
                               oninput="updateInvoiceItemField(${item.id}, 'unitPrice', this.value)"
                               class="w-full text-right font-mono-code text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-sky-500">
                    </div>
                </td>
                <td class="w-32 p-2 text-right font-mono-code font-bold text-sky-700 text-xs" id="item-total-${item.id}">
                    ${rowTotal.toLocaleString()} ${currency}
                </td>
                <td class="w-12 text-center p-2">
                    <button onclick="removeInvoiceItem(${item.id})" title="Delete row" 
                            class="text-slate-300 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-rose-50">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Recalculate Totals
function recalculateInvoiceTotals() {
    const subtotal = invoiceItems.reduce((acc, item) => acc + ((item.qty || 1) * (item.unitPrice || 0)), 0);
    const taxRate = parseFloat(document.getElementById('inv-tax-rate')?.value) || 0;
    const discountAmount = parseFloat(document.getElementById('inv-discount-amount')?.value) || 0;

    const taxAmount = (subtotal * taxRate) / 100;
    const grandTotal = Math.max(0, (subtotal + taxAmount) - discountAmount);
    const currency = document.getElementById('inv-currency-select')?.value || 'PKR';

    const setElem = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    };

    setElem('inv-subtotal-display', `${subtotal.toLocaleString()} ${currency}`);
    setElem('inv-tax-display', `+${taxAmount.toLocaleString()} ${currency}`);
    setElem('inv-discount-display', `-${discountAmount.toLocaleString()} ${currency}`);
    setElem('inv-grand-total-display', `${grandTotal.toLocaleString()} ${currency}`);
}

// Open Live A4 Invoice Preview Modal
async function openInvoicePreviewModal() {
    const clientName = document.getElementById('inv-client-name')?.value || 'Valued Client';
    const clientEmail = document.getElementById('inv-client-email')?.value || '';
    const clientPhone = document.getElementById('inv-client-phone')?.value || '';
    const clientAddress = document.getElementById('inv-client-address')?.value || '';

    const invDate = document.getElementById('inv-date')?.value || new Date().toISOString().split('T')[0];
    const invDueDate = document.getElementById('inv-due-date')?.value || '';
    const currency = document.getElementById('inv-currency-select')?.value || 'PKR';
    const status = document.getElementById('inv-status-select')?.value || 'Paid';

    const notes = document.getElementById('inv-notes')?.value || 'Thank you for your business. For any questions, please contact Azad SEO Support.';
    const terms = document.getElementById('inv-terms')?.value || '• Shared access is provided for 30 days.\n• No account sharing or password changes allowed.\n• Issues must be reported within 24 hours of delivery.';

    const subtotal = invoiceItems.reduce((acc, item) => acc + ((item.qty || 1) * (item.unitPrice || 0)), 0);
    const taxRate = parseFloat(document.getElementById('inv-tax-rate')?.value) || 0;
    const discountAmount = parseFloat(document.getElementById('inv-discount-amount')?.value) || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const grandTotal = Math.max(0, (subtotal + taxAmount) - discountAmount);

    // Bank Details from settings
    const bankDetails = await getSetting('payment_info', 'Bank: Meezan Bank Ltd | A/C: 0102030405 | Title: Azad SEO | JazzCash/EasyPaisa: 0300-1234567');
    const logoSrc = (typeof AZAD_LOGO_B64 !== 'undefined') ? AZAD_LOGO_B64 : 'logo.png';

    const statusBadge = status === 'Paid' 
        ? '<span class="px-3 py-1 rounded bg-emerald-100 text-emerald-800 font-extrabold text-xs uppercase tracking-wider border border-emerald-300">PAID</span>'
        : (status === 'Pending' 
            ? '<span class="px-3 py-1 rounded bg-amber-100 text-amber-800 font-extrabold text-xs uppercase tracking-wider border border-amber-300">PENDING</span>'
            : '<span class="px-3 py-1 rounded bg-rose-100 text-rose-800 font-extrabold text-xs uppercase tracking-wider border border-rose-300">UNPAID</span>');

    const rowsHtml = invoiceItems.map((item, idx) => {
        const total = (item.qty || 1) * (item.unitPrice || 0);
        return `
            <tr class="border-b border-slate-200 text-xs">
                <td class="py-2.5 px-2 text-center text-slate-400 font-bold">${idx + 1}</td>
                <td class="py-2.5 px-2">
                    <p class="font-bold text-slate-800 text-sm">${escapeHtml(item.name || 'Service Item')}</p>
                    <p class="text-[11px] text-slate-500">${escapeHtml(item.description || '')}</p>
                </td>
                <td class="py-2.5 px-2 text-center font-mono font-bold">${item.qty || 1}</td>
                <td class="py-2.5 px-2 text-center font-mono text-slate-600">${item.days || 30} Days</td>
                <td class="py-2.5 px-2 text-right font-mono">${(item.unitPrice || 0).toLocaleString()} ${currency}</td>
                <td class="py-2.5 px-2 text-right font-mono font-bold text-slate-900">${total.toLocaleString()} ${currency}</td>
            </tr>
        `;
    }).join('');

    const container = document.getElementById('invoice-preview-container');
    if (!container) return;

    container.innerHTML = `
        <div id="invoice-sheet" class="a4-sheet ${currentTemplate} p-8 flex flex-col justify-between">
            <div>
                <!-- Top Brand Header -->
                <div class="flex items-start justify-between border-b-2 invoice-accent-border pb-6 mb-6">
                    <div class="flex items-center gap-4">
                        <img src="${logoSrc}" alt="Azad SEO Logo" class="h-14 w-auto object-contain">
                        <div>
                            <h1 class="text-2xl font-black text-slate-900 tracking-tight">AZAD SEO</h1>
                            <p class="text-xs text-slate-500 font-semibold tracking-wide">Premium SEO & Digital Marketing Solutions</p>
                            <p class="text-[11px] text-slate-400">WhatsApp: +92 300 0000000 | Web: azadseo.com</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="text-2xl font-black tracking-tight invoice-accent-text block">INVOICE</span>
                        <p class="text-sm font-mono font-bold text-slate-700 mt-1">${currentInvoiceNumber}</p>
                        <div class="mt-2">${statusBadge}</div>
                    </div>
                </div>

                <!-- Meta & Client Info Grid -->
                <div class="grid grid-cols-2 gap-8 mb-6">
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Invoice To:</p>
                        <h3 class="text-base font-extrabold text-slate-800">${escapeHtml(clientName)}</h3>
                        ${clientEmail ? `<p class="text-xs text-slate-600 mt-0.5"><i class="fa-regular fa-envelope text-slate-400 mr-1.5"></i>${escapeHtml(clientEmail)}</p>` : ''}
                        ${clientPhone ? `<p class="text-xs text-slate-600 mt-0.5"><i class="fa-solid fa-phone text-slate-400 mr-1.5"></i>${escapeHtml(clientPhone)}</p>` : ''}
                        ${clientAddress ? `<p class="text-xs text-slate-500 mt-0.5"><i class="fa-solid fa-location-dot text-slate-400 mr-1.5"></i>${escapeHtml(clientAddress)}</p>` : ''}
                    </div>

                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-right space-y-1">
                        <p class="text-xs text-slate-600">
                            <span class="text-slate-400 font-medium mr-2">Invoice Date:</span>
                            <span class="font-bold text-slate-800">${invDate}</span>
                        </p>
                        ${invDueDate ? `
                        <p class="text-xs text-slate-600">
                            <span class="text-slate-400 font-medium mr-2">Due Date:</span>
                            <span class="font-bold text-slate-800">${invDueDate}</span>
                        </p>` : ''}
                        <p class="text-xs text-slate-600">
                            <span class="text-slate-400 font-medium mr-2">Currency:</span>
                            <span class="font-bold text-slate-800">${currency}</span>
                        </p>
                        <p class="text-xs text-slate-600">
                            <span class="text-slate-400 font-medium mr-2">Billing Cycle:</span>
                            <span class="font-bold text-slate-800">Monthly (30 Days)</span>
                        </p>
                    </div>
                </div>

                <!-- Items Table -->
                <div class="border border-slate-200 rounded-xl overflow-hidden mb-6">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="invoice-accent-bg text-white text-xs font-bold uppercase tracking-wider">
                                <th class="py-2.5 px-2 text-center w-10">#</th>
                                <th class="py-2.5 px-2">Description / Tool</th>
                                <th class="py-2.5 px-2 text-center w-16">Qty</th>
                                <th class="py-2.5 px-2 text-center w-24">Duration</th>
                                <th class="py-2.5 px-2 text-right w-28">Unit Price</th>
                                <th class="py-2.5 px-2 text-right w-32">Total</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>

                <!-- Totals & Payment Info Row -->
                <div class="grid grid-cols-12 gap-6 mb-6">
                    <!-- Left: Bank Details & Verification QR -->
                    <div class="col-span-7 flex gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div id="invoice-qr-code" class="w-20 h-20 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center shrink-0"></div>
                        <div class="text-[11px] text-slate-600 flex-1">
                            <p class="font-bold text-slate-800 uppercase tracking-wider mb-1">Payment Instructions:</p>
                            <p class="whitespace-pre-line leading-relaxed text-slate-600">${escapeHtml(bankDetails)}</p>
                            <p class="text-[10px] text-slate-400 mt-2 font-mono">Scan QR to verify official invoice authenticity.</p>
                        </div>
                    </div>

                    <!-- Right: Calculations Summary -->
                    <div class="col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div class="flex justify-between text-slate-600">
                            <span>Subtotal:</span>
                            <span class="font-mono font-bold text-slate-800">${subtotal.toLocaleString()} ${currency}</span>
                        </div>
                        ${taxRate > 0 ? `
                        <div class="flex justify-between text-slate-600">
                            <span>Tax (${taxRate}%):</span>
                            <span class="font-mono font-bold text-slate-800">+${taxAmount.toLocaleString()} ${currency}</span>
                        </div>` : ''}
                        ${discountAmount > 0 ? `
                        <div class="flex justify-between text-emerald-600">
                            <span>Discount:</span>
                            <span class="font-mono font-bold">-${discountAmount.toLocaleString()} ${currency}</span>
                        </div>` : ''}
                        <div class="border-t-2 border-slate-300 pt-2 flex justify-between items-baseline font-bold text-slate-900">
                            <span class="text-sm">Grand Total:</span>
                            <span class="text-lg font-black invoice-accent-text">${grandTotal.toLocaleString()} ${currency}</span>
                        </div>
                    </div>
                </div>

                <!-- Terms & Notes -->
                <div class="grid grid-cols-2 gap-6 text-[11px] text-slate-500 mb-6 bg-white p-3 rounded-lg border border-slate-100">
                    <div>
                        <p class="font-bold text-slate-700 uppercase tracking-wider mb-1">Terms & Conditions:</p>
                        <p class="whitespace-pre-line leading-relaxed">${escapeHtml(terms)}</p>
                    </div>
                    <div>
                        <p class="font-bold text-slate-700 uppercase tracking-wider mb-1">Notes / Remarks:</p>
                        <p class="whitespace-pre-line leading-relaxed">${escapeHtml(notes)}</p>
                    </div>
                </div>
            </div>

            <!-- Footer Copyright -->
            <div class="border-t border-slate-200 pt-3 text-center text-[10px] text-slate-400">
                © Copyrights Azad Seo 2026. All rights reserved. | Generated via Azad SEO Professional Web Suite.
            </div>
        </div>
    `;

    // Render QR Code
    setTimeout(() => {
        const qrContainer = document.getElementById('invoice-qr-code');
        if (qrContainer && window.QRCode) {
            qrContainer.innerHTML = '';
            new QRCode(qrContainer, {
                text: `https://azadseo.com/verify?inv=${currentInvoiceNumber}&amount=${grandTotal}`,
                width: 72,
                height: 72,
                colorDark: "#0f172a",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
            });
        }
    }, 50);

    document.getElementById('invoice-preview-modal').classList.remove('hidden');
}

// Save Invoice to IndexedDB
async function saveInvoiceToDB() {
    const clientName = document.getElementById('inv-client-name')?.value?.trim();
    if (!clientName) {
        showToast('Please enter a Client Name before saving', 'warning');
        return;
    }

    const clientEmail = document.getElementById('inv-client-email')?.value?.trim() || '';
    const clientPhone = document.getElementById('inv-client-phone')?.value?.trim() || '';
    const clientAddress = document.getElementById('inv-client-address')?.value?.trim() || '';

    const invDate = document.getElementById('inv-date')?.value || new Date().toISOString().split('T')[0];
    const invDueDate = document.getElementById('inv-due-date')?.value || '';
    const currency = document.getElementById('inv-currency-select')?.value || 'PKR';
    const status = document.getElementById('inv-status-select')?.value || 'Paid';

    const subtotal = invoiceItems.reduce((acc, item) => acc + ((item.qty || 1) * (item.unitPrice || 0)), 0);
    const taxRate = parseFloat(document.getElementById('inv-tax-rate')?.value) || 0;
    const discountAmount = parseFloat(document.getElementById('inv-discount-amount')?.value) || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const grandTotal = Math.max(0, (subtotal + taxAmount) - discountAmount);

    const invoiceData = {
        invoice_no: currentInvoiceNumber,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        client_address: clientAddress,
        date: invDate,
        due_date: invDueDate,
        currency: currency,
        status: status,
        items: JSON.parse(JSON.stringify(invoiceItems)),
        subtotal: subtotal,
        tax_rate: taxRate,
        discount_amount: discountAmount,
        grand_total: grandTotal,
        notes: document.getElementById('inv-notes')?.value || '',
        terms: document.getElementById('inv-terms')?.value || '',
        template: currentTemplate,
        createdAt: new Date().toISOString()
    };

    try {
        await db.invoices.add(invoiceData);

        // Auto-save Client if not already exists
        const existingClient = await db.clients.where('name').equalsIgnoreCase(clientName).first();
        if (!existingClient) {
            await db.clients.add({
                name: clientName,
                email: clientEmail,
                phone: clientPhone,
                address: clientAddress,
                createdAt: new Date().toISOString()
            });
            await loadClientsList();
        }

        // Increment invoice number sequence in settings
        await getNextInvoiceNumber();
        currentInvoiceNumber = await peekNextInvoiceNumber();
        const invNoEl = document.getElementById('inv-number-display');
        if (invNoEl) invNoEl.innerText = currentInvoiceNumber;

        await loadInvoiceHistory();
        showToast(`Invoice ${invoiceData.invoice_no} saved successfully!`, 'success');
    } catch (err) {
        console.error('Error saving invoice:', err);
        showToast('Error saving invoice to database', 'error');
    }
}

// Download PDF using high-reliability engine
async function downloadInvoicePDF() {
    const filename = `Invoice_${currentInvoiceNumber}.pdf`;
    await generateAndSavePDF('invoice-sheet', filename);
}

// Load Past Invoices History
async function loadInvoiceHistory() {
    const tableBody = document.getElementById('invoice-history-body');
    if (!tableBody) return;

    const invoices = await db.invoices.reverse().toArray();

    if (invoices.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="py-8 text-center text-slate-400">
                    <i class="fa-regular fa-folder-open text-3xl mb-2 block"></i>
                    No invoices saved yet. Create and save your first invoice above!
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = invoices.map(inv => {
        const badge = inv.status === 'Paid' 
            ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">PAID</span>'
            : (inv.status === 'Pending' 
                ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">PENDING</span>'
                : '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">UNPAID</span>');

        return `
            <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100 text-xs">
                <td class="py-2.5 px-3 font-mono font-bold text-sky-700">${escapeHtml(inv.invoice_no)}</td>
                <td class="py-2.5 px-3 font-bold text-slate-800">${escapeHtml(inv.client_name)}</td>
                <td class="py-2.5 px-3 text-slate-500">${inv.date}</td>
                <td class="py-2.5 px-3 font-mono font-bold text-right">${Number(inv.grand_total).toLocaleString()} ${inv.currency || 'PKR'}</td>
                <td class="py-2.5 px-3 text-center">${badge}</td>
                <td class="py-2.5 px-3 text-center">
                    <div class="flex items-center justify-center gap-1.5">
                        <button onclick="loadPastInvoice(${inv.id})" title="Load into Editor" 
                                class="p-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="deletePastInvoice(${inv.id})" title="Delete" 
                                class="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Load past invoice into editor
async function loadPastInvoice(id) {
    const inv = await db.invoices.get(id);
    if (!inv) return;

    currentInvoiceNumber = inv.invoice_no;
    const invNoEl = document.getElementById('inv-number-display');
    if (invNoEl) invNoEl.innerText = currentInvoiceNumber;

    document.getElementById('inv-client-name').value = inv.client_name || '';
    document.getElementById('inv-client-email').value = inv.client_email || '';
    document.getElementById('inv-client-phone').value = inv.client_phone || '';
    document.getElementById('inv-client-address').value = inv.client_address || '';

    document.getElementById('inv-date').value = inv.date || '';
    document.getElementById('inv-due-date').value = inv.due_date || '';
    document.getElementById('inv-currency-select').value = inv.currency || 'PKR';
    document.getElementById('inv-status-select').value = inv.status || 'Paid';

    document.getElementById('inv-tax-rate').value = inv.tax_rate || 0;
    document.getElementById('inv-discount-amount').value = inv.discount_amount || 0;
    document.getElementById('inv-notes').value = inv.notes || '';
    document.getElementById('inv-terms').value = inv.terms || '';

    invoiceItems = inv.items && inv.items.length > 0 ? inv.items : [];
    renderInvoiceItems();
    recalculateInvoiceTotals();

    // Scroll to top of invoice editor
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Loaded invoice ${inv.invoice_no} into editor`, 'info');
}

// Delete past invoice
async function deletePastInvoice(id) {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    await db.invoices.delete(id);
    await loadInvoiceHistory();
    showToast('Invoice deleted', 'info');
}
