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
