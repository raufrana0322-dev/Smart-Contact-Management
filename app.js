/**
 * =========================================================
 * SMART CONTACT MANAGEMENT SYSTEM - USER PANEL LOGIC (app.js)
 * =========================================================
 * Designed for BSCS Web Technologies Capstone.
 * All logic is plain JavaScript, optimized for viva explanation.
 */

// 1. STATE & CONFIGURATION
const API_URL = 'http://localhost:3000/contacts';
let contactsState = []; // Holds active contacts fetched from backend
let searchFilter = '';  // Holds active search query
let categoryFilter = 'All'; // Holds active category filter

// 2. DOM SELECTORS
const contactsContainer = document.getElementById('contacts-container');
const searchInput = document.getElementById('search-input');
const categoryFilters = document.getElementById('category-filters');
const addForm = document.getElementById('add-contact-form');
const errorContainer = document.getElementById('error-container');

// Modal Elements
const addModal = document.getElementById('add-contact-modal');
const openModalBtn = document.getElementById('open-add-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelAddBtn = document.getElementById('cancel-add-btn');

// Theme Elements
const themeToggle = document.getElementById('theme-toggle');
const themeToggleIcon = document.getElementById('theme-toggle-icon');

// Form Input Elements
const nameInput = document.getElementById('contact-name');
const emailInput = document.getElementById('contact-email');
const phoneInput = document.getElementById('contact-phone');
const categorySelect = document.getElementById('contact-category');
const companyInput = document.getElementById('contact-company');
const notesInput = document.getElementById('contact-notes');

// 3. INITIALIZATION & THEME TOGGLE
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  getContacts();
  setupEventListeners();
});

/**
 * Initializes light/dark theme based on localStorage.
 * Demonstrated concept: Web Storage API (localStorage)
 */
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

/**
 * Toggles theme and saves preference in localStorage.
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

/**
 * Updates the theme SVG icon inside the button.
 */
function updateThemeIcon(theme) {
  if (theme === 'dark') {
    // Render moon icon
    themeToggleIcon.innerHTML = `
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    `;
  } else {
    // Render sun icon
    themeToggleIcon.innerHTML = `
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    `;
  }
}

// 4. EVENT LISTENERS SETUP
function setupEventListeners() {
  // Theme button toggle
  themeToggle.addEventListener('click', toggleTheme);
  
  // Modal open/close actions
  openModalBtn.addEventListener('click', openAddModal);
  closeModalBtn.addEventListener('click', closeAddModal);
  cancelAddBtn.addEventListener('click', closeAddModal);
  
  // Close modal when clicking outside modal box
  addModal.addEventListener('click', (e) => {
    if (e.target === addModal) closeAddModal();
  });

  // Debounced search input handler
  // Demonstrated concept: Debouncing (reduces server load by delaying fetch execution)
  searchInput.addEventListener('input', debounce(handleSearch, 300));

  // Category filter tabs
  // Demonstrated concept: Event Delegation (one listener on parent checks children targets)
  categoryFilters.addEventListener('click', handleCategoryFilter);

  // Form submission handler
  addForm.addEventListener('submit', handleFormSubmit);

  // Real-time validation listeners on blur (for professional inline feedback)
  nameInput.addEventListener('blur', () => validateName(true));
  emailInput.addEventListener('blur', () => validateEmail(true));
  phoneInput.addEventListener('blur', () => validatePhone(true));
  categorySelect.addEventListener('change', () => validateCategory(true));
  companyInput.addEventListener('blur', () => validateCompany(true));
  notesInput.addEventListener('input', () => validateNotes(true));
}

// 5. FETCH & DATA HANDLERS

/**
 * Fetches only 'Active' status contacts from JSON Server.
 * Demonstrated concepts: async/await, try/catch, response.ok verification, GET method
 */
async function getContacts() {
  showLoadingState();
  clearErrorBanner();
  
  try {
    // Fetch only active contacts (hide archived from user panel)
    const response = await fetch(`${API_URL}?status=Active`);
    
    // Viva concept: If network request is made but server returns 404/500, response.ok is false.
    // It doesn't throw a JavaScript error naturally, so we must check response.ok and throw manually.
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    
    // response.json() returns a Promise containing parsed JavaScript object
    contactsState = await response.json();
    renderContacts();
  } catch (error) {
    showErrorState(error.message);
  }
}

/**
 * Renders the fetched list of contacts after filtering.
 */
function renderContacts() {
  contactsContainer.innerHTML = '';

  // Apply search and category filter client-side
  const filteredContacts = contactsState.filter(contact => {
    const matchesCategory = categoryFilter === 'All' || contact.category === categoryFilter;
    
    const term = searchFilter.toLowerCase();
    const matchesSearch = 
      contact.name.toLowerCase().includes(term) ||
      contact.email.toLowerCase().includes(term) ||
      contact.company.toLowerCase().includes(term);
      
    return matchesCategory && matchesSearch;
  });

  // If no contacts, render empty state representation
  if (filteredContacts.length === 0) {
    renderEmptyState();
    return;
  }

  // Generate layouts dynamically
  filteredContacts.forEach(contact => {
    const initials = getInitials(contact.name);
    const badgeClass = `badge-${contact.category.toLowerCase()}`;
    const cardColor = getCategoryColor(contact.category);
    
    const contactCard = document.createElement('article');
    contactCard.className = 'contact-card';
    contactCard.style.setProperty('--cat-color', cardColor);
    
    contactCard.innerHTML = `
      <div class="card-header">
        <div class="avatar" style="background: linear-gradient(135deg, ${cardColor}, #818cf8)">
          ${initials}
        </div>
        <div class="header-info">
          <h3 class="contact-name" title="${contact.name}">${contact.name}</h3>
          <p class="contact-company" title="${contact.company}">${contact.company}</p>
        </div>
      </div>
      
      <div class="card-body">
        <span class="badge ${badgeClass}">${contact.category}</span>
        
        <div class="info-item">
          <!-- Email SVG Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <a href="mailto:${contact.email}" style="color: inherit; text-decoration: none;">${contact.email}</a>
        </div>
        
        <div class="info-item">
          <!-- Phone SVG Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <a href="tel:${contact.phone}" style="color: inherit; text-decoration: none;">${contact.phone}</a>
        </div>
        
        ${contact.notes ? `
          <div class="card-notes">
            "${contact.notes}"
          </div>
        ` : ''}
      </div>
    `;
    
    contactsContainer.appendChild(contactCard);
  });
}

// 6. FORM VALIDATION & SUBMISSION

/**
 * Handles validation and sends POST request to save contact.
 * Demonstrated concepts: e.preventDefault(), fetch options (headers, stringify), POST method
 */
async function handleFormSubmit(e) {
  // Viva concept: e.preventDefault() prevents the browser from doing its default page reload action
  // on form submission. This allows us to run custom JavaScript validation and execute async AJAX requests.
  e.preventDefault();

  // Validate all fields
  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isPhoneValid = validatePhone();
  const isCategoryValid = validateCategory();
  const isCompanyValid = validateCompany();
  const isNotesValid = validateNotes();

  const isFormValid = isNameValid && isEmailValid && isPhoneValid && isCategoryValid && isCompanyValid && isNotesValid;

  if (!isFormValid) {
    // Focus the first invalid element for accessibility
    const firstInvalid = addForm.querySelector('.form-control.is-invalid');
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  // Create POST payload from form inputs
  const newContact = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    category: categorySelect.value,
    company: companyInput.value.trim(),
    notes: notesInput.value.trim(),
    status: 'Active', // New contacts default to active status
    createdAt: new Date().toISOString()
  };

  try {
    // Set headers and body for server integration
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // Viva concept: HTTP protocol transmits strings. We use JSON.stringify() to serialize 
      // our JavaScript object payload into a formatted JSON string for transportation.
      body: JSON.stringify(newContact)
    });

    if (!response.ok) {
      throw new Error(`Failed to save contact. Status: ${response.status}`);
    }

    // Success response: Close modal, reset input, and trigger automatic list refresh
    closeAddModal();
    getContacts();
  } catch (error) {
    showErrorBanner(`Error saving contact: ${error.message}`);
  }
}

// Custom Inline Validation Helper Functions
function validateName(showImmediate = false) {
  const val = nameInput.value.trim();
  // Check: required, min 3 characters, letters and spaces only
  const nameRegex = /^[A-Za-z\s]{3,}$/;
  const isValid = nameRegex.test(val);
  return toggleInputState(nameInput, isValid, showImmediate);
}

function validateEmail(showImmediate = false) {
  const val = emailInput.value.trim();
  // Standard email validation pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(val);
  return toggleInputState(emailInput, isValid, showImmediate);
}

function validatePhone(showImmediate = false) {
  const val = phoneInput.value.trim();
  // Check: required, min 10 digits, only digits, +, -, and spaces
  const phoneRegex = /^[+\d\s-]{10,}$/;
  const isValid = phoneRegex.test(val);
  return toggleInputState(phoneInput, isValid, showImmediate);
}

function validateCategory(showImmediate = false) {
  const val = categorySelect.value;
  const isValid = val !== '';
  return toggleInputState(categorySelect, isValid, showImmediate);
}

function validateCompany(showImmediate = false) {
  const val = companyInput.value.trim();
  const isValid = val.length >= 2;
  return toggleInputState(companyInput, isValid, showImmediate);
}

function validateNotes(showImmediate = false) {
  const val = notesInput.value.trim();
  // Notes are optional, but if entered, must be <= 200 chars
  const isValid = val.length <= 200;
  return toggleInputState(notesInput, isValid, showImmediate);
}

/**
 * Toggles border classes and displays inline warning text.
 */
function toggleInputState(inputEl, isValid, showImmediate) {
  if (isValid) {
    inputEl.classList.remove('is-invalid');
    return true;
  } else {
    // Only highlight invalid input if submitting or focus was blurred (user finished typing)
    if (showImmediate || addForm.dataset.submitted === 'true') {
      inputEl.classList.add('is-invalid');
    }
    return false;
  }
}

// 7. FILTER & SEARCH HANDLERS

/**
 * Search callback from debounce
 */
function handleSearch(e) {
  searchFilter = e.target.value;
  renderContacts();
}

/**
 * Handles category tab clicks.
 */
function handleCategoryFilter(e) {
  // Check if target is a filter button
  const filterBtn = e.target.closest('.filter-btn');
  if (!filterBtn) return;

  // Toggle active styling states
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  filterBtn.classList.add('active');

  // Filter category
  categoryFilter = filterBtn.dataset.category;
  renderContacts();
}

/**
 * Debounce wrapper to restrict processing overhead.
 * Demonstrated closure concept: inner function remembers outer timer variable.
 */
function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// 8. HELPER LAYOUT DRAWERS & MODALS

function openAddModal() {
  addModal.classList.add('open');
  addModal.setAttribute('aria-hidden', 'false');
  nameInput.focus();
}

function closeAddModal() {
  addModal.classList.remove('open');
  addModal.setAttribute('aria-hidden', 'true');
  
  // Clean inputs & validation borders on modal dismissal
  addForm.reset();
  addForm.removeAttribute('data-submitted');
  const controls = addForm.querySelectorAll('.form-control');
  controls.forEach(ctrl => ctrl.classList.remove('is-invalid'));
}

/**
 * Renders glowing skeleton cards during GET load.
 */
function showLoadingState() {
  contactsContainer.innerHTML = `
    <div class="skeleton-grid" role="status" aria-label="Loading contacts">
      ${Array(3).fill('').map(() => `
        <div class="skeleton-card">
          <div class="skeleton-circle"></div>
          <div class="skeleton-line title"></div>
          <div class="skeleton-line subtitle"></div>
          <div class="skeleton-line" style="width: 80%"></div>
          <div class="skeleton-line" style="width: 70%"></div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Displays error banner if JSON server cannot be resolved.
 */
function showErrorState(message) {
  contactsContainer.innerHTML = `
    <div class="error-banner">
      <div class="error-banner-content">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 24px; height: 24px;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <h3>Database Connection Failed</h3>
          <p>We could not reach the contact database at ${API_URL}. Make sure your local JSON Server is running.</p>
        </div>
      </div>
      <button onclick="getContacts()" class="btn btn-secondary" style="margin-top: 0.5rem;">Retry Connection</button>
    </div>
  `;
}

function showErrorBanner(message) {
  errorContainer.innerHTML = `
    <div class="error-banner" style="margin-bottom: 1.5rem;">
      <div class="error-banner-content">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>${message}</span>
      </div>
    </div>
  `;
}

function clearErrorBanner() {
  errorContainer.innerHTML = '';
}

function renderEmptyState() {
  contactsContainer.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">📇</div>
      <h3>No Contacts Found</h3>
      <p>Try searching for a different term or select another category filter.</p>
    </div>
  `;
}

// 9. STRING FORMATTING & UTILITIES

/**
 * Extract first letter of name components.
 * Example: "Rauf Ahmed" -> "RA"
 */
function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Returns Hex code corresponding to categories.
 */
function getCategoryColor(category) {
  switch (category) {
    case 'Work': return '#4f46e5';     // Indigo
    case 'Personal': return '#10b981'; // Emerald
    case 'Family': return '#ec4899';   // Pink
    default: return '#64748b';         // Slate
  }
}
