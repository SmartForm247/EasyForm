(function() {
  // Structure module for Sole Proprietorship App
  const Structure = {
    // Exposed example function
    duplicateFieldset() {
      console.log("Duplicating fieldset...");
      // You can call Structure.createOwnerBlock() manually if needed
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
    // OWNER/PROPRIETOR SECTION (Simplified for Sole Proprietorship)
    // ============================================================
    const ownerContainer = document.getElementById('iownerContainer');
    const addOwnerBtn = document.getElementById('iaddOwnerBtn');

    function createOwnerBlock(index) {
      const fieldset = document.createElement('fieldset');
      fieldset.id = `iowner${index}`;
      fieldset.innerHTML = `
        <legend>Proprietor ${index}</legend>
        <div class="form-group"><label>Title:</label><select id="iowner${index}_title">${titleOptions}</select></div>
        <div class="form-group"><label>First Name:</label><input id="iowner${index}_fname" type="text"></div>
        <div class="form-group"><label>Middle Name:</label><input id="iowner${index}_mname" type="text"></div>
        <div class="form-group"><label>Surname:</label><input id="iowner${index}_sname" type="text"></div>
        <div class="form-group"><label>Former Name:</label><input id="iowner${index}_former" type="text"></div>
        <div class="form-group"><label>Gender:</label><select id="iowner${index}_gender">${genderOptions}</select></div>
        <div class="form-group"><label>Date of Birth:</label><input id="iowner${index}_dob" type="text"></div>
        <div class="form-group"><label>Place of Birth:</label><input id="iowner${index}_pob" type="text"></div>
        <div class="form-group"><label>Nationality:</label><input id="iowner${index}_nation" type="text"></div>
       
        <div class="form-group"><label>Occupation:</label><input id="iowner${index}_occupation" type="text"></div>
        <div class="form-group"><label>Contact 1:</label><input id="iowner${index}_contact1" type="text"></div>
        <div class="form-group"><label>Contact 2:</label><input id="iowner${index}_contact2" type="text"></div>
        <div class="form-group"><label>Email:</label><input id="iowner${index}_email" type="email"></div>
        <div class="form-group"><label>Mother's Name:</label><input id="iowner${index}_mother" type="text"></div>
        <div class="form-group"><label>TIN:</label><input id="iowner${index}_tin" type="text"></div>
        <div class="form-group"><label>Ghana Card:</label><input id="iowner${index}_ghanaCard" type="text"></div>

        <h4>Residential Address</h4>
        <div class="form-group"><label>GPS:</label><input id="iowner${index}_resGps" type="text"></div>
        <div class="form-group"><label>House No.:</label><input id="iowner${index}_resHse" type="text"></div>
        <div class="form-group"><label>Landmark:</label><input id="iowner${index}_resLandmark" type="text"></div>
        <div class="form-group"><label>Street:</label><input id="iowner${index}_resStreet" type="text"></div>
        <div class="form-group"><label>City:</label><input id="iowner${index}_resCity" type="text"></div>
        <div class="form-group"><label>Town:</label><input id="iowner${index}_resTown" type="text"></div>
        <div class="form-group"><label>District:</label><input id="iowner${index}_resDistrict" type="text"></div>
        <div class="form-group"><label>Region:</label><input id="iowner${index}_resRegion" type="text"></div>
        <div class="form-group"><label>Country:</label><input id="iowner${index}_resCountry" type="text"></div>
      `;

      const removeBtn = makeRemoveButton('Remove Proprietor');
      removeBtn.addEventListener('click', () => {
        fieldset.remove();
        renumberFieldsets('iownerContainer', 'iowner', 'Proprietor');
      });
      fieldset.appendChild(removeBtn);
      
      // Add class 'cell' to all input fields within this owner block
      fieldset.querySelectorAll('input').forEach(input => input.classList.add('cell'));
      
      return fieldset;
    }

    // Initialize owner section if it exists
    if (ownerContainer && addOwnerBtn) {
      addOwnerBtn.addEventListener('click', () => {
        const next = ownerContainer.querySelectorAll('fieldset').length + 1;
        ownerContainer.appendChild(createOwnerBlock(next));
        renumberFieldsets('iownerContainer', 'iowner', 'Proprietor');
      });

      if (!ownerContainer.querySelector('fieldset')) {
        ownerContainer.appendChild(createOwnerBlock(1));
      }
    }

    // ============================================================
    // BUSINESS LOCATION SECTION
    // ============================================================
    const businessLocationFields = document.getElementById('ibusinessLocationFields');
    if (businessLocationFields) {
      businessLocationFields.innerHTML = `
        <div class="form-group"><label>GPS Address:</label><input id="ibusinessGps" type="text"></div>
        <div class="form-group"><label>Landmark:</label><input id="ibusinessLandmark" type="text"></div>
        <div class="form-group"><label>Building No.:</label><input id="ibusinessBuildingNo" type="text"></div>
        <div class="form-group"><label>Town:</label><input id="ibusinessTown" type="text"></div>
        <div class="form-group"><label>Street Name:</label><input id="ibusinessStreetName" type="text"></div>
        <div class="form-group"><label>City:</label><input id="ibusinessCity" type="text"></div>
        <div class="form-group"><label>District:</label><input id="ibusinessDistrict" type="text"></div>
        <div class="form-group"><label>Region:</label><input id="ibusinessRegion" type="text"></div>
        <div class="form-group"><label>Postal Number:</label><input id="ibusinessPostalNumber" type="text"></div>
        <div class="form-group"><label>Postal Town:</label><input id="ibusinessPostalTown" type="text"></div>
        <div class="form-group"><label>Postal Region:</label><input id="ibusinessPostalRegion" type="text"></div>
        <div class="form-group"><label>Business Contact:</label><input id="ibusinessContact" type="text"></div>
        <div class="form-group"><label>Business Email:</label><input id="ibusinessEmail" type="email"></div>
      `;
      
      // Add class 'cell' to all input fields
      businessLocationFields.querySelectorAll('input').forEach(input => input.classList.add('cell'));
    }

    // ============================================================
    // BUSINESS INFORMATION SECTION
    // ============================================================
    const businessInfoFields = document.getElementById('ibusinessInfoFields');
    if (businessInfoFields) {
      businessInfoFields.innerHTML = `
        <div class="form-group"><label>Business Name:</label><input id="ibusinessName" type="text"></div>
        <div class="form-group"><label>Business Activities:</label><input id="ibusinessActivities" type="text"></div>
        <div class="form-group"><label>Start Date:</label><input id="ibusinessStartDate" type="text"></div>
        <div class="form-group"><label>Estimated Annual Revenue:</label><input id="ibusinessRevenue" type="number"></div>
        <div class="form-group"><label>Number of Employees:</label><input id="ibusinessEmployees" type="number"></div>
      `;
      
      // Add class 'cell' to all input fields
      businessInfoFields.querySelectorAll('input').forEach(input => input.classList.add('cell'));
    }

    // ============================================================
    // Initialize all sections
    // ============================================================
    // Renumber all sections to ensure proper numbering
    if (ownerContainer) {
      renumberFieldsets('iownerContainer', 'iowner', 'Proprietor');
    }

    // Attach 'cell' class to all existing input fields on load
    document.querySelectorAll('input').forEach(input => {
      input.classList.add('cell');
    });
  });

  document.addEventListener('paste', function (event) {
    const activeElement = document.activeElement;

    // Only work when the user is inside an input
    if (activeElement && activeElement.tagName === 'INPUT') {
      event.preventDefault();

      // Get pasted text
      const pasteData = (event.clipboardData || window.clipboardData).getData('text');

      // Split by tab, comma, or newline (handles Excel/Sheets/CSV copy)
      // Keep empty values to maintain field positions
      const values = pasteData
        .split(/\t|\r?\n/)
        .map(v => v.trim());

      // Get ALL visible, enabled inputs in document order
      const inputs = Array.from(document.querySelectorAll('input:not([disabled]):not([hidden])'));

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
  if (typeof App !== 'undefined' && App.register) {
    App.register("Structure", Structure);
  }
})();