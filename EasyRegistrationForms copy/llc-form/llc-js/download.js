document.addEventListener("DOMContentLoaded", () => {
  // Call setupDownload() for each button
  setupDownload("sole-download-btn", 3, "Sole Proprietor PDF");
  setupDownload("limited-company-download-btn", 5, "Limited Company PDF");
  setupDownload("partnership-download-btn", 4, "Partnership PDF");
});

/**
 * Sets up a download button with cost deduction and credit checking
 * @param {string} buttonId - The ID of the download button element
 * @param {number} cost - The GHS cost for this download
 * @param {string} description - Description to record in transaction
 */
function setupDownload(buttonId, cost, description) {
  const button = document.getElementById(buttonId);
  if (!button) return; // Skip if button not found

  button.addEventListener("click", async () => {
    try {
      // ✅ Ensure Firebase is ready and user is logged in
      const user = firebase.auth().currentUser;
      if (!user) {
        alert("Please log in before downloading.");
        window.location.href = "authenticate.html";
        return;
      }

      const db = firebase.firestore();
      const userRef = db.collection("users").doc(user.uid);
      const docSnap = await userRef.get();

      if (!docSnap.exists) {
        alert("User record not found.");
        return;
      }

      const userData = docSnap.data();
      const freeDownloads = Math.max(0, 2 - (userData.download_count || 0));

      // ✅ Check balance if no free downloads left
      if (freeDownloads === 0 && (userData.credit_balance || 0) < cost) {
        alert("Insufficient balance. Please top up your account.");
        return;
      }

      // ✅ Prepare UI elements for PDF generation
      const element = document.body;
      const buttonContainer = document.querySelector(".button-container");
      const sect1 = document.getElementById("sect1");
      const sect2 = document.querySelector(".sect2");
      const sect2OriginalDisplay = sect2 ? sect2.style.display : null;

      buttonContainer.style.display = "none";
      if (sect1) sect1.style.display = "none";
      if (sect2) sect2.style.display = "block";
      window.scrollTo(0, 0);

      await new Promise(resolve => setTimeout(resolve, 300));

      // ✅ Generate and save PDF
      const options = {
        margin: 0,
        filename: `${description.replace(/\s+/g, "_")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      };

      await html2pdf().set(options).from(element).save();

      // ✅ Restore visibility after download
      buttonContainer.style.display = "block";
      if (sect1) sect1.style.display = "block";
      if (sect2) sect2.style.display = sect2OriginalDisplay;

      // ✅ Deduct credits after successful download
      const updates = {
        download_count: firebase.firestore.FieldValue.increment(1)
      };

      if (freeDownloads === 0) {
        updates.credit_balance = firebase.firestore.FieldValue.increment(-cost);
        updates.transactions = firebase.firestore.FieldValue.arrayUnion({
          type: "debit",
          amount: cost,
          description,
          timestamp: new Date()
        });
      }

      await userRef.update(updates);
      alert(`✅ ${description} downloaded successfully!`);

    } catch (err) {
      console.error(`Download error for ${buttonId}:`, err);
      alert("An error occurred while processing your download.");
    } finally {
      // Always restore hidden sections
      const buttonContainer = document.querySelector(".button-container");
      const sect1 = document.getElementById("sect1");
      const sect2 = document.querySelector(".sect2");
      if (buttonContainer) buttonContainer.style.display = "block";
      if (sect1) sect1.style.display = "block";
      if (sect2) sect2.style.display = "none";
    }
  });
}
