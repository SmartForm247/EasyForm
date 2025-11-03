// handler.js 
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

  // Track which director is assigned as secretary
  let secretaryDirectorIndex = null;

  // Fill company-level information
  function fillCompany() {
    const endWith = val("iendWith").toLowerCase();

    // Company Name Logic
    const companyNameValue = val("icompanyName") || ""; 
    setText("companyName", companyNameValue + endWith);
    
    // Set the same company name for elements 2 through 8
    const nameElementIds = ["companyName2", "companyName3", "companyName4", "companyName5", "companyName6", "companyName7", "companyName8"];
    nameElementIds.forEach(id => {
        setText(id, companyNameValue + endWith);
    });

    // Show a checkmark for the correct suffix overlay
    setText("endWithLTD", endWith === "ltd" ? "\u2714" : "");
    setText("endWithLIMITED", endWith === "limited" ? "\u2714" : "");

    // Constitution Type Check
    const constitution = val("iconstitutionType");
    setText("registeredCon", constitution === "Registered" ? "\u2714" : "");
    setText("standardCon", constitution === "Standard" ? "\u2714" : "");

    // Presenter and Company Details
    setText("presentedBy", val("ipresentedBy"));
    setText("presenterTIN", val("ipresenterTin"));
    setText("principalActivities", val("iactivities"));

    // Financials
    setText("StatedCapital", val("icapital") || "0");
    setText("estimatedRevenue", val("iestimatedRevenue"));
    setText("numOfEmp", val("inumOfEmployees"));
  }

  // Fill office address information
  function fillOffice() {
    setText("officedigital-address", val("iofficeGps"));
    setText("officeLandmark", val("iofficeLandmark"));
    setText("officehousenumber", val("iofficeHse"));
    setText("officetown", val("iofficeTown"));
    setText("officeStreet", val("iofficeStreetName"));
    setText("officeCity", val("iofficeCity"));
    setText("officeDistrict", val("iofficeDistrict"));
    setText("officeRegion", val("iofficeRegion"));

    // Postal type fields
    const postalType = val("iofficePostalType").toLowerCase();
    const boxNumber = val("iofficeBoxNumber");

    // Set checkmarks for postal type
    setText("emptyBox1", postalType === "pobox" ? "\u2714" : "");
    setText("emptyBox2", postalType === "pmb" ? "\u2714" : "");
    setText("emptyBox3", postalType === "dtd" ? "\u2714" : "");

    // Clear all number fields first
    setText("OfficeBoxNumber", "");
    setText("PMB", "");
    setText("DTD", "");

    // Place box number under the correct postal type
    if (postalType === "pobox") {
      setText("OfficeBoxNumber", boxNumber);
    } else if (postalType === "pmb") {
      setText("PMB", boxNumber);
    } else if (postalType === "dtd") {
      setText("DTD", boxNumber);
    }

    // Set other office info
    setText("OfficeBoxNumberTown", val("iofficeBoxTown"));
    setText("OfficeBoxNumberRegion", val("iofficeBoxRegion"));
    setText("OfficeContactOne", val("iofficeContact1"));
    setText("OfficeContactTwo", val("iofficeContact2"));
    setText("Officeemail", val("iofficeEmail"));
  }

  // Apply title overlay (MR, MRS, etc.)
  function applyTitleOverlay(prefix, titleValue) {
    const titles = ["MR", "MRS", "MISS", "MS", "DR"];
    titles.forEach(t => {
      const id = `${prefix}tittle${t}`;
      setText(id, "");
    });

    if (!titleValue) return;
    const normalized = titleValue.trim().toUpperCase();
    // Normalize title values
    let key = normalized;
    if (key === "MRS" || key === "MRS.") key = "MRS";
    if (key === "MISS") key = "MISS";
    if (key === "DR" || key === "DR.") key = "DR";
    const targetId = `${prefix}tittle${key}`;
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

  // Fill one director into overlay D1 or D2 depending on index (1 or 2)
  function fillDirector(index) {
    const overlayPrefix = index === 1 ? "D1" : "D2";
    const formPrefix = `idirector${index}_`;

    // Read form fields
    const fname = val(formPrefix + "fname");
    const mname = val(formPrefix + "mname");
    const sname = val(formPrefix + "sname");
    const former = val(formPrefix + "former");
    const title = val(formPrefix + "title");
    const gender = val(formPrefix + "gender");
    const dob = val(formPrefix + "dob");
    const pob = val(formPrefix + "pob");
    const nation = val(formPrefix + "nation");
    const occupation = val(formPrefix + "occupation");
    const phone1 = val(formPrefix + "contact1");
    const phone2 = val(formPrefix + "contact2");
    const email = val(formPrefix + "email");
    const tin = val(formPrefix + "tin");
    const ghanaCard = val(formPrefix + "ghanaCard");

    // Residential address
    const resGps = val(formPrefix + "resGps");
    const resHse = val(formPrefix + "resHse");
    const resLandmark = val(formPrefix + "resLandmark");
    const resStreet = val(formPrefix + "resStreet");
    const resCity = val(formPrefix + "resCity");
    const resTown = val(formPrefix + "resTown");
    const resDistrict = val(formPrefix + "resDistrict");
    const resRegion = val(formPrefix + "resRegion");
    const resCountry = val(formPrefix + "resCountry");
    const fullName = [fname, mname, sname].filter(Boolean).join(" ");

    // Apply to overlay elements
    setText(`${overlayPrefix}FirstName`, fname);
    setText(`${overlayPrefix}MiddleName`, mname);
    setText(`${overlayPrefix}LastName`, sname);
    setText(`${overlayPrefix}FormerName`, former);
    applyTitleOverlay(overlayPrefix, title);
    applyGenderOverlay(overlayPrefix, gender);
    setText(`${overlayPrefix}DOB`, dob);
    setText(`${overlayPrefix}POB`, pob);
    setText(`${overlayPrefix}Nationality`, nation);
    setText(`${overlayPrefix}Ocupation`, occupation);
    setText(`${overlayPrefix}PhoneNO1`, phone1);
    setText(`${overlayPrefix}PhoneNO2`, phone2);
    setText(`${overlayPrefix}Email`, email);
    setText(`${overlayPrefix}TIN`, tin);
    setText(`${overlayPrefix}GhanaCard`, ghanaCard);

    // Residential address
    setText(`${overlayPrefix}DigitalAddress`, resGps);
    setText(`${overlayPrefix}housenumber`, resHse);
    setText(`${overlayPrefix}Landmark`, resLandmark);
    setText(`${overlayPrefix}StreetName`, resStreet);
    setText(`${overlayPrefix}City`, resCity);
    setText(`${overlayPrefix}town`, resTown);
    setText(`${overlayPrefix}District`, resDistrict);
    setText(`${overlayPrefix}Region`, resRegion);
    setText(`${overlayPrefix}Country`, resCountry);

    // Special fields for first director
    if (index === 1) {
      setText("D1FullName", fullName);
      setText("directorName", fullName);
      setText("D1signature", fullName ? `Signed: ${fullName}` : "");
    } else if (index === 2) {
      setText("D2FirstName", fname);
      setText("D2signature", fullName ? `Signed: ${fullName}` : "");
      setText("D2Signature", fullName ? `Signed: ${fullName}` : "");
    }

    // Update generic director name fields
    setText("FdirectorFullName", fullName);
    setText("directorFullName2", fullName);
    setText("directorFullName3", fullName);
  }

  // Fill director declarations
  function fillDirectorDeclarations() {
    const directorsContainer = document.getElementById("idirectorsContainer");
    if (!directorsContainer) return;
    
    const directors = Array.from(directorsContainer.querySelectorAll("fieldset"));
    
    // Handle first director declaration (page 22)
    if (directors.length >= 1) {
      const prefix = `idirector1_`;
      const fname = val(prefix + "fname");
      const mname = val(prefix + "mname");
      const sname = val(prefix + "sname");
      const fullName = [fname, mname, sname].filter(Boolean).join(" ");
      
      // Full name fields
      setText("Ddirector1FullName1", fullName);
      setText("Ddirector1FullName2", fullName);
      setText("Ddirector1FullName3", fullName);
      
      // Address components
      setText("Ddirector1HouseNumber", val(prefix + "resHse"));
      setText("Ddirector1Landmark", val(prefix + "resLandmark"));
      setText("Ddirector1StreetName", val(prefix + "resStreet"));
      
      // Combine city and town
      const city = val(prefix + "resCity");
      const town = val(prefix + "resTown");
      setText("Ddirector1Town&City", city && town ? `${city}, ${town}` : city || town);
      
      // Date components - handle both YYYY-MM-DD and DD/MM/YYYY formats
      const dob = val(prefix + "dob");
      if (dob) {
        const { day, month, year } = parseDate(dob);
        setText("DayOfdeclaration", day);
        setText("MonthOfdeclaration", month);
        setText("YearOfdeclaration", year);
      }
    }
    
    // Handle second director declaration (page 23)
    if (directors.length >= 2) {
      const prefix = `idirector2_`;
      const fname = val(prefix + "fname");
      const mname = val(prefix + "mname");
      const sname = val(prefix + "sname");
      const fullName = [fname, mname, sname].filter(Boolean).join(" ");
      
      // Full name fields
      setText("Ddirector2FullName1", fullName);
      setText("Ddirector2FullName2", fullName);
      setText("Ddirector2FullName3", fullName);
      
      // Address components
      setText("Ddirector2HouseNumber", val(prefix + "resHse"));
      setText("Ddirector2Landmark", val(prefix + "resLandmark"));
      setText("Ddirector2StreetName", val(prefix + "resStreet"));
      
      // Combine city and town
      const city = val(prefix + "resCity");
      const town = val(prefix + "resTown");
      setText("Ddirector2Town&City", city && town ? `${city}, ${town}` : city || town);
      
      // Date components - handle both YYYY-MM-DD and DD/MM/YYYY formats
      const dob = val(prefix + "dob");
      if (dob) {
        const { day, month, year } = parseDate(dob);
        setText("DayOfdeclaration2", day);
        setText("MonthOfdeclaration2", month);
        setText("YearOfdeclaration2", year);
      }
    }
  }

  // Fill consent letters
  function fillConsentLetters() {
    // Helper function to create combined postal address
    function getCombinedPostalAddress() {
      const boxNumber = val("iofficeBoxNumber");
      const boxTown = val("iofficeBoxTown");
      const boxRegion = val("iofficeBoxRegion");
      
      const parts = [boxNumber, boxTown, boxRegion].filter(Boolean);
      return parts.join(", ");
    }
    
    // First director consent letter (page 25)
    const director1FullName = getDirectorFullName(1);
    if (director1FullName) {
      setText("LFdirectorFullName", director1FullName);
      setText("FdirectorResidentialAddress", 
        val("idirector1_resHse") + ", " + 
        val("idirector1_resStreet") + ", " + 
        val("idirector1_resCity")
      );
      // Use combined postal address instead of just house number
      setText("FdirectorBoxNumber", getCombinedPostalAddress());
      setText("FdirectorPhoneNumber", val("idirector1_contact1"));
    }
    
    // Second director consent letter (page 26)
    const director2FullName = getDirectorFullName(2);
    if (director2FullName) {
      setText("LSdirectorFullName", director2FullName);
      setText("SdirectorResidentialAddress", 
        val("idirector2_resHse") + ", " + 
        val("idirector2_resStreet") + ", " + 
        val("idirector2_resCity")
      );
      // Use combined postal address instead of just house number
      setText("SdirectorBoxNumber", getCombinedPostalAddress());
      setText("SdirectorPhoneNumber", val("idirector2_contact1"));
    }
    
    // Secretary consent letter (page 24)
    const secretaryFullName = [val("isecFname"), val("isecMname"), val("isecSname")].filter(Boolean).join(" ");
    if (secretaryFullName) {
      setText("SecfullName", secretaryFullName);
      setText("SecResidentialAddress", 
        val("isecResHse") + ", " + 
        val("isecResStreet") + ", " + 
        val("isecResCity")
      );
      // Use combined postal address instead of just house number
      setText("SecBoxNumber", getCombinedPostalAddress());
      setText("SecPhoneNumber", val("isecContact1"));
      setText("SecQualification", val("isecQualification"));
    }
  }

  // Fill secretary overlay from secretary form
  function fillSecretary() {
    // If there is a secretary linked from director, the isec* ids will be filled automatically
    const prefix = "isec";
    const fname = val(prefix + "Fname");
    const mname = val(prefix + "Mname");
    const sname = val(prefix + "Sname");
    const fullName = [fname, mname, sname].filter(Boolean).join(" ");

    setText("SecFirstName", fname);
    setText("secMiddleName", mname);
    setText("secLastName", sname);
    setText("secFormerName", val(prefix + "Former"));
    setText("secTIN", val(prefix + "Tin"));
    setText("secGhanaCard", val(prefix + "GhanaCard"));
    applyTitleOverlay("sec", val(prefix + "Title"));
    applyGenderOverlay("sec", val(prefix + "Gender"));
    setText("secDOB", val(prefix + "Dob"));
    setText("secPOB", val(prefix + "Pob"));
    setText("secNationality", val(prefix + "Nation"));
    setText("secOccupation", val(prefix + "Occupation"));
    setText("secPhoneNO1", val(prefix + "Contact1"));
    setText("secPhoneNO2", val(prefix + "Contact2"));
    setText("secEmail", val(prefix + "Email"));
    setText("secDigitalAddress", val(prefix + "ResGps"));
    setText("secLandmark", val(prefix + "ResLandmark"));
    setText("sechousenumber", val(prefix + "ResHse"));
    setText("secTown", val(prefix + "ResTown"));
    setText("secStreetNane", val(prefix + "ResStreet"));
    setText("secCity", val(prefix + "ResCity"));
    setText("secDistrict", val(prefix + "ResDistrict"));
    setText("secRegion", val(prefix + "ResRegion"));
    setText("secCountry", val(prefix + "ResCountry"));
    setText("SecSignature", fullName ? `Signed: ${fullName}` : "");
    setText("SecfullName", fullName);
    
    // Set secretaryFullName overlay
    setText("secretaryFullName", fullName);
    setText("secretaryFullName2", fullName);
    setText("secretaryFullName3", fullName);
  }

  // Fill first N subscribers into SH1/SH2 overlays (maps up to 2)
  function fillSubscribers() {
    const container = document.getElementById("isubscribersContainer");
    if (!container) {
      console.log("fillSubscribers: isubscribersContainer not found");
      return;
    }
    const fieldsets = Array.from(container.querySelectorAll("fieldset"));
    console.log(`fillSubscribers: Found ${fieldsets.length} subscriber fieldsets`); // Debug log

    for (let i = 0; i < 2; i++) {
      const fs = fieldsets[i];
      if (!fs) {
        setText(`SH${i+1}FirstName`, "");   
        setText(`SH${i+1}NoOfShare`, "");
        setText(`SH${i+1}ShareAmount`, "");
        continue;
      }

      const idx = fs.id.match(/\d+$/)?.[0];
      const prefix = `isubscriber${idx}_`;

      const fname = val(prefix + "fname");
      const mname = val(prefix + "mname");
      const sname = val(prefix + "sname");
      const former = val(prefix + "former");
      const title = val(prefix + "title");
      const gender = val(prefix + "gender");
      const dob = val(prefix + "dob");
      const pob = val(prefix + "pob");
      const nation = val(prefix + "nation");
      const occupation = val(prefix + "occupation");
      const full = [fname, mname, sname].filter(Boolean).join(" ");
      const tin = val(prefix + "tin");
      const gh = val(prefix + "ghanaCard");
      // *** FIX: Corrected field name to match the normalized key from the Roles module ***
      const shares = val(prefix + "sharepercent") || val(prefix + "sharePercent") || val("isubscriberShares") || "";
      const address = val(prefix + "resStreet") + " " + val(prefix + "resTown");

      // Map everything
      setText(`SH${i+1}FirstName`, fname);
      setText(`SH${i+1}MiddleName`, mname);
      setText(`SH${i+1}LastName`, sname);
      setText(`SH${i+1}FormerName`, former);
      applyTitleOverlay(`SH${i+1}`, title);
      applyGenderOverlay(`SH${i+1}`, gender);
      setText(`SH${i+1}DOB`, dob);
      setText(`SH${i+1}POB`, pob);
      setText(`SH${i+1}Nationality`, nation);
      setText(`SH${i+1}Occupation`, occupation);
      setText(`SH${i+1}TIN`, tin);
      setText(`SH${i+1}GhanaCard`, gh);
      setText(`SH${i+1}Address`, address);
      setText(`SH${i+1}NoOfShare`, shares);
      setText(`SH${i+1}ShareAmount`, shares);
      setText(`SH${i+1}DigitalAddress`, val(prefix + "resGps"));
      setText(`SH${i+1}Landmark`, val(prefix + "resLandmark"));
      setText(`SH${i+1}StreetName`, val(prefix + "resStreet"));
      setText(`SH${i+1}Town`, val(prefix + "resTown"));
      setText(`SH${i+1}housenumber`, val(prefix + "resHse"));
      setText(`SH${i+1}Signature`, full ? `Signed: ${full}` : "");
    }
  }

  // Fill beneficial owners into BO1..BO4 (map up to 4) and detailed views
  function fillBeneficialOwners() {
    const container = document.getElementById("iownersContainer");
    if (!container) return;
    const fieldsets = Array.from(container.querySelectorAll("fieldset"));

    // First, fill the list view on page 14 (LLC14.jpg)
    for (let i = 0; i < 4; i++) {
      const fs = fieldsets[i];
      const num = i + 1;
      if (!fs) {
        setText(`owner${num}fullName`, "");
        setText(`owner${num}status`, "");
        continue;
      }
      const idx = fs.id.match(/\d+$/)?.[0];
      const prefix = `iowner${idx}_`;
      const fname = val(prefix + "fname");
      const mname = val(prefix + "mname");
      const sname = val(prefix + "sname");
      const former = val(prefix + "former");
      const full = [fname, mname, sname, former].filter(Boolean).join(" ");
      
      // Set the owner's full name
      setText(`owner${num}fullName`, full);
      
      // Set status to checkmark if owner exists, otherwise empty
      setText(`owner${num}status`, full ? "\u2714" : "");
    }

    // Now fill detailed views for the first two owners
    for (let i = 0; i < 2; i++) {
      const fs = fieldsets[i];
      const num = i + 1;
      // Prefix for overlay elements
      const prefix = num === 1 ? "owner1" : "owner2";
      
      if (!fs) {
        // Clear all fields for this owner if not present
        setText(`${prefix}FirstName`, "");
        setText(`${prefix}Surname`, "");
        setText(`${prefix}MiddleName`, "");
        setText(`${prefix}DOB`, "");
        setText(`${prefix}Nationality`, "");
        setText(`${prefix}POB`, "");
        setText(`${prefix}Address1`, "");
        setText(`${prefix}Address2`, "");
        setText(`${prefix}GPS`, "");
        setText(`${prefix}Tin`, "");
        setText(`${prefix}PhoneNumber`, "");
        setText(`${prefix}Email`, "");
        setText(`${prefix}GhNumber`, "");
        setText(`${prefix}PlaceOfWork`, "");
        setText(`${prefix}Directpercent`, "");
        setText(`${prefix}votinRight`, "");
        setText(`${prefix}Indirectpercent`, "");
        continue;
      }
      
      const idx = fs.id.match(/\d+$/)?.[0];
      const formPrefix = `iowner${idx}_`;
      
      // Get all the form values
      const fname = val(formPrefix + "fname");
      const mname = val(formPrefix + "mname");
      const sname = val(formPrefix + "sname");
      const former = val(formPrefix + "former");
      const dob = val(formPrefix + "dob");
      const pob = val(formPrefix + "pob");
      const nationality = val(formPrefix + "nation");
      const address1 = val(formPrefix + "resHse") + ", " + val(formPrefix + "resStreet")+ ", " + val(formPrefix + "resCity")+ ", " + val(formPrefix + "resCountry");
      const address2 = val("iofficeHse") + ", " + val("iofficeStreetName") + ", " + val("iofficeCity") + ", " + val(formPrefix + "resCountry");
      const gps = val(formPrefix + "resGps");
      const tin = val(formPrefix + "tin");
      const phone = val(formPrefix + "contact1");
      const email = val(formPrefix + "email");
      const ghanaCard = val(formPrefix + "ghanaCard");
      
      // Determine the role of this person (director, secretary, or both)
      const ownerFullName = [fname, mname, sname].filter(Boolean).join(" ");
      let role = "";
      
      // Check if this owner is also a director
      const directorsContainer = document.getElementById("idirectorsContainer");
      if (directorsContainer) {
        const directors = Array.from(directorsContainer.querySelectorAll("fieldset"));
        for (let j = 0; j < directors.length; j++) {
          const directorIdx = directors[j].id.match(/\d+$/)?.[0] || "1";
          const directorPrefix = `idirector${directorIdx}_`;
          const directorFullName = [val(directorPrefix + "fname"), val(directorPrefix + "mname"), val(directorPrefix + "sname")].filter(Boolean).join(" ");
          
          if (directorFullName === ownerFullName) {
            role = "Director";
            break;
          }
        }
      }
      
      // Check if this owner is also the secretary
      const secretaryFullName = [val("isecFname"), val("isecMname"), val("isecSname")].filter(Boolean).join(" ");
      if (secretaryFullName === ownerFullName) {
        role = role ? role + " & Secretary" : "Secretary";
      }
      
      // If no role found, use the occupation
      if (!role) {
        role = val(formPrefix + "occupation");
      }
      
      // Use the role instead of occupation in placeOfWork
      const placeOfWork = val(formPrefix + "resCity") + ", " + role;
      
      const directPercent = val(formPrefix + "directPercent");
      const votingRights = val(formPrefix + "votingRights");
      const indirectPercent = val(formPrefix + "indirectPercent");
      
      // Map to overlay elements
      setText(`${prefix}FirstName`, fname);
      setText(`${prefix}Surname`, sname);
      
      // Combine middle name and former name into a single string
      const nameParts = [mname, former].filter(Boolean);
      const combinedMiddleAndFormer = nameParts.join(' ');
      setText(`${prefix}MiddleName`, combinedMiddleAndFormer);
      
      setText(`${prefix}DOB`, dob);
      setText(`${prefix}Nationality`, nationality);
      setText(`${prefix}POB`, pob);
      setText(`${prefix}Address1`, address1);
      setText(`${prefix}Address2`, address2);
      setText(`${prefix}GPS`, gps);
      setText(`${prefix}Tin`, tin);
      setText(`${prefix}PhoneNumber`, phone);
      setText(`${prefix}Email`, email);
      setText(`${prefix}GhNumber`, ghanaCard);
      setText(`${prefix}PlaceOfWork`, placeOfWork);
      setText(`${prefix}Directpercent`, directPercent);
      setText(`${prefix}votinRight`, votingRights);
      setText(`${prefix}votinRight2`, votingRights);
      setText(`${prefix}Indirectpercent`, indirectPercent);
      
      // For director and secretary names in the declaration sections
      if (num === 1) {
        setText("Fbo2directorName", getDirectorFullName(1));
        setText("Fbo2secretaryName", val("isecFname") + " " + val("isecSname"));
      } else {
        setText("Sbo2directorName", getDirectorFullName(2) || getDirectorFullName(1));
        setText("Sbo2secretaryName", val("isecFname") + " " + val("isecSname"));
      }
    }
  }

  // Function to get director full name by index
  function getDirectorFullName(index) {
    const prefix = `idirector${index}_`;
    const fname = val(prefix + "fname");
    const mname = val(prefix + "mname");
    const sname = val(prefix + "sname");
    return [fname, mname, sname].filter(Boolean).join(" ");
  }

  // Function to set directorFullName with the rule that it shouldn't match secretaryFullName
  function setDirectorFullName() {
    const directorsContainer = document.getElementById("idirectorsContainer");
    if (!directorsContainer) return;
    
    const directors = Array.from(directorsContainer.querySelectorAll("fieldset"));
    if (directors.length === 0) return;
    
    // Get secretary full name
    const secretaryFname = val("isecFname");
    const secretaryMname = val("isecMname");
    const secretarySname = val("isecSname");
    const secretaryFullName = [secretaryFname, secretaryMname, secretarySname].filter(Boolean).join(" ");
    
    // If no secretary is set, use the first director
    if (!secretaryFullName) {
      setText("directorFullName", getDirectorFullName(1));
      return;
    }
    
    // Find a director who is not the secretary
    let selectedDirector = null;
    for (let i = 1; i <= directors.length; i++) {
      const directorFullName = getDirectorFullName(i);
      if (directorFullName && directorFullName !== secretaryFullName) {
        selectedDirector = directorFullName;
        break;
      }
    }
    
    // If all directors are also secretaries (unlikely), use the first one
    if (!selectedDirector && directors.length > 0) {
      selectedDirector = getDirectorFullName(1);
    }
    
    setText("directorFullName", selectedDirector || "");
  }

  // Hook to copy director role-linked subscriber/owner/secretary content to overlay
  function fillRoleLinkedEntries() {
    // Reset secretary director index
    secretaryDirectorIndex = null;
    
    // Check for any director role boxes
    const directorFieldsets = document.querySelectorAll("#idirectorsContainer fieldset");
    directorFieldsets.forEach(fs => {
      const roleWrapper = fs.querySelector(".role-checkboxes");
      if (!roleWrapper) return;
      const directorId = fs.id; // e.g., idirector1
      
      // If secretary checked, copy to secretary form (isec*)
      const secCheckbox = roleWrapper.querySelector('[data-role="secretary"]');
      if (secCheckbox && secCheckbox.checked) {
        // Track which director is assigned as secretary
        const idx = directorId.match(/\d+$/)?.[0] || "1";
        secretaryDirectorIndex = parseInt(idx);
        
        // Build data object and directly set isec* fields
        const prefix = `idirector${idx}_`;
        // Transfer values to isec fields
        const mapping = {
          Fname: prefix + "fname",
          Mname: prefix + "mname",
          Sname: prefix + "sname",
          Former: prefix + "former",
          Title: prefix + "title",
          Gender: prefix + "gender",
          Dob: prefix + "dob",
          Pob: prefix + "pob",
          Nation: prefix + "nation",
          Occupation: prefix + "occupation",
          Contact1: prefix + "contact1",
          Contact2: prefix + "contact2",
          Email: prefix + "email",
          Tin: prefix + "tin",
          GhanaCard: prefix + "ghanaCard",
          ResGps: prefix + "resGps",
          ResHse: prefix + "resHse",
          ResLandmark: prefix + "resLandmark",
          ResStreet: prefix + "resStreet",
          ResCity: prefix + "resCity",
          ResTown: prefix + "resTown",
          ResDistrict: prefix + "resDistrict",
          ResRegion: prefix + "resRegion",
          ResCountry: prefix + "resCountry",
        };
        // Write directly to isec* inputs if they exist
        for (const [isecKey, directorIdRef] of Object.entries(mapping)) {
          const destId = "isec" + isecKey;
          const srcVal = val(directorIdRef);
          const destEl = document.getElementById(destId);
          if (destEl) destEl.value = srcVal;
        }
      }
    });

    // After copying secretary values (if any), call fillSecretary to map them to overlays
    fillSecretary();
    
    // Set directorFullName with the rule that it shouldn't match secretaryFullName
    setDirectorFullName();
  }

  // General updates: called on input/change/mutation
  function updateOverlay() {
    fillCompany();
    fillOffice();
    
    // Directors: only map first two to pages
    const directorsContainer = document.getElementById("idirectorsContainer");
    if (directorsContainer) {
      const directors = Array.from(directorsContainer.querySelectorAll("fieldset"));
      if (directors.length >= 1) fillDirector(1);
      else {
        // Clear D1 overlays
        ["FirstName","MiddleName","LastName","DOB","POB","Nationality","Ocupation"].forEach(k => setText("D1" + k, ""));
      }
      if (directors.length >= 2) fillDirector(2);
    }
    
    // Fill director declarations and consent letters
    fillDirectorDeclarations();
    fillConsentLetters();
    
    fillSecretary();
    fillSubscribers();
    fillBeneficialOwners();
    fillRoleLinkedEntries();

    // Set current date in all date fields
    const today = nowDateString();
    ["date1","date2","date3","date4","date5","date6","date7","date8","date9","date10","date11"].forEach(did => setText(did, today));
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
      });
    }

    // Dynamic container observers: directors, subscribers, owners
    const observeContainer = id => {
      const container = document.getElementById(id);
      if (!container) return;
      const obs = new MutationObserver(mutations => {
        // Small delay allowing scripts that create elements to run
        setTimeout(updateOverlay, 80);
        // Also rewire new inputs inside newly created fieldsets
        mutations.forEach(m => {
          m.addedNodes?.forEach(node => {
            if (node.nodeType === 1) {
              node.querySelectorAll?.("input, select, textarea").forEach(el => {
                el.addEventListener("input", updateOverlay);
                el.addEventListener("change", updateOverlay);
              });
              // Check for role-checkboxes added - attach change handler
              node.querySelectorAll?.(".roleCheck").forEach(cb => {
                cb.addEventListener("change", () => {
                  setTimeout(updateOverlay, 40);
                });
              });
            }
          });
        });
      });
      obs.observe(container, { childList: true, subtree: true });
    };

    observeContainer("idirectorsContainer");
    observeContainer("isubscribersContainer");
    observeContainer("iownersContainer");

    // Quick update if roles toggled
    document.addEventListener("click", e => {
      if (e.target && (e.target.classList?.contains("roleCheck") || e.target.closest?.(".role-checkboxes"))) {
        setTimeout(updateOverlay, 50);
      }
    });

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
  window.LLCOverlay = {
    update: updateOverlay
  };
})();