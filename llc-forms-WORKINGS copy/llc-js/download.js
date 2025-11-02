document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("download-btn").addEventListener("click", async () => {

    const element = document.body;
    const buttonContainer = document.querySelector(".button-container");
    const sect1 = document.getElementById("sect1");
    const sect2 = document.querySelector(".sect2"); // use class selector!

    buttonContainer.style.display = "none";
    sect1.style.display = "none";

    // ✅ Show sect2 temporarily
    const sect2OriginalDisplay = sect2 ? sect2.style.display : null;
    if (sect2) sect2.style.display = "block";

    // ✅ Scroll to top before capturing
    window.scrollTo(0, 0);

    // Wait a short moment to let browser repaint
    await new Promise(resolve => setTimeout(resolve, 300));

    const options = {
      margin: 0,
      filename: 'form.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf()
      .set(options)
      .from(element)
      .save()
      .then(() => {
        // ✅ Restore visibility
        buttonContainer.style.display = "block";
        sect1.style.display = "block";
        if (sect2) sect2.style.display = sect2OriginalDisplay; // hide it again
      })
      .catch(err => {
        console.error("PDF generation error:", err);
        // Restore visibility even if there was an error
        buttonContainer.style.display = "block";
        sect1.style.display = "block";
        if (sect2) sect2.style.display = sect2OriginalDisplay;
      });
  });
});
