document.addEventListener("DOMContentLoaded", () => {
  // Make all <p> inside .page editable
  document.querySelectorAll(".page p").forEach(p => {
    p.setAttribute("contenteditable", "true");
  });

  // Handle signature upload
  document.querySelectorAll(".signature-box").forEach(box => {
    const input = box.querySelector("input");
    const img = box.querySelector("img");

    box.addEventListener("click", () => {
      input.click(); // open file picker
    });

    input.addEventListener("change", () => {
      const file = input.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          img.src = e.target.result;
          img.style.display = "block";
          box.firstChild.textContent = ""; // remove "Click to upload signature" text
        };
        reader.readAsDataURL(file);
      }
    });
  });
});


