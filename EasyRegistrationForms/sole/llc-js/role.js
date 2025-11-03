// roleselector.js
(function() {
  // Define the Roles module
  const Roles = {
    // A lock to prevent infinite sync loops
    isSyncing: false,

    // A single, consistent key normalization function
    normalizeKey: (key) => key.replace(/\s+/g, "").replace(/_+/g, "").toLowerCase(),

    // *** NEW: A utility function for comprehensive input handling ***
    addInputListeners(element, callback) {
      const handler = () => {
        // Use setTimeout to ensure the paste/drop operation completes before syncing
        setTimeout(callback, 10);
      };
      
      element.addEventListener("input", handler);
      element.addEventListener("change", handler);
      element.addEventListener("paste", handler);
      element.addEventListener("drop", handler); // Also handle drag-drop
      
      return handler; // Return handler for potential removal later
    },

    init() {
      const container = document.getElementById("idirectorsContainer");
      if (!container) return;

      // Wait briefly to ensure director fields have loaded
      setTimeout(() => {
        Roles.addRoleSelectorsToAllDirectors();

        // ✅ UPDATED MutationObserver (handles additions + removals)
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              // --- Handle removed directors ---
              mutation.removedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'FIELDSET') {
                  const tag = "linkedFromDirector-" + node.id;

                  // Remove linked subscriber
                  const subLinked = document.querySelector(`#isubscribersContainer fieldset[data-link="${tag}"]`);
                  if (subLinked) subLinked.remove();

                  // Remove linked owner
                  const ownerLinked = document.querySelector(`#iownersContainer fieldset[data-link="${tag}"]`);
                  if (ownerLinked) ownerLinked.remove();

                  // Clear secretary form if this director was linked as secretary
                  const secCheckbox = node.querySelector('.roleCheck[data-role="secretary"]');
                  if (secCheckbox && secCheckbox.checked) {
                    const prefix = "isec";
                    document.querySelectorAll(`[id^="${prefix}"]`).forEach(el => {
                      if (el.tagName.toLowerCase() === "select") el.selectedIndex = 0;
                      else el.value = "";
                    });
                  }
                  // *** FIX: Trigger overlay update after removal ***
                  setTimeout(() => window.LLCOverlay?.update(), 50);
                }
              });

              // --- Handle newly added directors ---
              Roles.addRoleSelectorsToAllDirectors();
            }
          });
        });

        observer.observe(container, { childList: true, subtree: false });
      }, 300);
    },

    addRoleSelectorsToAllDirectors() {
      console.log("Adding role selectors...");

      const directorFieldsets = document.querySelectorAll("#idirectorsContainer fieldset");

      directorFieldsets.forEach(fs => {
        if (fs.querySelector(".role-checkboxes")) {
          Roles.ensureDirectorInputListeners(fs);
          Roles.restoreExistingLinks(fs);
          return;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "role-checkboxes";
        wrapper.innerHTML = `
          <p class="role-prefix">This Director is also:</p>
          <div class="role-options">
            <label class="role-label">
              <input type="checkbox" class="roleCheck" data-role="only" checked> Director Only
            </label>
            <label class="role-label">
              <input type="checkbox" class="roleCheck" data-role="secretary"> Secretary
            </label>
            <label class="role-label">
              <input type="checkbox" class="roleCheck" data-role="subscriber"> Subscriber
            </label>
            <label class="role-label">
              <input type="checkbox" class="roleCheck" data-role="owner"> Beneficial Owner
            </label>
          </div>
         <div class="qualificationBox hidden">
          <label>Qualification:</label>
          <select class="secQualification">
            <option value="">Select Qualification</option>
            <option value="Professional qualification">Professional qualification</option>
            <option value="Tertiary level qualification">Tertiary level qualification</option>
            <option value="Company Secretary Trainee">Company Secretary Trainee</option>
            <option value="Barrister or Solicitor in the Republic">Barrister or Solicitor in the Republic</option>
            <option value="Institute of Chartered Accountants">Institute of Chartered Accountants</option>
            <option value="Under supervision of a qualified Company Secretary">Under supervision of a qualified Company Secretary</option>
            <option value="Institute of Chartered Secretaries and Administrators">Institute of Chartered Secretaries and Administrators</option>
          </select>
        </div>

          <div class="sharePercentBox hidden">
            <label>Share %:</label>
            <input type="number" class="shareInput" min="0" max="100" placeholder="Enter share percentage">
          </div>
          <div class="votingRightsBox hidden">
            <label>Voting Rights (%):</label>
            <input type="number" class="votingRightsInput" min="0" max="100" placeholder="Enter voting rights percentage">
          </div>
          <hr class="role-divider">
        `;

        const firstGroup = fs.querySelector(".form-group") || fs.firstChild;
        fs.insertBefore(wrapper, firstGroup);

        wrapper.querySelectorAll(".roleCheck").forEach(cb => {
          cb.addEventListener("change", e => Roles.handleRoleChange(fs, e.target));
        });

        // Using the new utility function for listeners
        wrapper.querySelectorAll(".shareInput, .secQualification, .votingRightsInput").forEach(el => {
          Roles.addInputListeners(el, () => Roles.syncLinkedRoles(fs));
        });

        Roles.ensureDirectorInputListeners(fs);
        Roles.restoreExistingLinks(fs);
      });
    },

    ensureDirectorInputListeners(directorFs) {
      if (directorFs.__roles_listeners_attached) return;
      directorFs.__roles_listeners_attached = true;

      Roles.addInputListeners(directorFs, () => Roles.syncLinkedRoles(directorFs));
    },

    ensureRoleInputListeners(roleFs, sourceDirectorFs) {
      if (roleFs.__roles_to_director_listeners_attached) return;
      roleFs.__roles_to_director_listeners_attached = true;

      Roles.addInputListeners(roleFs, () => Roles.syncFromRoleToDirector(roleFs, sourceDirectorFs));
    },

    handleRoleChange(directorFs, checkbox) {
      const role = checkbox.dataset.role;
      const checked = checkbox.checked;
      const wrapper = checkbox.closest(".role-checkboxes");
      const onlyBox = wrapper.querySelector('[data-role="only"]');

      if (role === "only" && checked) {
        wrapper.querySelectorAll(".roleCheck").forEach(cb => {
          if (cb.dataset.role !== "only") cb.checked = false;
        });
        wrapper.querySelector(".sharePercentBox")?.classList.add("hidden");
        wrapper.querySelector(".qualificationBox")?.classList.add("hidden");
        wrapper.querySelector(".votingRightsBox")?.classList.add("hidden");
        Roles.removeLinkedRoleEntry(directorFs, "subscriber");
        Roles.removeLinkedRoleEntry(directorFs, "owner");
        Roles.removeLinkedRoleEntry(directorFs, "secretary");
        // *** FIX: Trigger overlay update after change ***
        setTimeout(() => window.LLCOverlay?.update(), 50);
        return;
      }

      if (role !== "only" && checked) {
        onlyBox.checked = false;
      }

      if (role === "subscriber") wrapper.querySelector(".sharePercentBox")?.classList.toggle("hidden", !checked);
      if (role === "secretary") wrapper.querySelector(".qualificationBox")?.classList.toggle("hidden", !checked);
      if (role === "owner") wrapper.querySelector(".votingRightsBox")?.classList.toggle("hidden", !checked);

      if (checked) {
        Roles.copyDirectorDataToRole(directorFs, role, wrapper);
      } else {
        Roles.removeLinkedRoleEntry(directorFs, role);
      }
      // *** FIX: Trigger overlay update after change ***
      setTimeout(() => window.LLCOverlay?.update(), 50);
    },

    getFormData(fs, prefix) {
      const data = {};
      fs.querySelectorAll("input, select, textarea").forEach(el => {
        let rawKey = el.id || el.name || "";
        if (prefix && rawKey.startsWith(prefix)) rawKey = rawKey.replace(prefix, "");
        rawKey = rawKey.trim();
        if (!rawKey && el.name) rawKey = el.name.trim();

        const key = Roles.normalizeKey(rawKey);
        data[key] = el.value;
      });
      return data;
    },

    copyDirectorDataToRole(directorFs, role, wrapper) {
      const dirIndex = directorFs.id.match(/\d+$/)?.[0];
      const dirData = Roles.getFormData(directorFs, `idirector${dirIndex}_`);

      if (role === "subscriber") {
        const shareVal = wrapper.querySelector(".shareInput")?.value || "";
        dirData["sharepercent"] = shareVal;
      }
      if (role === "secretary") {
        const qual = wrapper.querySelector(".secQualification")?.value || "";
        dirData["qualification"] = qual;
      }
      if (role === "owner") {
        const votingRights = wrapper.querySelector(".votingRightsInput")?.value || "";
        dirData["votingrights"] = votingRights;
      }

      switch (role) {
        case "secretary": Roles.fillSecretaryForm(dirData); break;
        case "subscriber": Roles.addOrFillSubscriber(dirData, directorFs); break;
        case "owner": Roles.addOrFillOwner(dirData, directorFs); break;
      }
    },

    fillSecretaryForm(data) {
      const prefix = "isec";
      document.querySelectorAll(`[id^="${prefix}"]`).forEach(el => {
        const rawKey = el.id.replace(prefix, "").replace(/^_+/, "");
        const keyNorm = Roles.normalizeKey(rawKey);
        for (const dKey in data) {
          if (!dKey) continue;
          const dKeyNorm = Roles.normalizeKey(dKey);
          if (keyNorm === dKeyNorm) {
            el.value = data[dKey];
            break;
          }
        }
      });
    },

    addOrFillSubscriber(data, directorFs) {
      const container = document.getElementById("isubscribersContainer");
      const addBtn = document.getElementById("iaddSubscriberBtn");
      const tag = "linkedFromDirector-" + directorFs.id;
      if (!container) return;

      let targetFs = container.querySelector(`fieldset[data-link="${tag}"]`);
      if (!targetFs) {
        targetFs = Array.from(container.querySelectorAll("fieldset")).find(fs => !fs.dataset.link);
        if (!targetFs) {
          if (addBtn) addBtn.click();
          targetFs = container.querySelector("fieldset:last-of-type");
        }
        if (targetFs) targetFs.dataset.link = tag;
      }

      if (!targetFs) return;
      const index = targetFs.id.match(/\d+$/)?.[0] || "";
      Roles.fillTargetForm(targetFs, `isubscriber${index}_`, data);
      
      // Establish two-way communication
      Roles.ensureRoleInputListeners(targetFs, directorFs);
      // *** FIX: Trigger overlay update after filling ***
      setTimeout(() => window.LLCOverlay?.update(), 50);
    },

    addOrFillOwner(data, directorFs) {
      const container = document.getElementById("iownersContainer");
      const addBtn = document.getElementById("iaddOwnerBtn");
      const tag = "linkedFromDirector-" + directorFs.id;
      if (!container) return;

      let targetFs = container.querySelector(`fieldset[data-link="${tag}"]`);
      if (!targetFs) {
        targetFs = Array.from(container.querySelectorAll("fieldset")).find(fs => !fs.dataset.link);
        if (!targetFs) {
          if (addBtn) addBtn.click();
          targetFs = container.querySelector("fieldset:last-of-type");
        }
        if (targetFs) targetFs.dataset.link = tag;
      }

      if (!targetFs) return;
      const index = targetFs.id.match(/\d+$/)?.[0] || "";
      Roles.fillTargetForm(targetFs, `iowner${index}_`, data);

      // Establish two-way communication
      Roles.ensureRoleInputListeners(targetFs, directorFs);
      // *** FIX: Trigger overlay update after filling ***
      setTimeout(() => window.LLCOverlay?.update(), 50);
    },

    removeLinkedRoleEntry(directorFs, role) {
      const tag = "linkedFromDirector-" + directorFs.id;
      let container;
      if (role === "subscriber") container = document.querySelector("#isubscribersContainer");
      else if (role === "owner") container = document.querySelector("#iownersContainer");
      else if (role === "secretary") container = document.querySelector("#isecContainer");
      else return;

      if (role === "subscriber" || role === "owner") {
        const linked = container?.querySelector(`fieldset[data-link="${tag}"]`);
        if (linked) linked.remove();
        // *** FIX: Trigger overlay update after removal ***
        setTimeout(() => window.LLCOverlay?.update(), 50);
        return;
      }

      if (role === "secretary") {
        const prefix = "isec";
        document.querySelectorAll(`[id^="${prefix}"]`).forEach(el => {
          if (el.tagName.toLowerCase() === "select") el.selectedIndex = 0;
          else el.value = "";
        });
        // *** FIX: Trigger overlay update after clearing ***
        setTimeout(() => window.LLCOverlay?.update(), 50);
      }
    },

    fillTargetForm(targetFs, prefix, data) {
      targetFs.querySelectorAll("input, select, textarea").forEach(el => {
        const rawId = el.id || el.name || "";
        let key = rawId;
        if (prefix && rawId.startsWith(prefix)) key = rawId.replace(prefix, "");
        const keyNorm = Roles.normalizeKey(key);

        for (const dKey in data) {
          if (!dKey) continue;
          const dKeyNorm = Roles.normalizeKey(dKey);
          if (keyNorm === dKeyNorm) {
            if (el.tagName.toLowerCase() === "select") {
              const option = Array.from(el.options).find(o => o.value === data[dKey] || o.text === data[dKey]);
              if (option) el.value = option.value; else el.value = data[dKey];
            } else if (el.type === "checkbox") {
              el.checked = !!(data[dKey] && (data[dKey] === "true" || data[dKey] === "1" || data[dKey] === true));
            } else {
              el.value = data[dKey];
            }
            break;
          }
        }
      });
    },

    // *** UPDATED: Now uses a try...finally block with the sync lock ***
    syncLinkedRoles(directorFs) {
      if (Roles.isSyncing) return; // Exit if a sync is already in progress
      Roles.isSyncing = true;

      try {
        const wrapper = directorFs.querySelector(".role-checkboxes");
        if (!wrapper) return;

        const dirIndex = directorFs.id.match(/\d+$/)?.[0];
        const dirData = Roles.getFormData(directorFs, `idirector${dirIndex}_`);

        const subChecked = wrapper.querySelector('.roleCheck[data-role="subscriber"]')?.checked;
        if (subChecked) {
          const share = wrapper.querySelector(".shareInput")?.value;
          if (share !== undefined) dirData["sharepercent"] = share;
          Roles.addOrFillSubscriber(dirData, directorFs);
        }

        const ownerChecked = wrapper.querySelector('.roleCheck[data-role="owner"]')?.checked;
        if (ownerChecked) {
          const votingRights = wrapper.querySelector(".votingRightsInput")?.value;
          if (votingRights !== undefined) dirData["votingrights"] = votingRights;
          Roles.addOrFillOwner(dirData, directorFs);
        }

        const secChecked = wrapper.querySelector('.roleCheck[data-role="secretary"]')?.checked;
        if (secChecked) {
          const qual = wrapper.querySelector(".secQualification")?.value;
          if (qual !== undefined) dirData["qualification"] = qual;
          Roles.fillSecretaryForm(dirData);
        }
      } finally {
        Roles.isSyncing = false; // Release the lock
        // *** FIX: Trigger overlay update after a full sync cycle ***
        setTimeout(() => window.LLCOverlay?.update(), 50);
      }
    },
    
    // *** UPDATED: Now uses a try...finally block with the sync lock ***
    syncFromRoleToDirector(roleFs, sourceDirectorFs) {
      if (Roles.isSyncing) return; // Exit if a sync is already in progress
      Roles.isSyncing = true;

      try {
        const roleIndex = roleFs.id.match(/\d+$/)?.[0];
        let rolePrefix;
        if (roleFs.id.startsWith('isubscriber')) rolePrefix = `isubscriber${roleIndex}_`;
        if (roleFs.id.startsWith('iowner')) rolePrefix = `iowner${roleIndex}_`;
        if (!rolePrefix) return;
        
        const roleData = Roles.getFormData(roleFs, rolePrefix);
        const dirIndex = sourceDirectorFs.id.match(/\d+$/)?.[0];
        Roles.fillTargetForm(sourceDirectorFs, `idirector${dirIndex}_`, roleData);
        
        // After updating the director, we need to re-sync to other roles
        // to ensure all linked fields are consistent.
        // The overlay update is already called within syncLinkedRoles, so no need to call it here again.
        Roles.syncLinkedRoles(sourceDirectorFs);
      } finally {
        Roles.isSyncing = false; // Release the lock
      }
    },

    restoreExistingLinks(directorFs) {
      const wrapper = directorFs.querySelector(".role-checkboxes");
      if (!wrapper) return;
      const tag = "linkedFromDirector-" + directorFs.id;

      const subLinked = document.querySelector(`#isubscribersContainer fieldset[data-link="${tag}"]`);
      if (subLinked) {
        const cb = wrapper.querySelector('.roleCheck[data-role="subscriber"]');
        if (cb) {
          cb.checked = true;
          wrapper.querySelector(".sharePercentBox")?.classList.remove("hidden");
          Roles.ensureRoleInputListeners(subLinked, directorFs);
        }
      }

      const ownerLinked = document.querySelector(`#iownersContainer fieldset[data-link="${tag}"]`);
      if (ownerLinked) {
        const cb = wrapper.querySelector('.roleCheck[data-role="owner"]');
        if (cb) {
          cb.checked = true;
          wrapper.querySelector(".votingRightsBox")?.classList.remove("hidden");
          Roles.ensureRoleInputListeners(ownerLinked, directorFs);
        }
      }
    },

    exampleHelper() {
      alert("Helper from roleselector");
    }
  };

  if (window.App && typeof App.register === "function") {
    App.register("Roles", Roles);
  } else {
    window.Roles = Roles;
  }

  document.addEventListener("DOMContentLoaded", Roles.init);
})();