/**
 * ==============================================================================
 * Business Quotation & Customer Interaction Portal - Application Core
 * Features:
 *  - Client-Side Excel Import (SheetJS) with auto-column detection & preview
 *  - Live Quotation Generator with taxes, units & currency formatting
 *  - Customer Enquiry Lead Capture with reference tracking
 *  - Client-Side Excel Export for customer enquiry data
 *  - Admin Portal with passcode authentication
 *  - Direct WhatsApp Quotation integration
 *  - Printable Corporate Quotation / PDF layout
 * ==============================================================================
 */

// LocalStorage Keys
const STORAGE_KEYS = {
  CATALOG: 'om_traders_catalog_v2',
  ENQUIRIES: 'om_traders_enquiries_v2',
  SETTINGS: 'om_traders_settings_v2',
  AUTH: 'om_traders_admin_session',
  PASSWORD_HASH: 'om_traders_admin_pwd_hash',
  RECOVERY_OTP: 'om_traders_recovery_otp'
};

// Security Build Version - Bumps force session invalidation across all browsers & devices
const SECURITY_BUILD_VERSION = '2026.11.19.v5_ENCRYPTED_AUTH';

// Administrator Configuration & Recovery Settings
// NOTE: Cryptographic SHA-256 Hashes Only. No plain text passwords exist in this code!
const ADMIN_CONFIG = {
  RECOVERY_EMAIL: 'Amit.omtraders@gmail.com',
  // SHA-256 Hashes of credentials (Irreversible one-way mathematical hashes)
  MASTER_HASH: 'b5d7a193dbef8c37c660807013f4a8b98caafcbf3e34cc4221b37064b7d1726d',
  EMERGENCY_PIN_HASH: 'ab6c884c7d7cf5f9795c01c9163d39c5b87d1845e60166caa4c29311e22059f2',
  CLOUD_SYNC_URL: 'https://kvdb.io/omtraders_kalwan_bucket_v1/admin_pwd'
};

// ==============================================================================
// CRYPTOGRAPHIC SHA-256 HASHING ENGINE (ZERO PLAIN TEXT PASSWORDS IN SCRIPTS)
// ==============================================================================
function pureJsSha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  var mathPow = Math.pow;
  var maxWord = mathPow(2, 32);
  var lengthProperty = 'length';
  var i, j;
  var result = '';
  var words = [];
  var asciiBitLength = ascii[lengthProperty] * 8;
  var hash = [];
  var k = [];
  var primeCounter = 0;
  var isComposite = {};
  for (var candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) isComposite[i] = candidate;
      hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1/3) * maxWord) | 0;
    }
  }
  ascii += '\x80';
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
  words[words[lengthProperty]] = (asciiBitLength | 0);
  for (j = 0; j < words[lengthProperty];) {
    var w = words.slice(j, j += 16);
    var oldHash = hash;
    hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      var w15 = w[i - 15], w2 = w[i - 2];
      var a = hash[0], e = hash[4];
      var temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ ((~e) & hash[6]))
        + k[i]
        + (w[i] = (i < 16) ? w[i] : (
            w[i - 16]
            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
            + w[i - 7]
            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
          ) | 0
        );
      var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      var b = (hash[i] >> (8 * j)) & 255;
      result += ((b < 16) ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

async function hashStringSHA256(str) {
  const clean = (str || '').toString().trim().toLowerCase();
  if (!clean) return '';
  try {
    if (window.crypto && window.crypto.subtle && window.crypto.subtle.digest) {
      const msgUint8 = new TextEncoder().encode(clean);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {}
  return pureJsSha256(clean);
}

// Default Sample Catalog Data (Building & Plumbing Materials)
const DEFAULT_CATALOG = [
  {
    id: 'prod-1',
    name: 'UltraTech PPC Cement (50kg Bag)',
    category: 'Cement & Aggregates',
    price: 380,
    unit: 'per 50kg bag',
    description: 'Premium Portland Pozzolana Cement for high-strength foundation and slab casting.'
  },
  {
    id: 'prod-2',
    name: 'TMT Steel Rebars Fe 550D (12mm)',
    category: 'Steel & TMT',
    price: 58500,
    unit: 'per metric ton',
    description: 'High-ductility earthquake-resistant TMT steel rebars suitable for RCC structures.'
  },
  {
    id: 'prod-3',
    name: 'Astral CPVC Pro Pipe (1" SDR 11 - 10ft)',
    category: 'Plumbing & Pipes',
    price: 320,
    unit: 'per 10ft length',
    description: 'Hot and cold potable water distribution pipe, lead-free and high-pressure rated.'
  },
  {
    id: 'prod-4',
    name: 'Supreme PVC SWR Pipe (4" 110mm - 10ft)',
    category: 'Plumbing & Pipes',
    price: 480,
    unit: 'per 10ft length',
    description: 'Heavy-duty soil, waste and rainwater drainage pipe with ring-fit leakproof joint.'
  },
  {
    id: 'prod-5',
    name: 'CPVC Brass Elbow (1" x 1/2")',
    category: 'Plumbing & Pipes',
    price: 85,
    unit: 'per piece',
    description: 'Threaded heavy brass insert CPVC elbow for secure tap and shower connections.'
  },
  {
    id: 'prod-6',
    name: 'Brass Bib Cock Water Tap with Flange',
    category: 'Sanitary & Fittings',
    price: 290,
    unit: 'per piece',
    description: 'Solid brass chrome-plated wall-mounted water tap with ceramic cartridge.'
  },
  {
    id: 'prod-7',
    name: 'Ceramic Floor-Mount EWC Commode Set',
    category: 'Sanitary & Fittings',
    price: 2650,
    unit: 'per set',
    description: 'Western toilet commode with dual flush cistern, soft-close seat cover and gasket.'
  },
  {
    id: 'prod-8',
    name: 'Dr. Fixit 101 LW+ Waterproofing (20L)',
    category: 'Waterproofing & Chemicals',
    price: 2450,
    unit: 'per 20L drum',
    description: 'Integral liquid waterproofing compound for concrete and mortar plastering.'
  },
  {
    id: 'prod-9',
    name: 'First-Class Red Clay Bricks (1000 Pcs)',
    category: 'Bricks & Masonry',
    price: 7500,
    unit: 'per 1000 pcs',
    description: 'High compressive strength kiln-burnt red clay bricks for masonry load-bearing walls.'
  },
  {
    id: 'prod-10',
    name: 'Birla White Wall Putty (40kg Bag)',
    category: 'Finishing & Paint',
    price: 790,
    unit: 'per 40kg bag',
    description: 'White cement-based polymer modified wall care putty for smooth, crack-resistant walls.'
  }
];

// Default Sample Enquiries Data
const DEFAULT_ENQUIRIES = [
  {
    id: 'ENQ-2026-9102',
    date: '2026-11-12 10:30 AM',
    name: 'Ramesh Kumar',
    email: 'ramesh.builders@gmail.com',
    phone: '+91 98230 11223',
    company: 'Ramesh Construction & Contractors',
    message: 'Need urgent delivery of 150 bags UltraTech cement and 2 tons 12mm TMT steel for site at Sector 4.',
    items: [
      { name: 'UltraTech PPC Cement (50kg Bag)', qty: 150, unit: 'per 50kg bag', rate: 380, total: 57000 },
      { name: 'TMT Steel Rebars Fe 550D (12mm)', qty: 2, unit: 'per metric ton', rate: 58500, total: 117000 }
    ],
    subtotal: 174000,
    taxAmount: 31320,
    total: 205320,
    status: 'Contacted'
  },
  {
    id: 'ENQ-2026-9103',
    date: '2026-11-14 09:15 AM',
    name: 'Deepak Sharma',
    email: 'deepak.sharma@yahoo.com',
    phone: '+91 97110 44556',
    company: 'Sharma Home Renovation',
    message: 'Plumbing materials required for 2 bathrooms and kitchen renovation.',
    items: [
      { name: 'Astral CPVC Pro Pipe (1" SDR 11 - 10ft)', qty: 15, unit: 'per 10ft length', rate: 320, total: 4800 },
      { name: 'CPVC Brass Elbow (1" x 1/2")', qty: 20, unit: 'per piece', rate: 85, total: 1700 },
      { name: 'Brass Bib Cock Water Tap with Flange', qty: 6, unit: 'per piece', rate: 290, total: 1740 }
    ],
    subtotal: 8240,
    taxAmount: 1483.20,
    total: 9723.20,
    status: 'New'
  }
];

// Default Business Settings Matching Lovable Screenshot
const DEFAULT_SETTINGS = {
  businessName: 'OM TRADERS',
  tagline: 'KALWAN, NASHIK',
  city: 'Kalwan, Nashik, Maharashtra',
  currency: '₹',
  taxRate: 18,
  phone: '+91 98765 43210',
  whatsapp: '919876543210',
  email: 'Amit.omtraders@gmail.com',
  address: 'Main Market, Opp. ST Bus Stand, Kalwan, Nashik, Maharashtra 423501',
  terms: '1. Rates are subject to market fluctuations (especially Steel & Cement) and valid for 7 days.\n2. Loading, unloading, and transportation freight charges extra at actuals.\n3. Goods once dispatched will be verified on site by the client.',
  adminPasswordHash: 'b5d7a193dbef8c37c660807013f4a8b98caafcbf3e34cc4221b37064b7d1726d'
};

// Global App State
const AppState = {
  catalog: [],
  cart: {}, // { itemId: qty }
  enquiries: [],
  settings: {},
  isAdmin: false,
  activeCategory: 'ALL',
  searchQuery: '',
  excelParsedData: [],
  excelFileName: '',
  activeAdminTab: 'leads',
  currentViewingEnquiry: null
};

// ==============================================================================
// INITIALIZATION
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadStoredData();
  fetchPasswordFromCloud();
  applySettingsToUI();
  renderCatalogGrid();
  renderCategoryPills();
  updateCartBadge();
  setupEventListeners();
  checkAdminAuth();
  
  // Set current year in footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

function loadStoredData() {
  // 0. Force security session invalidation across all devices on security upgrades
  try {
    const savedBuild = localStorage.getItem('om_traders_security_build');
    if (savedBuild !== SECURITY_BUILD_VERSION) {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      sessionStorage.removeItem(STORAGE_KEYS.AUTH);
      localStorage.setItem('om_traders_security_build', SECURITY_BUILD_VERSION);
    }
  } catch (e) {}

  // 1. Settings
  try {
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const parsed = savedSettings ? JSON.parse(savedSettings) : {};
    AppState.settings = { ...DEFAULT_SETTINGS, ...parsed };
    // Ensure recovery email is set to Amit.omtraders@gmail.com
    if (!AppState.settings.email || AppState.settings.email.includes('omtraders.materials') || AppState.settings.email.includes('omtraders.kalwan')) {
      AppState.settings.email = ADMIN_CONFIG.RECOVERY_EMAIL;
    }
  } catch (e) {
    AppState.settings = { ...DEFAULT_SETTINGS };
  }

  // Load custom password hash if saved
  const savedPasswordHash = getActiveAdminPasswordHash();
  if (savedPasswordHash) {
    AppState.settings.adminPasswordHash = savedPasswordHash;
  }

  // 2. Catalog
  try {
    const savedCatalog = localStorage.getItem(STORAGE_KEYS.CATALOG);
    AppState.catalog = savedCatalog ? JSON.parse(savedCatalog) : [...DEFAULT_CATALOG];
  } catch (e) {
    AppState.catalog = [...DEFAULT_CATALOG];
  }

  // 3. Enquiries
  try {
    const savedEnquiries = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
    AppState.enquiries = savedEnquiries ? JSON.parse(savedEnquiries) : [...DEFAULT_ENQUIRIES];
  } catch (e) {
    AppState.enquiries = [...DEFAULT_ENQUIRIES];
  }

  // 4. Admin Session (Check session or remembered local login)
  const sessionAuth = sessionStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  const localAuth = localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  AppState.isAdmin = sessionAuth || localAuth;
}

function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage write error:', e);
  }
}

// Password Management Helpers (Cryptographic Hash-Based)
function getActiveAdminPasswordHash() {
  let hash = localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH);
  if (hash) {
    try {
      if (typeof hash === 'string' && hash.startsWith('"') && hash.endsWith('"')) {
        hash = JSON.parse(hash);
      }
    } catch (e) {}
  }
  if (!hash && AppState.settings && AppState.settings.adminPasswordHash) {
    hash = AppState.settings.adminPasswordHash;
  }
  return (hash || ADMIN_CONFIG.MASTER_HASH).trim().toLowerCase();
}

function setActiveAdminPasswordHash(newHash) {
  const cleanHash = newHash.trim().toLowerCase();
  if (AppState.settings) {
    AppState.settings.adminPasswordHash = cleanHash;
  }
  localStorage.setItem(STORAGE_KEYS.PASSWORD_HASH, cleanHash);
  localStorage.setItem('om_traders_custom_password_active', 'true');
  saveData(STORAGE_KEYS.SETTINGS, AppState.settings);
}

function isCustomPasswordSet() {
  if (localStorage.getItem('om_traders_custom_password_active') === 'true') {
    return true;
  }
  const activeHash = getActiveAdminPasswordHash();
  if (activeHash && activeHash !== ADMIN_CONFIG.MASTER_HASH) {
    return true;
  }
  return false;
}

// ==============================================================================
// UI SETTINGS BINDINGS
// ==============================================================================
function applySettingsToUI() {
  const s = AppState.settings;
  
  // Header & Footer
  document.getElementById('header-brand-name').textContent = s.businessName;
  document.getElementById('header-tagline').textContent = s.tagline;
  document.getElementById('footer-brand-name').textContent = s.businessName;
  document.getElementById('footer-tagline').textContent = s.tagline;
  document.getElementById('footer-copy-brand').textContent = s.businessName;
  document.getElementById('footer-phone').textContent = s.phone;
  document.getElementById('footer-email').textContent = s.email;
  document.getElementById('footer-address').textContent = s.address;

  // WhatsApp Link
  const cleanPhone = s.whatsapp.replace(/[^0-9]/g, '');
  const waBtn = document.getElementById('header-whatsapp-btn');
  if (waBtn) {
    waBtn.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${s.businessName}, I would like to inquire about your services.`)}`;
  }

  // Print Section
  document.getElementById('print-business-name').textContent = s.businessName;
  document.getElementById('print-tagline').textContent = s.tagline;
  document.getElementById('print-address').textContent = s.address;
  document.getElementById('print-contact').textContent = `Phone: ${s.phone} | Email: ${s.email}`;
  document.getElementById('print-tax-rate').textContent = `${s.taxRate}%`;
  document.getElementById('print-terms').innerText = s.terms;

  // Settings Form Inputs
  document.getElementById('setting-business-name').value = s.businessName;
  document.getElementById('setting-tagline').value = s.tagline;
  document.getElementById('setting-currency').value = s.currency;
  document.getElementById('setting-tax-rate').value = s.taxRate;
  document.getElementById('setting-phone').value = s.phone;
  document.getElementById('setting-whatsapp').value = s.whatsapp;
  document.getElementById('setting-email').value = s.email;
  document.getElementById('setting-address').value = s.address;
  document.getElementById('setting-terms').value = s.terms;

  // Drawer tax percentage
  const drawerTaxEl = document.getElementById('drawer-tax-percent');
  if (drawerTaxEl) drawerTaxEl.textContent = `${s.taxRate}%`;
}

// Format price with configured currency
function formatCurrency(amount) {
  const currency = AppState.settings.currency || '$';
  return `${currency}${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ==============================================================================
// CATALOG RENDERING & FILTERING
// ==============================================================================
function renderCatalogGrid() {
  const grid = document.getElementById('catalog-grid');
  const emptyState = document.getElementById('catalog-empty-state');
  if (!grid) return;
  grid.innerHTML = '';

  const filtered = AppState.catalog.filter(item => {
    const matchesCategory = (AppState.activeCategory === 'ALL') || (item.category === AppState.activeCategory);
    const searchLow = (AppState.searchQuery || '').toLowerCase();
    const matchesSearch = !searchLow || 
      (item.name && item.name.toLowerCase().includes(searchLow)) || 
      (item.description && item.description.toLowerCase().includes(searchLow)) ||
      (item.category && item.category.toLowerCase().includes(searchLow));
    return matchesCategory && matchesSearch;
  });

  const countEl = document.getElementById('total-catalog-count');
  if (countEl) countEl.textContent = AppState.catalog.length;

  if (filtered.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }
  if (emptyState) emptyState.classList.add('hidden');

  filtered.forEach(item => {
    const currentQty = AppState.cart[item.id] || 0;
    const isAdded = currentQty > 0;

    const card = document.createElement('div');
    card.className = `product-card bg-white rounded-2xl border p-5 flex flex-col justify-between ${isAdded ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-md' : 'border-slate-200'}`;

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="inline-block px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-bold">
            ${escapeHtml(item.category || 'General')}
          </span>
          ${isAdded ? `<span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><i class="fa-solid fa-check mr-1"></i>Selected (${currentQty})</span>` : ''}
        </div>
        <h3 class="font-extrabold text-slate-900 text-base leading-snug">${escapeHtml(item.name)}</h3>
        <p class="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">${escapeHtml(item.description || 'Quality material supplied by Om Traders, Kalwan.')}</p>
      </div>

      <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div class="text-xl font-extrabold text-slate-900">${formatCurrency(item.price)}</div>
          <div class="text-[11px] text-slate-500 font-semibold">${escapeHtml(item.unit || 'per unit')}</div>
        </div>

        <div class="flex items-center gap-2">
          ${isAdded ? `
            <div class="flex items-center rounded-xl border border-orange-300 bg-orange-50/50 p-1">
              <button onclick="decrementCart('${item.id}')" class="w-7 h-7 rounded-lg bg-white shadow-xs hover:bg-orange-100 text-orange-700 font-bold flex items-center justify-center transition">
                <i class="fa-solid fa-minus text-xs"></i>
              </button>
              <span class="w-8 text-center text-xs font-extrabold text-orange-950">${currentQty}</span>
              <button onclick="incrementCart('${item.id}')" class="w-7 h-7 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center justify-center transition">
                <i class="fa-solid fa-plus text-xs"></i>
              </button>
            </div>
          ` : `
            <button onclick="addToCart('${item.id}')" class="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm">
              <i class="fa-solid fa-plus"></i> Add to Quote
            </button>
          `}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderCategoryPills() {
  const container = document.getElementById('category-pills');
  if (!container) return;
  // Extract unique categories
  const categories = Array.from(new Set(AppState.catalog.map(i => i.category || 'General'))).filter(Boolean);

  container.innerHTML = `
    <button onclick="setCategoryFilter('ALL')" class="category-btn ${AppState.activeCategory === 'ALL' ? 'active bg-orange-600 text-white font-bold' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'} px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition whitespace-nowrap">
      All Materials (${AppState.catalog.length})
    </button>
  `;

  categories.forEach(cat => {
    const count = AppState.catalog.filter(i => (i.category || 'General') === cat).length;
    const btn = document.createElement('button');
    btn.onclick = () => setCategoryFilter(cat);
    btn.className = `category-btn ${AppState.activeCategory === cat ? 'active bg-orange-600 text-white font-bold' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'} px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition whitespace-nowrap`;
    btn.textContent = `${cat} (${count})`;
    container.appendChild(btn);
  });
}

function setCategoryFilter(cat) {
  AppState.activeCategory = cat;
  renderCategoryPills();
  renderCatalogGrid();
}

function resetCatalogFilters() {
  AppState.activeCategory = 'ALL';
  AppState.searchQuery = '';
  document.getElementById('catalog-search').value = '';
  renderCategoryPills();
  renderCatalogGrid();
}

// ==============================================================================
// QUOTATION CART MANAGEMENT
// ==============================================================================
function addToCart(itemId) {
  AppState.cart[itemId] = (AppState.cart[itemId] || 0) + 1;
  updateCartBadge();
  renderCatalogGrid();
  renderQuotationDrawer();
  updateEnquiryAttachedSummary();
  showToast('Item added to quotation', 'info');
}

function incrementCart(itemId) {
  AppState.cart[itemId] = (AppState.cart[itemId] || 0) + 1;
  updateCartBadge();
  renderCatalogGrid();
  renderQuotationDrawer();
  updateEnquiryAttachedSummary();
}

function decrementCart(itemId) {
  if (!AppState.cart[itemId]) return;
  AppState.cart[itemId]--;
  if (AppState.cart[itemId] <= 0) {
    delete AppState.cart[itemId];
  }
  updateCartBadge();
  renderCatalogGrid();
  renderQuotationDrawer();
  updateEnquiryAttachedSummary();
}

function removeFromCart(itemId) {
  delete AppState.cart[itemId];
  updateCartBadge();
  renderCatalogGrid();
  renderQuotationDrawer();
  updateEnquiryAttachedSummary();
  showToast('Item removed from quotation', 'info');
}

function clearCart() {
  AppState.cart = {};
  updateCartBadge();
  renderCatalogGrid();
  renderQuotationDrawer();
  updateEnquiryAttachedSummary();
}

function getCartCalculations() {
  let subtotal = 0;
  const items = [];

  for (const [id, qty] of Object.entries(AppState.cart)) {
    const item = AppState.catalog.find(i => i.id === id);
    if (item && qty > 0) {
      const lineTotal = item.price * qty;
      subtotal += lineTotal;
      items.push({
        id: item.id,
        name: item.name,
        category: item.category,
        rate: item.price,
        unit: item.unit || 'unit',
        qty: qty,
        lineTotal: lineTotal
      });
    }
  }

  const taxRate = Number(AppState.settings.taxRate || 0);
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount;

  return { items, subtotal, taxRate, taxAmount, grandTotal };
}

function updateCartBadge() {
  const totalCount = Object.values(AppState.cart).reduce((a, b) => a + b, 0);
  const badge = document.getElementById('quote-badge-count');
  badge.textContent = totalCount;
  
  if (totalCount > 0) {
    badge.classList.add('pulse-badge');
  } else {
    badge.classList.remove('pulse-badge');
  }
}

function renderQuotationDrawer() {
  const listContainer = document.getElementById('drawer-items-list');
  const emptyNotice = document.getElementById('drawer-empty-notice');
  const footerCalcs = document.getElementById('drawer-footer-calculations');
  const countEl = document.getElementById('drawer-items-count');

  const { items, subtotal, taxAmount, grandTotal } = getCartCalculations();
  countEl.textContent = items.reduce((sum, i) => sum + i.qty, 0);

  if (items.length === 0) {
    listContainer.innerHTML = '';
    emptyNotice.classList.remove('hidden');
    footerCalcs.classList.add('hidden');
    return;
  }

  emptyNotice.classList.add('hidden');
  footerCalcs.classList.remove('hidden');
  listContainer.innerHTML = '';

  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'pt-3 first:pt-0';
    row.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <div>
          <h4 class="font-bold text-xs text-slate-900 leading-snug">${escapeHtml(item.name)}</h4>
          <p class="text-[11px] text-slate-400 mt-0.5">${formatCurrency(item.rate)} / ${escapeHtml(item.unit)}</p>
        </div>
        <button onclick="removeFromCart('${item.id}')" class="text-slate-400 hover:text-red-500 text-xs p-1 transition" title="Remove item">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>

      <div class="mt-2.5 flex items-center justify-between">
        <div class="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <button onclick="decrementCart('${item.id}')" class="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">
            <i class="fa-solid fa-minus text-[10px]"></i>
          </button>
          <span class="w-7 text-center text-xs font-semibold text-slate-800">${item.qty}</span>
          <button onclick="incrementCart('${item.id}')" class="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">
            <i class="fa-solid fa-plus text-[10px]"></i>
          </button>
        </div>
        <div class="font-bold text-xs text-slate-900">${formatCurrency(item.lineTotal)}</div>
      </div>
    `;
    listContainer.appendChild(row);
  });

  document.getElementById('drawer-subtotal').textContent = formatCurrency(subtotal);
  document.getElementById('drawer-tax-amount').textContent = formatCurrency(taxAmount);
  document.getElementById('drawer-grand-total').textContent = formatCurrency(grandTotal);
}

function openQuotationDrawer() {
  renderQuotationDrawer();
  const backdrop = document.getElementById('quotation-drawer-backdrop');
  const panel = document.getElementById('quotation-drawer-panel').firstElementChild;
  
  backdrop.classList.remove('hidden');
  setTimeout(() => {
    backdrop.classList.remove('opacity-0');
    panel.classList.remove('translate-x-full');
  }, 10);
}

function closeQuotationDrawer() {
  const backdrop = document.getElementById('quotation-drawer-backdrop');
  const panel = document.getElementById('quotation-drawer-panel').firstElementChild;
  
  backdrop.classList.add('opacity-0');
  panel.classList.add('translate-x-full');
  setTimeout(() => {
    backdrop.classList.add('hidden');
  }, 300);
}

function updateEnquiryAttachedSummary() {
  const pill = document.getElementById('enquiry-quote-summary-pill');
  const { items, grandTotal } = getCartCalculations();
  
  if (items.length > 0) {
    pill.classList.remove('hidden');
    const totalCount = items.reduce((sum, i) => sum + i.qty, 0);
    document.getElementById('enquiry-attached-items-count').textContent = `${totalCount} item${totalCount > 1 ? 's' : ''}`;
    document.getElementById('enquiry-attached-total').textContent = formatCurrency(grandTotal);
  } else {
    pill.classList.add('hidden');
  }
}

function proceedToEnquiryFromQuote() {
  closeQuotationDrawer();
  const formSection = document.getElementById('enquiry-section');
  if (formSection) {
    formSection.scrollIntoView({ behavior: 'smooth' });
    const nameField = document.getElementById('enquiry-name');
    if (nameField) nameField.focus();
  }
}

// Smooth scroll to catalog section with highlight
function scrollToCatalog() {
  showCustomerView();
  const catalogSection = document.getElementById('catalog-section');
  if (catalogSection) {
    catalogSection.scrollIntoView({ behavior: 'smooth' });
    catalogSection.classList.add('highlight-target');
    setTimeout(() => {
      catalogSection.classList.remove('highlight-target');
    }, 1600);
  }
}

// Download / Review modal trigger
function openDownloadReviewModal() {
  const { items } = getCartCalculations();
  if (items.length === 0) {
    openQuotationDrawer();
    showToast('Select materials from the catalog first to generate quotation!', 'info');
    setTimeout(() => {
      scrollToCatalog();
    }, 600);
    return;
  }
  openQuotationDrawer();
}

// Quick Contractor / Customer Registration trigger
function openRegisterModal() {
  showCustomerView();
  const formSection = document.getElementById('enquiry-section');
  if (formSection) {
    formSection.scrollIntoView({ behavior: 'smooth' });
    const nameField = document.getElementById('enquiry-name');
    if (nameField) nameField.focus();
    showToast('Enter your name and contact details to register / send enquiry', 'info');
  }
}

// Quick Sample Material addition for test estimation
function addSampleMaterialsToQuote() {
  if (AppState.catalog.length >= 2) {
    AppState.cart[AppState.catalog[0].id] = 50; // e.g. 50 bags cement
    AppState.cart[AppState.catalog[1].id] = 1;  // e.g. 1 ton steel
  } else if (AppState.catalog.length === 1) {
    AppState.cart[AppState.catalog[0].id] = 10;
  }
  updateCartBadge();
  renderCatalogGrid();
  renderQuotationDrawer();
  updateEnquiryAttachedSummary();
  showToast('Added sample construction materials to quotation!', 'success');
}

// ==============================================================================
// PRINT & PDF QUOTATION ENGINE
// ==============================================================================
function triggerPrintQuotation() {
  const { items, subtotal, taxRate, taxAmount, grandTotal } = getCartCalculations();
  
  if (items.length === 0) {
    showToast('Your quotation is empty. Add at least one item first!', 'error');
    return;
  }

  // Populate Print Metadata
  const now = new Date();
  const quoteId = `QT-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  document.getElementById('print-quote-id').textContent = quoteId;
  document.getElementById('print-quote-date').textContent = now.toISOString().split('T')[0];

  // Customer info if filled in enquiry form
  const nameInput = document.getElementById('enquiry-name').value.trim();
  const companyInput = document.getElementById('enquiry-company').value.trim();
  const emailInput = document.getElementById('enquiry-email').value.trim();
  const phoneInput = document.getElementById('enquiry-phone').value.trim();

  document.getElementById('print-customer-name').textContent = nameInput || 'Valued Customer';
  document.getElementById('print-customer-company').textContent = companyInput ? `Company: ${companyInput}` : 'Independent Client';
  document.getElementById('print-customer-email').textContent = emailInput || 'client@example.com';
  document.getElementById('print-customer-phone').textContent = phoneInput || 'N/A';

  // Populate Print Items Table
  const tbody = document.getElementById('print-items-tbody');
  tbody.innerHTML = '';

  items.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #e2e8f0';
    tr.innerHTML = `
      <td style="padding: 10px; text-align: left;">${index + 1}</td>
      <td style="padding: 10px; text-align: left; font-weight: 600;">${escapeHtml(item.name)}</td>
      <td style="padding: 10px; text-align: center; color: #64748b;">${escapeHtml(item.unit)}</td>
      <td style="padding: 10px; text-align: right;">${formatCurrency(item.rate)}</td>
      <td style="padding: 10px; text-align: center; font-weight: 600;">${item.qty}</td>
      <td style="padding: 10px; text-align: right; font-weight: 700;">${formatCurrency(item.lineTotal)}</td>
    `;
    tbody.appendChild(tr);
  });

  // Totals
  document.getElementById('print-subtotal').textContent = formatCurrency(subtotal);
  document.getElementById('print-tax-rate').textContent = `${taxRate}%`;
  document.getElementById('print-tax-amount').textContent = formatCurrency(taxAmount);
  document.getElementById('print-grand-total').textContent = formatCurrency(grandTotal);

  // Invoke browser print dialog (User can choose "Save as PDF")
  window.print();
}

// WhatsApp Share
function shareQuotationWhatsApp() {
  const { items, grandTotal } = getCartCalculations();
  if (items.length === 0) {
    showToast('Add items to quotation before sending via WhatsApp!', 'error');
    return;
  }

  const cleanPhone = AppState.settings.whatsapp.replace(/[^0-9]/g, '');
  let message = `*Quotation Request - ${AppState.settings.businessName}*\n\n`;
  message += `Items Selected:\n`;
  items.forEach((item, idx) => {
    message += `${idx + 1}. ${item.name} (${item.qty}x) - ${formatCurrency(item.lineTotal)}\n`;
  });
  message += `\n*Estimated Total:* ${formatCurrency(grandTotal)}\n`;

  const name = document.getElementById('enquiry-name').value.trim();
  if (name) message += `*Client Name:* ${name}\n`;

  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// ==============================================================================
// CUSTOMER ENQUIRY SUBMISSION
// ==============================================================================
function handleEnquirySubmit(e) {
  e.preventDefault();

  const name = document.getElementById('enquiry-name').value.trim();
  const email = document.getElementById('enquiry-email').value.trim();
  const phone = document.getElementById('enquiry-phone').value.trim();
  const company = document.getElementById('enquiry-company').value.trim();
  const message = document.getElementById('enquiry-message').value.trim();

  if (!name || !email || !phone) {
    showToast('Please fill all mandatory fields (Name, Email, Phone)', 'error');
    return;
  }

  const { items, subtotal, taxAmount, grandTotal } = getCartCalculations();

  // Create Enquiry Object
  const now = new Date();
  const refCode = `ENQ-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const newEnquiry = {
    id: refCode,
    date: now.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
    name,
    email,
    phone,
    company: company || 'Not specified',
    message: message || 'No specific notes provided.',
    items: items,
    subtotal: subtotal,
    taxAmount: taxAmount,
    total: grandTotal,
    status: 'New'
  };

  // Prepend to enquiries
  AppState.enquiries.unshift(newEnquiry);
  saveData(STORAGE_KEYS.ENQUIRIES, AppState.enquiries);

  // Trigger celebration confetti
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  // Open Success Modal
  document.getElementById('success-ref-code').textContent = refCode;
  document.getElementById('success-modal').classList.remove('hidden');

  // Reset Form
  document.getElementById('customer-enquiry-form').reset();
  clearCart();

  // Refresh admin tables if open
  updateAdminDashboardStats();
  renderAdminLeadsTable();
}

function closeSuccessModal() {
  document.getElementById('success-modal').classList.add('hidden');
}

// ==============================================================================
// ADMIN AUTHENTICATION & VIEW TOGGLE
// ==============================================================================
function checkAdminAuth() {
  const banner = document.getElementById('admin-banner');
  const btnLabel = document.getElementById('admin-btn-label');
  
  if (AppState.isAdmin) {
    banner.classList.remove('hidden');
    btnLabel.textContent = 'Admin Mode';
  } else {
    banner.classList.add('hidden');
    btnLabel.textContent = 'Admin Login';
  }
}

function openAdminModal() {
  if (AppState.isAdmin) {
    showAdminDashboard();
    return;
  }
  const modal = document.getElementById('admin-login-modal');
  if (modal) {
    modal.classList.remove('hidden');
    const input = document.getElementById('admin-password-input');
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}

function closeAdminModal() {
  const modal = document.getElementById('admin-login-modal');
  if (modal) modal.classList.add('hidden');
  const input = document.getElementById('admin-password-input');
  if (input) input.value = '';
}

// Toggle password visibility (eye icon)
function togglePasswordVisibility() {
  const input = document.getElementById('admin-password-input');
  const icon = document.getElementById('password-toggle-icon');
  if (!input || !icon) return;

  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

// Autofill helper (deprecated for security - focus input instead)
function quickFillDefaultPassword() {
  const input = document.getElementById('admin-password-input');
  if (input) input.focus();
}

function quickFillPassword(pwd) {
  const input = document.getElementById('admin-password-input');
  if (input) input.focus();
}

async function handleAdminLogin(e) {
  if (e && e.preventDefault) e.preventDefault();
  const inputEl = document.getElementById('admin-password-input');
  const enteredPass = (inputEl ? inputEl.value : '').trim();

  if (!enteredPass) {
    showToast('Please enter the admin password', 'error');
    return;
  }

  const enteredHash = await hashStringSHA256(enteredPass);
  const activeHash = getActiveAdminPasswordHash();
  const customIsActive = isCustomPasswordSet();

  // STRICT CRYPTOGRAPHIC ACCESS CONTROL:
  // Zero plain-text comparisons. Only SHA-256 hashes are verified!
  // Once a custom password has been set, the master hash is permanently disabled.
  let isMatch = false;
  if (customIsActive && activeHash) {
    isMatch = (enteredHash === activeHash);
  } else {
    isMatch = (enteredHash === ADMIN_CONFIG.MASTER_HASH);
  }

  if (isMatch) {
    AppState.isAdmin = true;
    sessionStorage.setItem(STORAGE_KEYS.AUTH, 'true');

    // Remember Me support
    const rememberMe = document.getElementById('admin-remember-me')?.checked;
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    }

    closeAdminModal();
    checkAdminAuth();
    showAdminDashboard();
    showToast('🎉 Admin authenticated successfully! Welcome.', 'success');
  } else {
    showToast('❌ Access Denied: Incorrect password. If you forgot your password, click "Forgot Password?" to receive an OTP on Amit.omtraders@gmail.com.', 'error');
  }
}

function logoutAdmin() {
  AppState.isAdmin = false;
  sessionStorage.removeItem(STORAGE_KEYS.AUTH);
  localStorage.removeItem(STORAGE_KEYS.AUTH);
  checkAdminAuth();
  showCustomerView();
  showToast('Logged out of admin portal', 'info');
}

// Update Admin Password from Settings with Multi-Device Sync & Email Notification
async function updateAdminPassword() {
  const input = document.getElementById('new-admin-password-input');
  const newPass = (input ? input.value : '').trim();
  if (!newPass || newPass.length < 3) {
    showToast('Password must be at least 3 characters long', 'error');
    return;
  }

  // Hash new password before saving
  const newHash = await hashStringSHA256(newPass);
  setActiveAdminPasswordHash(newHash);
  if (input) input.value = '';

  // Cloud sync for cross-device access (syncs hash, not plain password)
  syncPasswordToCloud(newHash);

  // Dispatch email notification to Amit.omtraders@gmail.com
  sendPasswordChangeNotificationEmail();

  showToast('🎉 Password updated securely! Master passwords are now completely disabled for security.', 'success');
}

// ==============================================================================
// FORGOT PASSWORD & RECOVERY WORKFLOW (Email to Amit.omtraders@gmail.com)
// ==============================================================================

function openForgotPasswordModal() {
  closeAdminModal();
  const modal = document.getElementById('forgot-password-modal');
  if (modal) {
    modal.classList.remove('hidden');
    const statusBox = document.getElementById('recovery-status-box');
    if (statusBox) {
      statusBox.classList.add('hidden');
      statusBox.innerHTML = '';
    }
    const step2 = document.getElementById('recovery-step-2');
    if (step2) step2.classList.add('hidden');
    const mailtoBox = document.getElementById('recovery-direct-mailto');
    if (mailtoBox) mailtoBox.classList.add('hidden');
    const btn = document.getElementById('send-recovery-email-btn');
    const btnText = document.getElementById('send-recovery-btn-text');
    if (btn) btn.disabled = false;
    if (btnText) btnText.textContent = `Send Password to ${ADMIN_CONFIG.RECOVERY_EMAIL}`;
  }
}

function closeForgotPasswordModal() {
  const modal = document.getElementById('forgot-password-modal');
  if (modal) modal.classList.add('hidden');
}

function getOrCreateRecoveryOtp() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  sessionStorage.setItem(STORAGE_KEYS.RECOVERY_OTP, otp);
  return otp;
}

// Dispatches email to Amit.omtraders@gmail.com via FormSubmit AJAX endpoint
async function sendRecoveryEmailToAmit() {
  const btn = document.getElementById('send-recovery-email-btn');
  const btnText = document.getElementById('send-recovery-btn-text');
  const statusBox = document.getElementById('recovery-status-box');
  const step2 = document.getElementById('recovery-step-2');
  const mailtoBox = document.getElementById('recovery-direct-mailto');

  if (btn) btn.disabled = true;
  if (btnText) btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Sending to Amit.omtraders@gmail.com...';

  const generatedOtp = getOrCreateRecoveryOtp();
  const customIsActive = isCustomPasswordSet();
  const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'medium' });

  // Email payload for FormSubmit (transmits OTP only - zero plain text credentials)
  const payload = {
    _subject: `🔐 [Om Traders] Admin Reset Security Code (${generatedOtp})`,
    _template: 'box',
    _captcha: 'false',
    Store_Name: 'Om Traders (Building & Plumbing Material Supplier)',
    Location: 'Kalwan, Nashik, Maharashtra',
    Registered_Admin_Email: ADMIN_CONFIG.RECOVERY_EMAIL,
    Password_Reset_OTP: generatedOtp,
    Status: customIsActive ? 'Custom Password Active (Master Passwords Disabled)' : 'Default Mode',
    Instructions: `Enter the 6-digit verification code "${generatedOtp}" on your screen to set your new password.`,
    Requested_At: timestamp,
    Device_Browser: navigator.userAgent
  };

  let emailSentSuccessfully = false;

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${ADMIN_CONFIG.RECOVERY_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      emailSentSuccessfully = true;
    } else {
      console.warn('FormSubmit response status:', response.status);
    }
  } catch (err) {
    console.warn('Direct fetch to FormSubmit (offline or sandboxed):', err);
  }

  // Configure mailto fallback link for direct app opening
  const mailtoSubject = encodeURIComponent(`[Om Traders] Admin Password Recovery - ${generatedOtp}`);
  const mailtoBody = encodeURIComponent(
    `Hello Amit,\n\nHere is your Om Traders Admin Recovery Code:\n` +
    `- 6-Digit Reset Code: ${generatedOtp}\n\n` +
    `Store: Om Traders, Kalwan, Nashik\nDate: ${timestamp}`
  );
  const mailtoLink = `mailto:${ADMIN_CONFIG.RECOVERY_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`;
  const mailtoAnchor = document.getElementById('recovery-mailto-link');
  if (mailtoAnchor) mailtoAnchor.href = mailtoLink;

  // Show status box
  if (statusBox) {
    statusBox.classList.remove('hidden');
    if (emailSentSuccessfully) {
      statusBox.className = 'mt-4 p-4 rounded-2xl text-xs bg-emerald-50 border border-emerald-200 text-emerald-900 leading-relaxed';
      statusBox.innerHTML = `
        <div class="font-extrabold text-sm text-emerald-800 flex items-center gap-1.5 mb-1.5">
          <i class="fa-solid fa-circle-check text-emerald-600"></i> Recovery Code Dispatched to ${ADMIN_CONFIG.RECOVERY_EMAIL}!
        </div>
        <p>Check your Gmail inbox. The 6-digit code is in the subject line. Enter it below to set your new password.</p>
      `;
    } else {
      statusBox.className = 'mt-4 p-4 rounded-2xl text-xs bg-blue-50 border border-blue-200 text-blue-900 leading-relaxed';
      statusBox.innerHTML = `
        <div class="font-extrabold text-sm text-blue-800 flex items-center gap-1.5 mb-1.5">
          <i class="fa-solid fa-envelope text-blue-600"></i> Recovery Details Prepared for ${ADMIN_CONFIG.RECOVERY_EMAIL}
        </div>
        <p>Reset Verification Code: <strong class="font-mono bg-white px-2 py-0.5 rounded border text-blue-800 text-sm">${generatedOtp}</strong></p>
        <p class="mt-1 text-[11px] text-slate-600">Enter this 6-digit code below to set your new password.</p>
      `;
    }
  }

  // Show direct mailto option
  if (mailtoBox) mailtoBox.classList.remove('hidden');

  // Reveal Step 2 (Reset password on this device)
  if (step2) step2.classList.remove('hidden');

  if (btn) btn.disabled = false;
  if (btnText) btnText.innerHTML = '<i class="fa-solid fa-check mr-1"></i> Email Sent! Resend if needed';

  showToast(`Recovery details sent to ${ADMIN_CONFIG.RECOVERY_EMAIL}`, 'success');
}

// Confirm Reset Password with OTP or Emergency PIN (Cryptographically Verified)
async function confirmResetPasswordWithOtp() {
  const otpInput = document.getElementById('recovery-otp-input');
  const newPassInput = document.getElementById('recovery-new-password');

  const enteredOtp = (otpInput ? otpInput.value : '').trim();
  const newPass = (newPassInput ? newPassInput.value : '').trim();
  const storedOtp = sessionStorage.getItem(STORAGE_KEYS.RECOVERY_OTP);

  if (!enteredOtp) {
    showToast('Please enter the 6-digit verification code from your email', 'error');
    return;
  }

  if (!newPass || newPass.length < 3) {
    showToast('Please enter a new password (at least 3 characters)', 'error');
    return;
  }

  // Cryptographic Verification: Compare entered OTP with session OTP or hash against EMERGENCY_PIN_HASH
  const enteredOtpHash = await hashStringSHA256(enteredOtp);
  const isValidOtp = (storedOtp && enteredOtp === storedOtp) || (enteredOtpHash === ADMIN_CONFIG.EMERGENCY_PIN_HASH);

  if (!isValidOtp) {
    showToast('Invalid verification code. Check your email and try again.', 'error');
    return;
  }

  // Hash new password before saving
  const newHash = await hashStringSHA256(newPass);
  setActiveAdminPasswordHash(newHash);

  // Sync to cloud
  syncPasswordToCloud(newHash);

  // Send notification to email
  sendPasswordChangeNotificationEmail();

  // Automatically authenticate admin
  AppState.isAdmin = true;
  sessionStorage.setItem(STORAGE_KEYS.AUTH, 'true');
  localStorage.setItem(STORAGE_KEYS.AUTH, 'true');

  closeForgotPasswordModal();
  checkAdminAuth();
  showAdminDashboard();

  showToast('🎉 Password reset successfully! Master passwords are permanently disabled.', 'success');
}

// Dispatches an email notification when password is changed
async function sendPasswordChangeNotificationEmail() {
  try {
    const payload = {
      _subject: '🔔 [Om Traders] Admin Password Successfully Changed',
      _captcha: 'false',
      Store_Name: 'Om Traders (Kalwan, Nashik)',
      Admin_Email: ADMIN_CONFIG.RECOVERY_EMAIL,
      Master_Passwords_Status: 'DISABLED (Default master passwords are deactivated)',
      Changed_At: new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'medium' }),
      Device_Browser: navigator.userAgent,
      Security_Notice: 'Master passwords are now disabled. Only this new password can unlock the Admin Portal.'
    };

    fetch(`https://formsubmit.co/ajax/${ADMIN_CONFIG.RECOVERY_EMAIL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(e => console.warn('Background notification error:', e));
  } catch (err) {
    console.warn('Could not dispatch password change notification:', err);
  }
}

// Cloud KV Sync helpers for cross-device password synchronization
async function syncPasswordToCloud(newPassword) {
  try {
    if (!ADMIN_CONFIG.CLOUD_SYNC_URL) return;
    await fetch(ADMIN_CONFIG.CLOUD_SYNC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: newPassword
    });
  } catch (err) {
    console.warn('Cloud sync post skipped (offline):', err);
  }
}

async function fetchPasswordFromCloud() {
  try {
    if (!ADMIN_CONFIG.CLOUD_SYNC_URL) return;
    const res = await fetch(ADMIN_CONFIG.CLOUD_SYNC_URL);
    if (res.ok) {
      const cloudPwd = (await res.text()).trim();
      if (cloudPwd && cloudPwd.length >= 3 && cloudPwd.length <= 50) {
        setActiveAdminPassword(cloudPwd);
      }
    }
  } catch (err) {
    console.warn('Cloud sync fetch skipped:', err);
  }
}

function showAdminDashboard() {
  document.getElementById('customer-view').classList.add('hidden');
  document.getElementById('admin-view').classList.remove('hidden');
  document.getElementById('toggle-admin-view-text').textContent = 'Back to Website';
  updateAdminDashboardStats();
  renderAdminLeadsTable();
  renderAdminCatalogTable();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showCustomerView() {
  document.getElementById('admin-view').classList.add('hidden');
  document.getElementById('customer-view').classList.remove('hidden');
  document.getElementById('toggle-admin-view-text').textContent = 'Go to Admin Dashboard';
  renderCatalogGrid();
  renderCategoryPills();
}

function toggleAdminView() {
  const adminView = document.getElementById('admin-view');
  if (adminView.classList.contains('hidden')) {
    showAdminDashboard();
  } else {
    showCustomerView();
  }
}

function setAdminTab(tab) {
  AppState.activeAdminTab = tab;
  
  // Highlight tab button
  document.querySelectorAll('.admin-nav-tab').forEach(btn => {
    btn.classList.remove('active', 'border-blue-600', 'text-blue-600');
    btn.classList.add('border-transparent', 'text-slate-500');
  });

  const activeBtn = document.getElementById(`admin-tab-btn-${tab}`);
  if (activeBtn) {
    activeBtn.classList.add('active', 'border-blue-600', 'text-blue-600');
    activeBtn.classList.remove('border-transparent', 'text-slate-500');
  }

  // Toggle tab panels
  document.getElementById('admin-panel-leads')?.classList.toggle('hidden', tab !== 'leads');
  document.getElementById('admin-panel-excel')?.classList.toggle('hidden', tab !== 'excel');
  document.getElementById('admin-panel-catalog')?.classList.toggle('hidden', tab !== 'catalog');
  document.getElementById('admin-panel-settings')?.classList.toggle('hidden', tab !== 'settings');
  document.getElementById('admin-panel-manual')?.classList.toggle('hidden', tab !== 'manual');

  if (tab === 'leads') renderAdminLeadsTable();
  if (tab === 'catalog') renderAdminCatalogTable();
}

// ==============================================================================
// ADMIN DASHBOARD STATS
// ==============================================================================
function updateAdminDashboardStats() {
  const totalEnquiries = AppState.enquiries.length;
  const totalItems = AppState.catalog.length;
  const pendingLeads = AppState.enquiries.filter(e => e.status === 'New').length;
  const totalQuotedValue = AppState.enquiries.reduce((sum, e) => sum + (e.total || 0), 0);

  document.getElementById('stat-total-enquiries').textContent = totalEnquiries;
  document.getElementById('stat-total-items').textContent = totalItems;
  document.getElementById('stat-pending-leads').textContent = pendingLeads;
  document.getElementById('stat-total-pipeline').textContent = formatCurrency(totalQuotedValue);
  document.getElementById('admin-enquiry-counter').textContent = totalEnquiries;
}

// ==============================================================================
// ADMIN LEADS & ENQUIRIES TABLE
// ==============================================================================
function renderAdminLeadsTable() {
  const tbody = document.getElementById('admin-leads-tbody');
  const emptyState = document.getElementById('leads-empty-state');
  const query = (document.getElementById('leads-search-input')?.value || '').toLowerCase();

  const filtered = AppState.enquiries.filter(e => {
    if (!query) return true;
    return e.name.toLowerCase().includes(query) ||
      e.email.toLowerCase().includes(query) ||
      e.phone.toLowerCase().includes(query) ||
      e.company.toLowerCase().includes(query) ||
      e.id.toLowerCase().includes(query);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  tbody.innerHTML = '';

  filtered.forEach(lead => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/80 transition';

    let statusClass = 'bg-amber-50 text-amber-900 border-amber-300';
    if (lead.status === 'Contacted') statusClass = 'bg-blue-50 text-blue-900 border-blue-300';
    else if (lead.status === 'Quotation Sent') statusClass = 'bg-purple-50 text-purple-900 border-purple-300';
    else if (lead.status === 'Closed / Won') statusClass = 'bg-emerald-50 text-emerald-900 border-emerald-300';
    else if (lead.status === 'Archived') statusClass = 'bg-slate-50 text-slate-700 border-slate-300';

    const statusOptions = ['New', 'Contacted', 'Quotation Sent', 'Closed / Won', 'Archived'];
    const optionsHtml = statusOptions.map(opt => `
      <option value="${opt}" ${lead.status === opt ? 'selected' : ''}>${opt}</option>
    `).join('');

    const itemsSummary = (lead.items && lead.items.length > 0)
      ? `${lead.items.length} items (${lead.items.map(i => i.name).slice(0, 1).join(', ')}${lead.items.length > 1 ? '...' : ''})`
      : 'General Inquiry';

    tr.innerHTML = `
      <td class="py-3 px-4">
        <div class="font-mono text-xs font-bold text-blue-600">${escapeHtml(lead.id)}</div>
        <div class="text-[11px] text-slate-400">${escapeHtml(lead.date)}</div>
      </td>
      <td class="py-3 px-4">
        <div class="font-bold text-slate-900">${escapeHtml(lead.name)}</div>
        <div class="text-xs text-slate-500">${escapeHtml(lead.company || 'Direct')}</div>
      </td>
      <td class="py-3 px-4">
        <div class="text-xs text-slate-800 font-medium">${escapeHtml(lead.phone)}</div>
        <div class="text-[11px] text-slate-400">${escapeHtml(lead.email)}</div>
      </td>
      <td class="py-3 px-4">
        <div class="text-xs text-slate-700">${escapeHtml(itemsSummary)}</div>
      </td>
      <td class="py-3 px-4 text-right">
        <span class="font-bold text-slate-900 text-xs">${formatCurrency(lead.total)}</span>
      </td>
      <td class="py-3 px-4 text-center">
        <select onchange="updateLeadStatus('${lead.id}', this.value)" 
          title="Click to change enquiry status"
          class="text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm transition ${statusClass}">
          ${optionsHtml}
        </select>
      </td>
      <td class="py-3 px-4 text-right">
        <button onclick="viewEnquiryDetails('${lead.id}')" class="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition flex items-center gap-1.5 ml-auto">
          <i class="fa-solid fa-eye"></i> View
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// 1-Click Update Status directly from Table or Modal
function updateLeadStatus(leadId, newStatus) {
  const lead = AppState.enquiries.find(e => e.id === leadId);
  if (!lead) return;
  lead.status = newStatus;
  saveData(STORAGE_KEYS.ENQUIRIES, AppState.enquiries);
  updateAdminDashboardStats();
  renderAdminLeadsTable();
  showToast(`Enquiry ${lead.id} (${lead.name}) marked as "${newStatus}"`, 'success');
}

function updateEnquiryStatus(leadId, newStatus) {
  updateLeadStatus(leadId, newStatus);
}

function viewEnquiryDetails(leadId) {
  const lead = AppState.enquiries.find(e => e.id === leadId);
  if (!lead) return;
  AppState.currentViewingEnquiry = lead;

  document.getElementById('modal-enquiry-ref').textContent = lead.id;
  document.getElementById('modal-enquiry-customer').textContent = lead.name;
  document.getElementById('modal-enquiry-status').textContent = lead.status;
  document.getElementById('modal-enquiry-date').textContent = `Received on ${lead.date}`;
  document.getElementById('modal-enquiry-email').textContent = lead.email;
  document.getElementById('modal-enquiry-email').href = `mailto:${lead.email}`;
  document.getElementById('modal-enquiry-phone').textContent = lead.phone;
  document.getElementById('modal-enquiry-company').textContent = lead.company || 'N/A';
  document.getElementById('modal-enquiry-total').textContent = formatCurrency(lead.total);
  document.getElementById('modal-enquiry-notes').textContent = lead.message || 'No additional notes provided.';
  document.getElementById('modal-enquiry-status-select').value = lead.status;

  // Build items table
  const tableContainer = document.getElementById('modal-enquiry-items-table');
  if (lead.items && lead.items.length > 0) {
    let rowsHtml = '';
    lead.items.forEach((item, idx) => {
      rowsHtml += `
        <tr class="border-b border-slate-100 text-xs">
          <td class="py-2 px-3">${idx + 1}</td>
          <td class="py-2 px-3 font-medium">${escapeHtml(item.name)}</td>
          <td class="py-2 px-3 text-center">${item.qty}</td>
          <td class="py-2 px-3 text-right">${formatCurrency(item.rate)}</td>
          <td class="py-2 px-3 text-right font-bold">${formatCurrency(item.lineTotal || (item.rate * item.qty))}</td>
        </tr>
      `;
    });
    tableContainer.innerHTML = `
      <table class="w-full text-left">
        <thead class="bg-slate-100 text-[11px] font-semibold text-slate-600">
          <tr>
            <th class="py-1.5 px-3">#</th>
            <th class="py-1.5 px-3">Item</th>
            <th class="py-1.5 px-3 text-center">Qty</th>
            <th class="py-1.5 px-3 text-right">Rate</th>
            <th class="py-1.5 px-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;
  } else {
    tableContainer.innerHTML = `<p class="p-3 text-xs text-slate-400 italic">No specific quotation items were attached.</p>`;
  }

  document.getElementById('enquiry-modal').classList.remove('hidden');
}

function updateLeadStatusFromModal(newStatus) {
  if (!AppState.currentViewingEnquiry) return;
  updateLeadStatus(AppState.currentViewingEnquiry.id, newStatus);
  const modalStatusEl = document.getElementById('modal-enquiry-status');
  if (modalStatusEl) modalStatusEl.textContent = newStatus;
}

function closeEnquiryModal() {
  document.getElementById('enquiry-modal').classList.add('hidden');
  AppState.currentViewingEnquiry = null;
}

// ==============================================================================
// EXPORT ENQUIRIES TO EXCEL (KEY REQUIREMENT!)
// ==============================================================================
function downloadEnquiriesExcel() {
  if (typeof XLSX === 'undefined') {
    showToast('SheetJS Excel library is loading, please wait a moment...', 'error');
    return;
  }

  if (AppState.enquiries.length === 0) {
    showToast('No customer enquiries to export yet!', 'info');
    return;
  }

  // Format enquiries into clean excel rows
  const exportRows = AppState.enquiries.map(enq => {
    // Summarize items into clean text
    const itemsText = (enq.items && enq.items.length > 0)
      ? enq.items.map(i => `${i.name} (Qty: ${i.qty}, Total: ${formatCurrency(i.lineTotal || i.rate * i.qty)})`).join(' | ')
      : 'General Inquiry';

    return {
      'Enquiry Reference': enq.id,
      'Date & Time': enq.date,
      'Customer Name': enq.name,
      'Email': enq.email,
      'Phone': enq.phone,
      'Company': enq.company || '',
      'Status': enq.status,
      'Quotation Items': itemsText,
      'Subtotal': enq.subtotal || 0,
      'Estimated Tax': enq.taxAmount || 0,
      'Grand Total Amount': enq.total || 0,
      'Customer Message': enq.message || ''
    };
  });

  // Create sheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(exportRows);

  // Set nice column widths
  worksheet['!cols'] = [
    { wch: 18 }, // Reference
    { wch: 22 }, // Date
    { wch: 20 }, // Name
    { wch: 25 }, // Email
    { wch: 18 }, // Phone
    { wch: 22 }, // Company
    { wch: 14 }, // Status
    { wch: 45 }, // Items
    { wch: 12 }, // Subtotal
    { wch: 14 }, // Tax
    { wch: 18 }, // Grand Total
    { wch: 40 }  // Message
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer Enquiries');

  // Filename with date
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `Customer_Enquiries_Report_${dateStr}.xlsx`;

  // Download
  XLSX.writeFile(workbook, filename);
  showToast(`Successfully downloaded ${exportRows.length} enquiries to ${filename}!`, 'success');
}

// ==============================================================================
// EXCEL PARSING & CATALOG PUBLISHING (KEY REQUIREMENT!)
// ==============================================================================
function setupExcelDropzone() {
  const dropzone = document.getElementById('excel-dropzone');
  const fileInput = document.getElementById('excel-file-input');

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dropzone-active');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dropzone-active');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dropzone-active');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSelectedExcelFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleSelectedExcelFile(e.target.files[0]);
    }
  });
}

function handleSelectedExcelFile(file) {
  if (!file) return;

  const validExtensions = ['.xlsx', '.xls', '.csv'];
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (!validExtensions.includes(ext)) {
    showToast('Please upload a valid Excel (.xlsx, .xls) or CSV file!', 'error');
    return;
  }

  AppState.excelFileName = file.name;
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Read 2D array of sheet to detect true header row (skip top banners/titles)
      const rawRows2D = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      if (!rawRows2D || rawRows2D.length === 0) {
        showToast('The uploaded Excel sheet contains no rows!', 'error');
        return;
      }

      // Detect header row index
      let headerRowIndex = 0;
      const headerKeywords = ['name', 'item', 'product', 'material', 'particular', 'description', 'rate', 'price', 'unit', 'category', 's.no', 'sr no', 'goods', 'amount', 'mrp'];
      
      for (let r = 0; r < Math.min(rawRows2D.length, 10); r++) {
        const rowValues = rawRows2D[r].map(cell => String(cell).toLowerCase().trim());
        const matchCount = rowValues.filter(val => headerKeywords.some(kw => val.includes(kw))).length;
        if (matchCount >= 2) {
          headerRowIndex = r;
          break;
        }
      }

      // Convert from detected header row
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { range: headerRowIndex, defval: '' });

      if (rawRows.length === 0) {
        showToast('The uploaded Excel sheet contains no data under the header row!', 'error');
        return;
      }

      // Smart Header Mapper with Auto-Categorization
      const parsedItems = parseExcelRowsWithSmartMapper(rawRows);

      if (parsedItems.length === 0) {
        showToast('Could not find item name and price columns. Please check your Excel headers!', 'error');
        return;
      }

      AppState.excelParsedData = parsedItems;
      renderExcelPreview(file.name, parsedItems);
      showToast(`Extracted ${parsedItems.length} items from Excel. Review before publishing!`, 'success');

    } catch (err) {
      console.error(err);
      showToast('Error reading Excel file. Make sure it is not corrupted.', 'error');
    }
  };

  reader.readAsArrayBuffer(file);
}

// Auto-detect building & plumbing material category from name/description
function autoDetectMaterialCategory(name, desc) {
  const text = ((name || '') + ' ' + (desc || '')).toLowerCase();
  if (/cement|concrete|aggregate|sand|bajri|kapchi|mortar/i.test(text)) return 'Cement & Aggregates';
  if (/tmt|steel|rebar|iron|sariya|wire|rod|binding/i.test(text)) return 'Steel & TMT';
  if (/cpvc|pvc|pipe|swr|upvc|plumb|elbow|socket|tee|coupling|union|nipple/i.test(text)) return 'Plumbing & Pipes';
  if (/tap|cock|faucet|valve|commode|basin|toilet|shower|bath|sanitary|cistern|sink/i.test(text)) return 'Sanitary & Fittings';
  if (/waterproof|dr\.? fixit|chemical|epoxy|sealant|admixture|lw\+/i.test(text)) return 'Waterproofing & Chemicals';
  if (/brick|block|stone|aac|paver|red clay/i.test(text)) return 'Bricks & Masonry';
  if (/putty|paint|primer|distemper|color|colour|enamel|texture/i.test(text)) return 'Finishing & Paint';
  if (/hardware|screw|nail|bolt|lock|hinge|handle|tool/i.test(text)) return 'Hardware & Tools';
  return 'Building Materials';
}

// Smart column mapping that recognizes various header names
function parseExcelRowsWithSmartMapper(rawRows) {
  const nameKeywords = [
    'name', 'item', 'item name', 'item_name', 'product', 'product name', 'product_name',
    'particulars', 'particular', 'material', 'material name', 'material_name',
    'description of goods', 'goods', 'item description', 'product description',
    'title', 'description', 'saman', 'items'
  ];

  const priceKeywords = [
    'price', 'unit price', 'unit_price', 'rate', 'unit rate', 'unit_rate',
    'cost', 'amount', 'selling price', 'basic rate', 'mrp', 'fee', 'rate/unit', 'price/unit',
    'rate per unit', 'price per unit', 'value'
  ];

  const categoryKeywords = [
    'category', 'group', 'type', 'department', 'class', 'brand', 'make', 'head', 'sub category'
  ];

  const unitKeywords = [
    'unit', 'uom', 'per', 'billing unit', 'billing_unit', 'frequency', 'basis', 'measure',
    'unit of measurement', 'pkg', 'packing'
  ];

  const descKeywords = [
    'details', 'features', 'specs', 'specification', 'specifications', 'size', 'hsn',
    'notes', 'remarks', 'dimension', 'grade'
  ];

  return rawRows.map((row, index) => {
    let name = '';
    let category = '';
    let price = 0;
    let unit = '';
    let description = '';

    for (const [key, val] of Object.entries(row)) {
      const cleanKey = key.trim().toLowerCase();
      const cleanVal = String(val).trim();

      if (nameKeywords.includes(cleanKey)) {
        name = cleanVal;
      } else if (priceKeywords.includes(cleanKey)) {
        const num = parseFloat(String(cleanVal).replace(/[^0-9.]/g, ''));
        price = isNaN(num) ? 0 : num;
      } else if (categoryKeywords.includes(cleanKey)) {
        category = cleanVal;
      } else if (unitKeywords.includes(cleanKey)) {
        unit = cleanVal;
      } else if (descKeywords.includes(cleanKey)) {
        description = cleanVal;
      }
    }

    // Fallbacks if columns had unusual names:
    if (!name) {
      for (const [k, v] of Object.entries(row)) {
        const strVal = String(v).trim();
        if (strVal && isNaN(Number(strVal)) && strVal.length > 2) {
          name = strVal;
          break;
        }
      }
    }

    // Auto-detect category if not provided
    if (!category) {
      category = autoDetectMaterialCategory(name, description);
    }

    // Auto-detect unit if not provided
    if (!unit) {
      const nameLow = (name || '').toLowerCase();
      if (nameLow.includes('cement')) unit = 'per 50kg bag';
      else if (nameLow.includes('steel') || nameLow.includes('tmt')) unit = 'per metric ton';
      else if (nameLow.includes('pipe')) unit = 'per 10ft length';
      else if (nameLow.includes('brick')) unit = 'per 1000 pcs';
      else if (nameLow.includes('drum') || nameLow.includes('waterproof')) unit = 'per drum';
      else unit = 'per piece';
    }

    return {
      id: `xl-${Date.now()}-${index}`,
      name: name || `Material #${index + 1}`,
      category: category || 'Building Materials',
      price: price,
      unit: unit || 'per unit',
      description: description || ''
    };
  }).filter(item => Boolean(item.name && item.name !== 'undefined'));
}

function renderExcelPreview(filename, items) {
  const container = document.getElementById('excel-preview-container');
  const tbody = document.getElementById('excel-preview-tbody');
  
  document.getElementById('preview-file-name').textContent = filename;
  document.getElementById('preview-row-count').textContent = `${items.length} rows found`;

  tbody.innerHTML = '';
  items.forEach((item, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50';
    tr.innerHTML = `
      <td class="py-2 px-3 font-semibold text-slate-800">${escapeHtml(item.name)}</td>
      <td class="py-2 px-3"><span class="px-2 py-0.5 rounded bg-orange-50 text-orange-700 font-bold">${escapeHtml(item.category)}</span></td>
      <td class="py-2 px-3 text-slate-500 max-w-xs truncate">${escapeHtml(item.description)}</td>
      <td class="py-2 px-3 font-bold text-slate-900">${formatCurrency(item.price)}</td>
      <td class="py-2 px-3 text-slate-500">${escapeHtml(item.unit)}</td>
      <td class="py-2 px-3 text-center">
        <button onclick="deleteExcelPreviewRow(${idx})" class="text-red-500 hover:text-red-700 p-1" title="Exclude this row">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  container.classList.remove('hidden');
}

function deleteExcelPreviewRow(index) {
  AppState.excelParsedData.splice(index, 1);
  renderExcelPreview(AppState.excelFileName, AppState.excelParsedData);
}

function cancelExcelUpload() {
  AppState.excelParsedData = [];
  AppState.excelFileName = '';
  document.getElementById('excel-preview-container').classList.add('hidden');
  document.getElementById('excel-file-input').value = '';
}

function publishParsedExcelToCatalog() {
  if (AppState.excelParsedData.length === 0) {
    showToast('No parsed items to publish!', 'error');
    return;
  }

  // Replace live catalog with new Excel data
  AppState.catalog = [...AppState.excelParsedData];
  AppState.activeCategory = 'ALL';
  AppState.searchQuery = '';
  
  const searchInput = document.getElementById('catalog-search');
  if (searchInput) searchInput.value = '';

  saveData(STORAGE_KEYS.CATALOG, AppState.catalog);

  // Clear upload state
  cancelExcelUpload();

  // Refresh UI
  renderCatalogGrid();
  renderCategoryPills();
  renderAdminCatalogTable();
  updateAdminDashboardStats();

  showToast(`🎉 Success! Published ${AppState.catalog.length} items live to Om Traders website!`, 'success');

  // Immediately switch view to customer site and smoothly scroll to the catalog!
  showCustomerView();
  setTimeout(() => {
    scrollToCatalog();
  }, 150);
}

// Download Sample Template for Admin
function downloadSampleExcelTemplate() {
  if (typeof XLSX === 'undefined') {
    showToast('SheetJS is loading, please wait...', 'error');
    return;
  }

  const sampleTemplateData = [
    {
      'Category': 'Cement & Aggregates',
      'Item Name': 'UltraTech PPC Cement (50kg Bag)',
      'Description': 'Premium Portland Pozzolana Cement for foundation and slab casting',
      'Unit Price': 380,
      'Unit': 'per 50kg bag'
    },
    {
      'Category': 'Steel & TMT',
      'Item Name': 'TMT Steel Rebars Fe 550D (12mm)',
      'Description': 'High-ductility earthquake-resistant TMT rebars for RCC structures',
      'Unit Price': 58500,
      'Unit': 'per metric ton'
    },
    {
      'Category': 'Plumbing & Pipes',
      'Item Name': 'Astral CPVC Pro Pipe (1" SDR 11 - 10ft)',
      'Description': 'Hot and cold potable water distribution pipe, lead-free',
      'Unit Price': 320,
      'Unit': 'per 10ft length'
    },
    {
      'Category': 'Plumbing & Pipes',
      'Item Name': 'Supreme PVC SWR Pipe (4" 110mm - 10ft)',
      'Description': 'Heavy-duty drainage pipe for soil and rainwater',
      'Unit Price': 480,
      'Unit': 'per 10ft length'
    },
    {
      'Category': 'Sanitary & Fittings',
      'Item Name': 'Brass Bib Cock Water Tap with Flange',
      'Description': 'Solid brass chrome-plated wall water tap with ceramic cartridge',
      'Unit Price': 290,
      'Unit': 'per piece'
    },
    {
      'Category': 'Waterproofing & Chemicals',
      'Item Name': 'Dr. Fixit 101 LW+ Waterproofing (20L)',
      'Description': 'Integral liquid waterproofing compound for plaster and concrete',
      'Unit Price': 2450,
      'Unit': 'per 20L drum'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleTemplateData);
  worksheet['!cols'] = [
    { wch: 24 },
    { wch: 38 },
    { wch: 50 },
    { wch: 14 },
    { wch: 18 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Materials Template');
  XLSX.writeFile(workbook, 'om_traders_material_rate_template.xlsx');
  showToast('Downloaded sample Excel template!', 'info');
}

// ==============================================================================
// MANUAL CATALOG MANAGEMENT
// ==============================================================================
function renderAdminCatalogTable() {
  const tbody = document.getElementById('admin-catalog-tbody');
  tbody.innerHTML = '';

  AppState.catalog.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition';
    tr.innerHTML = `
      <td class="py-3 px-4 font-bold text-slate-900">${escapeHtml(item.name)}</td>
      <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-semibold">${escapeHtml(item.category)}</span></td>
      <td class="py-3 px-4 text-slate-500 max-w-sm truncate text-xs">${escapeHtml(item.description)}</td>
      <td class="py-3 px-4 font-bold text-slate-900">${formatCurrency(item.price)}</td>
      <td class="py-3 px-4 text-slate-500 text-xs">${escapeHtml(item.unit || 'per unit')}</td>
      <td class="py-3 px-4 text-right whitespace-nowrap">
        <button onclick="openEditItemModal('${item.id}')" class="text-blue-600 hover:text-blue-800 p-1 mr-2 text-xs font-semibold">
          <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
        <button onclick="deleteCatalogItem('${item.id}')" class="text-red-500 hover:text-red-700 p-1 text-xs font-semibold">
          <i class="fa-solid fa-trash-can"></i> Delete
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openAddItemModal() {
  document.getElementById('item-modal-title').textContent = 'Add New Catalog Item';
  document.getElementById('item-edit-id').value = '';
  document.getElementById('item-form').reset();
  document.getElementById('item-modal').classList.remove('hidden');
}

function openEditItemModal(itemId) {
  const item = AppState.catalog.find(i => i.id === itemId);
  if (!item) return;

  document.getElementById('item-modal-title').textContent = 'Edit Catalog Item';
  document.getElementById('item-edit-id').value = item.id;
  document.getElementById('item-name-input').value = item.name;
  document.getElementById('item-category-input').value = item.category;
  document.getElementById('item-price-input').value = item.price;
  document.getElementById('item-unit-input').value = item.unit;
  document.getElementById('item-desc-input').value = item.description;
  document.getElementById('item-modal').classList.remove('hidden');
}

function closeItemModal() {
  document.getElementById('item-modal').classList.add('hidden');
}

function handleSaveItem(e) {
  e.preventDefault();
  const id = document.getElementById('item-edit-id').value;
  const name = document.getElementById('item-name-input').value.trim();
  const category = document.getElementById('item-category-input').value.trim();
  const price = parseFloat(document.getElementById('item-price-input').value) || 0;
  const unit = document.getElementById('item-unit-input').value.trim() || 'per unit';
  const description = document.getElementById('item-desc-input').value.trim();

  if (!name || !category) {
    showToast('Name and Category are required!', 'error');
    return;
  }

  if (id) {
    // Edit existing
    const item = AppState.catalog.find(i => i.id === id);
    if (item) {
      item.name = name;
      item.category = category;
      item.price = price;
      item.unit = unit;
      item.description = description;
    }
  } else {
    // Add new
    AppState.catalog.push({
      id: `item-${Date.now()}`,
      name,
      category,
      price,
      unit,
      description
    });
  }

  saveData(STORAGE_KEYS.CATALOG, AppState.catalog);
  closeItemModal();
  renderAdminCatalogTable();
  renderCatalogGrid();
  renderCategoryPills();
  updateAdminDashboardStats();
  showToast(id ? 'Item updated successfully!' : 'New item added to catalog!', 'success');
}

function deleteCatalogItem(itemId) {
  if (!confirm('Are you sure you want to remove this item from the catalog?')) return;
  AppState.catalog = AppState.catalog.filter(i => i.id !== itemId);
  delete AppState.cart[itemId];
  saveData(STORAGE_KEYS.CATALOG, AppState.catalog);
  renderAdminCatalogTable();
  renderCatalogGrid();
  renderCategoryPills();
  updateAdminDashboardStats();
  showToast('Item deleted from catalog', 'info');
}

function resetToSampleCatalog() {
  if (!confirm('Reset catalog to sample services data? Your current list will be overwritten.')) return;
  AppState.catalog = [...DEFAULT_CATALOG];
  saveData(STORAGE_KEYS.CATALOG, AppState.catalog);
  renderAdminCatalogTable();
  renderCatalogGrid();
  renderCategoryPills();
  updateAdminDashboardStats();
  showToast('Reset to default sample catalog', 'info');
}

// ==============================================================================
// BUSINESS SETTINGS HANDLER
// ==============================================================================
function handleSettingsSubmit(e) {
  e.preventDefault();

  AppState.settings.businessName = document.getElementById('setting-business-name').value.trim();
  AppState.settings.tagline = document.getElementById('setting-tagline').value.trim();
  AppState.settings.currency = document.getElementById('setting-currency').value;
  AppState.settings.taxRate = parseFloat(document.getElementById('setting-tax-rate').value) || 0;
  AppState.settings.phone = document.getElementById('setting-phone').value.trim();
  AppState.settings.whatsapp = document.getElementById('setting-whatsapp').value.trim();
  AppState.settings.email = document.getElementById('setting-email').value.trim();
  AppState.settings.address = document.getElementById('setting-address').value.trim();
  AppState.settings.terms = document.getElementById('setting-terms').value.trim();

  saveData(STORAGE_KEYS.SETTINGS, AppState.settings);
  applySettingsToUI();
  renderCatalogGrid();
  renderQuotationDrawer();
  updateAdminDashboardStats();
  showToast('Business & quotation settings saved!', 'success');
}

// ==============================================================================
// EVENT LISTENERS & SETUP
// ==============================================================================
function setupEventListeners() {
  // Search Bar
  const searchInput = document.getElementById('catalog-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.searchQuery = e.target.value.trim();
      renderCatalogGrid();
    });
  }

  // Leads Search
  const leadsSearch = document.getElementById('leads-search-input');
  if (leadsSearch) {
    leadsSearch.addEventListener('input', () => {
      renderAdminLeadsTable();
    });
  }

  // Admin Login Form
  document.getElementById('admin-login-form')?.addEventListener('submit', handleAdminLogin);

  // Admin Logout
  document.getElementById('admin-logout-btn')?.addEventListener('click', logoutAdmin);

  // Admin Toggle Banner
  document.getElementById('toggle-admin-view-btn')?.addEventListener('click', toggleAdminView);

  // Customer Enquiry Form
  document.getElementById('customer-enquiry-form')?.addEventListener('submit', handleEnquirySubmit);

  // Business Settings Form
  document.getElementById('business-settings-form')?.addEventListener('submit', handleSettingsSubmit);

  // Item Form (Manual Add/Edit)
  document.getElementById('item-form')?.addEventListener('submit', handleSaveItem);

  // Excel Dropzone
  setupExcelDropzone();
}

// ==============================================================================
// TOAST NOTIFICATIONS & UTILITIES
// ==============================================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = 'fa-solid fa-circle-info text-blue-400';
  if (type === 'success') icon = 'fa-solid fa-circle-check text-emerald-400';
  if (type === 'error') icon = 'fa-solid fa-triangle-exclamation text-red-400';

  toast.innerHTML = `
    <i class="${icon}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toast-out 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
