 function updateSelectStyle(select) {
    select.classList.toggle("empty", select.value === "");
    select.classList.toggle("filled", select.value !== "");
  }

  function updateInputBorder(input) {
    input.classList.toggle("empty", input.value.trim() === "");
    input.classList.toggle("filled", input.value.trim() !== "");
  }

  // ✅ Validate all inputs & selects in the document
  function revalidateAllFields() {
    document.querySelectorAll("select").forEach(updateSelectStyle);
    document.querySelectorAll("input").forEach(updateInputBorder);
  }

  // Event: change (select dropdowns)
  document.addEventListener("change", e => {
    if (e.target.tagName.toLowerCase() === "select") {
      updateSelectStyle(e.target);
    }
  });

  // Event: typing (inputs)
  document.addEventListener("input", e => {
    if (e.target.tagName.toLowerCase() === "input") {
      updateInputBorder(e.target);
    }
  });

  // ✅ Event: paste (anywhere → revalidate everything)
  document.addEventListener("paste", () => {
    setTimeout(revalidateAllFields, 20);
  });

  // ✅ Event: drop text (drag + drop)
  document.addEventListener("drop", () => {
    setTimeout(revalidateAllFields, 20);
  });

  // ✅ Monitor dynamic elements
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (!node.querySelectorAll) return;

        if (node.tagName) {
          const tag = node.tagName.toLowerCase();
          if (tag === "select") updateSelectStyle(node);
          if (tag === "input") updateInputBorder(node);
        }

        node.querySelectorAll("select").forEach(updateSelectStyle);
        node.querySelectorAll("input").forEach(updateInputBorder);
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // ✅ Validate everything on page load + on back/forward restore
  window.addEventListener("load", revalidateAllFields);
  window.addEventListener("pageshow", revalidateAllFields);
