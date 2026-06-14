/**
 * =========================================================
 * SMART CONTACT MANAGEMENT SYSTEM - ADMIN PANEL LOGIC (admin.js)
 * =========================================================
 * Designed for BSCS Web Technologies Capstone.
 * All logic is plain JavaScript, optimized for viva explanation.
 */

// 1. STATE & CONFIGURATION
const API_URL = 'http://localhost:3000/contacts';
let allContacts = []; // Holds all contacts (Active & Archived) fetched from backend

// 2. DOM SELECTORS
const tableBody = document.getElementById('admin-table-body');
const statTotal = document.getElementById('stat-total-contacts');
const statRatio = document.getElementById('stat-status-ratio');
const statCategoryDistribution = document.getElementById('stat-category-distribution');
const editForm = document.getElementById('edit-contact-form');
const errorContainer = document.getElementById('error-container');

// Modal Elements
const editModal = document.getElementById('edit-contact-modal');
const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// Theme Elements
const themeToggle = document.getElementById('theme-toggle');
const themeToggleIcon = document.getElementById('theme-toggle-icon');

// Form Input Elements
const idInput = document.getElementById('edit-contact-id');
const nameInput = document.getElementById('edit-contact-name');
const emailInput = document.getElementById('edit-contact-email');
const phoneInput = document.getElementById('edit-contact-phone');
const categorySelect = document.getElementById('edit-contact-category');
const companyInput = document.getElementById('edit-contact-company');
const statusSelect = document.getElementById('edit-contact-status');
const notesInput = document.getElementById('edit-contact-notes');

// 3. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  getAllContacts();
  setupEventListeners();
});

/**
 * Initializes light/dark theme based on localStorage.
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
 * Updates the theme SVG icon.
 */
function updateThemeIcon(theme) {
  if (theme === 'dark') {
    themeToggleIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
  } else {
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

// 4. EVENT LISTENERS
function setupEventListeners() {
  themeToggle.addEventListener('click', toggleTheme);
  
  // Modal Close Actions
  closeEditModalBtn.addEventListener('click', closeEditModal);
  cancelEditBtn.addEventListener('click', closeEditModal);
  
  // Close modal when clicking on overlay background
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
  });

  // Edit form submission
  editForm.addEventListener('submit', handleEditFormSubmit);

  // Event Delegation on Table Actions (highly performant and professional)
  // Demonstrated concept: Event Delegation (one listener handles clicks on edit/delete buttons)
  tableBody.addEventListener('click', handleTableActions);

  // Real-time blur validation bindings
  nameInput.addEventListener('blur', () => validateField(nameInput, validateName));
  emailInput.addEventListener('blur', () => validateField(emailInput, validateEmail));
  phoneInput.addEventListener('blur', () => validateField(phoneInput, validatePhone));
  categorySelect.addEventListener('change', () => validateField(categorySelect, validateCategory));
  companyInput.addEventListener('blur', () => validateField(companyInput, validateCompany));
  statusSelect.addEventListener('change', () => validateField(statusSelect, validateStatus));
  notesInput.addEventListener('input', () => validateField(notesInput, validateNotes));
}

// 5. FETCH & CORE READ (GET)

/**
 * Fetches all resources (active & archived).
 * Demonstrated concept: GET method fetching all documents.
 */
async function getAllContacts() {
  showLoadingTable();
  clearErrorBanner();
  
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    
    allContacts = await response.json();
    
    // Refresh admin visuals
    renderStats();
    renderTable();
  } catch (error) {
    showErrorState(error.message);
  }
}

// 6. STATISTICS COMPUTER

/**
 * Calculates and renders 3 dynamic statistics from the loaded dataset.
 * Demonstrated concepts: Math, object manipulation, reduce/filter arrays.
 */
function renderStats() {
  const total = allContacts.length;
  
  if (total === 0) {
    statTotal.textContent = '0';
    statRatio.textContent = '0 / 0';
    statCategoryDistribution.innerHTML = '<div class="bar-item">No data available</div>';
    return;
  }

  // 1. Total count
  statTotal.textContent = total;

  // 2. Active vs Archived stats
  const activeCount = allContacts.filter(c => c.status === 'Active').length;
  const archivedCount = total - activeCount;
  statRatio.textContent = `${activeCount} / ${archivedCount}`;

  // 3. Category distribution (Work, Personal, Family, Other)
  const categories = ['Work', 'Personal', 'Family', 'Other'];
  let categoriesHTML = '';

  categories.forEach(cat => {
    const count = allContacts.filter(c => c.category === cat).length;
    // Calculate percentage
    const percentage = Math.round((count / total) * 100);
    const color = getCategoryColor(cat);
    
    categoriesHTML += `
      <div class="bar-item">
        <span class="bar-label">${cat} (${count})</span>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${percentage}%; background-color: ${color};" title="${percentage}%"></div>
        </div>
        <span style="font-weight: 600; width: 30px; text-align: right;">${percentage}%</span>
      </div>
    `;
  });

  statCategoryDistribution.innerHTML = categoriesHTML;
}

// 7. TABLE RENDER

/**
 * Renders contact rows in the admin management datatable.
 */
function renderTable() {
  tableBody.innerHTML = '';

  if (allContacts.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 3rem;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">📭</div>
          <strong>No contacts in database.</strong> Add a contact from the User Panel.
        </td>
      </tr>
    `;
    return;
  }

  allContacts.forEach(contact => {
    const initials = getInitials(contact.name);
    const statusClass = contact.status === 'Active' ? 'status-active' : 'status-archived';
    const cardColor = getCategoryColor(contact.category);
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="table-avatar-cell">
          <div class="table-avatar" style="background: linear-gradient(135deg, ${cardColor}, #818cf8)">
            ${initials}
          </div>
          <div>
            <strong style="display: block; font-size: 0.95rem;">${contact.name}</strong>
            <span style="font-size: 0.8rem; color: var(--text-secondary);">${contact.company}</span>
          </div>
        </div>
      </td>
      <td>${contact.email}</td>
      <td>${contact.phone}</td>
      <td>
        <span class="badge badge-${contact.category.toLowerCase()}">${contact.category}</span>
      </td>
      <td>
        <span class="status-badge ${statusClass}">${contact.status}</span>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn btn-edit" data-action="edit" data-id="${contact.id}">Edit</button>
          <button class="btn btn-delete" data-action="delete" data-id="${contact.id}">Delete</button>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// 8. TABLE ACTION EVENT DELEGATION (EDIT / DELETE FLOW)

function handleTableActions(e) {
  const target = e.target;
  const action = target.dataset.action;
  const contactId = target.dataset.id;
  
  if (!action || !contactId) return;

  const contact = allContacts.find(c => c.id === contactId);
  if (!contact) return;

  if (action === 'edit') {
    populateEditModal(contact);
  } else if (action === 'delete') {
    // Demonstrated concept: DELETE method with confirmation dialog
    confirmDelete(contact);
  }
}

// 9. EDIT RESOURCE FLOW (PUT)

/**
 * Prefills inputs of the edit modal with current resource fields.
 */
function populateEditModal(contact) {
  idInput.value = contact.id;
  nameInput.value = contact.name;
  emailInput.value = contact.email;
  phoneInput.value = contact.phone;
  categorySelect.value = contact.category;
  companyInput.value = contact.company;
  statusSelect.value = contact.status;
  notesInput.value = contact.notes || '';

  // Clean invalid styling configurations
  editForm.removeAttribute('data-submitted');
  editForm.querySelectorAll('.form-control').forEach(ctrl => ctrl.classList.remove('is-invalid'));

  openEditModal();
}

/**
 * Handles validation and PUT request to update resource.
 * Demonstrated concept: PUT method (replacing resource entirely), headers, body serialization
 */
async function handleEditFormSubmit(e) {
  e.preventDefault();

  // Validate all fields
  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isPhoneValid = validatePhone();
  const isCategoryValid = validateCategory();
  const isCompanyValid = validateCompany();
  const isStatusValid = validateStatus();
  const isNotesValid = validateNotes();

  const isFormValid = isNameValid && isEmailValid && isPhoneValid && isCategoryValid && isCompanyValid && isStatusValid && isNotesValid;

  if (!isFormValid) {
    const firstInvalid = editForm.querySelector('.form-control.is-invalid');
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  const contactId = idInput.value;
  // Retrieve original contact to preserve other metadata like `createdAt`
  const originalContact = allContacts.find(c => c.id === contactId);
  const createdAtVal = originalContact ? originalContact.createdAt : new Date().toISOString();

  // Construct complete payload for PUT replacement
  // Viva concept: PUT replaces the resource entirely. Hence, we must transmit all fields
  // (including non-editable ones like createdAt) to avoid losing database data.
  const updatedContact = {
    id: contactId,
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    category: categorySelect.value,
    company: companyInput.value.trim(),
    status: statusSelect.value,
    notes: notesInput.value.trim(),
    createdAt: createdAtVal
  };

  try {
    const response = await fetch(`${API_URL}/${contactId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedContact)
    });

    if (!response.ok) {
      throw new Error(`Failed to update contact. Status: ${response.status}`);
    }

    closeEditModal();
    getAllContacts(); // Automatically re-renders admin panel
  } catch (error) {
    showErrorBanner(`Error updating contact: ${error.message}`);
  }
}

// 10. DELETE RESOURCE FLOW (DELETE)

/**
 * Asks for deletion confirmation and dispatches DELETE.
 * Demonstrated concepts: confirm() browser dialog, DELETE HTTP method
 */
async function confirmDelete(contact) {
  // Viva concept: confirm() freezes the main thread, showing a modal dialog.
  // It returns true if user selects "OK", and false if they select "Cancel".
  const hasConfirmed = confirm(`Are you sure you want to delete "${contact.name}"?\nThis action cannot be undone.`);
  
  if (!hasConfirmed) return;

  try {
    const response = await fetch(`${API_URL}/${contact.id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete contact. Status: ${response.status}`);
    }

    // Refresh list on successful delete
    getAllContacts();
  } catch (error) {
    showErrorBanner(`Error deleting contact: ${error.message}`);
  }
}

// 11. INLINE FORM VALIDATION FUNCTIONS
// Validates single input when focus is blurred
function validateField(inputEl, validationFn) {
  const isValid = validationFn();
  toggleInputState(inputEl, isValid, true);
}

function validateName() {
  const val = nameInput.value.trim();
  const nameRegex = /^[A-Za-z\s]{3,}$/;
  return nameRegex.test(val);
}

function validateEmail() {
  const val = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(val);
}

function validatePhone() {
  const val = phoneInput.value.trim();
  const phoneRegex = /^[+\d\s-]{10,}$/;
  return phoneRegex.test(val);
}

function validateCategory() {
  return categorySelect.value !== '';
}

function validateCompany() {
  return companyInput.value.trim().length >= 2;
}

function validateStatus() {
  return statusSelect.value !== '';
}

function validateNotes() {
  return notesInput.value.trim().length <= 200;
}

function toggleInputState(inputEl, isValid, showImmediate) {
  if (isValid) {
    inputEl.classList.remove('is-invalid');
    return true;
  } else {
    inputEl.classList.add('is-invalid');
    return false;
  }
}

// 12. HELPER UI LAYOUT DRAWERS

function openEditModal() {
  editModal.classList.add('open');
  editModal.setAttribute('aria-hidden', 'false');
  nameInput.focus();
}

function closeEditModal() {
  editModal.classList.remove('open');
  editModal.setAttribute('aria-hidden', 'true');
  editForm.reset();
  editForm.removeAttribute('data-submitted');
  editForm.querySelectorAll('.form-control').forEach(ctrl => ctrl.classList.remove('is-invalid'));
}

function showLoadingTable() {
  tableBody.innerHTML = `
    <tr>
      <td colspan="6" style="text-align: center; padding: 3rem;">
        <div class="spinner" style="margin: 0 auto 1rem;"></div>
        <p style="color: var(--text-secondary);">Fetching system directories...</p>
      </td>
    </tr>
  `;
}

function showErrorState(message) {
  tableBody.innerHTML = `
    <tr>
      <td colspan="6" style="text-align: center; padding: 3rem;">
        <div class="error-banner" style="max-width: 600px; margin: 0 auto; text-align: left;">
          <div class="error-banner-content">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 24px; height: 24px;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3>Database Connection Failed</h3>
              <p>We could not reach the contact database. Make sure your local JSON Server is running at http://localhost:3000/contacts.</p>
            </div>
          </div>
          <button onclick="getAllContacts()" class="btn btn-secondary" style="margin-top: 0.5rem;">Retry Connection</button>
        </div>
      </td>
    </tr>
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

// 13. STRING UTILS
function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getCategoryColor(category) {
  switch (category) {
    case 'Work': return '#4f46e5';
    case 'Personal': return '#10b981';
    case 'Family': return '#ec4899';
    default: return '#64748b';
  }
}
