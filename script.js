const DIAL_MIN = 1;
const DIAL_MAX = 10;
const CODE_LENGTH = 3;
const ALLOW_REPEATS = false;

const puzzle = {
  title: "Training Safe 001",
  clueKeys: [
    {
      name: "BRASS KEY",
      text: "The first and third numbers add to 11.",
      test: ([first, , third]) => first + third === 11,
    },
    {
      name: "IRON KEY",
      text: "The middle number is double the first.",
      test: ([first, middle]) => middle === first * 2,
    },
    {
      name: "GLASS KEY",
      text: "The third number is one click lower than the middle.",
      test: ([, middle, third]) => third === middle - 1,
    },
    {
      name: "COPPER KEY",
      text: "Exactly one number is odd.",
      test: (code) => code.filter((number) => number % 2 !== 0).length === 1,
    },
  ],
};

const state = {
  selectedCode: [],
  validation: null,
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

function renderSlots() {
  codeSlots.innerHTML = "";

  for (let index = 0; index < CODE_LENGTH; index += 1) {
    const slot = document.createElement("div");
    const value = state.selectedCode[index];

    slot.className = `slot ${value ? "" : "empty"}`;
    slot.textContent = value || "_";
    slot.setAttribute("aria-label", `Code slot ${index + 1}: ${value || "empty"}`);

    codeSlots.append(slot);
  }
}

function renderDial() {
  dialButtons.innerHTML = "";

  for (const number of getDialNumbers()) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = number;
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
    const clueCard = document.createElement("article");
    clueCard.className = "clue-card";

    const name = document.createElement("strong");
    name.textContent = clue.name;

    const text = document.createElement("p");
    text.textContent = clue.text;

    clueCard.append(name, text);
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
  renderDiagnostics();
}

function selectNumber(number) {
  if (state.selectedCode.length >= CODE_LENGTH) {
    return;
  }

  if (!ALLOW_REPEATS && state.selectedCode.includes(number)) {
    return;
  }

  state.selectedCode.push(number);
  resultText.className = "result";
  resultText.textContent = "Code staged.";
  render();
}

function clearCode() {
  state.selectedCode = [];
  resultText.className = "result";
  resultText.textContent = "Awaiting code.";
  render();
}

function openSafe() {
  if (!state.validation?.isFair) {
    resultText.className = "result locked";
    resultText.textContent = "Module fault. This safe has no proven fair solution.";
    return;
  }

  if (state.selectedCode.length !== CODE_LENGTH) {
    resultText.className = "result locked";
    resultText.textContent = "LOCKED — enter all three numbers first.";
    return;
  }

  const solution = state.validation.possibleSolutions[0];

  if (codesMatch(state.selectedCode, solution)) {
    resultText.className = "result open";
    resultText.textContent = `SAFE OPEN — ${solution.join("-")}. The tumblers surrender.`;
    return;
  }

  const passed = countPassedClues(state.selectedCode);
  resultText.className = "result locked";
  resultText.textContent = `LOCKED — module agreement: ${passed}/${puzzle.clueKeys.length} keys.`;
}

function boot() {
  state.validation = validatePuzzle(puzzle.clueKeys);

  renderClues();
  render();

  clearButton.addEventListener("click", clearCode);
  openButton.addEventListener("click", openSafe);
}

boot();
