const DIAL_MIN = 1;
const DIAL_MAX = 10;
const CODE_LENGTH = 3;
const ALLOW_REPEATS = false;
const SLOT_LABELS = ["A", "B", "C"];

const puzzle = {
  title: "Training Safe 001",
  clueKeys: [
    {
      name: "SUM KEY",
      targets: ["A", "C"],
      formula: "A + C = 11",
      text: "The left and right slots add to 11.",
      test: ([slotA, , slotC]) => slotA + slotC === 11,
    },
    {
      name: "SCALE KEY",
      targets: ["A", "B"],
      formula: "B = A × 2",
      text: "The center slot is double the left slot.",
      test: ([slotA, slotB]) => slotB === slotA * 2,
    },
    {
      name: "OFFSET KEY",
      targets: ["B", "C"],
      formula: "C = B − 1",
      text: "The right slot is one click lower than the center slot.",
      test: ([, slotB, slotC]) => slotC === slotB - 1,
    },
    {
      name: "PARITY KEY",
      targets: ["A", "B", "C"],
      formula: "odd(A, B, C) = 1",
      text: "Exactly one slot contains an odd number.",
      test: (code) => code.filter((number) => number % 2 !== 0).length === 1,
    },
  ],
};

const state = {
  selectedCode: [],
  validation: null,
  lastSelectedNumber: null,
  lastFilledSlot: null,
  lastCheck: null,
};

const codeSlots = document.querySelector("#codeSlots");
const dialButtons = document.querySelector("#dialButtons");
const clueList = document.querySelector("#clueList");
const resultText = document.querySelector("#resultText");
const integrityStatus = document.querySelector("#integrityStatus");
const moduleLight = document.querySelector("#moduleLight");
const diagnosticText = document.querySelector("#diagnosticText");
const clearButton = document.querySelector("#clearButton");
const openButton = document.querySelector("#openButton");
const safeFace = document.querySelector(".safe-face");
const dialNotice = document.querySelector("#dialNotice");

function getDialNumbers() {
  const numbers = [];

  for (let number = DIAL_MIN; number <= DIAL_MAX; number += 1) {
    numbers.push(number);
  }

  return numbers;
}

function hasRepeats(code) {
  return new Set(code).size !== code.length;
}

function generateCodes(length = CODE_LENGTH, prefix = []) {
  if (prefix.length === length) {
    return [prefix];
  }

  const codes = [];

  for (const number of getDialNumbers()) {
    if (!ALLOW_REPEATS && prefix.includes(number)) {
      continue;
    }

    codes.push(...generateCodes(length, [...prefix, number]));
  }

  return codes;
}

function codePassesClues(code, clues) {
  if (!ALLOW_REPEATS && hasRepeats(code)) {
    return false;
  }

  return clues.every((clue) => clue.test(code));
}

function validatePuzzle(clues) {
  const allCodes = generateCodes();
  const possibleSolutions = allCodes.filter((code) => codePassesClues(code, clues));

  return {
    totalCodes: allCodes.length,
    possibleSolutions,
    isFair: possibleSolutions.length === 1,
  };
}

function countPassedClues(code) {
  return puzzle.clueKeys.filter((clue) => clue.test(code)).length;
}

function codesMatch(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function getFilledSlotNames() {
  return SLOT_LABELS.slice(0, state.selectedCode.length);
}

function getNextSlotName() {
  return SLOT_LABELS[state.selectedCode.length] || null;
}

function injectDialNoticeStyles() {
  if (document.querySelector("#dialNoticeStyles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "dialNoticeStyles";
  style.textContent = `
    .dial-cap {
      width: 66%;
      grid-template-rows: auto auto;
      gap: 0.18rem;
      padding: 0.45rem;
      text-align: center;
    }

    .dial-notice-label {
      color: var(--brass);
      font-family: "Courier New", monospace;
      font-size: 0.52rem;
      letter-spacing: 0.12em;
      line-height: 1;
    }

    .dial-notice {
      color: var(--crt);
      font-family: "Courier New", monospace;
      font-size: clamp(1rem, 2.2vw, 1.75rem);
      font-weight: 800;
      letter-spacing: 0.04em;
      line-height: 0.95;
      text-shadow: 0 0 16px rgba(155, 245, 178, 0.42);
    }

    .dial-cap.notice-hot {
      border-color: rgba(155, 245, 178, 0.72);
      box-shadow: 0 0 20px rgba(155, 245, 178, 0.16), inset 0 0 16px rgba(155, 245, 178, 0.08);
    }

    .dial-cap.notice-ready {
      border-color: rgba(198, 155, 79, 0.76);
      box-shadow: 0 0 20px rgba(198, 155, 79, 0.16), inset 0 0 16px rgba(198, 155, 79, 0.08);
    }
  `;

  document.head.append(style);
}

function updateDialNotice() {
  if (!dialNotice) {
    return;
  }

  const dialCap = dialNotice.closest(".dial-cap");
  const nextSlot = getNextSlotName();

  dialCap?.classList.remove("notice-hot", "notice-ready");

  if (state.lastSelectedNumber === null) {
    dialNotice.textContent = "NEXT SLOT A";
    return;
  }

  if (nextSlot) {
    dialNotice.textContent = `SLOT ${state.lastFilledSlot} = ${state.lastSelectedNumber}`;
    dialCap?.classList.add("notice-hot");
    return;
  }

  dialNotice.textContent = `READY ${state.selectedCode.join("-")}`;
  dialCap?.classList.add("notice-ready");
}

function pulseSafeFace(className = "is-pulsing") {
  safeFace.classList.remove("is-pulsing", "is-open", "is-denied");
  void safeFace.offsetWidth;
  safeFace.classList.add(className);

  window.setTimeout(() => {
    safeFace.classList.remove(className);
  }, 520);
}

function getClueStatusClass(clue) {
  if (state.lastCheck) {
    return clue.test(state.lastCheck.code) ? "passed" : "failed";
  }

  const filledSlots = getFilledSlotNames();
  const nextSlot = getNextSlotName();
  const filledTargetCount = clue.targets.filter((target) => filledSlots.includes(target)).length;
  const allTargetsFilled = filledTargetCount === clue.targets.length;

  if (allTargetsFilled) {
    return "ready";
  }

  if (filledTargetCount > 0) {
    return "armed";
  }

  if (nextSlot && clue.targets.includes(nextSlot)) {
    return "listening";
  }

  return "idle";
}

function renderSlots() {
  codeSlots.innerHTML = "";

  for (let index = 0; index < CODE_LENGTH; index += 1) {
    const slot = document.createElement("div");
    const label = document.createElement("span");
    const valueText = document.createElement("span");
    const value = state.selectedCode[index];
    const slotName = SLOT_LABELS[index];
    const isCurrentTarget = index === state.selectedCode.length;
    const isRecent = slotName === state.lastFilledSlot;

    slot.className = [
      "slot",
      value ? "filled" : "empty",
      isCurrentTarget ? "current-target" : "",
      isRecent ? "recent-fill" : "",
    ].filter(Boolean).join(" ");

    slot.dataset.slot = slotName;
    slot.setAttribute("aria-label", `Slot ${slotName}: ${value || "empty"}`);

    label.className = "slot-label";
    label.textContent = `Slot ${slotName}`;

    valueText.className = "slot-value";
    valueText.textContent = value || "_";

    slot.append(label, valueText);
    codeSlots.append(slot);
  }
}

function renderDial() {
  dialButtons.innerHTML = "";

  for (const number of getDialNumbers()) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = number;
    button.dataset.number = String(number);
    button.className = number === state.lastSelectedNumber ? "last-selected" : "";
    button.disabled =
      state.selectedCode.length >= CODE_LENGTH ||
      (!ALLOW_REPEATS && state.selectedCode.includes(number));

    button.addEventListener("click", () => selectNumber(number));
    dialButtons.append(button);
  }
}

function renderClues() {
  clueList.innerHTML = "";

  puzzle.clueKeys.forEach((clue) => {
    const statusClass = getClueStatusClass(clue);
    const clueCard = document.createElement("article");
    clueCard.className = `clue-card ${statusClass}`;

    const name = document.createElement("strong");
    name.textContent = clue.name;

    const targets = document.createElement("div");
    targets.className = "clue-targets";

    const targetLabel = document.createElement("span");
    targetLabel.className = "target-label";
    targetLabel.textContent = "USES";
    targets.append(targetLabel);

    clue.targets.forEach((target) => {
      const chip = document.createElement("span");
      const isFilled = getFilledSlotNames().includes(target);
      chip.className = `target-chip ${isFilled ? "filled-target" : ""}`;
      chip.textContent = target;
      targets.append(chip);
    });

    const formula = document.createElement("p");
    formula.className = "clue-formula";
    formula.textContent = clue.formula;

    const text = document.createElement("p");
    text.textContent = clue.text;

    clueCard.append(name, targets, formula, text);
    clueList.append(clueCard);
  });
}

function renderDiagnostics() {
  const { validation } = state;

  if (!validation) {
    integrityStatus.textContent = "Checking safe...";
    diagnosticText.textContent = "Scanning clue field...";
    return;
  }

  if (validation.isFair) {
    integrityStatus.textContent = "Validated";
    moduleLight.textContent = "ONLINE";
    integrityStatus.classList.remove("bad");
    moduleLight.classList.remove("bad");
    diagnosticText.textContent = `${validation.totalCodes} possible codes scanned. Clue field resolves to one fair solution.`;
  } else {
    integrityStatus.textContent = "Unstable";
    moduleLight.textContent = "FAULT";
    integrityStatus.classList.add("bad");
    moduleLight.classList.add("bad");
    diagnosticText.textContent = `${validation.totalCodes} possible codes scanned. Clue field resolves to ${validation.possibleSolutions.length} solutions. Safe rejected.`;
  }
}

function render() {
  renderSlots();
  renderDial();
  updateDialNotice();
  renderClues();
  renderDiagnostics();
}

function selectNumber(number) {
  if (state.selectedCode.length >= CODE_LENGTH) {
    return;
  }

  if (!ALLOW_REPEATS && state.selectedCode.includes(number)) {
    return;
  }

  state.lastSelectedNumber = number;
  state.lastFilledSlot = SLOT_LABELS[state.selectedCode.length];
  state.lastCheck = null;
  state.selectedCode.push(number);

  resultText.className = "result";
  resultText.textContent = `Dial clicked ${number} into Slot ${state.lastFilledSlot}.`;

  render();
  pulseSafeFace();
}

function clearCode() {
  state.selectedCode = [];
  state.lastSelectedNumber = null;
  state.lastFilledSlot = null;
  state.lastCheck = null;

  resultText.className = "result";
  resultText.textContent = "Awaiting code.";
  render();
}

function openSafe() {
  if (!state.validation?.isFair) {
    resultText.className = "result locked";
    resultText.textContent = "Module fault. This safe has no proven fair solution.";
    pulseSafeFace("is-denied");
    return;
  }

  if (state.selectedCode.length !== CODE_LENGTH) {
    resultText.className = "result locked";
    resultText.textContent = "LOCKED — enter all three numbers first.";
    pulseSafeFace("is-denied");
    return;
  }

  const solution = state.validation.possibleSolutions[0];
  state.lastCheck = { code: [...state.selectedCode] };
  render();

  if (codesMatch(state.selectedCode, solution)) {
    resultText.className = "result open";
    resultText.textContent = `SAFE OPEN — ${solution.join("-")}. The tumblers surrender.`;
    pulseSafeFace("is-open");
    return;
  }

  const passed = countPassedClues(state.selectedCode);
  resultText.className = "result locked";
  resultText.textContent = `LOCKED — module agreement: ${passed}/${puzzle.clueKeys.length} keys.`;
  pulseSafeFace("is-denied");
}

function boot() {
  state.validation = validatePuzzle(puzzle.clueKeys);

  injectDialNoticeStyles();
  render();

  clearButton.addEventListener("click", clearCode);
  openButton.addEventListener("click", openSafe);
}

boot();
