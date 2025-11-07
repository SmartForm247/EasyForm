(function() {
  // Structure module for App
  const Structure = {
    // Exposed example function
    duplicateFieldset() {
      console.log("Duplicating fieldset...");
      // You can call Structure.createDirectorBlock() manually if needed
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
    // DIRECTORS SECTION
    // ============================================================
    const directorsContainer = document.getElementById('idirectorsContainer');
    const addDirectorBtn = document.getElementById('iaddDirectorBtn');

    function createDirectorBlock(index) {
      const fieldset = document.createElement('fieldset');
      fieldset.id = `idirector${index}`;
      fieldset.innerHTML = `
        <legend>Director ${index}</legend>
        <div class="form-group"><label>Title:</label><select id="idirector${index}_title">${titleOptions}</select></div>
        <div class="form-group"><label>First Name:</label><input id="idirector${index}_fname" type="text"></div>
        <div class="form-group"><label>Middle Name:</label><input id="idirector${index}_mname" type="text"></div>
        <div class="form-group"><label>Surname:</label><input id="idirector${index}_sname" type="text"></div>
        <div class="form-group"><label>Former Name:</label><input id="idirector${index}_former" type="text"></div>
        <div class="form-group"><label>Gender:</label><select id="idirector${index}_gender">${genderOptions}</select></div>
        <div class="form-group"><label>Date of Birth:</label><input id="idirector${index}_dob" type="text"></div>
        <div class="form-group"><label>Place of Birth:</label><input id="idirector${index}_pob" type="text"></div>
         <div class="form-group"><label>Nationality:</label><input id="idirector${index}_nation" type="text"></div>
       
        <div class="form-group"><label>Occupation:</label><input id="idirector${index}_occupation" type="text"></div>
        <div class="form-group"><label>Contact 1:</label><input id="idirector${index}_contact1" type="text"></div>
        <div class="form-group"><label>Contact 2:</label><input id="idirector${index}_contact2" type="text"></div>
        <div class="form-group"><label>Email:</label><input id="idirector${index}_email" type="email"></div>
        <div class="form-group"><label>TIN:</label><input id="idirector${index}_tin" type="text"></div>
        <div class="form-group"><label>Ghana Card:</label><input id="idirector${index}_ghanaCard" type="text"></div>

        <h4>Residential Address</h4>
        <div class="form-group"><label>GPS:</label><input id="idirector${index}_resGps" type="text"></div>
        <div class="form-group"><label>House No.:</label><input id="idirector${index}_resHse" type="text"></div>
        <div class="form-group"><label>Landmark:</label><input id="idirector${index}_resLandmark" type="text"></div>
        <div class="form-group"><label>Street:</label><input id="idirector${index}_resStreet" type="text"></div>
        <div class="form-group"><label>City:</label><input id="idirector${index}_resCity" type="text"></div>
        <div class="form-group"><label>Town:</label><input id="idirector${index}_resTown" type="text"></div>
        <div class="form-group"><label>District:</label><input id="idirector${index}_resDistrict" type="text"></div>
        <div class="form-group"><label>Region:</label><input id="idirector${index}_resRegion" type="text"></div>
        <div class="form-group"><label>Country:</label><input id="idirector${index}_resCountry" type="text"></div>
      `;

      const removeBtn = makeRemoveButton('Remove Director');
      removeBtn.addEventListener('click', () => {
        fieldset.remove();
        renumberFieldsets('idirectorsContainer', 'idirector', 'Director');
      });
      fieldset.appendChild(removeBtn);
      return fieldset;
    }

    addDirectorBtn.addEventListener('click', () => {
      const next = directorsContainer.querySelectorAll('fieldset').length + 1;
      directorsContainer.appendChild(createDirectorBlock(next));
      renumberFieldsets('idirectorsContainer', 'idirector', 'Director');
    });

    if (!directorsContainer.querySelector('fieldset')) {
      directorsContainer.appendChild(createDirectorBlock(1));

      if (window.SecretaryManager) {
  SecretaryManager.checkForExistingSecretary();
}

    }

    // ============================================================
    // SECRETARY SECTION
    // ============================================================
    const secretaryFields = document.getElementById('isecretaryFormFields');
    if (secretaryFields) {
      secretaryFields.innerHTML = `
        <div class="form-group"><label>Title:</label><select id="isecTitle">${titleOptions}</select></div>
        <div class="form-group"><label>First Name:</label><input id="isecFname" type="text"></div>
        <div class="form-group"><label>Middle Name:</label><input id="isecMname" type="text"></div>
        <div class="form-group"><label>Surname:</label><input id="isecSname" type="text"></div>
        <div class="form-group"><label>Former Name:</label><input id="isecFormer" type="text"></div>
        <div class="form-group"><label>Gender:</label><select id="isecGender">${genderOptions}</select></div>
        <div class="form-group"><label>Date of Birth:</label><input id="isecDob" type="text"></div>
        <div class="form-group"><label>Place of Birth:</label><input id="isecPob" type="text"></div>
         <div class="form-group"><label>Nationality:</label><input id="isecNation" type="text"></div>
        
        <div class="form-group"><label>Occupation:</label><input id="isecOccupation" type="text"></div>
        <div class="form-group"><label>Contact 1:</label><input id="isecContact1" type="text"></div>
        <div class="form-group"><label>Contact 2:</label><input id="isecContact2" type="text"></div>
        <div class="form-group"><label>Email:</label><input id="isecEmail" type="email"></div>
        <div class="form-group"><label>TIN:</label><input id="isecTin" type="text"></div>
        <div class="form-group"><label>Ghana Card:</label><input id="isecGhanaCard" type="text"></div>
        <h4>Residential Address</h4>
        <div class="form-group"><label>GPS:</label><input id="isecResGps" type="text"></div>
        <div class="form-group"><label>House No.:</label><input id="isecResHse" type="text"></div>
        <div class="form-group"><label>Landmark:</label><input id="isecResLandmark" type="text"></div>
        <div class="form-group"><label>Street:</label><input id="isecResStreet" type="text"></div>
        <div class="form-group"><label>City:</label><input id="isecResCity" type="text"></div>
        <div class="form-group"><label>Town:</label><input id="isecResTown" type="text"></div>
        <div class="form-group"><label>District:</label><input id="isecResDistrict" type="text"></div>
        <div class="form-group"><label>Region:</label><input id="isecResRegion" type="text"></div>
        <div class="form-group"><label>Country:</label><input id="isecResCountry" type="text"></div>
      `;
    }

    // ============================================================
    // SUBSCRIBERS + OWNERS setup
  // ----- SUBSCRIBERS -----
  const subscribersContainer = document.getElementById('isubscribersContainer');
  const addSubscriberBtn = document.getElementById('iaddSubscriberBtn');

  function createSubscriberBlock(index) {
    const fieldset = document.createElement('fieldset');
    fieldset.id = `isubscriber${index}`;
    fieldset.innerHTML = `
      <legend>Subscriber ${index}</legend>
      <div class="form-group"><label>Title:</label><select id="isubscriber${index}_title">${titleOptions}</select></div>
      <div class="form-group"><label>First Name:</label><input id="isubscriber${index}_fname" type="text"></div>
      <div class="form-group"><label>Middle Name:</label><input id="isubscriber${index}_mname" type="text"></div>
      <div class="form-group"><label>Surname:</label><input id="isubscriber${index}_sname" type="text"></div>
      <div class="form-group"><label>Former Name:</label><input id="isubscriber${index}_former" type="text"></div>
      <div class="form-group"><label>Gender:</label><select id="isubscriber${index}_gender">${genderOptions}</select></div>
      <div class="form-group"><label>Date of Birth:</label><input id="isubscriber${index}_dob" type="text"></div>
      <div class="form-group"><label>Place of Birth:</label><input id="isubscriber${index}_pob" type="text"></div>
      <div class="form-group"><label>Nationality:</label><input id="isubscriber${index}_nation" type="text"></div>
      
      <div class="form-group"><label>Occupation:</label><input id="isubscriber${index}_occupation" type="text"></div>
      <div class="form-group"><label>Contact 1:</label><input id="isubscriber${index}_contact1" type="text"></div>
      <div class="form-group"><label>Contact 2:</label><input id="isubscriber${index}_contact2" type="text"></div>
      <div class="form-group"><label>Email:</label><input id="isubscriber${index}_email" type="email"></div>
      <div class="form-group"><label>TIN:</label><input id="isubscriber${index}_tin" type="text"></div>
      <div class="form-group"><label>Ghana Card:</label><input id="isubscriber${index}_ghanaCard" type="text"></div>

      <h4>Residential Address</h4>
      <div class="form-group"><label>GPS:</label><input id="isubscriber${index}_resGps" type="text"></div>
      <div class="form-group"><label>House No.:</label><input id="isubscriber${index}_resHse" type="text"></div>
      <div class="form-group"><label>Landmark:</label><input id="isubscriber${index}_resLandmark" type="text"></div>
      <div class="form-group"><label>Street:</label><input id="isubscriber${index}_resStreet" type="text"></div>
      <div class="form-group"><label>City:</label><input id="isubscriber${index}_resCity" type="text"></div>
      <div class="form-group"><label>Town:</label><input id="isubscriber${index}_resTown" type="text"></div>
      <div class="form-group"><label>District:</label><input id="isubscriber${index}_resDistrict" type="text"></div>
      <div class="form-group"><label>Region:</label><input id="isubscriber${index}_resRegion" type="text"></div>
      <div class="form-group"><label>Share Percent:</label><input id="isubscriber${index}_sharePercent" type="number" min="0" max="100"></div>
    `;

    const removeBtn = makeRemoveButton('Remove Subscriber');
    removeBtn.addEventListener('click', () => {
      fieldset.remove();
      renumberFieldsets('isubscribersContainer', 'isubscriber', 'Subscriber');
    });
    fieldset.appendChild(removeBtn);
    return fieldset;
  }

  addSubscriberBtn.addEventListener('click', () => {
    const next = subscribersContainer.querySelectorAll('fieldset').length + 1;
    subscribersContainer.appendChild(createSubscriberBlock(next));
    renumberFieldsets('isubscribersContainer', 'isubscriber', 'Subscriber');
  });

  if (!subscribersContainer.querySelector('fieldset')) {
    subscribersContainer.appendChild(createSubscriberBlock(1));
  }

  // ----- BENEFICIAL OWNERS -----
  const ownersContainer = document.getElementById('iownersContainer');
  const addOwnerBtn = document.getElementById('iaddOwnerBtn');
// In structure.js, update the createOwnerBlock function
// In structure.js, update the createOwnerBlock function
function createOwnerBlock(index) {
  const fieldset = document.createElement('fieldset');
  fieldset.id = `iowner${index}`;
  fieldset.innerHTML = `
    <legend>Beneficial Owner ${index}</legend>
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
    
    <!-- Simplified voting rights field -->
    <h4>Voting Rights</h4>
    <div class="form-group"><label>Voting Rights (%):</label><input id="iowner${index}_votingRights" type="number" min="0" max="100"></div>
  `;

  const removeBtn = makeRemoveButton('Remove Owner');
removeBtn.addEventListener('click', () => {
  fieldset.remove();
  renumberFieldsets('iownersContainer', 'iowner', 'Beneficial Owner');
});
fieldset.appendChild(removeBtn);

// ✅ Add class 'cell' to all input fields within this owner block
fieldset.querySelectorAll('input').forEach(input => input.classList.add('cell'));

return fieldset;
}

addOwnerBtn.addEventListener('click', () => {
  const next = ownersContainer.querySelectorAll('fieldset').length + 1;
  ownersContainer.appendChild(createOwnerBlock(next));
  renumberFieldsets('iownersContainer', 'iowner', 'Beneficial Owner');
});

if (!ownersContainer.querySelector('fieldset')) {
  ownersContainer.appendChild(createOwnerBlock(1));
}

// ✅ After all sections are initialized
renumberFieldsets('idirectorsContainer', 'idirector', 'Director');
renumberFieldsets('isubscribersContainer', 'isubscriber', 'Subscriber');
renumberFieldsets('iownersContainer', 'iowner', 'Beneficial Owner');

// ✅ Attach 'cell' class to all existing input fields on load
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
App.register("Structure", Structure);
})();


(function() {
  const Structure = {
    duplicateFieldset() {
      console.log("Duplicating fieldset...");
      // your existing duplication logic
    },
    anotherMethod() {
      console.log("Another function");
    }
  };

  App.register("Structure", Structure);
})();
