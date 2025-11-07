// Select all the inputs that should behave like Excel cells
    const cells = document.querySelectorAll('.cell');

    // Add paste event listener to each
    cells.forEach((cell, index) => {
      cell.addEventListener('paste', (event) => {
        event.preventDefault();

        // Get plain text from clipboard
        const pasteData = (event.clipboardData || window.clipboardData).getData('text');

        // Split by tab, comma, or newline
        const values = pasteData.split(/\t|,|\n/).map(v => v.trim()).filter(v => v !== '');

        // Fill inputs sequentially starting from where paste occurred
        for (let i = 0; i < values.length; i++) {
          if (cells[index + i]) {
            cells[index + i].value = values[i];
          }
        }
      });
    });






    