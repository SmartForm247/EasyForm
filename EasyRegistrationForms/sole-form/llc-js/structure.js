(function() {
  // Structure module for App
  const Structure = {
    // Exposed example function
    duplicateFieldset() {
      console.log("Duplicating fieldset...");
      // You can call Structure.createFieldBlock() manually if needed
    },

    anotherMethod() {
      console.log("Another function");
    }
  };

  // ============================================================
  // Existing logic — wrapped inside DOMContentLoaded
  // ============================================================
  document.addEventListener('DOMContentLoaded', () => {
    const titleOptions = `
      <option value="">-- Select Title --</option>
      <option value="Mr">Mr</option>
      <option value="Mrs">Mrs</option>
      <option value="Miss">Miss</option>
      <option value="Ms">Ms</option>
      <option value="Dr">Dr</option>
    `;

    const genderOptions = `
      <option value="">-- Select Gender --</option>
      <option value="Male">Male</option>
      <option value="Female">Female</option>
    `;

    const nationalityOptions = `
      <option value="">-- Select Nationality --</option>
      <option value="Ghanaian">Ghanaian</option>
      <option value="Nigerian">Nigerian</option>
      <option value="British">British</option>
      <option value="American">American</option>
      <option value="Canadian">Canadian</option>
      <option value="German">German</option>
      <option value="Chinese">Chinese</option>
      <option value="South African">South African</option>
      <option value="Kenyan">Kenyan</option>
      <option value="Ivorian">Ivorian</option>
      <option value="Togolese">Togolese</option>
    `;

    // -----------------------------
    // Helper: Renumber fieldsets
    // -----------------------------
    function renumberFieldsets(containerId, prefixId, baseLabel) {
      const container = document.getElementById(containerId);
      if (!container) return;
      const fieldsets = Array.from(container.querySelectorAll('fieldset'));

      fieldsets.forEach((fs, idx) => {
        const newIndex = idx + 1;
        const oldMatch = fs.id.match(new RegExp(`^${prefixId}(\\d+)$`));
        const oldIndex = oldMatch ? oldMatch[1] : null;

        fs.id = `${prefixId}${newIndex}`;
        const legend = fs.querySelector('legend');
        if (legend) legend.textContent = `${baseLabel} ${newIndex}`;

        fs.querySelectorAll('[id]').forEach(el => {
          el.id = el.id.replace(new RegExp(`${prefixId}\\d+_`, 'g'), `${prefixId}${newIndex}_`);
        });
      });
    }

    function makeRemoveButton(label) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label || 'Remove';
      return btn;
    }

    // ============================================================
    // BUSINESS INFORMATION SECTION
    // ============================================================
    const businessInfoContainer = document.getElementById('businessInfoContainer');
    
    if (businessInfoContainer) {
      businessInfoContainer.innerHTML = `
        <fieldset id="businessInfo">
          <legend>Business Information</legend>
          <div class="form-group"><label>Business Name:</label><input id="businessName" type="text" class="cell"></div>
          <div class="form-group"><label>Business Activities:</label><input id="businessActivities" type="text" class="cell"></div>
          <div class="form-group"><label>Start Date:</label><input id="startDate" type="date" class="cell"></div>
          <div class="form-group"><label>Estimated Annual Revenue:</label><input id="estimatedRevenue" type="number" class="cell"></div>
          <div class="form-group"><label>Number of Employees:</label><input id="numEmployees" type="number" class="cell"></div>
        </fieldset>
      `;
    }

    // ============================================================
    // BUSINESS LOCATION SECTION
    // ============================================================
    const businessLocationContainer = document.getElementById('businessLocationContainer');
    
    if (businessLocationContainer) {
      businessLocationContainer.innerHTML = `
        <fieldset id="businessLocation">
          <legend>Business Location</legend>
          <div class="form-group"><label>GPS Address:</label><input id="gpsAddress" type="text" class="cell"></div>
          <div class="form-group"><label>Landmark:</label><input id="landmark" type="text" class="cell"></div>
          <div class="form-group"><label>Building No.:</label><input id="buildingNo" type="text" class="cell"></div>
          <div class="form-group"><label>Town:</label><input id="town" type="text" class="cell"></div>
          <div class="form-group"><label>Street Name:</label><input id="streetName" type="text" class="cell"></div>
          <div class="form-group"><label>City:</label><input id="city" type="text" class="cell"></div>
          <div class="form-group"><label>District:</label><input id="district" type="text" class="cell"></div>
          <div class="form-group"><label>Region:</label><input id="region" type="text" class="cell"></div>
          <div class="form-group"><label>Postal Number:</label><input id="postalNumber" type="text" class="cell"></div>
          <div class="form-group"><label>Postal Town:</label><input id="postalTown" type="text" class="cell"></div>
          <div class="form-group"><label>Postal Region:</label><input id="postalRegion" type="text" class="cell"></div>
          <div class="form-group"><label>Business Contact:</label><input id="businessContact" type="text" class="cell"></div>
          <div class="form-group"><label>Business Email:</label><input id="businessEmail" type="email" class="cell"></div>
        </fieldset>
      `;
    }

    // ============================================================
    // OWNER INFORMATION SECTION
    // ============================================================
    const ownerInfoContainer = document.getElementById('ownerInfoContainer');
    
    if (ownerInfoContainer) {
      ownerInfoContainer.innerHTML = `
        <fieldset id="ownerInfo">
          <legend>Owner Information</legend>
          <div class="form-group"><label>Title:</label><select id="ownerTitle" class="cell">${titleOptions}</select></div>
          <div class="form-group"><label>First Name:</label><input id="ownerFirstName" type="text" class="cell"></div>
          <div class="form-group"><label>Middle Name:</label><input id="ownerMiddleName" type="text" class="cell"></div>
          <div class="form-group"><label>Surname:</label><input id="ownerSurname" type="text" class="cell"></div>
          <div class="form-group"><label>Former Name:</label><input id="ownerFormerName" type="text" class="cell"></div>
          <div class="form-group"><label>Date of Birth:</label><input id="ownerDOB" type="date" class="cell"></div>
          <div class="form-group"><label>Place of Birth:</label><input id="ownerPOB" type="text" class="cell"></div>
          <div class="form-group"><label>Gender:</label><select id="ownerGender" class="cell">${genderOptions}</select></div>
          <div class="form-group"><label>Nationality:</label><select id="ownerNationality" class="cell">${nationalityOptions}</select></div>
          <div class="form-group"><label>Occupation:</label><input id="ownerOccupation" type="text" class="cell"></div>
          <div class="form-group"><label>Contact 1:</label><input id="ownerContact1" type="text" class="cell"></div>
          <div class="form-group"><label>Contact 2:</label><input id="ownerContact2" type="text" class="cell"></div>
          <div class="form-group"><label>Email:</label><input id="ownerEmail" type="email" class="cell"></div>
          <div class="form-group"><label>Mother's Name:</label><input id="motherName" type="text" class="cell"></div>
          <div class="form-group"><label>TIN:</label><input id="ownerTIN" type="text" class="cell"></div>
          <div class="form-group"><label>Ghana Card:</label><input id="ownerGhanaCard" type="text" class="cell"></div>
          
          <h4>Owner Residential Address</h4>
          <div class="form-group"><label>GPS:</label><input id="ownerGPS" type="text" class="cell"></div>
          <div class="form-group"><label>Landmark:</label><input id="ownerLandmark" type="text" class="cell"></div>
          <div class="form-group"><label>House No.:</label><input id="ownerHouseNo" type="text" class="cell"></div>
          <div class="form-group"><label>Street:</label><input id="ownerStreet" type="text" class="cell"></div>
          <div class="form-group"><label>City:</label><input id="ownerCity" type="text" class="cell"></div>
          <div class="form-group"><label>Town:</label><input id="ownerTown" type="text" class="cell"></div>
          <div class="form-group"><label>District:</label><input id="ownerDistrict" type="text" class="cell"></div>
          <div class="form-group"><label>Region:</label><input id="ownerRegion" type="text" class="cell"></div>
          <div class="form-group"><label>Country:</label><input id="ownerCountry" type="text" class="cell"></div>
        </fieldset>
      `;
    }

    // Attach 'cell' class to all existing input fields on load
    document.querySelectorAll('input, select').forEach(input => {
      input.classList.add('cell');
    });
  });

  document.addEventListener('paste', function (event) {
    const activeElement = document.activeElement;

    // Only work when the user is inside an input
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT')) {
      event.preventDefault();

      // Get pasted text
      const pasteData = (event.clipboardData || window.clipboardData).getData('text');

      // Split by tab, comma, or newline (handles Excel/Sheets/CSV copy)
      // Keep empty values to maintain field positions
      const values = pasteData
        .split(/\t|\r?\n/)
        .map(v => v.trim());

      // Get ALL visible, enabled inputs and selects in document order
      const inputs = Array.from(document.querySelectorAll('input:not([disabled]):not([hidden]), select:not([disabled]):not([hidden])'));

      // Find the index of the currently focused input
      const startIndex = inputs.indexOf(activeElement);

      // Fill each subsequent field with the pasted values
      for (let i = 0; i < values.length; i++) {
        const nextInput = inputs[startIndex + i];
        if (nextInput) {
          // Convert if input is numeric
          if (nextInput.type === 'number' && !isNaN(values[i])) {
            nextInput.value = parseFloat(values[i]);
          } else {
            nextInput.value = values[i];
          }
        }
      }
    }
  });

  // Register module globally for cross-script access
  if (typeof App !== 'undefined') {
    App.register("Structure", Structure);
  } else {
    // Fallback if App is not defined
    window.Structure = Structure;
  }
})();