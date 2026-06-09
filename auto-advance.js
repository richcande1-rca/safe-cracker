(() => {
  const AUTO_ADVANCE_AFTER_OPEN_MS = 1400;

  const resultText = document.querySelector("#resultText");
  const newSafeButton = document.querySelector("#newSafeButton");
  const clearButton = document.querySelector("#clearButton");
  const openButton = document.querySelector("#openButton");

  let autoAdvanceTimer = null;

  function cancelAutoAdvance() {
    if (autoAdvanceTimer === null) {
      return;
    }

    window.clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }

  function scheduleAutoAdvance() {
    if (!resultText?.classList.contains("open")) {
      return;
    }

    if (!resultText.textContent.startsWith("SAFE OPEN")) {
      return;
    }

    cancelAutoAdvance();

    autoAdvanceTimer = window.setTimeout(() => {
      autoAdvanceTimer = null;
      newSafeButton?.click();
    }, AUTO_ADVANCE_AFTER_OPEN_MS);
  }

  if (resultText && newSafeButton) {
    const resultObserver = new MutationObserver(scheduleAutoAdvance);

    resultObserver.observe(resultText, {
      attributes: true,
      attributeFilter: ["class"],
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  clearButton?.addEventListener("click", cancelAutoAdvance);
  newSafeButton?.addEventListener("click", cancelAutoAdvance);
  openButton?.addEventListener("click", cancelAutoAdvance);
})();
