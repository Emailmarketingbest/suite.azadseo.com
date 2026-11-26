/**
 * Azad SEO All-In-One Web Suite - Tools & Autofill Module (tools.js)
 * Covers:
 * - 42+ SEO tools catalog with promotional cards
 * - 4 Marketing Facebook Plans (Student, Basic, Standard, Guru)
 * - Click-to-Copy Image directly to Clipboard for WhatsApp paste (Ctrl+V)
 * - Interactive multi-select package builder dock
 * - Full Tool Management (Add / Edit / Delete Tool)
 * - 1-Click Send Plan or Tools directly into Invoice Maker
 */

let allTools = [];
let allPlans = [];
let selectedToolIds = new Set();
let currentCategory = 'All';
let searchQuery = '';
let editingToolId = null;
let editingPlanId = null;
let currentToolsSubView = 'plans'; // 'plans' or 'tools'
let currentToolImageBase64 = null;
let currentPlanImageBase64 = null;

// Tool Promotional Image Lookup Map (matches keywords and names to thumbnail PNG cards)
const TOOL_THUMBNAILS = {
    'ahrefs': 'images/tools/ahrefs_card.png',
    'semrush': 'images/tools/SEMrush_card.png',
    'canva': 'images/tools/Canva_card.png',
    'chat gpt': 'images/tools/Chat Gpt_card.png',
    'chatgpt': 'images/tools/Chat Gpt_card.png',
    'chatgptplus': 'images/tools/Chat Gpt_card.png',
    'claude': 'images/tools/Claude_card.png',
    'claude.ai': 'images/tools/Claude_card.png',
    'envato': 'images/tools/Envato Elements_card.png',
    'grammarly': 'images/tools/Grammarly_card.png',
    'helium 10': 'images/tools/Helium 10_card.png',
    'helium10': 'images/tools/Helium 10_card.png',
    'jasper': 'images/tools/Jasper_card.png',
    'moz': 'images/tools/Moz_card.png',
    'quillbot': 'images/tools/Quillbot_card.png',
    'capcut': 'images/tools/Capcut Pro_card.png',
    'flaticon': 'images/tools/Flaticon_card.png',
    'word.ai': 'images/tools/Wordai_card.png',
    'wordai': 'images/tools/Wordai_card.png',
    'invideo': 'images/tools/InvideoStudio_card.png',
    'indexification': 'images/tools/Indexifications_card.png',
    'indexifications': 'images/tools/Indexifications_card.png',
    'kwfinder': 'images/tools/Kwfinder_card.png',
    'magnific': 'images/tools/Magnific_card.png',
    'majestic': 'images/tools/Majestic_card.png',
    'picmonkey': 'images/tools/PicMonkey_card.png',
    'rewritify': 'images/tools/Rewritify_card.png',
    'skillshare': 'images/tools/SkillShare_card.png',
    'smodin': 'images/tools/Smodin_card.png',
    'stealthwriter': 'images/tools/StealthWriter_card.png',
    'storyblocks': 'images/tools/Storyblocks_card.png',
    'vidiq': 'images/tools/VidIQ_card.png',
    'vistacreate': 'images/tools/VistaCreate_card.png',
    'woorank': 'images/tools/Woorank_card.png',
    'buzzstream': 'images/tools/BuzzStream_card.png',
    'copymatic': 'images/tools/Copymaticai_card.png',
    'copymatic.ai': 'images/tools/Copymaticai_card.png'
};

// Helper: Get thumbnail image path for tool (prioritizes user uploaded image, then preloaded Base64)
function getToolThumbnail(tool) {
    if (!tool) return null;
    if (tool.image) return tool.image; // Custom user uploaded Base64 image
    const kw = (tool.keyword || '').toLowerCase().trim();
    const name = (tool.name || '').toLowerCase().trim();

    // Check preloaded assets dictionary first for 100% offline CORS-free loading
    if (window.getPreloadedAsset) {
        const found = window.getPreloadedAsset(kw) || window.getPreloadedAsset(name);
        if (found) return found;
    }

    for (const [key, path] of Object.entries(TOOL_THUMBNAILS)) {
        if (kw === key || kw.includes(key) || name.includes(key)) {
            if (window.getPreloadedAsset) {
                const pre = window.getPreloadedAsset(path);
                if (pre) return pre;
            }
            return path;
        }
    }
    return null;
}

// Helper: Get poster image for marketing plan (prioritizes user uploaded Base64, then preloaded assets)
function getPlanPoster(plan) {
    if (!plan) return 'images/plans/Basic Plan.jpg';
    if (plan.image && plan.image.startsWith('data:')) return plan.image;
    if (window.getPreloadedAsset) {
        const found = window.getPreloadedAsset(plan.slug) || 
                      window.getPreloadedAsset(plan.name) || 
                      window.getPreloadedAsset(plan.image);
        if (found) return found;
    }
    return plan.image || 'images/plans/Basic Plan.jpg';
}

// Dedicated 1-Click Clipboard Copy Handler for Marketing Plans
function copyPlanCardImage(element, planId) {
    const plan = (allPlans || []).find(p => p.id === planId);
    const poster = plan ? getPlanPoster(plan) : (element ? element.querySelector('img')?.src : null);
    const title = plan ? plan.name : 'Marketing Plan';
    copyCardImage(element, poster, title);
}

// Dedicated 1-Click Clipboard Copy Handler for Single Tools
function copyToolCardImage(element, toolId) {
    const tool = (allTools || []).find(t => t.id === toolId);
    const thumb = tool ? getToolThumbnail(tool) : (element ? element.querySelector('img')?.src : null);
    const title = tool ? tool.name : 'Tool';
    copyCardImage(element, thumb, title);
}

// Resizes and converts user uploaded file to compact Base64
function readFileAsResizedBase64(file, maxDimension = 1200) {
    return new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                let width = img.naturalWidth || img.width;
                let height = img.naturalHeight || img.height;

                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    } else {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
                resolve(canvas.toDataURL(mime, 0.90));
            };
            img.onerror = () => resolve(e.target.result);
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Initialize Tools Module
async function initToolsModule() {
    await loadToolsFromDB();
    await loadPlansFromDB();
    setupToolsEventListeners();
    renderMarketingPlans();
    renderCategoryPills();
    renderToolsList();
    updatePackageDock();
}

// Load plans from Dexie DB
async function loadPlansFromDB() {
    try {
        if (typeof getAllPlans === 'function') {
            allPlans = await getAllPlans();
        } else {
            allPlans = typeof DEFAULT_PLANS !== 'undefined' ? DEFAULT_PLANS : [];
        }
    } catch (err) {
        console.error('Error loading plans:', err);
        allPlans = typeof DEFAULT_PLANS !== 'undefined' ? DEFAULT_PLANS : [];
    }
}

// Load tools from Dexie DB
async function loadToolsFromDB() {
    try {
        allTools = await db.tools.toArray();
        if (!allTools || allTools.length === 0) {
            await initDatabase();
            allTools = await db.tools.toArray();
        }
    } catch (err) {
        console.error('Error loading tools:', err);
    }
}

// Setup Event Listeners
function setupToolsEventListeners() {
    const searchInput = document.getElementById('tool-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            // If user searches, switch to tools view automatically to show search results
            if (searchQuery && currentToolsSubView !== 'tools') {
                switchToolsSubView('tools');
            }
            renderToolsList();
        });
    }

    const discountInput = document.getElementById('package-discount-input');
    if (discountInput) {
        discountInput.addEventListener('input', () => {
            updatePackageDock();
        });
    }
}

// Switch between Marketing Plans and Single Tools
function switchToolsSubView(view) {
    currentToolsSubView = view;
    const plansSec = document.getElementById('marketing-plans-section');
    const toolsSec = document.getElementById('single-tools-section');

    const btnPlans = document.getElementById('subview-btn-plans');
    const btnTools = document.getElementById('subview-btn-tools');

    if (view === 'plans') {
        if (plansSec) plansSec.classList.remove('hidden');
        if (toolsSec) toolsSec.classList.add('hidden');
        if (btnPlans) {
            btnPlans.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white shadow-sm transition-all';
        }
        if (btnTools) {
            btnTools.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all';
        }
    } else {
        if (plansSec) plansSec.classList.add('hidden');
        if (toolsSec) toolsSec.classList.remove('hidden');
        if (btnTools) {
            btnTools.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white shadow-sm transition-all';
        }
        if (btnPlans) {
            btnPlans.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all';
        }
    }
}

// Render Marketing Plans Showcase from Database
function renderMarketingPlans() {
    const container = document.getElementById('marketing-plans-grid');
    if (!container) return;

    if (!allPlans || allPlans.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                <i class="fa-solid fa-layer-group text-4xl mb-3 block text-slate-300"></i>
                <p class="text-base font-semibold text-slate-600">No marketing combo plans configured</p>
                <p class="text-xs text-slate-400 mt-1">Create your first custom marketing plan or reload defaults.</p>
                <button onclick="openAddPlanModal()" class="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm">
                    <i class="fa-solid fa-plus mr-1.5"></i>Create New Plan
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = allPlans.map(plan => {
        const planTools = Array.isArray(plan.tools) ? plan.tools : (typeof plan.tools === 'string' ? plan.tools.split(',') : []);
        const posterImg = getPlanPoster(plan);
        const planId = plan.id;

        return `
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between card-hover">
            <!-- Clickable Plan Poster Image with Instant Clipboard Copy & Visual Badge -->
            <div class="relative group cursor-pointer bg-slate-100 overflow-hidden" 
                 onclick="copyPlanCardImage(this, ${planId})" 
                 title="Click to copy poster image to clipboard for WhatsApp!">
                <img src="${posterImg}" alt="${escapeHtml(plan.name)}" 
                     class="w-full h-64 object-cover object-top group-hover:scale-105 transition-transform duration-300">
                
                <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span class="px-3 py-1.5 rounded-xl bg-white/95 text-slate-900 text-xs font-black shadow-lg flex items-center gap-1.5 backdrop-blur-sm pointer-events-none">
                        <i class="fa-solid fa-copy text-sky-600"></i>
                        <span>Click to Copy for WhatsApp</span>
                    </span>
                    <button type="button" onclick="event.stopPropagation(); openImageLightbox('${posterImg}', '${escapeHtml(plan.name)}')" 
                            class="p-2 rounded-xl bg-slate-900/80 text-white hover:bg-slate-900" title="View Full Poster">
                        <i class="fa-solid fa-expand text-xs"></i>
                    </button>
                </div>

                <div class="absolute top-3 left-3 flex items-center gap-2">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${plan.badgeColor || 'bg-blue-100 text-blue-800'} shadow-sm backdrop-blur-md">
                        ${escapeHtml(plan.badge || 'Plan')}
                    </span>
                </div>

                <!-- Plan Edit & Delete Quick Actions -->
                <div class="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-xl shadow-md" onclick="event.stopPropagation()">
                    <button onclick="openEditPlanModal(${planId})" title="Edit Plan & Poster" class="p-1.5 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors">
                        <i class="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button onclick="confirmDeletePlan(${planId})" title="Delete Plan" class="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                </div>
            </div>

            <!-- Content & Actions -->
            <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="text-lg font-black text-slate-900">${escapeHtml(plan.name)}</h3>
                        <div class="text-right">
                            <span class="text-lg font-black text-sky-700">${Number(plan.price).toLocaleString()}</span>
                            <span class="text-[10px] font-bold text-slate-500 uppercase">PKR</span>
                        </div>
                    </div>
                    <p class="text-xs text-slate-500 mb-3">${escapeHtml(plan.description || '')}</p>

                    <!-- Included Tools Badges -->
                    <div class="flex flex-wrap gap-1 mb-4">
                        ${planTools.map(t => `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">${escapeHtml(t.trim())}</span>`).join('')}
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="pt-3 border-t border-slate-100 space-y-2">
                    <div class="grid grid-cols-2 gap-2">
                        <button onclick="copyPlanCardImage(this.closest('.card-hover')?.querySelector('.group') || this, ${planId})" 
                                class="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                                title="Copies the actual poster image to clipboard for WhatsApp">
                            <i class="fa-solid fa-image text-emerald-600"></i>
                            <span>Copy Image</span>
                        </button>
                        <button onclick="copyPlanWhatsApp(${planId})" 
                                class="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                                title="Copy WhatsApp quotation text">
                            <i class="fa-brands fa-whatsapp text-emerald-600"></i>
                            <span>Copy Text</span>
                        </button>
                    </div>

                    <button onclick="sendPlanToInvoice(${planId})" 
                            class="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors">
                        <i class="fa-solid fa-file-invoice text-xs"></i>
                        <span>Add Plan to Invoice</span>
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Copy plan WhatsApp text
function copyPlanWhatsApp(planId) {
    const plan = allPlans.find(p => p.id === planId || p.slug === String(planId));
    if (!plan) return;

    const msg = plan.message || `*AZAD SEO - ${plan.name}*\nPrice: *${plan.price} PKR*`;
    navigator.clipboard.writeText(msg).then(() => {
        showToast(`Copied ${plan.name} text for WhatsApp!`, 'success');
    }).catch(() => {
        fallbackCopyTextToClipboard(msg);
        showToast(`Copied ${plan.name} text!`, 'success');
    });
}

// Send Plan to Invoice
function sendPlanToInvoice(planId) {
    const plan = allPlans.find(p => p.id === planId || p.slug === String(planId));
    if (!plan) return;

    switchTab('invoice');
    const toolsStr = Array.isArray(plan.tools) ? plan.tools.join(', ') : (plan.tools || '');
    addInvoiceItem({
        name: plan.name,
        description: `${plan.description || 'Promotional Combo Plan'} (Includes: ${toolsStr})`,
        qty: 1,
        days: 30,
        unitPrice: plan.price
    });

    showToast(`Added ${plan.name} to Invoice!`, 'success');
}

// Render Category Filter Pills
function renderCategoryPills() {
    const container = document.getElementById('tool-categories-container');
    if (!container) return;

    const categoriesSet = new Set(['All', 'SEO / Research', 'Content & AI', 'Design & Graphics', 'E-Commerce', 'Developer & Indexing']);
    allTools.forEach(t => {
        if (t.category) categoriesSet.add(t.category);
    });

    const categories = Array.from(categoriesSet);
    
    container.innerHTML = categories.map(cat => {
        const isActive = currentCategory === cat;
        const activeClass = isActive 
            ? 'bg-sky-600 text-white shadow-sm' 
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200';
        return `
            <button onclick="filterToolsByCategory('${escapeHtml(cat)}')" 
                    class="px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeClass}">
                ${escapeHtml(cat)}
            </button>
        `;
    }).join('');
}

// Filter by category
function filterToolsByCategory(cat) {
    currentCategory = cat;
    renderCategoryPills();
    renderToolsList();
}

// Render Tools Grid with Clickable Pictures & Full CRUD
function renderToolsList() {
    const container = document.getElementById('tools-grid');
    const countBadge = document.getElementById('tools-count-badge');
    if (!container) return;

    let filtered = allTools.filter(tool => {
        const matchesCategory = (currentCategory === 'All') || (tool.category === currentCategory);
        const matchesSearch = !searchQuery || 
            (tool.name && tool.name.toLowerCase().includes(searchQuery)) ||
            (tool.keyword && tool.keyword.toLowerCase().includes(searchQuery)) ||
            (tool.specs && tool.specs.toLowerCase().includes(searchQuery));
        return matchesCategory && matchesSearch;
    });

    if (countBadge) {
        countBadge.innerText = `${filtered.length} Tools`;
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-12 text-center text-slate-400">
                <i class="fa-solid fa-magnifying-glass text-4xl mb-3 block"></i>
                <p class="text-base font-medium">No tools found matching "${searchQuery}"</p>
                <p class="text-xs text-slate-400 mt-1">Try another keyword or category filter</p>
                <button onclick="openAddToolModal()" class="mt-4 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700">
                    <i class="fa-solid fa-plus mr-1.5"></i>Add This Tool to Catalog
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(tool => {
        const isSelected = selectedToolIds.has(tool.id);
        const cardBorder = isSelected ? 'border-sky-500 bg-sky-50/50 shadow-md ring-2 ring-sky-400/20' : 'border-slate-200 bg-white hover:border-slate-300';
        const thumbImg = getToolThumbnail(tool);
        
        return `
            <div class="relative flex flex-col justify-between p-4 rounded-xl border transition-all card-hover ${cardBorder}">
                <div>
                    <!-- Visual Tool Picture (if available) -->
                    ${thumbImg ? `
                        <div class="relative group cursor-pointer mb-3 rounded-lg overflow-hidden bg-slate-100 border border-slate-200"
                             onclick="copyToolCardImage(this, ${tool.id})" 
                             title="Click to copy tool image to clipboard for WhatsApp!">
                            <img src="${thumbImg}" alt="${escapeHtml(tool.name)}" class="w-full h-36 object-contain group-hover:scale-105 transition-transform duration-300">
                            <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                <span class="px-2.5 py-1 rounded-lg bg-white/95 text-slate-900 text-[11px] font-black shadow flex items-center gap-1 pointer-events-none">
                                    <i class="fa-solid fa-copy text-sky-600"></i>
                                    <span>Copy for WhatsApp</span>
                                </span>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Header with Category and Edit/Delete controls -->
                    <div class="flex items-start justify-between gap-2 mb-2">
                        <div class="flex-1">
                            <span class="inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide badge-category mb-1">
                                ${escapeHtml(tool.category || 'General')}
                            </span>
                            <h4 class="font-bold text-slate-800 text-base leading-tight">${escapeHtml(tool.name)}</h4>
                            <p class="text-[11px] font-mono-code text-slate-400">#${escapeHtml(tool.keyword || tool.name.toLowerCase().replace(/\s+/g, ''))}</p>
                        </div>
                        <div class="text-right shrink-0">
                            <span class="text-base font-extrabold text-sky-700">${Number(tool.price).toLocaleString()}</span>
                            <span class="text-[10px] font-bold text-slate-500 block uppercase">${escapeHtml(tool.currency || 'PKR')}</span>
                            
                            <!-- Edit / Delete Tools Actions -->
                            <div class="flex items-center justify-end gap-1 mt-1">
                                <button onclick="openEditToolModal(${tool.id})" title="Edit Tool Price & Specs" 
                                        class="p-1 rounded text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors">
                                    <i class="fa-solid fa-pen text-[11px]"></i>
                                </button>
                                <button onclick="confirmDeleteTool(${tool.id})" title="Delete Tool" 
                                        class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                                    <i class="fa-solid fa-trash-can text-[11px]"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <p class="text-xs text-slate-600 line-clamp-3 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        ${escapeHtml(tool.specs || 'Shared Access for 30 Days')}
                    </p>
                </div>

                <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div class="flex items-center gap-1">
                        ${thumbImg ? `
                            <button onclick="copyToolCardImage(this.closest('.card-hover')?.querySelector('.group') || this, ${tool.id})" 
                                    title="Copy picture for WhatsApp" 
                                    class="p-1.5 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs">
                                <i class="fa-solid fa-image text-slate-600"></i>
                            </button>
                        ` : ''}
                        <button onclick="copyToolWhatsApp(${tool.id})" 
                                title="Copy formatted message for WhatsApp" 
                                class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1.5">
                            <i class="fa-brands fa-whatsapp text-sm text-emerald-600"></i>
                            <span>Script</span>
                        </button>
                    </div>
                    
                    <button onclick="toggleToolSelection(${tool.id})" 
                            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                isSelected 
                                    ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100' 
                                    : 'bg-sky-600 text-white hover:bg-sky-700 shadow-sm'
                            }">
                        <i class="fa-solid ${isSelected ? 'fa-check' : 'fa-plus'}"></i>
                        <span>${isSelected ? 'Selected' : 'Add to Package'}</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Toggle tool in package
function toggleToolSelection(id) {
    if (selectedToolIds.has(id)) {
        selectedToolIds.delete(id);
    } else {
        selectedToolIds.add(id);
    }
    renderToolsList();
    updatePackageDock();
}

// Remove from package
function removeFromPackage(id) {
    selectedToolIds.delete(id);
    renderToolsList();
    updatePackageDock();
}

// Clear package
function clearPackage() {
    selectedToolIds.clear();
    renderToolsList();
    updatePackageDock();
    showToast('Package cleared', 'info');
}

// Update Package Dock UI
function updatePackageDock() {
    const dock = document.getElementById('package-dock');
    if (!dock) return;

    if (selectedToolIds.size === 0) {
        dock.classList.add('hidden');
        return;
    }
    dock.classList.remove('hidden');

    const selectedTools = allTools.filter(t => selectedToolIds.has(t.id));
    const subtotal = selectedTools.reduce((acc, t) => acc + (Number(t.price) || 0), 0);
    
    const discountEl = document.getElementById('package-discount-input');
    const discountPercent = discountEl ? (parseFloat(discountEl.value) || 0) : 0;
    const discountAmount = Math.round(subtotal * (discountPercent / 100));
    const netTotal = Math.max(0, subtotal - discountAmount);

    document.getElementById('dock-item-count').innerText = `${selectedTools.length} Item${selectedTools.length > 1 ? 's' : ''}`;
    document.getElementById('dock-subtotal').innerText = `${subtotal.toLocaleString()} PKR`;
    document.getElementById('dock-discount-amt').innerText = `-${discountAmount.toLocaleString()} PKR`;
    document.getElementById('dock-net-total').innerText = `${netTotal.toLocaleString()} PKR`;

    const itemsContainer = document.getElementById('dock-selected-items');
    if (itemsContainer) {
        itemsContainer.innerHTML = selectedTools.map(tool => `
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                ${escapeHtml(tool.name)} (${tool.price} PKR)
                <button onclick="removeFromPackage(${tool.id})" class="text-slate-400 hover:text-rose-600">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </span>
        `).join('');
    }
}

// Copy single tool script for WhatsApp
function copyToolWhatsApp(toolId) {
    const tool = allTools.find(t => t.id === toolId);
    if (!tool) return;

    let msg = tool.message;
    if (!msg) {
        msg = `*${tool.name}*\nPrice: *${tool.price} ${tool.currency || 'PKR'}*\n${tool.specs || 'Shared Access for 30 Days'}\n\n*Azad SEO - Premium Digital Solutions*`;
    }

    navigator.clipboard.writeText(msg).then(() => {
        showToast(`Copied ${tool.name} script to clipboard!`, 'success');
    }).catch(err => {
        fallbackCopyTextToClipboard(msg);
        showToast(`Copied ${tool.name} script!`, 'success');
    });
}

// Copy full package quotation for WhatsApp
function copyPackageWhatsApp() {
    const selectedTools = allTools.filter(t => selectedToolIds.has(t.id));
    if (selectedTools.length === 0) return;

    const subtotal = selectedTools.reduce((acc, t) => acc + (Number(t.price) || 0), 0);
    const discountEl = document.getElementById('package-discount-input');
    const discountPercent = discountEl ? (parseFloat(discountEl.value) || 0) : 0;
    const discountAmount = Math.round(subtotal * (discountPercent / 100));
    const netTotal = Math.max(0, subtotal - discountAmount);

    let text = `🌟 *AZAD SEO - CUSTOM PACKAGE QUOTATION* 🌟\n\n`;
    text += `Dear Client, here is your customized SEO & Marketing Tools package:\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;

    selectedTools.forEach((tool, index) => {
        text += `*${index + 1}. ${tool.name}*\n`;
        text += `   • Price: *${tool.price} PKR*\n`;
        if (tool.specs) {
            text += `   • Specs: ${tool.specs}\n`;
        }
        text += `\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `Subtotal: ${subtotal.toLocaleString()} PKR\n`;
    if (discountPercent > 0) {
        text += `Special Discount (${discountPercent}%): -${discountAmount.toLocaleString()} PKR\n`;
    }
    text += `*Grand Total: ${netTotal.toLocaleString()} PKR*\n`;
    text += `Validity: 30 Days Active Access\n\n`;
    text += `⚡ Instant activation upon payment verification.\n`;
    text += `Contact Azad SEO Support for payment details. Thank you!`;

    navigator.clipboard.writeText(text).then(() => {
        showToast('WhatsApp Quotation copied to clipboard!', 'success');
    }).catch(() => {
        fallbackCopyTextToClipboard(text);
        showToast('WhatsApp Quotation copied!', 'success');
    });
}

// Send selected tools directly to Invoice Maker
function sendPackageToInvoice() {
    const selectedTools = allTools.filter(t => selectedToolIds.has(t.id));
    if (selectedTools.length === 0) {
        showToast('Select at least one tool first', 'warning');
        return;
    }

    switchTab('invoice');

    selectedTools.forEach(tool => {
        addInvoiceItem({
            name: tool.name,
            description: tool.specs || 'Shared Access for 30 Days',
            qty: 1,
            days: 30,
            unitPrice: tool.price
        });
    });

    showToast(`Added ${selectedTools.length} tool(s) to Invoice!`, 'success');
}

// ==========================================================================
// Tool Management (Add / Edit / Delete Tool with Image Upload)
// ==========================================================================

async function handleToolImageUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    try {
        currentToolImageBase64 = await readFileAsResizedBase64(file, 800);
        const preview = document.getElementById('tool-image-preview');
        const placeholder = document.getElementById('tool-image-placeholder');
        const removeBtn = document.getElementById('tool-image-remove-btn');

        if (preview && currentToolImageBase64) {
            preview.src = currentToolImageBase64;
            preview.classList.remove('hidden');
        }
        if (placeholder) placeholder.classList.add('hidden');
        if (removeBtn) removeBtn.classList.remove('hidden');
        showToast('Tool picture loaded! Ready to save.', 'info');
    } catch (err) {
        console.error('Tool image upload error:', err);
        showToast('Failed to load image', 'error');
    }
}

function removeToolImage() {
    currentToolImageBase64 = null;
    const fileInput = document.getElementById('tool-image-file');
    if (fileInput) fileInput.value = '';

    const preview = document.getElementById('tool-image-preview');
    const placeholder = document.getElementById('tool-image-placeholder');
    const removeBtn = document.getElementById('tool-image-remove-btn');

    if (preview) {
        preview.src = '';
        preview.classList.add('hidden');
    }
    if (placeholder) placeholder.classList.remove('hidden');
    if (removeBtn) removeBtn.classList.add('hidden');
}

function openAddToolModal() {
    editingToolId = null;
    document.getElementById('tool-modal-title').innerText = 'Add New Tool to Catalog';
    document.getElementById('tool-name-input').value = '';
    document.getElementById('tool-keyword-input').value = '';
    document.getElementById('tool-category-input').value = 'SEO / Research';
    document.getElementById('tool-price-input').value = '';
    document.getElementById('tool-specs-input').value = 'Shared Access for 30 Days';
    document.getElementById('tool-message-input').value = '';
    document.getElementById('tool-form-submit-btn').innerText = 'Save Tool to Database';

    removeToolImage();
    document.getElementById('tool-editor-modal')?.classList.remove('hidden');
}

function openEditToolModal(toolId) {
    const tool = allTools.find(t => t.id === toolId);
    if (!tool) return;

    editingToolId = toolId;
    document.getElementById('tool-modal-title').innerText = `Edit: ${tool.name}`;
    document.getElementById('tool-name-input').value = tool.name || '';
    document.getElementById('tool-keyword-input').value = tool.keyword || '';
    document.getElementById('tool-category-input').value = tool.category || 'SEO / Research';
    document.getElementById('tool-price-input').value = tool.price || 0;
    document.getElementById('tool-specs-input').value = tool.specs || '';
    document.getElementById('tool-message-input').value = tool.message || '';
    document.getElementById('tool-form-submit-btn').innerText = 'Update Tool';

    currentToolImageBase64 = tool.image || null;
    const preview = document.getElementById('tool-image-preview');
    const placeholder = document.getElementById('tool-image-placeholder');
    const removeBtn = document.getElementById('tool-image-remove-btn');

    if (currentToolImageBase64 && preview) {
        preview.src = currentToolImageBase64;
        preview.classList.remove('hidden');
        if (placeholder) placeholder.classList.add('hidden');
        if (removeBtn) removeBtn.classList.remove('hidden');
    } else {
        const thumb = getToolThumbnail(tool);
        if (thumb && preview) {
            preview.src = thumb;
            preview.classList.remove('hidden');
            if (placeholder) placeholder.classList.add('hidden');
            if (removeBtn) removeBtn.classList.remove('hidden');
            currentToolImageBase64 = thumb;
        } else {
            removeToolImage();
        }
    }

    document.getElementById('tool-editor-modal')?.classList.remove('hidden');
}

async function handleSaveToolForm() {
    const name = document.getElementById('tool-name-input')?.value?.trim();
    const keyword = document.getElementById('tool-keyword-input')?.value?.trim() || name.toLowerCase().replace(/\s+/g, '');
    const category = document.getElementById('tool-category-input')?.value?.trim() || 'General';
    const price = parseFloat(document.getElementById('tool-price-input')?.value) || 0;
    const specs = document.getElementById('tool-specs-input')?.value?.trim() || 'Shared Access for 30 Days';
    let message = document.getElementById('tool-message-input')?.value?.trim();

    if (!name) {
        showToast('Please enter a tool name', 'warning');
        return;
    }

    if (!message) {
        message = `${name}\nPrice *${price} PKR*\n${specs}`;
    }

    const toolData = {
        name: name,
        keyword: keyword,
        category: category,
        price: price,
        currency: 'PKR',
        specs: specs,
        message: message,
        image: currentToolImageBase64 || null
    };

    try {
        if (editingToolId) {
            await db.tools.update(editingToolId, toolData);
            showToast(`Updated ${name} in database!`, 'success');
        } else {
            await db.tools.add(toolData);
            showToast(`Added ${name} to database!`, 'success');
        }

        closeModal('tool-editor-modal');
        await loadToolsFromDB();
        renderCategoryPills();
        renderToolsList();
        updatePackageDock();
        if (typeof updateDatabaseStats === 'function') updateDatabaseStats();
        window.GitHubLiveDB?.triggerAutoSync('Updated tool: ' + name);
    } catch (err) {
        console.error('Error saving tool:', err);
        showToast('Error saving tool: ' + err.message, 'error');
    }
}

// ==========================================================================
// Marketing Plans Management (Add / Edit / Delete Plan with Poster Upload)
// ==========================================================================

async function handlePlanImageUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    try {
        currentPlanImageBase64 = await readFileAsResizedBase64(file, 1400);
        const preview = document.getElementById('plan-image-preview');
        const placeholder = document.getElementById('plan-image-placeholder');
        const removeBtn = document.getElementById('plan-image-remove-btn');

        if (preview && currentPlanImageBase64) {
            preview.src = currentPlanImageBase64;
            preview.classList.remove('hidden');
        }
        if (placeholder) placeholder.classList.add('hidden');
        if (removeBtn) removeBtn.classList.remove('hidden');
        showToast('Plan poster image loaded!', 'info');
    } catch (err) {
        console.error('Plan poster upload error:', err);
        showToast('Failed to load poster', 'error');
    }
}

function removePlanImage() {
    currentPlanImageBase64 = null;
    const fileInput = document.getElementById('plan-image-file');
    if (fileInput) fileInput.value = '';

    const preview = document.getElementById('plan-image-preview');
    const placeholder = document.getElementById('plan-image-placeholder');
    const removeBtn = document.getElementById('plan-image-remove-btn');

    if (preview) {
        preview.src = '';
        preview.classList.add('hidden');
    }
    if (placeholder) placeholder.classList.remove('hidden');
    if (removeBtn) removeBtn.classList.add('hidden');
}

function openAddPlanModal() {
    editingPlanId = null;
    document.getElementById('plan-modal-title').innerText = 'Add Marketing Combo Plan';
    document.getElementById('plan-name-input').value = '';
    document.getElementById('plan-price-input').value = '';
    document.getElementById('plan-duration-input').value = '30 Days Access';
    document.getElementById('plan-badge-input').value = 'Special Offer';
    document.getElementById('plan-badge-color-input').value = 'bg-emerald-100 text-emerald-800';
    document.getElementById('plan-desc-input').value = '';
    document.getElementById('plan-tools-input').value = '';
    document.getElementById('plan-message-input').value = '';
    document.getElementById('plan-form-submit-btn').innerText = 'Save Plan to Catalog';

    removePlanImage();
    document.getElementById('plan-editor-modal')?.classList.remove('hidden');
}

function openEditPlanModal(planId) {
    const plan = allPlans.find(p => p.id === planId || p.slug === String(planId));
    if (!plan) return;

    editingPlanId = plan.id;
    document.getElementById('plan-modal-title').innerText = `Edit: ${plan.name}`;
    document.getElementById('plan-name-input').value = plan.name || '';
    document.getElementById('plan-price-input').value = plan.price || '';
    document.getElementById('plan-duration-input').value = plan.duration || '30 Days Access';
    document.getElementById('plan-badge-input').value = plan.badge || 'Featured';
    document.getElementById('plan-badge-color-input').value = plan.badgeColor || 'bg-blue-100 text-blue-800';
    document.getElementById('plan-desc-input').value = plan.description || '';
    document.getElementById('plan-tools-input').value = Array.isArray(plan.tools) ? plan.tools.join(', ') : (plan.tools || '');
    document.getElementById('plan-message-input').value = plan.message || '';
    document.getElementById('plan-form-submit-btn').innerText = 'Update Plan';

    currentPlanImageBase64 = plan.image || null;
    const preview = document.getElementById('plan-image-preview');
    const placeholder = document.getElementById('plan-image-placeholder');
    const removeBtn = document.getElementById('plan-image-remove-btn');

    if (currentPlanImageBase64 && preview) {
        preview.src = currentPlanImageBase64;
        preview.classList.remove('hidden');
        if (placeholder) placeholder.classList.add('hidden');
        if (removeBtn) removeBtn.classList.remove('hidden');
    } else {
        removePlanImage();
    }

    document.getElementById('plan-editor-modal')?.classList.remove('hidden');
}

async function handleSavePlanForm() {
    const name = document.getElementById('plan-name-input')?.value?.trim();
    const price = parseFloat(document.getElementById('plan-price-input')?.value) || 0;
    const duration = document.getElementById('plan-duration-input')?.value?.trim() || '30 Days Access';
    const badge = document.getElementById('plan-badge-input')?.value?.trim() || 'Featured';
    const badgeColor = document.getElementById('plan-badge-color-input')?.value || 'bg-emerald-100 text-emerald-800';
    const description = document.getElementById('plan-desc-input')?.value?.trim() || '';
    const rawTools = document.getElementById('plan-tools-input')?.value?.trim() || '';
    const tools = rawTools ? rawTools.split(',').map(s => s.trim()).filter(Boolean) : [];
    let message = document.getElementById('plan-message-input')?.value?.trim();

    if (!name) {
        showToast('Please enter a plan name', 'warning');
        return;
    }

    if (!message) {
        message = `🌟 *AZAD SEO - ${name.toUpperCase()}* 🌟\nPrice: *${price} PKR*\nDuration: ${duration}\n\nIncluded Tools:\n${tools.map(t => '• ' + t).join('\n')}\n\n⚡ Instant Activation upon payment verification.\nContact Azad SEO Support. Thank you!`;
    }

    const planData = {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        price,
        currency: 'PKR',
        duration,
        badge,
        badgeColor,
        description,
        tools,
        message,
        image: currentPlanImageBase64 || 'images/plans/Basic Plan.jpg'
    };

    try {
        if (editingPlanId) {
            await updatePlan(editingPlanId, planData);
            showToast(`Updated ${name} plan!`, 'success');
        } else {
            await addPlan(planData);
            showToast(`Added ${name} plan!`, 'success');
        }

        closeModal('plan-editor-modal');
        await loadPlansFromDB();
        renderMarketingPlans();
        window.GitHubLiveDB?.triggerAutoSync('Updated plan: ' + name);
    } catch (err) {
        console.error('Error saving plan:', err);
        showToast('Error saving plan: ' + err.message, 'error');
    }
}

async function confirmDeletePlan(planId) {
    const plan = allPlans.find(p => p.id === planId);
    if (!plan) return;

    if (!confirm(`Are you sure you want to delete the plan "${plan.name}"?`)) {
        return;
    }

    try {
        await deletePlan(planId);
        showToast(`Deleted ${plan.name} plan`, 'info');
        await loadPlansFromDB();
        renderMarketingPlans();
        window.GitHubLiveDB?.triggerAutoSync('Deleted plan: ' + plan.name);
    } catch (err) {
        console.error('Error deleting plan:', err);
        showToast('Error deleting plan: ' + err.message, 'error');
    }
}

async function confirmDeleteTool(toolId) {
    const tool = allTools.find(t => t.id === toolId);
    if (!tool) return;

    if (!confirm(`Are you sure you want to delete "${tool.name}" from your tools catalog?`)) {
        return;
    }

    try {
        await db.tools.delete(toolId);
        selectedToolIds.delete(toolId);
        showToast(`Deleted ${tool.name}`, 'info');

        await loadToolsFromDB();
        renderCategoryPills();
        renderToolsList();
        updatePackageDock();
        if (typeof updateDatabaseStats === 'function') updateDatabaseStats();
        window.GitHubLiveDB?.triggerAutoSync('Deleted tool: ' + tool.name);
    } catch (err) {
        console.error('Error deleting tool:', err);
        showToast('Error deleting tool: ' + err.message, 'error');
    }
}

// Export Tools for GitHub Repository (Enables Updating for ALL users on GitHub Pages)
async function exportToolsForGitHub() {
    const tools = await db.tools.toArray();
    const jsonStr = JSON.stringify(tools, null, 2);

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `default_tools.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Downloaded default_tools.json! Commit this file to GitHub to update for all visitors.', 'success');
}

// Helper: Escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Helper: Fallback copy
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
    } catch (err) {}
    document.body.removeChild(textArea);
}
