// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBzSHkVxRiLC5gsq04LTTDnXaGdoF7eJ2c",
    authDomain: "easyregistrationforms.firebaseapp.com",
    projectId: "easyregistrationforms",
    storageBucket: "easyregistrationforms.firebasestorage.app",
    messagingSenderId: "589421628989",
    appId: "1:589421628989:web:d9f6e9dbe372ab7acd6454",
    measurementId: "G-GVCPBN8VB5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Initialize the system
let currentUser = null;
let currentClientId = null;
let ownerUniqueId = null;
const FORM_TYPE = 'sole'; // This form type identifier for Sole Proprietorship

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
  auth.onAuthStateChanged(user => {
    if (user) {
      currentUser = user;
      loadUserData();
    } else {
      // Redirect to login page if not logged in
      window.location.href = 'authenticate.html';
    }
  });
});

function loadUserData() {
  db.collection('users').doc(currentUser.uid).get()
    .then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        ownerUniqueId = userData.uniqueId;
        
        // Update user info display
        document.getElementById('userName').textContent = userData.firstName || 'User';
        document.getElementById('userUniqueId').textContent = ownerUniqueId;
        
        // Load client data
        loadClientData();
      } else {
        showNotification('User data not found. Please contact support.', 'error');
      }
    })
    .catch((error) => {
      console.error("Error getting user data:", error);
      showNotification('Error loading user data. Please try again.', 'error');
    });
}

function loadClientData() {
  showNotification('Loading client data...', 'info');
  
  // Query the form-specific collection for Sole Proprietorship forms
  db.collection('owners').doc(ownerUniqueId).collection(`${FORM_TYPE}_clients`)
    .orderBy('submittedAt', 'desc')
    .get()
    .then((querySnapshot) => {
      const clients = [];
      querySnapshot.forEach((doc) => {
        clients.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('Loaded Sole Proprietorship clients:', clients);
      
      if (clients.length === 0) {
        showEmptyState();
      } else {
        renderClientList(clients);
      }
    })
    .catch((error) => {
      console.error("Error getting client data:", error);
      showNotification('Error loading client data. Please try again.', 'error');
    });
}

function showEmptyState() {
  const container = document.getElementById('clientListContainer');
  container.innerHTML = `
    <div class="empty-state">
      <h3>No Sole Proprietorship Client Data Found</h3>
      <p>No clients have submitted Sole Proprietorship registration data through your link yet.</p>
      <p>Share your unique Sole Proprietorship link with clients to start collecting data.</p>
    </div>
  `;
}

function renderClientList(clients) {
  const container = document.getElementById('clientListContainer');
  
  container.innerHTML = clients.map(client => {
    // Extract business name from the flattened data structure
    const businessName = client['business_Business Name'] || 'Unknown Business';
    const submittedDate = new Date(client.submittedAt).toLocaleString();
    
    return `
      <div class="client-item">
        <h4>${businessName}</h4>
        <p><strong>Submitted:</strong> ${submittedDate}</p>
        <p><strong>Owner:</strong> ${client['owner_First Name'] || ''} ${client['owner_Surname'] || ''}</p>
        <div class="client-meta">
          <span class="client-id">ID: ${client.id}</span>
          <div>
            <button class="btn-view" onclick="viewClient('${client.id}')">View Details</button>
            <button class="btn-delete" onclick="deleteClient('${client.id}')">Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function viewClient(clientId) {
  // Get the specific client document from the form-specific collection
  db.collection('owners').doc(ownerUniqueId).collection(`${FORM_TYPE}_clients`).doc(clientId).get()
    .then((doc) => {
      if (doc.exists) {
        const client = doc.data();
        currentClientId = clientId;
        
        document.getElementById('clientListView').style.display = 'none';
        document.getElementById('clientDetailView').style.display = 'block';
        document.getElementById('mainTitle').textContent = 'Sole Proprietorship Client Data Details';
        
        // Extract business name from the flattened data structure
        const businessName = client['business_Business Name'] || 'Unknown Business';
        document.getElementById('clientDetailTitle').textContent = `${businessName} - Submitted ${new Date(client.submittedAt).toLocaleString()}`;
        
        renderClientDetail(client);
      } else {
        showNotification('Client not found!', 'error');
      }
    })
    .catch((error) => {
      console.error("Error getting client data:", error);
      showNotification('Error loading client data. Please try again.', 'error');
    });
}

function renderClientDetail(client) {
  const container = document.getElementById('clientDetailContainer');
  container.innerHTML = '';
  
  // Add a single copy all button at the top
  const copyAllButton = document.createElement('div');
  copyAllButton.className = 'copy-all-container';
  copyAllButton.innerHTML = `
    <button class="btn-copy-all" onclick="copyAllData()">
      <i class="fas fa-copy"></i> Copy All Data
    </button>
  `;
  container.appendChild(copyAllButton);
  
  // Render Business Information from the flattened data structure
  const businessFields = [
    { label: 'Business Name', value: client['business_Business Name'] || '' },
    { label: 'Business Activities', value: client['business_Business Activities'] || '' },
    { label: 'Start Date', value: client['business_Start Date'] || '' },
    { label: 'Estimated Annual Revenue', value: client['business_Estimated Annual Revenue'] || '' },
    { label: 'Number of Employees', value: client['business_Number of Employees'] || '' }
  ];
  
  let html = `<div class="section-container">
    <h3>Business Information</h3>
    <table>
      <tr><th>Field Label</th><th>Submitted Data</th></tr>`;
  
  businessFields.forEach(field => {
    html += `<tr data-field="${field.label}">
      <td>${field.label}</td>
      <td class="value-cell">${field.value}</td>
    </tr>`;
  });
  
  html += `</table>
    <div class="button-group">
      <button class="btn-edit" onclick="editSection('business')">Edit Section</button>
      <button class="btn-save" style="display:none;" onclick="saveSection('business')">Save Section</button>
      <button class="btn-cancel" style="display:none;" onclick="cancelEdit('business')">Cancel</button>
    </div>
  </div>`;
  
  const sectionDiv = document.createElement('div');
  sectionDiv.innerHTML = html;
  sectionDiv.id = 'business-section';
  container.appendChild(sectionDiv);
  
  // Render Business Location
  const locationFields = [
    { label: 'GPS Address', value: client['location_GPS Address'] || '' },
    { label: 'Landmark', value: client['location_Landmark'] || '' },
    { label: 'Building No.', value: client['location_Building No.'] || '' },
    { label: 'Town', value: client['location_Town'] || '' },
    { label: 'Street Name', value: client['location_Street Name'] || '' },
    { label: 'City', value: client['location_City'] || '' },
    { label: 'District', value: client['location_District'] || '' },
    { label: 'Region', value: client['location_Region'] || '' },
    { label: 'Postal Number', value: client['location_Postal Number'] || '' },
    { label: 'Postal Town', value: client['location_Postal Town'] || '' },
    { label: 'Postal Region', value: client['location_Postal Region'] || '' },
    { label: 'Business Contact', value: client['location_Business Contact'] || '' },
    { label: 'Business Email', value: client['location_Business Email'] || '' }
  ];
  
  html = `<div class="section-container">
    <h3>Business Location</h3>
    <table>
      <tr><th>Field Label</th><th>Submitted Data</th></tr>`;
  
  locationFields.forEach(field => {
    html += `<tr data-field="${field.label}">
      <td>${field.label}</td>
      <td class="value-cell">${field.value}</td>
    </tr>`;
  });
  
  html += `</table>
    <div class="button-group">
      <button class="btn-edit" onclick="editSection('location')">Edit Section</button>
      <button class="btn-save" style="display:none;" onclick="saveSection('location')">Save Section</button>
      <button class="btn-cancel" style="display:none;" onclick="cancelEdit('location')">Cancel</button>
    </div>
  </div>`;
  
  const locationSectionDiv = document.createElement('div');
  locationSectionDiv.innerHTML = html;
  locationSectionDiv.id = 'location-section';
  container.appendChild(locationSectionDiv);
  
  // Render Owner Information
  const ownerFields = [
    { label: 'First Name', value: client['owner_First Name'] || '' },
    { label: 'Middle Name', value: client['owner_Middle Name'] || '' },
    { label: 'Surname', value: client['owner_Surname'] || '' },
    { label: 'Former Name', value: client['owner_Former Name'] || '' },
    { label: 'Date of Birth', value: client['owner_Date of Birth'] || '' },
    { label: 'Place of Birth', value: client['owner_Place of Birth'] || '' },
    { label: 'Nationality', value: client['owner_Nationality'] || '' },
    { label: 'Occupation', value: client['owner_Occupation'] || '' },
    { label: 'Contact 1', value: client['owner_Contact 1'] || '' },
    { label: 'Contact 2', value: client['owner_Contact 2'] || '' },
    { label: 'Email', value: client['owner_Email'] || '' },
    { label: "Mother's Name", value: client["owner_Mother's Name"] || '' },
    { label: 'TIN', value: client['owner_TIN'] || '' },
    { label: 'Ghana Card', value: client['owner_Ghana Card'] || '' },
    { label: 'GPS', value: client['owner_GPS'] || '' },
    { label: 'Landmark', value: client['owner_Landmark'] || '' },
    { label: 'House No.', value: client['owner_House No.'] || '' },
    { label: 'Street', value: client['owner_Street'] || '' },
    { label: 'City', value: client['owner_City'] || '' },
    { label: 'Town', value: client['owner_Town'] || '' },
    { label: 'District', value: client['owner_District'] || '' },
    { label: 'Region', value: client['owner_Region'] || '' },
    { label: 'Country', value: client['owner_Country'] || '' }
  ];
  
  html = `<div class="section-container">
    <h3>Owner Information</h3>
    <table>
      <tr><th>Field Label</th><th>Submitted Data</th></tr>`;
  
  ownerFields.forEach(field => {
    html += `<tr data-field="${field.label}">
      <td>${field.label}</td>
      <td class="value-cell">${field.value}</td>
    </tr>`;
  });
  
  html += `</table>
    <div class="button-group">
      <button class="btn-edit" onclick="editSection('owner')">Edit Section</button>
      <button class="btn-save" style="display:none;" onclick="saveSection('owner')">Save Section</button>
      <button class="btn-cancel" style="display:none;" onclick="cancelEdit('owner')">Cancel</button>
    </div>
  </div>`;
  
  const ownerSectionDiv = document.createElement('div');
  ownerSectionDiv.innerHTML = html;
  ownerSectionDiv.id = 'owner-section';
  container.appendChild(ownerSectionDiv);
}

function deleteClient(clientId) {
  if (confirm('Are you sure you want to delete this client data?')) {
    // Delete from the form-specific collection
    db.collection('owners').doc(ownerUniqueId).collection(`${FORM_TYPE}_clients`).doc(clientId).delete()
      .then(() => {
        showNotification('Client data deleted successfully!');
        loadClientData(); // Reload the client list
      })
      .catch((error) => {
        console.error("Error deleting client data:", error);
        showNotification('Error deleting client data. Please try again.', 'error');
      });
  }
}

function showClientList() {
  document.getElementById('clientDetailView').style.display = 'none';
  document.getElementById('clientListView').style.display = 'block';
  document.getElementById('mainTitle').textContent = 'Sole Proprietorship Client Data Management Dashboard';
  
  loadClientData(); // Reload the client list
}

function editSection(sectionId) {
  const section = document.getElementById(sectionId + '-section');
  if (!section) return;
  
  const table = section.querySelector('table');
  const editBtn = section.querySelector('.btn-edit');
  const saveBtn = section.querySelector('.btn-save');
  const cancelBtn = section.querySelector('.btn-cancel');
  
  table.classList.add('edit-mode');
  editBtn.style.display = 'none';
  saveBtn.style.display = 'inline-block';
  cancelBtn.style.display = 'inline-block';
  
  const rows = table.querySelectorAll('tr:not(:first-child)');
  rows.forEach(row => {
    const valueCell = row.querySelector('.value-cell');
    const currentValue = valueCell.textContent;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    input.className = 'edit-input';
    
    valueCell.innerHTML = '';
    valueCell.appendChild(input);
  });
}

// Firestore does not allow field names with spaces or periods. This helper sanitizes them.
function sanitizeFirestoreKeys(obj) {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Replace spaces and periods in key names with underscores
    const safeKey = key.replace(/[ .]/g, '_');
    sanitized[safeKey] = value;
  }
  return sanitized;
}

function saveSection(sectionId) {
  const section = document.getElementById(sectionId + '-section');
  if (!section) return;
  
  const table = section.querySelector('table');
  const editBtn = section.querySelector('.btn-edit');
  const saveBtn = section.querySelector('.btn-save');
  const cancelBtn = section.querySelector('.btn-cancel');
  
  const rows = table.querySelectorAll('tr:not(:first-child)');
  const updatedData = [];
  
  rows.forEach(row => {
    const input = row.querySelector('.edit-input');
    const label = row.querySelector('td:first-child').textContent;
    const value = input ? input.value : row.querySelector('.value-cell').textContent;
    
    updatedData.push({ label, value });
    
    if (input) {
      row.querySelector('.value-cell').textContent = value;
    }
  });

  // Call the update function and handle the promise
  updateClientSectionData(sectionId, updatedData)
    .then(() => {
      // This block only runs if the update was successful
      table.classList.remove('edit-mode');
      editBtn.style.display = 'inline-block';
      saveBtn.style.display = 'none';
      cancelBtn.style.display = 'none';
      
      showNotification('Section updated successfully!');
    })
    .catch((error) => {
      // This block runs if the update failed
      console.error("Error updating section:", error);
      showNotification('Error updating section. Please try again.', 'error');
      // Optional: You could leave the table in edit mode so the user can retry
    });
}

function cancelEdit(sectionId) {
  const section = document.getElementById(sectionId + '-section');
  if (!section) return;
  
  const table = section.querySelector('table');
  const editBtn = section.querySelector('.btn-edit');
  const saveBtn = section.querySelector('.btn-save');
  const cancelBtn = section.querySelector('.btn-cancel');
  
  table.classList.remove('edit-mode');
  editBtn.style.display = 'inline-block';
  saveBtn.style.display = 'none';
  cancelBtn.style.display = 'none';
}

// NEW FUNCTION: Copy all data from all sections at once
// UPDATED FUNCTION: Copy all data from all sections at once with proper Excel formatting
function copyAllData() {
  const allRows = [];
  
  // Get all sections
  const sections = document.querySelectorAll('.section-container');
  
  sections.forEach(section => {
    // Get all rows in this section (excluding header row)
    const rows = section.querySelectorAll('tr:not(:first-child)');
    
    // Process each row to get its values
    rows.forEach(row => {
      const rowValues = [];
      // Get all value cells in this row
      const valueCells = row.querySelectorAll('.value-cell');
      
      // Extract values from each cell in this row
      valueCells.forEach(cell => {
        rowValues.push(cell.textContent);
      });
      
      // Join row values with tabs and add to all rows
      allRows.push(rowValues.join('\t'));
    });
  });
  
  // Join all rows with newlines to create the Excel-compatible format
  const excelData = allRows.join('\n');
  
  // Copy to clipboard
  navigator.clipboard.writeText(excelData).then(() => {
    // Show notification about the format
    showCopyAllNotification();
  }).catch(err => {
    console.error('Failed to copy data:', err);
    showNotification('Failed to copy data. Please try again.', 'error');
  });
}

function showCopyAllNotification() {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('copyAllNotification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'copyAllNotification';
    notification.className = 'copy-all-notification';
    document.body.appendChild(notification);
  }
  
  notification.innerHTML = `
    <h4>All Data Copied!</h4>
    <p>All submitted data has been copied as tab-separated values for spreadsheet compatibility.</p>
    <p>You can paste this directly into Excel or Google Sheets.</p>
  `;
  
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 4000);
}

function updateClientSectionData(sectionId, updatedData) {
  // Get the current client document from the form-specific collection
  return db.collection('owners').doc(ownerUniqueId).collection(`${FORM_TYPE}_clients`).doc(currentClientId).get()
    .then((doc) => {
      if (doc.exists) {
        const client = doc.data();
        
        if (sectionId === 'business') {
          // Update business fields
          updatedData.forEach(field => {
            // Map field labels to the flattened structure
            if (field.label === 'Business Name') {
              client['business_Business Name'] = field.value;
            } else if (field.label === 'Business Activities') {
              client['business_Business Activities'] = field.value;
            } else if (field.label === 'Start Date') {
              client['business_Start Date'] = field.value;
            } else if (field.label === 'Estimated Annual Revenue') {
              client['business_Estimated Annual Revenue'] = field.value;
            } else if (field.label === 'Number of Employees') {
              client['business_Number of Employees'] = field.value;
            }
          });
        } else if (sectionId === 'location') {
          // Update location fields
          updatedData.forEach(field => {
            // Map field labels to the flattened structure
            if (field.label === 'GPS Address') {
              client['location_GPS Address'] = field.value;
            } else if (field.label === 'Landmark') {
              client['location_Landmark'] = field.value;
            } else if (field.label === 'Building No.') {
              client['location_Building No.'] = field.value;
            } else if (field.label === 'Town') {
              client['location_Town'] = field.value;
            } else if (field.label === 'Street Name') {
              client['location_Street Name'] = field.value;
            } else if (field.label === 'City') {
              client['location_City'] = field.value;
            } else if (field.label === 'District') {
              client['location_District'] = field.value;
            } else if (field.label === 'Region') {
              client['location_Region'] = field.value;
            } else if (field.label === 'Postal Number') {
              client['location_Postal Number'] = field.value;
            } else if (field.label === 'Postal Town') {
              client['location_Postal Town'] = field.value;
            } else if (field.label === 'Postal Region') {
              client['location_Postal Region'] = field.value;
            } else if (field.label === 'Business Contact') {
              client['location_Business Contact'] = field.value;
            } else if (field.label === 'Business Email') {
              client['location_Business Email'] = field.value;
            }
          });
        } else if (sectionId === 'owner') {
          // Update owner fields
          updatedData.forEach(field => {
            // Map field labels to the flattened structure
            if (field.label === 'First Name') {
              client['owner_First Name'] = field.value;
            } else if (field.label === 'Middle Name') {
              client['owner_Middle Name'] = field.value;
            } else if (field.label === 'Surname') {
              client['owner_Surname'] = field.value;
            } else if (field.label === 'Former Name') {
              client['owner_Former Name'] = field.value;
            } else if (field.label === 'Date of Birth') {
              client['owner_Date of Birth'] = field.value;
            } else if (field.label === 'Place of Birth') {
              client['owner_Place of Birth'] = field.value;
            } else if (field.label === 'Nationality') {
              client['owner_Nationality'] = field.value;
            } else if (field.label === 'Occupation') {
              client['owner_Occupation'] = field.value;
            } else if (field.label === 'Contact 1') {
              client['owner_Contact 1'] = field.value;
            } else if (field.label === 'Contact 2') {
              client['owner_Contact 2'] = field.value;
            } else if (field.label === 'Email') {
              client['owner_Email'] = field.value;
            } else if (field.label === "Mother's Name") {
              client["owner_Mother's Name"] = field.value;
            } else if (field.label === 'TIN') {
              client['owner_TIN'] = field.value;
            } else if (field.label === 'Ghana Card') {
              client['owner_Ghana Card'] = field.value;
            } else if (field.label === 'GPS') {
              client['owner_GPS'] = field.value;
            } else if (field.label === 'Landmark') {
              client['owner_Landmark'] = field.value;
            } else if (field.label === 'House No.') {
              client['owner_House No.'] = field.value;
            } else if (field.label === 'Street') {
              client['owner_Street'] = field.value;
            } else if (field.label === 'City') {
              client['owner_City'] = field.value;
            } else if (field.label === 'Town') {
              client['owner_Town'] = field.value;
            } else if (field.label === 'District') {
              client['owner_District'] = field.value;
            } else if (field.label === 'Region') {
              client['owner_Region'] = field.value;
            } else if (field.label === 'Country') {
              client['owner_Country'] = field.value;
            }
          });
        }
        
        // Sanitize keys and return the update promise
        const sanitizedClient = sanitizeFirestoreKeys(client);
        // Update the document in the form-specific collection
        return db.collection('owners').doc(ownerUniqueId).collection(`${FORM_TYPE}_clients`).doc(currentClientId).update(sanitizedClient);
      } else {
        // If doc doesn't exist, reject the promise
        return Promise.reject('Client document not found');
      }
    });
}

function showNotification(message, type) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}