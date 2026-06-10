(() => {
  const ADVANCE_DELAY_MS = 1400;
  const CHECK_DELAY_MS = 80;

  const resultText = document.querySelector("#resultText");
  const newSafeButton = document.querySelector("#newSafeButton");
  const clearButton = document.querySelector("#clearButton");
  const openButton = document.querySelector("#openButton");

  let advanceTimer = null;

  function cancelAdvance() {
    if (advanceTimer === null) {
      return;
    }

    window.clearTimeout(advanceTimer);
    advanceTimer = null;
  }

  function resultIsOpen() {
    return Boolean(resultText?.classList.contains("open"));
  }

  function scheduleAdvance() {
    cancelAdvance();

    if (!resultIsOpen()) {
      return;
    }

    advanceTimer = window.setTimeout(() => {
      advanceTimer = null;
      newSafeButton?.click();
    }, ADVANCE_DELAY_MS);
  }

  openButton?.addEventListener("click", () => {
    window.setTimeout(scheduleAdvance, CHECK_DELAY_MS);
  });

  clearButton?.addEventListener("click", cancelAdvance);
  newSafeButton?.addEventListener("click", cancelAdvance);
})();
