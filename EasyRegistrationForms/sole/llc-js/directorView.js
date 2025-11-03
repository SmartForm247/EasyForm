(function() {
  const DirectorVisibilityManager = {
    selectors: {
      directorsContainer: '#idirectorsContainer', // where all director <fieldset>s are
    },

    // Initialize manager
    init() {
      document.addEventListener('DOMContentLoaded', () => {
        this.container = document.querySelector(this.selectors.directorsContainer);
        if (!this.container) return;

        this.updateVisibility();

        // Watch for directors being added or removed dynamically
        const observer = new MutationObserver(() => this.updateVisibility());
        observer.observe(this.container, { childList: true });
      });
    },

    // Main logic for showing/hiding elements based on number of directors
    updateVisibility() {
      const directorsCount = this.container.querySelectorAll('fieldset').length;
      console.log(`Directors count: ${directorsCount}`);

      // Example #1 — Show section if there are MORE than 2 directors
      const section2 = document.getElementById('showWhenMoreThan2');
      if (section2) {
        section2.style.display = directorsCount > 2 ? 'block' : 'none';
      }

      // Example #2 — Show another section if there are MORE than 4 directors
      const section4 = document.getElementById('showWhenMoreThan4');
      if (section4) {
        section4.style.display = directorsCount > 4 ? 'block' : 'none';
      }

      // Example #3 — (Optional) Hide a section if fewer than 2 directors
      const sectionMin2 = document.getElementById('hideWhenLessThan2');
      if (sectionMin2) {
        sectionMin2.style.display = directorsCount < 2 ? 'none' : 'block';
      }
    }
  };

  // Initialize when page loads
  DirectorVisibilityManager.init();

  // Optional: expose globally so you can trigger manually if needed
  window.DirectorVisibilityManager = DirectorVisibilityManager;
})();
