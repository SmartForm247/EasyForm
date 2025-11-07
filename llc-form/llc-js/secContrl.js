// secretaryManager.js
(function() {
  const SecretaryManager = {
    currentSecretaryId: null,
    
    init() {
      // Wait for the DOM to be ready
      document.addEventListener('DOMContentLoaded', () => {
        this.setupEventListeners();
        this.checkForExistingSecretary();
      });
    },
    
    setupEventListeners() {
      // Listen for changes to secretary checkboxes
      document.addEventListener('change', (e) => {
        if (e.target.classList.contains('roleCheck') && e.target.dataset.role === 'secretary') {
          this.handleSecretaryChange(e.target);
        }
      });
    },
    
    handleSecretaryChange(checkbox) {
      const directorFieldset = checkbox.closest('fieldset');
      const directorId = directorFieldset.id;
      const directorName = this.getDirectorName(directorFieldset);
      
      if (checkbox.checked) {
        // If this director is being set as secretary
        if (this.currentSecretaryId && this.currentSecretaryId !== directorId) {
          // Another director is already secretary
          checkbox.checked = false;
          this.showWarning(checkbox, directorName);
          return;
        }
        
        // Set this director as the current secretary
        this.currentSecretaryId = directorId;
        this.disableOtherSecretaryCheckboxes(directorId);
      } else {
        // If this director is being unchecked as secretary
        if (this.currentSecretaryId === directorId) {
          this.currentSecretaryId = null;
          this.enableAllSecretaryCheckboxes();
        }
      }
    },
    
    getDirectorName(directorFieldset) {
      // Try to get the director's name from the form fields
      const firstNameInput = directorFieldset.querySelector('[id*="FirstName"]');
      const lastNameInput = directorFieldset.querySelector('[id*="LastName"]');
      
      let directorName = "Director";
      
      if (firstNameInput && lastNameInput) {
        directorName = `${firstNameInput.value} ${lastNameInput.value}`.trim();
      } else if (firstNameInput) {
        directorName = firstNameInput.value.trim();
      } else if (lastNameInput) {
        directorName = lastNameInput.value.trim();
      }
      
      // If no name is available, try to get the director number from the ID
      if (directorName === "Director") {
        const match = directorFieldset.id.match(/idirector(\d+)/);
        if (match) {
          directorName = `Director ${match[1]}`;
        }
      }
      
      return directorName;
    },
    
    disableOtherSecretaryCheckboxes(currentDirectorId) {
      const allSecretaryCheckboxes = document.querySelectorAll('.roleCheck[data-role="secretary"]');
      
      allSecretaryCheckboxes.forEach(checkbox => {
        const directorFieldset = checkbox.closest('fieldset');
        if (directorFieldset.id !== currentDirectorId) {
          checkbox.disabled = true;
        }
      });
    },
    
    enableAllSecretaryCheckboxes() {
      const allSecretaryCheckboxes = document.querySelectorAll('.roleCheck[data-role="secretary"]');
      
      allSecretaryCheckboxes.forEach(checkbox => {
        checkbox.disabled = false;
      });
    },
    
    showWarning(checkbox, attemptedDirectorName) {
      const currentSecretaryName = this.getDirectorName(document.getElementById(this.currentSecretaryId));
      
      // Find the role options container where the checkbox is located
      const roleOptions = checkbox.closest('.role-options');
      
      // Remove any existing warning for this director
      const existingWarning = roleOptions.querySelector('.secretary-attempt-warning');
      if (existingWarning) {
        existingWarning.remove();
      }
      
      // Create the warning message
      const warningElement = document.createElement('div');
      warningElement.className = 'secretary-attempt-warning';
      warningElement.style.cssText = `
        background-color: #e72222ff;
        border: 1px solid #ffeeba;
        border-radius: 4px;
        color: white;
        padding: 8px 12px;
        margin-top: 8px;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        animation: slideDown 0.3s ease-out;
      `;
      
      // Add warning icon
      const icon = document.createElement('span');
      icon.innerHTML = '⚠️';
      icon.style.fontSize = '16px';
      
      // Add warning text
      const text = document.createElement('span');
      text.textContent = `${currentSecretaryName} is already Secretary. Uncheck them first.`;
      
      // Add close button
      const closeButton = document.createElement('span');
      closeButton.innerHTML = '✕';
      closeButton.style.cssText = `
        margin-left: auto;
        cursor: pointer;
        font-weight: bold;
        opacity: 0.7;
      `;
      closeButton.onmouseover = () => closeButton.style.opacity = '1';
      closeButton.onmouseout = () => closeButton.style.opacity = '0.7';
      closeButton.onclick = () => warningElement.remove();
      
      warningElement.appendChild(icon);
      warningElement.appendChild(text);
      warningElement.appendChild(closeButton);
      
      // Insert the warning after the role options container
      roleOptions.parentNode.insertBefore(warningElement, roleOptions.nextSibling);
      
      // Add animation keyframes if not already present
      if (!document.querySelector('#secretary-warning-animation')) {
        const style = document.createElement('style');
        style.id = 'secretary-warning-animation';
        style.textContent = `
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        if (warningElement.parentNode) {
          warningElement.style.animation = 'slideDown 0.3s ease-out reverse';
          setTimeout(() => warningElement.remove(), 300);
        }
      }, 5000);
    },
    
    checkForExistingSecretary() {
      // Check if any director is already marked as secretary
      const allSecretaryCheckboxes = document.querySelectorAll('.roleCheck[data-role="secretary"]:checked');
      
      if (allSecretaryCheckboxes.length > 0) {
        const firstChecked = allSecretaryCheckboxes[0];
        const directorFieldset = firstChecked.closest('fieldset');
        this.currentSecretaryId = directorFieldset.id;
        this.disableOtherSecretaryCheckboxes(this.currentSecretaryId);
      }
    }
  };
  
  // Initialize the SecretaryManager
  SecretaryManager.init();
  
  // Expose globally if needed
  window.SecretaryManager = SecretaryManager;
})();