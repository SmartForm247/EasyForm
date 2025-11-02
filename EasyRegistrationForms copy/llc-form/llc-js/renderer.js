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
  
  // FIXED: Query the owners collection with the owner's unique ID and then the clients subcollection
  db.collection('owners').doc(ownerUniqueId).collection('clients')
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
      
      console.log('Loaded clients:', clients);
      
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
      <h3>No Client Data Found</h3>
      <p>No clients have submitted data through your link yet.</p>
      <p>Share your unique link with clients to start collecting data.</p>
    </div>
  `;
}

function renderClientList(clients) {
  const container = document.getElementById('clientListContainer');
  
  container.innerHTML = clients.map(client => {
    // FIXED: Extract company name from the flattened data structure
    const companyName = client['company_Company Name'] || 'Unknown Company';
    const submittedDate = new Date(client.submittedAt).toLocaleString();
    
    return `
      <div class="client-item">
        <h4>${companyName}</h4>
        <p><strong>Submitted:</strong> ${submittedDate}</p>
        <p><strong>Directors:</strong> ${client.directorsCount || 0}</p>
        <p><strong>Subscribers:</strong> ${client.subscribersCount || 0}</p>
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
  // FIXED: Get the specific client document from the correct path
  db.collection('owners').doc(ownerUniqueId).collection('clients').doc(clientId).get()
    .then((doc) => {
      if (doc.exists) {
        const client = doc.data();
        currentClientId = clientId;
        
        document.getElementById('clientListView').style.display = 'none';
        document.getElementById('clientDetailView').style.display = 'block';
        document.getElementById('mainTitle').textContent = 'Client Data Details';
        
        // FIXED: Extract company name from the flattened data structure
        const companyName = client['company_Company Name'] || 'Unknown Company';
        document.getElementById('clientDetailTitle').textContent = `${companyName} - Submitted ${new Date(client.submittedAt).toLocaleString()}`;
        
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
  
  // FIXED: Render Business Information from the flattened data structure
  const businessFields = [
    { label: 'Company Name', value: client['company_Company Name'] || '' },
    { label: 'Presented By', value: client['company_Presented By'] || '' },
    { label: 'Presenter TIN', value: client['company_Presenter TIN'] || '' },
    { label: 'Activities', value: client['company_Activities'] || '' },
    { label: 'Stated Capital', value: client['company_Stated Capital'] || '' },
    { label: 'Estimated Revenue', value: client['company_Estimated Revenue'] || '' },
    { label: 'Number of Employees', value: client['company_Number of Employees'] || '' },
    { label: 'GPS Address', value: client['office_GPS Address'] || '' },
    { label: 'Landmark', value: client['office_Landmark'] || '' },
    { label: 'Building No.', value: client['office_Building No.'] || '' },
    { label: 'Town', value: client['office_Town'] || '' },
    { label: 'Street Name', value: client['office_Street Name'] || '' },
    { label: 'City', value: client['office_City'] || '' },
    { label: 'District', value: client['office_District'] || '' },
    { label: 'Region', value: client['office_Region'] || '' },
    { label: 'Postal Number', value: client['office_Postal Number'] || '' },
    { label: 'Postal Town', value: client['office_Postal Town'] || '' },
    { label: 'Postal Region', value: client['office_Postal Region'] || '' },
    { label: 'Contact 1', value: client['office_Contact 1'] || '' },
    { label: 'Contact 2', value: client['office_Contact 2'] || '' },
    { label: 'Email', value: client['office_Email'] || '' }
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
      <button class="btn-copy" onclick="copySection('business')">Copy Section</button>
    </div>
  </div>`;
  
  const sectionDiv = document.createElement('div');
  sectionDiv.innerHTML = html;
  sectionDiv.id = 'business-section';
  container.appendChild(sectionDiv);
  
  // Check if any director is selected as secretary
  let hasDirectorAsSecretary = false;
  for (let i = 0; i < (client.directorsCount || 0); i++) {
    if (client[`director${i}_isSecretary`]) {
      hasDirectorAsSecretary = true;
      break;
    }
  }
  
  // Render Directors
  for (let i = 0; i < (client.directorsCount || 0); i++) {
    // Create director role display
    let roleHtml = '';
    let badges = [];
    
    if (client[`director${i}_isSubscriber`]) {
      badges.push('<span class="role-badge subscriber">Subscriber</span>');
    }
    if (client[`director${i}_isSecretary`]) {
      badges.push('<span class="role-badge secretary">Secretary</span>');
    }
    
    roleHtml = `
      <div class="director-role-display">
        <h3>
          Directors - Entry ${i + 1}
          ${badges.length > 0 ? `<div class="role-badges">${badges.join('')}</div>` : ''}
        </h3>
        ${client[`director${i}_isSubscriber`] && client[`director${i}_sharePercent`] ? 
          `<div class="share-percent-display"><strong>Share Percentage:</strong> ${client[`director${i}_sharePercent`]}%</div>` : ''}
      </div>`;
    
    const directorFields = [
      { label: 'First Name', value: client[`director${i}_First Name`] || '' },
      { label: 'Middle Name', value: client[`director${i}_Middle Name`] || '' },
      { label: 'Surname', value: client[`director${i}_Surname`] || '' },
      { label: 'Former Name', value: client[`director${i}_Former Name`] || '' },
      { label: 'Date of Birth', value: client[`director${i}_Date of Birth`] || '' },
      { label: 'Place of Birth', value: client[`director${i}_Place of Birth`] || '' },
      { label: 'Nationality', value: client[`director${i}_Nationality`] || '' },
      { label: 'Occupation', value: client[`director${i}_Occupation`] || '' },
      { label: 'Contact 1', value: client[`director${i}_Contact 1`] || '' },
      { label: 'Contact 2', value: client[`director${i}_Contact 2`] || '' },
      { label: 'Email', value: client[`director${i}_Email`] || '' },
      { label: 'TIN', value: client[`director${i}_TIN`] || '' },
      { label: 'Ghana Card', value: client[`director${i}_Ghana Card`] || '' },
      { label: 'GPS', value: client[`director${i}_GPS`] || '' },
      { label: 'House No.', value: client[`director${i}_House No.`] || '' },
      { label: 'Landmark', value: client[`director${i}_Landmark`] || '' },
      { label: 'Street', value: client[`director${i}_Street`] || '' },
      { label: 'City', value: client[`director${i}_City`] || '' },
      { label: 'Town', value: client[`director${i}_Town`] || '' },
      { label: 'District', value: client[`director${i}_District`] || '' },
      { label: 'Region', value: client[`director${i}_Region`] || '' },
      { label: 'Country', value: client[`director${i}_Country`] || '' }
    ];
    
    html = `<div class="section-container">
      ${roleHtml}
      <table>
        <tr><th>Field Label</th><th>Submitted Data</th></tr>`;
    
    directorFields.forEach(field => {
      html += `<tr data-field="${field.label}">
        <td>${field.label}</td>
        <td class="value-cell">${field.value}</td>
      </tr>`;
    });
    
    html += `</table>
      <div class="button-group">
        <button class="btn-edit" onclick="editSection('director-${i}')">Edit Section</button>
        <button class="btn-save" style="display:none;" onclick="saveSection('director-${i}')">Save Section</button>
        <button class="btn-cancel" style="display:none;" onclick="cancelEdit('director-${i}')">Cancel</button>
        <button class="btn-copy" onclick="copySection('director-${i}')">Copy Section</button>
      </div>
    </div>`;
    
    const directorSectionDiv = document.createElement('div');
    directorSectionDiv.innerHTML = html;
    directorSectionDiv.id = `director-${i}-section`;
    container.appendChild(directorSectionDiv);
  }
  
  // Render Secretary only if no director is selected as secretary
  if (!hasDirectorAsSecretary) {
    const secretaryFields = [
      { label: 'Qualification', value: client['secretary_Qualification'] || '' },
      { label: 'First Name', value: client['secretary_First Name'] || '' },
      { label: 'Middle Name', value: client['secretary_Middle Name'] || '' },
      { label: 'Surname', value: client['secretary_Surname'] || '' },
      { label: 'Former Name', value: client['secretary_Former Name'] || '' },
      { label: 'Date of Birth', value: client['secretary_Date of Birth'] || '' },
      { label: 'Place of Birth', value: client['secretary_Place of Birth'] || '' },
      { label: 'Nationality', value: client['secretary_Nationality'] || '' },
      { label: 'Occupation', value: client['secretary_Occupation'] || '' },
      { label: 'Contact 1', value: client['secretary_Contact 1'] || '' },
      { label: 'Contact 2', value: client['secretary_Contact 2'] || '' },
      { label: 'Email', value: client['secretary_Email'] || '' },
      { label: 'TIN', value: client['secretary_TIN'] || '' },
      { label: 'Ghana Card', value: client['secretary_Ghana Card'] || '' },
      { label: 'GPS', value: client['secretary_GPS'] || '' },
      { label: 'House No.', value: client['secretary_House No.'] || '' },
      { label: 'Landmark', value: client['secretary_Landmark'] || '' },
      { label: 'Street', value: client['secretary_Street'] || '' },
      { label: 'City', value: client['secretary_City'] || '' },
      { label: 'Town', value: client['secretary_Town'] || '' },
      { label: 'District', value: client['secretary_District'] || '' },
      { label: 'Region', value: client['secretary_Region'] || '' },
      { label: 'Country', value: client['secretary_Country'] || '' }
    ];
    
    html = `<div class="section-container">
      <h3>Secretary Details</h3>
      <table>
        <tr><th>Field Label</th><th>Submitted Data</th></tr>`;
    
    secretaryFields.forEach(field => {
      html += `<tr data-field="${field.label}">
        <td>${field.label}</td>
        <td class="value-cell">${field.value}</td>
      </tr>`;
    });
    
    html += `</table>
      <div class="button-group">
        <button class="btn-edit" onclick="editSection('secretary')">Edit Section</button>
        <button class="btn-save" style="display:none;" onclick="saveSection('secretary')">Save Section</button>
        <button class="btn-cancel" style="display:none;" onclick="cancelEdit('secretary')">Cancel</button>
        <button class="btn-copy" onclick="copySection('secretary')">Copy Section</button>
      </div>
    </div>`;
    
    const secretarySectionDiv = document.createElement('div');
    secretarySectionDiv.innerHTML = html;
    secretarySectionDiv.id = 'secretary-section';
    container.appendChild(secretarySectionDiv);
  }
  
  // Render Subscribers
  for (let i = 0; i < (client.subscribersCount || 0); i++) {
    const subscriberFields = [
      { label: 'First Name', value: client[`subscriber${i}_First Name`] || '' },
      { label: 'Middle Name', value: client[`subscriber${i}_Middle Name`] || '' },
      { label: 'Surname', value: client[`subscriber${i}_Surname`] || '' },
      { label: 'Former Name', value: client[`subscriber${i}_Former Name`] || '' },
      { label: 'Date of Birth', value: client[`subscriber${i}_Date of Birth`] || '' },
      { label: 'Place of Birth', value: client[`subscriber${i}_Place of Birth`] || '' },
      { label: 'Nationality', value: client[`subscriber${i}_Nationality`] || '' },
      { label: 'Occupation', value: client[`subscriber${i}_Occupation`] || '' },
      { label: 'Contact 1', value: client[`subscriber${i}_Contact 1`] || '' },
      { label: 'Contact 2', value: client[`subscriber${i}_Contact 2`] || '' },
      { label: 'Email', value: client[`subscriber${i}_Email`] || '' },
      { label: 'TIN', value: client[`subscriber${i}_TIN`] || '' },
      { label: 'Ghana Card', value: client[`subscriber${i}_Ghana Card`] || '' },
      { label: 'GPS', value: client[`subscriber${i}_GPS`] || '' },
      { label: 'House No.', value: client[`subscriber${i}_House No.`] || '' },
      { label: 'Landmark', value: client[`subscriber${i}_Landmark`] || '' },
      { label: 'Street', value: client[`subscriber${i}_Street`] || '' },
      { label: 'City', value: client[`subscriber${i}_City`] || '' },
      { label: 'Town', value: client[`subscriber${i}_Town`] || '' },
      { label: 'District', value: client[`subscriber${i}_District`] || '' },
      { label: 'Region', value: client[`subscriber${i}_Region`] || '' }
    ];
    
    html = `<div class="section-container">
      <h3>Subscribers - Entry ${i + 1}</h3>
      <table>
        <tr><th>Field Label</th><th>Submitted Data</th></tr>`;
    
    subscriberFields.forEach(field => {
      html += `<tr data-field="${field.label}">
        <td>${field.label}</td>
        <td class="value-cell">${field.value}</td>
      </tr>`;
    });
    
    html += `</table>
      <div class="button-group">
        <button class="btn-edit" onclick="editSection('subscriber-${i}')">Edit Section</button>
        <button class="btn-save" style="display:none;" onclick="saveSection('subscriber-${i}')">Save Section</button>
        <button class="btn-cancel" style="display:none;" onclick="cancelEdit('subscriber-${i}')">Cancel</button>
        <button class="btn-copy" onclick="copySection('subscriber-${i}')">Copy Section</button>
      </div>
    </div>`;
    
    const subscriberSectionDiv = document.createElement('div');
    subscriberSectionDiv.innerHTML = html;
    subscriberSectionDiv.id = `subscriber-${i}-section`;
    container.appendChild(subscriberSectionDiv);
  }
}

function deleteClient(clientId) {
  if (confirm('Are you sure you want to delete this client data?')) {
    // FIXED: Delete from the correct path
    db.collection('owners').doc(ownerUniqueId).collection('clients').doc(clientId).delete()
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
  document.getElementById('mainTitle').textContent = 'Client Data Management Dashboard';
  
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

// ✅ HELPER FUNCTION: Moved to global scope to be accessible by updateClientSectionData
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

// ✅ CORRECTED FUNCTION: Now properly handles the asynchronous update operation
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

function copySection(sectionId) {
  const section = document.getElementById(sectionId + '-section');
  if (!section) return;
  
  const rows = section.querySelectorAll('tr:not(:first-child)');
  const values = [];
  
  // Get all field labels to maintain order
  const fieldLabels = Array.from(rows).map(row => 
    row.querySelector('td:first-child').textContent
  );
  
  // Get all values (including empty ones)
  const fieldValues = Array.from(rows).map(row => 
    row.querySelector('.value-cell').textContent
  );
  
  // Create tab-separated values for spreadsheet compatibility
  const tabSeparatedValues = fieldValues.join('\t');
  
  // Copy to clipboard
  navigator.clipboard.writeText(tabSeparatedValues).then(() => {
    // Show notification about the format
    showCopyFormatNotification();
  });
}

function showCopyFormatNotification() {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('copyFormatNotification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'copyFormatNotification';
    notification.className = 'copy-format-notification';
    document.body.appendChild(notification);
  }
  
  notification.innerHTML = `
    <h4>Data Copied!</h4>
    <p>Data has been copied as tab-separated values for spreadsheet compatibility.</p>
    <p>Empty fields are included to maintain cell positions when pasted.</p>
  `;
  
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 4000);
}

// ✅ CORRECTED FUNCTION: Now correctly returns the promise chain
function updateClientSectionData(sectionId, updatedData) {
  // Get the current client document
  return db.collection('owners').doc(ownerUniqueId).collection('clients').doc(currentClientId).get()
    .then((doc) => {
      if (doc.exists) {
        const client = doc.data();
        
        if (sectionId === 'business') {
          // Update business fields
          updatedData.forEach(field => {
            // Map field labels to the flattened structure
            if (field.label === 'Company Name') {
              client['company_Company Name'] = field.value;
            } else if (field.label === 'Presented By') {
              client['company_Presented By'] = field.value;
            } else if (field.label === 'Presenter TIN') {
              client['company_Presenter TIN'] = field.value;
            } else if (field.label === 'Activities') {
              client['company_Activities'] = field.value;
            } else if (field.label === 'Stated Capital') {
              client['company_Stated Capital'] = field.value;
            } else if (field.label === 'Estimated Revenue') {
              client['company_Estimated Revenue'] = field.value;
            } else if (field.label === 'Number of Employees') {
              client['company_Number of Employees'] = field.value;
            } else if (field.label === 'GPS Address') {
              client['office_GPS Address'] = field.value;
            } else if (field.label === 'Landmark') {
              client['office_Landmark'] = field.value;
            } else if (field.label === 'Building No.') {
              client['office_Building No.'] = field.value;
            } else if (field.label === 'Town') {
              client['office_Town'] = field.value;
            } else if (field.label === 'Street Name') {
              client['office_Street Name'] = field.value;
            } else if (field.label === 'City') {
              client['office_City'] = field.value;
            } else if (field.label === 'District') {
              client['office_District'] = field.value;
            } else if (field.label === 'Region') {
              client['office_Region'] = field.value;
            } else if (field.label === 'Postal Number') {
              client['office_Postal Number'] = field.value;
            } else if (field.label === 'Postal Town') {
              client['office_Postal Town'] = field.value;
            } else if (field.label === 'Postal Region') {
              client['office_Postal Region'] = field.value;
            } else if (field.label === 'Contact 1') {
              client['office_Contact 1'] = field.value;
            } else if (field.label === 'Contact 2') {
              client['office_Contact 2'] = field.value;
            } else if (field.label === 'Email') {
              client['office_Email'] = field.value;
            }
          });
        } else if (sectionId.startsWith('director-')) {
          const index = parseInt(sectionId.split('-')[1]);
          // Update director fields
          updatedData.forEach(field => {
            // Map field labels to the flattened structure
            if (field.label === 'First Name') {
              client[`director${index}_First Name`] = field.value;
            } else if (field.label === 'Middle Name') {
              client[`director${index}_Middle Name`] = field.value;
            } else if (field.label === 'Surname') {
              client[`director${index}_Surname`] = field.value;
            } else if (field.label === 'Former Name') {
              client[`director${index}_Former Name`] = field.value;
            } else if (field.label === 'Date of Birth') {
              client[`director${index}_Date of Birth`] = field.value;
            } else if (field.label === 'Place of Birth') {
              client[`director${index}_Place of Birth`] = field.value;
            } else if (field.label === 'Nationality') {
              client[`director${index}_Nationality`] = field.value;
            } else if (field.label === 'Occupation') {
              client[`director${index}_Occupation`] = field.value;
            } else if (field.label === 'Contact 1') {
              client[`director${index}_Contact 1`] = field.value;
            } else if (field.label === 'Contact 2') {
              client[`director${index}_Contact 2`] = field.value;
            } else if (field.label === 'Email') {
              client[`director${index}_Email`] = field.value;
            } else if (field.label === 'TIN') {
              client[`director${index}_TIN`] = field.value;
            } else if (field.label === 'Ghana Card') {
              client[`director${index}_Ghana Card`] = field.value;
            } else if (field.label === 'GPS') {
              client[`director${index}_GPS`] = field.value;
            } else if (field.label === 'House No.') {
              client[`director${index}_House No.`] = field.value;
            } else if (field.label === 'Landmark') {
              client[`director${index}_Landmark`] = field.value;
            } else if (field.label === 'Street') {
              client[`director${index}_Street`] = field.value;
            } else if (field.label === 'City') {
              client[`director${index}_City`] = field.value;
            } else if (field.label === 'Town') {
              client[`director${index}_Town`] = field.value;
            } else if (field.label === 'District') {
              client[`director${index}_District`] = field.value;
            } else if (field.label === 'Region') {
              client[`director${index}_Region`] = field.value;
            } else if (field.label === 'Country') {
              client[`director${index}_Country`] = field.value;
            }
          });
        } else if (sectionId === 'secretary') {
          // Update secretary fields
          updatedData.forEach(field => {
            // Map field labels to the flattened structure
            if (field.label === 'Qualification') {
              client['secretary_Qualification'] = field.value;
            } else if (field.label === 'First Name') {
              client['secretary_First Name'] = field.value;
            } else if (field.label === 'Middle Name') {
              client['secretary_Middle Name'] = field.value;
            } else if (field.label === 'Surname') {
              client['secretary_Surname'] = field.value;
            } else if (field.label === 'Former Name') {
              client['secretary_Former Name'] = field.value;
            } else if (field.label === 'Date of Birth') {
              client['secretary_Date of Birth'] = field.value;
            } else if (field.label === 'Place of Birth') {
              client['secretary_Place of Birth'] = field.value;
            } else if (field.label === 'Nationality') {
              client['secretary_Nationality'] = field.value;
            } else if (field.label === 'Occupation') {
              client['secretary_Occupation'] = field.value;
            } else if (field.label === 'Contact 1') {
              client['secretary_Contact 1'] = field.value;
            } else if (field.label === 'Contact 2') {
              client['secretary_Contact 2'] = field.value;
            } else if (field.label === 'Email') {
              client['secretary_Email'] = field.value;
            } else if (field.label === 'TIN') {
              client['secretary_TIN'] = field.value;
            } else if (field.label === 'Ghana Card') {
              client['secretary_Ghana Card'] = field.value;
            } else if (field.label === 'GPS') {
              client['secretary_GPS'] = field.value;
            } else if (field.label === 'House No.') {
              client['secretary_House No.'] = field.value;
            } else if (field.label === 'Landmark') {
              client['secretary_Landmark'] = field.value;
            } else if (field.label === 'Street') {
              client['secretary_Street'] = field.value;
            } else if (field.label === 'City') {
              client['secretary_City'] = field.value;
            } else if (field.label === 'Town') {
              client['secretary_Town'] = field.value;
            } else if (field.label === 'District') {
              client['secretary_District'] = field.value;
            } else if (field.label === 'Region') {
              client['secretary_Region'] = field.value;
            } else if (field.label === 'Country') {
              client['secretary_Country'] = field.value;
            }
          });
        } else if (sectionId.startsWith('subscriber-')) {
          const index = parseInt(sectionId.split('-')[1]);
          // Update subscriber fields
          updatedData.forEach(field => {
            // Map field labels to the flattened structure
            if (field.label === 'First Name') {
              client[`subscriber${index}_First Name`] = field.value;
            } else if (field.label === 'Middle Name') {
              client[`subscriber${index}_Middle Name`] = field.value;
            } else if (field.label === 'Surname') {
              client[`subscriber${index}_Surname`] = field.value;
            } else if (field.label === 'Former Name') {
              client[`subscriber${index}_Former Name`] = field.value;
            } else if (field.label === 'Date of Birth') {
              client[`subscriber${index}_Date of Birth`] = field.value;
            } else if (field.label === 'Place of Birth') {
              client[`subscriber${index}_Place of Birth`] = field.value;
            } else if (field.label === 'Nationality') {
              client[`subscriber${index}_Nationality`] = field.value;
            } else if (field.label === 'Occupation') {
              client[`subscriber${index}_Occupation`] = field.value;
            } else if (field.label === 'Contact 1') {
              client[`subscriber${index}_Contact 1`] = field.value;
            } else if (field.label === 'Contact 2') {
              client[`subscriber${index}_Contact 2`] = field.value;
            } else if (field.label === 'Email') {
              client[`subscriber${index}_Email`] = field.value;
            } else if (field.label === 'TIN') {
              client[`subscriber${index}_TIN`] = field.value;
            } else if (field.label === 'Ghana Card') {
              client[`subscriber${index}_Ghana Card`] = field.value;
            } else if (field.label === 'GPS') {
              client[`subscriber${index}_GPS`] = field.value;
            } else if (field.label === 'House No.') {
              client[`subscriber${index}_House No.`] = field.value;
            } else if (field.label === 'Landmark') {
              client[`subscriber${index}_Landmark`] = field.value;
            } else if (field.label === 'Street') {
              client[`subscriber${index}_Street`] = field.value;
            } else if (field.label === 'City') {
              client[`subscriber${index}_City`] = field.value;
            } else if (field.label === 'Town') {
              client[`subscriber${index}_Town`] = field.value;
            } else if (field.label === 'District') {
              client[`subscriber${index}_District`] = field.value;
            } else if (field.label === 'Region') {
              client[`subscriber${index}_Region`] = field.value;
            }
          });
        }
        
        // Sanitize keys and return the update promise
        const sanitizedClient = sanitizeFirestoreKeys(client);
        return db.collection('owners').doc(ownerUniqueId).collection('clients').doc(currentClientId).update(sanitizedClient);
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