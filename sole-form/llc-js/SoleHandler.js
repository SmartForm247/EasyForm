// handler.js for Sole Proprietorship Form
(function() {
  // Safe helper: get element value (returns empty string if not found)
  function val(id) {
    const el = document.getElementById(id);
    if (!el) return "";
    return el.value ?? el.textContent ?? "";
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text ?? "";
  }

  function setCheckmark(id, checked) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = checked ? "\u2714" : ""; // checkmark
  }

  // Format date dd/mm/yyyy
  function nowDateString() {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  // Parse date from various formats (YYYY-MM-DD or DD/MM/YYYY)
  function parseDate(dateString) {
    if (!dateString) return { day: "", month: "", year: "" };
    
    let day, month, year;
    
    if (dateString.includes('-')) {
      // YYYY-MM-DD format
      const parts = dateString.split('-');
      if (parts.length === 3) {
        year = parts[0];
        month = parts[1];
        day = parts[2];
      }
    } else if (dateString.includes('/')) {
      // DD/MM/YYYY format
      const parts = dateString.split('/');
      if (parts.length === 3) {
        day = parts[0];
        month = parts[1];
        year = parts[2];
      }
    }
    
    return { day, month, year };
  }

  // Fill business information
  function fillBusiness() {
    // Business Name
    setText("companyName", val("icompanyName"));
    
    // Business Activities
    setText("principalActivities", val("iactivities"));
    
    // Date
    setText("date", val("date"));
    
    // Financial Information
    setText("revenueEnvisage", val("iestimatedRevenue"));
    setText("NoOfemployee", val("inumOfEmployees"));
  }

  // Fill office address information
  function fillOffice() {
    setText("officedigital address", val("iofficeGps"));
    setText("officeLandmark", val("iofficeLandmark"));
    setText("officehousenumber", val("iofficeHseNo"));
    setText("officetown", val("iofficeTown"));
    setText("officeStreet", val("iofficeStreetName"));
    setText("officeCity", val("iofficeCity"));
    setText("officeDistrict", val("iofficeDistrict"));
    setText("officeRegion", val("iofficeRegion"));

    // Postal type fields
    const postalType = val("iofficePostalType").toLowerCase();
    const boxNumber = val("iofficeBoxNumber");

    // Set checkmarks for postal type - CORRECTED IDs
    setText("emptyBox1", postalType === "pobox" ? "\u2714" : "");
    setText("emptyBox2", postalType === "pmb" ? "\u2714" : "");
    setText("emptyBox3", postalType === "dtd" ? "\u2714" : "");

    // Clear all number fields first - CORRECTED IDs
    setText("POBOX", "");
    setText("PMB", "");
    setText("DTD", "");

    // Place box number under the correct postal type - CORRECTED IDs
    if (postalType === "pobox") {
        setText("POBOX", boxNumber);
    } else if (postalType === "pmb") {
        setText("PMB", boxNumber);
    } else if (postalType === "dtd") {
        setText("DTD", boxNumber);
    }

    // Set other office info
    setText("officePostalCodeTown", val("iofficeBoxTown"));
    setText("officePostalCodeRegion", val("iofficeBoxRegion"));
    setText("contactOne", val("iofficeContact1"));
    setText("contactTwo", val("iofficeContact2"));
    setText("email", val("iofficeEmail"));
  }

  // Apply title overlay (MR, MRS, etc.)
  function applyTitleOverlay(prefix, titleValue) {
    const titles = ["MR", "MRS", "MISS", "MS", "DR"];
    titles.forEach(t => {
      // FIXED: Use the correct ID pattern that matches your HTML
      const id = `${prefix}Tittle${t}`;
      setText(id, "");
    });

    if (!titleValue) return;
    const normalized = titleValue.trim().toUpperCase();
    // Normalize title values
    let key = normalized;
    if (key === "MRS" || key === "MRS.") key = "MRS";
    if (key === "MISS") key = "MISS";
    if (key === "DR" || key === "DR.") key = "DR";
    
    // FIXED: Use the correct ID pattern that matches your HTML
    const targetId = `${prefix}Tittle${key}`;
    setText(targetId, "\u2714");
  }

  // Apply gender overlay (male/female checkboxes)
  function applyGenderOverlay(prefix, genderValue) {
    // Clear all gender checkboxes first
    setText(prefix + "GenderMale", "");
    setText(prefix + "GenderFemale", "");
    setText(prefix + "genderMale", "");
    setText(prefix + "genderFemale", "");
    
    const normalized = (genderValue || "").toLowerCase();
    if (normalized === "male") {
      setText(prefix + "GenderMale", "\u2714");
      setText(prefix + "genderMale", "\u2714");
    } else if (normalized === "female") {
      setText(prefix + "GenderFemale", "\u2714");
      setText(prefix + "genderFemale", "\u2714");
    }
  }

  // Fill owner information
  function fillOwner() {
    // Personal Information
    applyTitleOverlay("", val("iownerTitle"));
    applyGenderOverlay("", val("iownerGender"));
    setText("FirstName", val("iownerFname"));
    setText("OwnerMiddleName", val("iownerMname"));
    setText("OwnerLastName", val("iownerSurname"));
    setText("OwnerFormerName", val("iownerFormerName"));
    setText("OwnerDOB", val("iownerDob"));
    setText("OwnerPOB", val("iownerPob"));
    setText("OwnerNationality", val("iownerNationality"));
    setText("Ocupation", val("iownerOccupation"));
    setText("OwnerPhoneNO1", val("iownerContact1"));
    setText("OwnerPhoneNO2", val("iownerContact2"));
    setText("OwnerEmail", val("iownerEmail"));
    setText("OwnerTIN", val("iownerTin"));
    setText("OwnerGhanaCard", val("iownerGhanaCard"));

    // Residential Address
    setText("OwnerDigitalAddress", val("iownerGps"));
    setText("OwnerLandmark", val("iownerLandmark"));
    setText("Ownerhousenumber", val("iownerHseNo"));
    setText("Ownertown", val("iownerTown"));
    setText("OwnerStreet", val("iownerStreet"));
    setText("OwnerCity", val("iownerCity"));
    setText("OwnerDistrict", val("iownerDistrict"));
    setText("OwnerRegion", val("iownerRegion"));
    setText("OwnerCountry", val("iownerCountry"));

    // Set owner full name
    const fullName = [val("iownerFname"), val("iownerMname"), val("iownerSurname"), val("iownerFormerName")].filter(Boolean).join(" ");
    setText("Ownerfullname", fullName);

    // Set date
    setText("date2", val("date"));
  }

  // General updates: called on input/change/mutation
  function updateOverlay() {
    fillBusiness();
    fillOffice();
    fillOwner();

    // Set current date in all date fields
    const today = nowDateString();
    ["date", "date2"].forEach(did => setText(did, today));
  }

  // Attach event listeners to all form inputs to trigger updateOverlay
  function attachListeners() {
    // All relevant form inputs
    const form = document.getElementById("icompanyForm");
    if (!form) {
      console.warn("Form with id icompanyForm not found in DOM when wiring overlay update listeners.");
    } else {
      form.querySelectorAll("input, select, textarea").forEach(el => {
        el.addEventListener("input", updateOverlay);
        el.addEventListener("change", updateOverlay);
        el.addEventListener("paste", (e) => {
          setTimeout(updateOverlay, 10);
        });
      });
    }

    // Update overlay on initial load
    updateOverlay();
  }

  // Run on DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    attachListeners();
    // Ensure a final run in case other scripts populate values after DOMContentLoaded
    setTimeout(updateOverlay, 250);
    setTimeout(updateOverlay, 800);
  });

  // Expose a small API in case you want to trigger update from other modules
  window.SoleOverlay = {
    update: updateOverlay
  };
})();