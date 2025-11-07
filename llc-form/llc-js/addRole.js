(function() {
  // Define the Roles module
  const Roles = {
    init() {
      const container = document.getElementById("idirectorsContainer");
      if (!container) return;

      // Wait briefly to ensure director fields have loaded
      setTimeout(() => {
        Roles.addRoleSelectorsToAllDirectors();

        // Watch for future changes (e.g., directors added/removed)
        const observer = new MutationObserver(() => Roles.addRoleSelectorsToAllDirectors());
        observer.observe(container, { childList: true, subtree: false });
      }, 300);
    },

    addRoleSelectorsToAllDirectors() {
      console.log("Adding role selectors...");

      const directorFieldsets = document.querySelectorAll("#idirectorsContainer fieldset");

      directorFieldsets.forEach(fs => {
        // Avoid adding again if already present
        if (fs.querySelector(".role-checkboxes")) {
          // ensure input listeners are present (idempotent)
          Roles.ensureDirectorInputListeners(fs);
          // restore checkbox states if fieldsets were previously linked
          Roles.restoreExistingLinks(fs);
          return;
        }

        // Create the role selector UI block
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

          <!-- Section shown only if "Secretary" is checked -->
          <div class="qualificationBox hidden">
            <label>Qualification:</label>
            <select class="secQualification">
              <option value="Professional qualification">Professional qualification</option>
              <option value="">Select Qualification</option>
              <option>Tertiary level qualification</option>
              <option>Company Secretary Trainee</option>
              <option>Barrister or Solicitor in the Republic</option>
              <option>Institute of Chartered Accountants</option>
              <option>Under supervision of a qualified Company Secretary</option>
              <option>Institute of Chartered Secretaries and Administrators</option>
              
            </select>
          </div>

          <!-- Section shown only if "Subscriber" is checked -->
          <div class="sharePercentBox hidden">
            <label>Share %:</label>
            <input type="number" class="shareInput" min="0" max="100" placeholder="Enter share percentage">
          </div>

          <!-- Simplified section for voting rights when "Owner" is checked -->
          <div class="votingRightsBox hidden">
            <label>Voting Rights (%):</label>
            <input type="number" class="votingRightsInput" min="0" max="100" placeholder="Enter voting rights percentage">
          </div>

          <hr class="role-divider">
        `;

        // Insert role selector UI at the top of the fieldset
        const firstGroup = fs.querySelector(".form-group") || fs.firstChild;
        fs.insertBefore(wrapper, firstGroup);

        // Attach change event to each checkbox
        wrapper.querySelectorAll(".roleCheck").forEach(cb => {
          cb.addEventListener("change", e => Roles.handleRoleChange(fs, e.target));
        });

        // When share % or qualification changes, propagate to linked entries immediately
        wrapper.querySelectorAll(".shareInput, .secQualification").forEach(el => {
          el.addEventListener("input", () => Roles.syncLinkedRoles(fs));
          el.addEventListener("change", () => Roles.syncLinkedRoles(fs));
        });

        // Add event listener for voting rights input
        wrapper.querySelector(".votingRightsInput").addEventListener("input", () => Roles.syncLinkedRoles(fs));
        wrapper.querySelector(".votingRightsInput").addEventListener("change", () => Roles.syncLinkedRoles(fs));

        // Add input listeners on the director's own fields so edits immediately sync to linked role entries
        Roles.ensureDirectorInputListeners(fs);

        // If the director already has linked role entries (maybe from server-rendered state), restore checkboxes accordingly
        Roles.restoreExistingLinks(fs);
      });
    },

    // Make sure director input listeners are added; idempotent
    ensureDirectorInputListeners(directorFs) {
      if (directorFs.__roles_listeners_attached) return;
      directorFs.__roles_listeners_attached = true;

      // Listen for any input/select changes inside the director fieldset
      directorFs.addEventListener("input", () => Roles.syncLinkedRoles(directorFs));
      directorFs.addEventListener("change", () => Roles.syncLinkedRoles(directorFs));
    },

    // When checkboxes change
   handleRoleChange(directorFs, checkbox) {
  const role = checkbox.dataset.role;
  const checked = checkbox.checked;
  const wrapper = checkbox.closest(".role-checkboxes");
  const shareBox = wrapper.querySelector(".sharePercentBox");
  const qualBox = wrapper.querySelector(".qualificationBox");
  const votingBox = wrapper.querySelector(".votingRightsBox");
  const onlyBox = wrapper.querySelector('[data-role="only"]');

  // If "Director Only" is checked, uncheck others and hide extra inputs
  if (role === "only" && checked) {
    wrapper.querySelectorAll(".roleCheck").forEach(cb => {
      if (cb.dataset.role !== "only") cb.checked = false;
    });
    shareBox.classList.add("hidden");
    qualBox.classList.add("hidden");
    votingBox.classList.add("hidden"); // This line was missing
    // Remove linked entries
    Roles.removeLinkedRoleEntry(directorFs, "subscriber");
    Roles.removeLinkedRoleEntry(directorFs, "owner");
    Roles.removeLinkedRoleEntry(directorFs, "secretary");
    return;
  }

  // Uncheck "Director Only" if another role is selected
  if (role !== "only" && checked) {
    onlyBox.checked = false;
  }

  // Show/hide extra input fields based on selected role
  if (role === "subscriber") wrapper.querySelector(".sharePercentBox").classList.toggle("hidden", !checked);
  if (role === "secretary") wrapper.querySelector(".qualificationBox").classList.toggle("hidden", !checked);
  if (role === "owner") wrapper.querySelector(".votingRightsBox").classList.toggle("hidden", !checked);

  // Copy data to corresponding forms if checked; otherwise remove
  if (checked) {
    Roles.copyDirectorDataToRole(directorFs, role, wrapper);
  } else {
    Roles.removeLinkedRoleEntry(directorFs, role);
  }
},

    // Returns an object of normalized director data (key -> value)
    getDirectorData(directorFs) {
      // Attempt to detect a prefix like "idirector{index}_"
      const idParts = directorFs.id.match(/\d+$/);
      const dirIndex = idParts ? idParts[0] : null;
      const prefix = dirIndex ? `idirector${dirIndex}_` : null;

      const data = {};
      directorFs.querySelectorAll("input, select, textarea").forEach(el => {
        // derive key: try to remove prefix if present, else use id or name
        let rawKey = el.id || el.name || "";
        if (prefix && rawKey.startsWith(prefix)) rawKey = rawKey.replace(prefix, "");
        rawKey = rawKey.trim();
        if (!rawKey && el.name) rawKey = el.name.trim();

        // normalize key to lowercase no-spaces
        const key = rawKey.replace(/\s+/g, "").toLowerCase();
        data[key] = el.value;
      });

      return data;
    },

    copyDirectorDataToRole(directorFs, role, wrapper) {
      // Gather director's input data
      const dirData = Roles.getDirectorData(directorFs);

      // Include additional fields depending on role (use normalized keys)
      if (role === "subscriber") {
        const shareVal = wrapper.querySelector(".shareInput")?.value || "";
        dirData["sharepercent"] = shareVal;
        dirData["sharepercentvalue"] = shareVal;
        dirData["sharepercent_"] = shareVal;
      }
      if (role === "secretary") {
        const qual = wrapper.querySelector(".secQualification")?.value || "";
        dirData["qualification"] = qual;
        dirData["secqualification"] = qual;
      }
      if (role === "owner") {
        const votingRights = wrapper.querySelector(".votingRightsInput")?.value || "";
        dirData["votingrights"] = votingRights;
      }

      // Fill the appropriate form based on the role
      switch (role) {
        case "secretary":
          Roles.fillSecretaryForm(dirData);
          break;
        case "subscriber":
          Roles.addOrFillSubscriber(dirData, directorFs);
          break;
        case "owner":
          Roles.addOrFillOwner(dirData, directorFs);
          break;
      }
    },

    // Map director data into secretary fields. More tolerant matching.
    fillSecretaryForm(data) {
      const prefix = "isec";
      // select all secretary inputs/selects that start with prefix
      document.querySelectorAll(`[id^="${prefix}"]`).forEach(el => {
        const rawKey = el.id.replace(prefix, "").replace(/^_+/, ""); // drop leading underscores
        const keyNorm = rawKey.replace(/\s+/g, "").toLowerCase();

        // try several ways to match keys
        for (const dKey in data) {
          if (!dKey) continue;
          if (keyNorm.includes(dKey) || dKey.includes(keyNorm) || keyNorm === dKey) {
            el.value = data[dKey];
            break;
          }
        }
      });
    },

    // Add or update subscriber entry linked to this director
    addOrFillSubscriber(data, directorFs) {
      const container = document.getElementById("isubscribersContainer");
      const addBtn = document.getElementById("iaddSubscriberBtn");
      const tag = "linkedFromDirector-" + directorFs.id;

      if (!container) return;

      // Try to find already linked fieldset
      let targetFs = container.querySelector(`fieldset[data-link="${tag}"]`);

      // If not linked yet, reuse first available empty one
      if (!targetFs) {
        targetFs = Array.from(container.querySelectorAll("fieldset")).find(fs => !fs.dataset.link);

        // If all existing are linked, create a new one
        if (!targetFs) {
          if (addBtn) addBtn.click();
          // after adding, pick last fieldset
          targetFs = container.querySelector("#isubscribersContainer fieldset:last-of-type") || container.querySelector("fieldset:last-of-type");
        }

        // Mark the reused or new fieldset as linked
        if (targetFs) targetFs.dataset.link = tag;
      }

      if (!targetFs) return;
      const index = targetFs.id.match(/\d+$/)?.[0] || "";
      Roles.fillTargetForm(targetFs, `isubscriber${index}_`, data);
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
          targetFs = container.querySelector("#iownersContainer fieldset:last-of-type") || container.querySelector("fieldset:last-of-type");
        }

        if (targetFs) targetFs.dataset.link = tag;
      }

      if (!targetFs) return;
      const index = targetFs.id.match(/\d+$/)?.[0] || "";
      Roles.fillTargetForm(targetFs, `iowner${index}_`, data);
    },

    // Removes linked role form entry when unchecked
    removeLinkedRoleEntry(directorFs, role) {
      const tag = "linkedFromDirector-" + directorFs.id;

      const container =
        role === "subscriber"
          ? document.querySelector("#isubscribersContainer")
          : role === "owner"
          ? document.querySelector("#iownersContainer")
          : role === "secretary"
          ? document.querySelector("#isecContainer") // if there's a specific container for secretary entries; otherwise, remove via IDs
          : null;

      // If subscriber/owner, remove linked fieldset
      if (role === "subscriber" || role === "owner") {
        const linked = container?.querySelector(`fieldset[data-link="${tag}"]`);
        if (linked) linked.remove();
        return;
      }

      // For secretary, you likely have single secretary fields: clear them if needed
      if (role === "secretary") {
        // If secretary is single record, clear its fields
        const prefix = "isec";
        document.querySelectorAll(`[id^="${prefix}"]`).forEach(el => {
          if (el.tagName.toLowerCase() === "select") el.selectedIndex = 0;
          else el.value = "";
        });
      }
    },

    // Fills inputs in a target fieldset based on provided data
    fillTargetForm(targetFs, prefix, data) {
      // Normalize prefix (allow either with or without trailing underscore)
      const normalizedPrefix = prefix || "";

      // For each input/select/textarea in the target fieldset, try to find a matching key in data
      targetFs.querySelectorAll("input, select, textarea").forEach(el => {
        const rawId = el.id || el.name || "";
        let key = rawId;
        if (normalizedPrefix && rawId.startsWith(normalizedPrefix)) {
          key = rawId.replace(normalizedPrefix, "");
        }
        // normalize key to compare
        const keyNorm = key.replace(/\s+/g, "").replace(/_+/g, "").toLowerCase();

        // Try to find best matching data key
        for (const dKey in data) {
          if (!dKey) continue;
          const dKeyNorm = dKey.replace(/\s+/g, "").replace(/_+/g, "").toLowerCase();

          // match if one contains the other (loose matching to be resilient)
          if (keyNorm === dKeyNorm || keyNorm.includes(dKeyNorm) || dKeyNorm.includes(keyNorm)) {
            // set value based on element type
            if (el.tagName.toLowerCase() === "select") {
              // try to set matching option if exact; otherwise set value
              const option = Array.from(el.options).find(o => o.value === data[dKey] || o.text === data[dKey]);
              if (option) el.value = option.value;
              else el.value = data[dKey];
            } else if (el.type === "checkbox") {
              // if data is 'on'/'true'/'1' set checked
              el.checked = !!(data[dKey] && (data[dKey] === "true" || data[dKey] === "1" || data[dKey] === true));
            } else {
              el.value = data[dKey];
            }
            break;
          }
        }
      });
      
      // Special handling for voting rights field to ensure it's properly mapped
      if (data.votingrights !== undefined) {
        const votingRightsEl = targetFs.querySelector(`[id$="_votingRights"]`);
        if (votingRightsEl) votingRightsEl.value = data.votingrights;
      }
    },

    // Called when director inputs change — sync any linked Subscriber/Owner/Secretary entries
    syncLinkedRoles(directorFs) {
      // If the wrapper exists, check which roles are checked and update linked entries accordingly
      const wrapper = directorFs.querySelector(".role-checkboxes");
      if (!wrapper) return;

      const dirData = Roles.getDirectorData(directorFs);

      // If subscriber checkbox is checked -> copy data (also includes share percent)
      const subChecked = wrapper.querySelector('.roleCheck[data-role="subscriber"]')?.checked;
      if (subChecked) {
        // attach share % into data if present
        const share = wrapper.querySelector(".shareInput")?.value;
        if (share !== undefined) dirData["sharepercent"] = share;
        Roles.addOrFillSubscriber(dirData, directorFs);
      }

      // owner
      const ownerChecked = wrapper.querySelector('.roleCheck[data-role="owner"]')?.checked;
      if (ownerChecked) {
        // attach voting rights data if present
        const votingRights = wrapper.querySelector(".votingRightsInput")?.value;
        if (votingRights !== undefined) dirData["votingrights"] = votingRights;
        
        Roles.addOrFillOwner(dirData, directorFs);
      }

      // secretary
      const secChecked = wrapper.querySelector('.roleCheck[data-role="secretary"]')?.checked;
      if (secChecked) {
        // include qualification
        const qual = wrapper.querySelector(".secQualification")?.value;
        if (qual !== undefined) dirData["qualification"] = qual;
        Roles.fillSecretaryForm(dirData);
      }
    },

    // If the director already has linked role entries in the DOM (e.g., page was rendered with them),
    // set the checkboxes accordingly so UI stays in sync.
    restoreExistingLinks(directorFs) {
      const wrapper = directorFs.querySelector(".role-checkboxes");
      if (!wrapper) return;
      const tag = "linkedFromDirector-" + directorFs.id;

      // subscribers
      const subLinked = document.querySelector(`#isubscribersContainer fieldset[data-link="${tag}"]`);
      if (subLinked) {
        const cb = wrapper.querySelector('.roleCheck[data-role="subscriber"]');
        if (cb) {
          cb.checked = true;
          wrapper.querySelector(".sharePercentBox")?.classList.remove("hidden");
        }
      }

      // owners
      const ownerLinked = document.querySelector(`#iownersContainer fieldset[data-link="${tag}"]`);
      if (ownerLinked) {
        const cb = wrapper.querySelector('.roleCheck[data-role="owner"]');
        if (cb) {
          cb.checked = true;
          wrapper.querySelector(".votingRightsBox")?.classList.remove("hidden");
        }
      }

      // secretary: if secretary fields match (single or multiple), mark checkbox (best-effort)
      // Here we check if any isec* input has value
      const isecHasValue = Array.from(document.querySelectorAll(`[id^="isec"]`)).some(el => !!el.value);
      if (isecHasValue) {
        const cb = wrapper.querySelector('.roleCheck[data-role="secretary"]');
        if (cb) {
          cb.checked = true;
          wrapper.querySelector(".qualificationBox")?.classList.remove("hidden");
        }
      }
    },

    exampleHelper() {
      alert("Helper from roleselector");
    }
  };

  // Expose the Roles module globally via App if App exists
  if (window.App && typeof App.register === "function") {
    App.register("Roles", Roles);
  } else {
    // fallback: attach to window
    window.Roles = Roles;
  }

  // Run Roles.init once DOM is fully loaded
  document.addEventListener("DOMContentLoaded", Roles.init);
})();