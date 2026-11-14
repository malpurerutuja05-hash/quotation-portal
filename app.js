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
  CATALOG: 'biz_portal_catalog_v1',
  ENQUIRIES: 'biz_portal_enquiries_v1',
  SETTINGS: 'biz_portal_settings_v1',
  AUTH: 'biz_portal_admin_session',
  PASSWORD: 'biz_portal_admin_password'
};

// Default Sample Catalog Data
const DEFAULT_CATALOG = [
  {
    id: 'prod-1',
    name: 'Professional Business Website',
    category: 'Digital Services',
    price: 499,
    unit: 'per project',
    description: 'Custom 5-page responsive website with mobile optimization, contact form & SEO-ready structure.'
  },
  {
    id: 'prod-2',
    name: 'E-Commerce Storefront Setup',
    category: 'Digital Services',
    price: 899,
    unit: 'per project',
    description: 'Online store with shopping cart, product catalog, payment gateway and inventory tracking.'
  },
  {
    id: 'prod-3',
    name: 'Monthly SEO & Growth Campaign',
    category: 'Marketing',
    price: 250,
    unit: 'per month',
    description: 'Targeted keyword research, on-page SEO optimization, technical fixes, and monthly ranking reports.'
  },
  {
    id: 'prod-4',
    name: 'Social Media Ad Campaign Management',
    category: 'Marketing',
    price: 350,
    unit: 'per month',
    description: 'Creative design, ad copywriting, audience targeting, and budget optimization across Meta & Google.'
  },
  {
    id: 'prod-5',
    name: 'Cloud Infrastructure & Server Setup',
    category: 'Cloud & IT',
    price: 400,
    unit: 'per setup',
    description: 'Secure cloud hosting deployment (AWS / Google Cloud) with automated daily backups and SSL certificates.'
  },
  {
    id: 'prod-6',
    name: 'Annual IT Support & Maintenance',
    category: 'Cloud & IT',
    price: 150,
    unit: 'per month',
    description: '24/7 server health monitoring, security updates, regular bug fixes, and prioritized helpdesk support.'
  },
  {
    id: 'prod-7',
    name: 'Strategic Business Consultation',
    category: 'Consulting',
    price: 120,
    unit: 'per hour',
    description: '1-on-1 strategic session with senior advisors to assess business workflow, tooling, and revenue growth.'
  },
  {
    id: 'prod-8',
    name: 'High-Performance Workstation Bundle',
    category: 'Hardware & Setup',
    price: 750,
    unit: 'per unit',
    description: 'Configured corporate desktop with dual 24-inch monitors, wireless peripherals, and warranty.'
  }
];

// Default Sample Enquiries Data
const DEFAULT_ENQUIRIES = [
  {
    id: 'ENQ-2026-9102',
    date: '2026-11-12 10:30 AM',
    name: 'Michael Reynolds',
    email: 'michael.r@apextech.com',
    phone: '+1 (555) 234-5678',
    company: 'Apex Technologies LLC',
    message: 'Looking to overhaul our corporate website before Q1 product release. Please include timeline estimates.',
    items: [
      { name: 'Professional Business Website', qty: 1, unit: 'per project', rate: 499, total: 499 },
      { name: 'Monthly SEO & Growth Campaign', qty: 1, unit: 'per month', rate: 250, total: 250 }
    ],
    subtotal: 749,
    taxAmount: 134.82,
    total: 883.82,
    status: 'Contacted'
  },
  {
    id: 'ENQ-2026-9103',
    date: '2026-11-14 09:15 AM',
    name: 'Sarah Chen',
    email: 'sarah.chen@greenpeak.org',
    phone: '+1 (555) 876-5432',
    company: 'GreenPeak Organics',
    message: 'We are launching an online organic grocery delivery service and need an e-commerce platform.',
    items: [
      { name: 'E-Commerce Storefront Setup', qty: 1, unit: 'per project', rate: 899, total: 899 }
    ],
    subtotal: 899,
    taxAmount: 161.82,
    total: 1060.82,
    status: 'New'
  }
];

// Default Business Settings
const DEFAULT_SETTINGS = {
  businessName: 'Apex Business Solutions',
  tagline: 'Instant Quotation & Client Services',
  currency: '$',
  taxRate: 18,
  phone: '+1 (800) 555-0199',
  whatsapp: '18005550199',
  email: 'contact@apexsolutions.com',
  address: 'Suite 400, Financial District, New York, NY',
  terms: '1. Quotation valid for 30 calendar days from the date of issue.\n2. 50% mobilization advance upon contract signing.\n3. Applicable local statutory taxes included as calculated.',
  adminPassword: 'admin123'
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
  // 1. Settings
  try {
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    AppState.settings = savedSettings ? JSON.parse(savedSettings) : { ...DEFAULT_SETTINGS };
  } catch (e) {
    AppState.settings = { ...DEFAULT_SETTINGS };
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

  // 4. Admin Session
  AppState.isAdmin = sessionStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
}

function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage write error:', e);
  }
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
  grid.innerHTML = '';

  const filtered = AppState.catalog.filter(item => {
    const matchesCategory = (AppState.activeCategory === 'ALL') || (item.category === AppState.activeCategory);
    const searchLow = AppState.searchQuery.toLowerCase();
    const matchesSearch = !searchLow || 
      item.name.toLowerCase().includes(searchLow) || 
      (item.description && item.description.toLowerCase().includes(searchLow)) ||
      (item.category && item.category.toLowerCase().includes(searchLow));
    return matchesCategory && matchesSearch;
  });

  document.getElementById('total-catalog-count').textContent = AppState.catalog.length;

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  filtered.forEach(item => {
    const currentQty = AppState.cart[item.id] || 0;
    const isAdded = currentQty > 0;

    const card = document.createElement('div');
    card.className = `product-card bg-white rounded-2xl border p-5 flex flex-col justify-between ${isAdded ? 'border-blue-400 ring-1 ring-blue-400 shadow-md' : 'border-slate-200'}`;

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
            ${escapeHtml(item.category || 'General')}
          </span>
          ${isAdded ? `<span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><i class="fa-solid fa-check mr-1"></i>In Quote (${currentQty})</span>` : ''}
        </div>
        <h3 class="font-bold text-slate-900 text-base leading-snug">${escapeHtml(item.name)}</h3>
        <p class="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">${escapeHtml(item.description || 'Professional standard offering with comprehensive execution.')}</p>
      </div>

      <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div class="text-xl font-extrabold text-slate-900">${formatCurrency(item.price)}</div>
          <div class="text-[11px] text-slate-400 font-medium">${escapeHtml(item.unit || 'per unit')}</div>
        </div>

        <div class="flex items-center gap-2">
          ${isAdded ? `
            <div class="flex items-center rounded-xl border border-blue-300 bg-blue-50/50 p-1">
              <button onclick="decrementCart('${item.id}')" class="w-7 h-7 rounded-lg bg-white shadow-xs hover:bg-blue-100 text-blue-700 font-bold flex items-center justify-center transition">
                <i class="fa-solid fa-minus text-xs"></i>
              </button>
              <span class="w-8 text-center text-xs font-bold text-blue-900">${currentQty}</span>
              <button onclick="incrementCart('${item.id}')" class="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center transition">
                <i class="fa-solid fa-plus text-xs"></i>
              </button>
            </div>
          ` : `
            <button onclick="addToCart('${item.id}')" class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm">
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
  // Extract unique categories
  const categories = Array.from(new Set(AppState.catalog.map(i => i.category || 'General'))).filter(Boolean);

  container.innerHTML = `
    <button onclick="setCategoryFilter('ALL')" class="category-btn ${AppState.activeCategory === 'ALL' ? 'active bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'} px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition whitespace-nowrap">
      All Items (${AppState.catalog.length})
    </button>
  `;

  categories.forEach(cat => {
    const count = AppState.catalog.filter(i => (i.category || 'General') === cat).length;
    const btn = document.createElement('button');
    btn.onclick = () => setCategoryFilter(cat);
    btn.className = `category-btn ${AppState.activeCategory === cat ? 'active bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'} px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition whitespace-nowrap`;
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
  formSection.scrollIntoView({ behavior: 'smooth' });
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
  document.getElementById('admin-login-modal').classList.remove('hidden');
  document.getElementById('admin-password-input').focus();
}

function closeAdminModal() {
  document.getElementById('admin-login-modal').classList.add('hidden');
  document.getElementById('admin-password-input').value = '';
}

function handleAdminLogin(e) {
  e.preventDefault();
  const enteredPass = document.getElementById('admin-password-input').value;
  const currentPass = AppState.settings.adminPassword || 'admin123';

  if (enteredPass === currentPass) {
    AppState.isAdmin = true;
    sessionStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    closeAdminModal();
    checkAdminAuth();
    showAdminDashboard();
    showToast('Admin authenticated successfully!', 'success');
  } else {
    showToast('Incorrect admin passcode. Try "admin123"', 'error');
  }
}

function logoutAdmin() {
  AppState.isAdmin = false;
  sessionStorage.removeItem(STORAGE_KEYS.AUTH);
  checkAdminAuth();
  showCustomerView();
  showToast('Logged out of admin portal', 'info');
}

function updateAdminPassword() {
  const newPass = document.getElementById('new-admin-password-input').value.trim();
  if (!newPass || newPass.length < 4) {
    showToast('Password must be at least 4 characters long', 'error');
    return;
  }
  AppState.settings.adminPassword = newPass;
  saveData(STORAGE_KEYS.SETTINGS, AppState.settings);
  document.getElementById('new-admin-password-input').value = '';
  showToast('Admin password updated successfully!', 'success');
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
  document.getElementById('admin-panel-leads').classList.toggle('hidden', tab !== 'leads');
  document.getElementById('admin-panel-excel').classList.toggle('hidden', tab !== 'excel');
  document.getElementById('admin-panel-catalog').classList.toggle('hidden', tab !== 'catalog');
  document.getElementById('admin-panel-settings').classList.toggle('hidden', tab !== 'settings');

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

    let statusBadgeColor = 'bg-slate-100 text-slate-700';
    if (lead.status === 'New') statusBadgeColor = 'bg-amber-100 text-amber-800';
    else if (lead.status === 'Contacted') statusBadgeColor = 'bg-blue-100 text-blue-800';
    else if (lead.status === 'Quotation Sent') statusBadgeColor = 'bg-purple-100 text-purple-800';
    else if (lead.status === 'Closed / Won') statusBadgeColor = 'bg-emerald-100 text-emerald-800';

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
        <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusBadgeColor}">${escapeHtml(lead.status || 'New')}</span>
      </td>
      <td class="py-3 px-4 text-right">
        <button onclick="viewEnquiryDetails('${lead.id}')" class="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition">
          <i class="fa-solid fa-eye"></i> View
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
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
  AppState.currentViewingEnquiry.status = newStatus;
  saveData(STORAGE_KEYS.ENQUIRIES, AppState.enquiries);
  document.getElementById('modal-enquiry-status').textContent = newStatus;
  renderAdminLeadsTable();
  updateAdminDashboardStats();
  showToast(`Enquiry marked as "${newStatus}"`, 'success');
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
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (rawRows.length === 0) {
        showToast('The uploaded Excel sheet contains no rows!', 'error');
        return;
      }

      // Smart Header Mapper
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

// Smart column mapping that recognizes various header names
function parseExcelRowsWithSmartMapper(rawRows) {
  return rawRows.map((row, index) => {
    let name = '';
    let category = 'Services';
    let price = 0;
    let unit = 'per project';
    let description = '';

    // Search object keys case-insensitively
    for (const [key, val] of Object.entries(row)) {
      const cleanKey = key.trim().toLowerCase();
      const cleanVal = String(val).trim();

      // Name matches
      if (['name', 'item', 'item name', 'product', 'product name', 'service', 'service name', 'title'].includes(cleanKey)) {
        name = cleanVal;
      }
      // Category matches
      else if (['category', 'group', 'type', 'department', 'class'].includes(cleanKey)) {
        category = cleanVal || 'Services';
      }
      // Price matches
      else if (['price', 'unit price', 'rate', 'cost', 'amount', 'fee'].includes(cleanKey)) {
        const num = parseFloat(String(cleanVal).replace(/[^0-9.]/g, ''));
        price = isNaN(num) ? 0 : num;
      }
      // Unit matches
      else if (['unit', 'billing unit', 'per', 'frequency', 'basis'].includes(cleanKey)) {
        unit = cleanVal || 'per unit';
      }
      // Description matches
      else if (['description', 'details', 'features', 'desc', 'notes', 'specifications'].includes(cleanKey)) {
        description = cleanVal;
      }
    }

    // Fallbacks if columns had unusual names:
    if (!name && Object.values(row)[0]) {
      name = String(Object.values(row)[0]).trim();
    }

    return {
      id: `xl-${Date.now()}-${index}`,
      name: name || `Item #${index + 1}`,
      category: category || 'General',
      price: price,
      unit: unit || 'per unit',
      description: description || ''
    };
  }).filter(item => Boolean(item.name));
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
      <td class="py-2 px-3"><span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">${escapeHtml(item.category)}</span></td>
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
  saveData(STORAGE_KEYS.CATALOG, AppState.catalog);

  // Clear upload state
  cancelExcelUpload();

  // Refresh UI
  renderCatalogGrid();
  renderCategoryPills();
  renderAdminCatalogTable();
  updateAdminDashboardStats();

  showToast(`🎉 Success! Published ${AppState.catalog.length} items live to the website quotation catalog!`, 'success');
}

// Download Sample Template for Admin
function downloadSampleExcelTemplate() {
  if (typeof XLSX === 'undefined') {
    showToast('SheetJS is loading, please wait...', 'error');
    return;
  }

  const sampleTemplateData = [
    {
      'Category': 'Digital Services',
      'Item Name': 'Complete Business Website',
      'Description': '5-Page responsive corporate website with SEO and mobile layout',
      'Unit Price': 499,
      'Unit': 'per project'
    },
    {
      'Category': 'Digital Services',
      'Item Name': 'Custom Mobile Application',
      'Description': 'iOS and Android native cross-platform application design',
      'Unit Price': 1499,
      'Unit': 'per project'
    },
    {
      'Category': 'Marketing & SEO',
      'Item Name': 'Monthly Search Engine Optimization',
      'Description': 'Targeted keywords, on-page optimization, and Google ranking report',
      'Unit Price': 250,
      'Unit': 'per month'
    },
    {
      'Category': 'Cloud & IT',
      'Item Name': 'Cloud Server Architecture & Setup',
      'Description': 'AWS / Google Cloud automated deployment with backup retention',
      'Unit Price': 400,
      'Unit': 'per setup'
    },
    {
      'Category': 'Consulting',
      'Item Name': 'Business Process Consultation',
      'Description': '1-on-1 strategy meeting with implementation roadmap',
      'Unit Price': 120,
      'Unit': 'per hour'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleTemplateData);
  worksheet['!cols'] = [
    { wch: 20 },
    { wch: 32 },
    { wch: 45 },
    { wch: 14 },
    { wch: 16 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Catalog Template');
  XLSX.writeFile(workbook, 'business_service_catalog_template.xlsx');
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

  // Cart Drawer Trigger
  document.getElementById('quote-drawer-toggle')?.addEventListener('click', openQuotationDrawer);

  // Admin Modal Trigger
  document.getElementById('open-admin-modal-btn')?.addEventListener('click', openAdminModal);

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
