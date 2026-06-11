const DIAL_MIN = 1;
const DIAL_MAX = 10;
const CODE_LENGTH = 3;
const ALLOW_REPEATS = false;
const SLOT_LABELS = ["A", "B", "C"];

const puzzleBank = [
  {
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
  },
  {
    title: "Training Safe 002",
    clueKeys: [
      {
        name: "SUM KEY",
        targets: ["A", "C"],
        formula: "A + C = 7",
        text: "The left and right slots add to 7.",
        test: ([slotA, , slotC]) => slotA + slotC === 7,
      },
      {
        name: "GAP KEY",
        targets: ["B", "C"],
        formula: "B − C = 4",
        text: "The center slot is four clicks higher than the right slot.",
        test: ([, slotB, slotC]) => slotB - slotC === 4,
      },
      {
        name: "PAIR KEY",
        targets: ["A", "B"],
        formula: "A + B = 11",
        text: "The left and center slots add to 11.",
        test: ([slotA, slotB]) => slotA + slotB === 11,
      },
      {
        name: "OFFSET KEY",
        targets: ["A", "C"],
        formula: "C = A + 3",
        text: "The right slot is three clicks higher than the left slot.",
        test: ([slotA, , slotC]) => slotC === slotA + 3,
      },
    ],
  },
  {
    title: "Training Safe 003",
    clueKeys: [
      {
        name: "SCALE KEY",
        targets: ["A", "B"],
        formula: "A = B × 2",
        text: "The left slot is double the center slot.",
        test: ([slotA, slotB]) => slotA === slotB * 2,
      },
      {
        name: "TOTAL KEY",
        targets: ["A", "B", "C"],
        formula: "A + B + C = 19",
        text: "All three slots add to 19.",
        test: ([slotA, slotB, slotC]) => slotA + slotB + slotC === 19,
      },
      {
        name: "GAP KEY",
        targets: ["A", "C"],
        formula: "C − A = 4",
        text: "The right slot is four clicks higher than the left slot.",
        test: ([slotA, , slotC]) => slotC - slotA === 4,
      },
      {
        name: "PARITY KEY",
        targets: ["B"],
        formula: "B is odd",
        text: "The center slot is odd.",
        test: ([, slotB]) => slotB % 2 !== 0,
      },
    ],
  },
  {
    title: "Training Safe 004",
    clueKeys: [
      {
        name: "SUM KEY",
        targets: ["A", "B"],
        formula: "A + B = 13",
        text: "The left and center slots add to 13.",
        test: ([slotA, slotB]) => slotA + slotB === 13,
      },
      {
        name: "SCALE KEY",
        targets: ["B", "C"],
        formula: "B = C × 2",
        text: "The center slot is double the right slot.",
        test: ([, slotB, slotC]) => slotB === slotC * 2,
      },
      {
        name: "GAP KEY",
        targets: ["A", "C"],
        formula: "A − C = 7",
        text: "The left slot is seven clicks higher than the right slot.",
        test: ([slotA, , slotC]) => slotA - slotC === 7,
      },
      {
        name: "PARITY KEY",
        targets: ["A", "B", "C"],
        formula: "even(A, B, C) = 2",
        text: "Exactly two slots contain even numbers.",
        test: (code) => code.filter((number) => number % 2 === 0).length === 2,
      },
    ],
  },
  {
    title: "Expert Safe 001",
    clueKeys: [
      {
        name: "PEAK KEY",
        targets: ["B"],
        formula: "B is highest",
        text: "The highest number is in the center slot.",
        test: ([slotA, slotB, slotC]) => slotB > slotA && slotB > slotC,
      },
      {
        name: "POSITION KEY",
        targets: ["A", "B", "C"],
        formula: "A is not smallest",
        text: "The left slot does not contain the smallest number.",
        test: ([slotA, slotB, slotC]) => slotA !== Math.min(slotA, slotB, slotC),
      },
      {
        name: "COUNT KEY",
        targets: ["A", "B", "C"],
        formula: "even(A, B, C) = 2",
        text: "Exactly two slots contain even numbers.",
        test: (code) => code.filter((number) => number % 2 === 0).length === 2,
      },
      {
        name: "SEPARATION KEY",
        targets: ["A", "B", "C"],
        formula: "no neighbors",
        text: "No two numbers are consecutive.",
        test: (code) => code.every((number, index) =>
          code.every((otherNumber, otherIndex) =>
            index === otherIndex || Math.abs(number - otherNumber) !== 1,
          ),
        ),
      },
      {
        name: "GAP KEY",
        targets: ["A", "C"],
        formula: "|A − C| = 4",
        text: "The left and right slots are four clicks apart.",
        test: ([slotA, , slotC]) => Math.abs(slotA - slotC) === 4,
      },
    ],
  },
];

const state = {
  activePuzzleIndex: 0,
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
const newSafeButton = document.querySelector("#newSafeButton");
const openButton = document.querySelector("#openButton");
const safeFace = document.querySelector(".safe-face");
const safeDial = document.querySelector(".outer-ring");
const dialNotice = document.querySelector("#dialNotice");
const currentSafeTitle = document.querySelector("#currentSafeTitle");

function getActivePuzzle() {
  return puzzleBank[state.activePuzzleIndex];
}

function getDialNumbers() {
  const numbers = [];

  for (let number = DIAL_MIN; number <= DIAL_MAX; number += 1) {
    numbers.push(number);
  }

  return numbers;
}

function getDialAngle(number) {
  if (number === null) {
    return 0;
  }

  const dialCount = DIAL_MAX - DIAL_MIN + 1;
  return (number - DIAL_MIN) * (360 / dialCount);
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
  return getActivePuzzle().clueKeys.filter((clue) => clue.test(code)).length;
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

function renderSafeTitle() {
  if (!currentSafeTitle) {
    return;
  }

  currentSafeTitle.textContent = getActivePuzzle().title;
}

function updateDialNotice() {
  if (!dialNotice) {
    return;
  }

  const dialPlaque = dialNotice.closest(".dial-plaque");
  const nextSlot = getNextSlotName();

  dialPlaque?.classList.remove("notice-hot", "notice-ready");

  if (state.lastSelectedNumber === null) {
    dialNotice.textContent = "NEXT SLOT A";
    return;
  }

  if (nextSlot) {
    dialNotice.textContent = `SLOT ${state.lastFilledSlot} = ${state.lastSelectedNumber}`;
    dialPlaque?.classList.add("notice-hot");
    return;
  }

  dialNotice.textContent = `READY ${state.selectedCode.join("-")}`;
  dialPlaque?.classList.add("notice-ready");
}

function updateDialSpin() {
  if (!safeDial) {
    return;
  }

  const angle = getDialAngle(state.lastSelectedNumber);
  safeDial.style.setProperty("--dial-spin", `${angle}deg`);
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

  getActivePuzzle().clueKeys.forEach((clue) => {
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
  const puzzle = getActivePuzzle();

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
    diagnosticText.textContent = `${puzzle.title}: ${validation.totalCodes} possible codes scanned. Clue field resolves to one fair solution.`;
  } else {
    integrityStatus.textContent = "Unstable";
    moduleLight.textContent = "FAULT";
    integrityStatus.classList.add("bad");
    moduleLight.classList.add("bad");
    diagnosticText.textContent = `${puzzle.title}: ${validation.totalCodes} possible codes scanned. Clue field resolves to ${validation.possibleSolutions.length} solutions. Safe rejected.`;
  }
}

function render() {
  renderSafeTitle();
  renderSlots();
  renderDial();
  updateDialSpin();
  updateDialNotice();
  renderClues();
  renderDiagnostics();
}

function resetEntry() {
  state.selectedCode = [];
  state.lastSelectedNumber = null;
  state.lastFilledSlot = null;
  state.lastCheck = null;
}

function loadSafe(puzzleIndex, announce = false) {
  state.activePuzzleIndex = puzzleIndex;
  resetEntry();
  state.validation = validatePuzzle(getActivePuzzle().clueKeys);

  if (announce) {
    resultText.className = "result";
    resultText.textContent = `${getActivePuzzle().title} loaded. Awaiting code.`;
  }

  render();
  pulseSafeFace();
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
  resetEntry();

  resultText.className = "result";
  resultText.textContent = "Awaiting code.";
  render();
}

function loadNextSafe() {
  const nextPuzzleIndex = (state.activePuzzleIndex + 1) % puzzleBank.length;
  loadSafe(nextPuzzleIndex, true);
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
  const attemptedCode = [...state.selectedCode];

  if (codesMatch(attemptedCode, solution)) {
    state.lastCheck = { code: attemptedCode };
    render();

    resultText.className = "result open";
    resultText.textContent = `SAFE OPEN — ${solution.join("-")}. The tumblers surrender.`;
    pulseSafeFace("is-open");
    return;
  }

  resetEntry();
  render();

  resultText.className = "result locked";
  resultText.textContent = "LOCKED — sequence rejected. Combination cleared.";
  pulseSafeFace("is-denied");
}

function boot() {
  loadSafe(0);

  clearButton.addEventListener("click", clearCode);
  newSafeButton.addEventListener("click", loadNextSafe);
  openButton.addEventListener("click", openSafe);
}

boot();
