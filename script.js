const WORDS_URL = "./data/words.json";
const ROWS = 6;
const COLS = 5;

const boardEl = document.getElementById("board");
const keyboardEl = document.getElementById("keyboard");
const messageEl = document.getElementById("message");
const newGameBtn = document.getElementById("newGameBtn");
const helpBtn = document.getElementById("helpBtn");
const helpModal = document.getElementById("helpModal");
const closeHelp = document.getElementById("closeHelp");
const hintBtn = document.getElementById("hintBtn");
const giveUpBtn = document.getElementById("giveUpBtn");
const scoreEl = document.getElementById("score");
const scoreDialog = document.getElementById("scoreDialog");
const scoreTitle = document.getElementById("scoreTitle");
const scoreText = document.getElementById("scoreText");
const dialogNextBtn = document.getElementById("dialogNextBtn");
const dialogCloseBtn = document.getElementById("dialogCloseBtn");
const themeBtn = document.getElementById("themeBtn");

let words = [];
let answer = "";
let currentRow = 0;
let currentGuess = "";
let currentInput = Array(COLS).fill("");
let cluePositions = new Set();
let inputIndex = 0;
let gameOver = false;
let keyStates = {};
let hintPositions = new Set();
let hintsUsed = 0;
let totalScore = 0;
let wordsSolved = 0;

const KEY_ROWS = [
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l"],
  ["enter","z","x","c","v","b","n","m","backspace"]
];

const STORAGE_KEY = "wordle-v1-theme";

function buildBoard() {
  boardEl.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    const row = document.createElement("div");
    row.className = "row";
    for (let c = 0; c < COLS; c++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.dataset.row = r;
      tile.dataset.col = c;
      row.appendChild(tile);
    }
    boardEl.appendChild(row);
  }
}

function buildKeyboard() {
  keyboardEl.innerHTML = "";
  KEY_ROWS.forEach(keys => {
    const row = document.createElement("div");
    row.className = "key-row";

    keys.forEach(value => {
      const key = document.createElement("button");
      key.className = "key";
      key.dataset.key = value;
      key.textContent =
        value === "backspace" ? "⌫" :
        value === "enter" ? "ENTER" :
        value.toUpperCase();

      key.addEventListener("click", () => handleKey(value));
      row.appendChild(key);
    });

    keyboardEl.appendChild(row);
  });
}

function pickAnswer() {
  answer = words[Math.floor(Math.random() * words.length)].toLowerCase();
}

function updateScoreDisplay() {
  scoreEl.textContent = totalScore.toLocaleString();
}

function getKnownClues() {
  const clues = Array(COLS).fill("");

  // Green letters discovered from previous submitted guesses.
  for (let r = 0; r < currentRow; r++) {
    const row = boardEl.children[r];
    if (!row) continue;

    for (let c = 0; c < COLS; c++) {
      const tile = row.children[c];
      if (tile.classList.contains("correct")) {
        clues[c] = tile.textContent.toLowerCase();
      }
    }
  }

  // Hints remain visible on every following row until the word changes.
  hintPositions.forEach(pos => {
    clues[pos] = answer[pos];
  });

  return clues;
}

function updateBoard() {
  const row = boardEl.children[currentRow];
  if (!row) return;

  const clues = getKnownClues();
  cluePositions = new Set();

  for (let i = 0; i < COLS; i++) {
    const tile = row.children[i];
    const typed = currentInput[i] || "";
    const clue = clues[i] || "";
    const value = typed || clue;

    tile.textContent = value.toUpperCase();
    tile.classList.toggle("filled", Boolean(value));
    tile.classList.toggle("hint", Boolean(!typed && clue && hintPositions.has(i)));

    if (clue && !typed) cluePositions.add(i);
  }

  currentGuess = currentInput.join("") || clues.join("");
}

function showMessage(text, duration = 1500) {
  messageEl.textContent = text;
  messageEl.classList.remove("show");
  void messageEl.offsetWidth;
  messageEl.classList.add("show");

  if (duration) {
    clearTimeout(showMessage.timer);
    showMessage.timer = setTimeout(() => {
      messageEl.textContent = "";
    }, duration);
  }
}

function evaluateGuess(guess, target) {
  const result = Array(COLS).fill("absent");
  const remaining = target.split("");

  for (let i = 0; i < COLS; i++) {
    if (guess[i] === target[i]) {
      result[i] = "correct";
      remaining[i] = null;
    }
  }

  for (let i = 0; i < COLS; i++) {
    if (result[i] === "correct") continue;
    const index = remaining.indexOf(guess[i]);
    if (index !== -1) {
      result[i] = "present";
      remaining[index] = null;
    }
  }

  return result;
}

function setKeyState(letter, state) {
  const rank = { absent: 1, present: 2, correct: 3 };
  if (!keyStates[letter] || rank[state] > rank[keyStates[letter]]) {
    keyStates[letter] = state;
  }

  const key = keyboardEl.querySelector(`[data-key="${letter}"]`);
  if (key) {
    key.classList.remove("absent", "present", "correct");
    key.classList.add(keyStates[letter]);
  }
}

function revealGuess(guess, result) {
  const row = boardEl.children[currentRow];

  result.forEach((state, i) => {
    const tile = row.children[i];
    setTimeout(() => {
      tile.classList.add("flip", state);
      setKeyState(guess[i], state);
    }, i * 260);
  });
}

/*
 * Hint logic:
 * 1. Never hint a position that has already been discovered GREEN.
 * 2. YELLOW is fair game: reveal its correct position as a hint.
 * 3. Otherwise choose an as-yet-undiscovered position.
 *
 * A position is considered discovered if it has ever been correctly solved
 * (green) in a submitted guess during this word.
 */
function getDiscoveredGreenPositions() {
  const discovered = new Set();

  for (let r = 0; r < currentRow; r++) {
    const row = boardEl.children[r];
    if (!row) continue;

    for (let c = 0; c < COLS; c++) {
      const tile = row.children[c];
      if (tile.classList.contains("correct")) {
        discovered.add(c);
      }
    }
  }

  return discovered;
}

function getYellowPositions() {
  const positions = [];

  for (let r = 0; r < currentRow; r++) {
    const row = boardEl.children[r];
    if (!row) continue;

    for (let c = 0; c < COLS; c++) {
      const tile = row.children[c];
      if (tile.classList.contains("present")) {
        positions.push(c);
      }
    }
  }

  return positions;
}

function giveHint() {
  if (gameOver) return;

  const discoveredGreen = getDiscoveredGreenPositions();

  // Prefer a yellow letter because it is information the player already
  // discovered but does not yet know the correct position for.
  const yellowCandidates = [...new Set(getYellowPositions())]
    .filter(pos => !discoveredGreen.has(pos));

  // More useful: find the actual answer positions represented by yellow
  // letters, but only if that answer position is not already green.
  const hintedYellowLetters = [];

  for (let r = 0; r < currentRow; r++) {
    const row = boardEl.children[r];
    if (!row) continue;

    for (let c = 0; c < COLS; c++) {
      const tile = row.children[c];
      if (tile.classList.contains("present")) {
        const letter = tile.textContent.toLowerCase();
        for (let answerPos = 0; answerPos < COLS; answerPos++) {
          if (
            answer[answerPos] === letter &&
            !discoveredGreen.has(answerPos) &&
            !hintPositions.has(answerPos)
          ) {
            hintedYellowLetters.push({ answerPos, letter });
          }
        }
      }
    }
  }

  let choice = hintedYellowLetters[0];

  // Otherwise reveal an unknown position. Never reveal a green position.
  if (!choice) {
    const unknownPositions = [];
    for (let i = 0; i < COLS; i++) {
      if (!discoveredGreen.has(i) && !hintPositions.has(i)) {
        unknownPositions.push(i);
      }
    }

    if (unknownPositions.length) {
      const answerPos =
        unknownPositions[Math.floor(Math.random() * unknownPositions.length)];
      choice = { answerPos, letter: answer[answerPos] };
    }
  }

  // All positions are already known/hinted.
  if (!choice) {
    showMessage("You've already uncovered every letter!");
    return;
  }

  hintPositions.add(choice.answerPos);
  hintsUsed++;

  updateBoard();

  showMessage(
    `Hint: position ${choice.answerPos + 1} is ${choice.letter.toUpperCase()}`,
    2200
  );
}

/*
 * Score formula:
 * Base = 600 points.
 * Fewer attempts earn more.
 * Every hint reduces the word score by 100.
 * Minimum successful score is 100.
 *
 * 1st try: 600
 * 2nd: 500
 * 3rd: 400
 * 4th: 300
 * 5th: 200
 * 6th: 100
 *
 * Hints: -100 each, never below 100 for a successful solve.
 */
function calculateWordScore() {
  const attemptBonus = (ROWS - currentRow) * 100;
  return Math.max(100, attemptBonus - hintsUsed * 100);
}

function showScoreDialog(title, body, nextAction = "next") {
  scoreTitle.textContent = title;
  scoreText.innerHTML = body;
  dialogNextBtn.textContent = nextAction === "next" ? "Next word" : "Play again";
  dialogNextBtn.dataset.action = nextAction;
  dialogCloseBtn.style.display = nextAction === "next" ? "inline-flex" : "none";
  scoreDialog.classList.remove("hidden");
}

function finishWin() {
  gameOver = true;
  const wordScore = calculateWordScore();
  totalScore += wordScore;
  wordsSolved++;
  updateScoreDisplay();

  const attempts = currentRow + 1;
  showScoreDialog(
    "Congratulations!",
    `You found <strong>${answer.toUpperCase()}</strong> in ${attempts} ${attempts === 1 ? "try" : "tries"}.<br><br>
     Word score: <strong>+${wordScore}</strong><br>
     Total score: <strong>${totalScore.toLocaleString()}</strong>`,
    "next"
  );
}

function finishLoss(reason) {
  gameOver = true;

  const finalScore = totalScore;
  totalScore = 0;
  updateScoreDisplay();

  const message =
    reason === "giveup"
      ? `You gave up on <strong>${answer.toUpperCase()}</strong>.`
      : `The word was <strong>${answer.toUpperCase()}</strong>.`;

  showScoreDialog(
    "Game over",
    `${message}<br><br>
     Words solved: <strong>${wordsSolved}</strong><br>
     Score: <strong>${finalScore.toLocaleString()}</strong>`,
    "restart"
  );
}

function submitGuess() {
  const clues = getKnownClues();
  const guess = currentInput.map((letter, i) => letter || clues[i]).join("");
  currentGuess = guess;

  if (guess.length !== COLS) {
    showMessage("Not enough letters");
    return;
  }

  if (!words.includes(guess)) {
    showMessage("Not in word list");
    return;
  }

  // Known green/hint letters are visual clues, but typed letters can overwrite them.
  // This lets the player test any other word while still seeing the clues.

  const result = evaluateGuess(guess, answer);
  revealGuess(guess, result);

  const rowFinishedAt = COLS * 260 + 500;

  setTimeout(() => {
    if (guess === answer) {
      finishWin();
      return;
    }

    currentRow++;
    currentGuess = "";
    currentInput = Array(COLS).fill("");
    inputIndex = 0;

    if (currentRow >= ROWS) {
      finishLoss("tries");
      return;
    }

    updateBoard();
  }, rowFinishedAt);
}

function handleKey(key) {
  if (gameOver) return;

  if (key === "enter") {
    submitGuess();
    return;
  }

  if (key === "backspace") {
    if (inputIndex > 0) {
      inputIndex--;
      currentInput[inputIndex] = "";
      updateBoard();
    }
    return;
  }

  if (/^[a-z]$/.test(key)) {
    // Once a letter has been confirmed absent (gray), silently block it.
    if (keyStates[key] === "absent") {
      showMessage(`${key.toUpperCase()} is not in the word`, 1400);
      return;
    }

    if (inputIndex < COLS) {
      currentInput[inputIndex] = key;
      inputIndex++;
      updateBoard();
    }
  }
}

function handlePhysicalKeyboard(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  const key = event.key.toLowerCase();

  if (key === "enter") {
    event.preventDefault();
    handleKey("enter");
  } else if (key === "backspace") {
    event.preventDefault();
    handleKey("backspace");
  } else if (/^[a-z]$/.test(key)) {
    event.preventDefault();
    handleKey(key);
  }
}

function newGame() {
  currentRow = 0;
  currentGuess = "";
  currentInput = Array(COLS).fill("");
  inputIndex = 0;
  cluePositions = new Set();
  gameOver = false;
  keyStates = {};
  hintPositions = new Set();
  hintsUsed = 0;
  messageEl.textContent = "";
  scoreDialog.classList.add("hidden");
  buildBoard();
  buildKeyboard();
  pickAnswer();
}

function nextWord() {
  scoreDialog.classList.add("hidden");
  newGame();
}

function restartScoreGame() {
  totalScore = 0;
  wordsSolved = 0;
  updateScoreDisplay();
  scoreDialog.classList.add("hidden");
  newGame();
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeBtn.textContent = theme === "dark" ? "☀" : "☾";
  themeBtn.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
  );
  localStorage.setItem(STORAGE_KEY, theme);
}

newGameBtn.addEventListener("click", () => {
  if (gameOver) {
    nextWord();
  } else {
    newGame();
  }
});

hintBtn.addEventListener("click", giveHint);

giveUpBtn.addEventListener("click", () => {
  if (!gameOver) finishLoss("giveup");
});

dialogNextBtn.addEventListener("click", () => {
  if (dialogNextBtn.dataset.action === "restart") {
    restartScoreGame();
  } else {
    nextWord();
  }
});

dialogCloseBtn.addEventListener("click", () => {
  scoreDialog.classList.add("hidden");
});

helpBtn.addEventListener("click", () => {
  helpModal.classList.remove("hidden");
});

closeHelp.addEventListener("click", () => {
  helpModal.classList.add("hidden");
});

helpModal.addEventListener("click", event => {
  if (event.target === helpModal) helpModal.classList.add("hidden");
});

themeBtn.addEventListener("click", () => {
  const current = document.documentElement.dataset.theme || "light";
  applyTheme(current === "dark" ? "light" : "dark");
});

document.addEventListener("keydown", handlePhysicalKeyboard);

async function init() {
  try {
    const response = await fetch(WORDS_URL);
    if (!response.ok) throw new Error("Could not load word database.");
    words = await response.json();

    if (!Array.isArray(words) || words.length === 0) {
      throw new Error("Word database is empty.");
    }

    const savedTheme = localStorage.getItem(STORAGE_KEY);
    applyTheme(savedTheme === "dark" ? "dark" : "light");
    updateScoreDisplay();
    newGame();
  } catch (error) {
    console.error(error);
    showMessage("Could not load the word database.", 0);
  }
}

init();
