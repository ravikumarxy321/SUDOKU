// DOM Ready
document.addEventListener("DOMContentLoaded", function () {
  generatePuzzle();
  startTimer();
});

// Globals
let timerInterval, secondsPassed = 0;

// Puzzle generation
function generatePuzzle(difficulty = 'medium') {
  const clues = {
    easy: 45,
    medium: 35,
    hard: 25
  }[difficulty] || 35;

  const board = document.getElementById('sudoku-board');
  board.innerHTML = '';
  const puzzle = generateUniquePuzzle(clues);

  puzzle.forEach((row, i) => {
    row.forEach((val, j) => {
      const cellWrapper = document.createElement('div');
      cellWrapper.classList.add('cell-wrapper');

      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.inputMode = 'numeric';
      input.classList.add('cell-input');
      input.addEventListener('input', () => {
        input.value = input.value.replace(/[^1-9]/g, '');
      });

      const spinner = document.createElement('div');
      spinner.classList.add('spinner');
      spinner.style.display = 'none';

      const upBtn = document.createElement('button');
      upBtn.textContent = '▲';
      upBtn.classList.add('spin-btn');
      upBtn.addEventListener('click', () => {
        let val = parseInt(input.value) || 0;
        input.value = val < 9 ? val + 1 : 1;
      });

      const downBtn = document.createElement('button');
      downBtn.textContent = '▼';
      downBtn.classList.add('spin-btn');
      downBtn.addEventListener('click', () => {
        let val = parseInt(input.value) || 10;
        input.value = val > 1 ? val - 1 : 9;
      });

      spinner.appendChild(upBtn);
      spinner.appendChild(downBtn);

      if (val !== 0) {
        input.value = val;
        input.readOnly = true;
      } else {
        input.addEventListener('focus', () => {
          document.querySelectorAll('.spinner').forEach(s => s.style.display = 'none');
          spinner.style.display = 'flex';
        });

        input.addEventListener('blur', () => {
          setTimeout(() => spinner.style.display = 'none', 100);
        });
      }

      cellWrapper.appendChild(input);
      cellWrapper.appendChild(spinner);
      board.appendChild(cellWrapper);
    });
  });

  startTimer();
}

// Timer
function startTimer() {
  clearInterval(timerInterval);
  secondsPassed = 0;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    secondsPassed++;
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const min = String(Math.floor(secondsPassed / 60)).padStart(2, '0');
  const sec = String(secondsPassed % 60).padStart(2, '0');
  document.getElementById('timer').textContent = `⏱ ${min}:${sec}`;
}

// Check solution
function checkSolution() {
  const inputs = document.querySelectorAll('.cell-wrapper input');
  const board = [];

  for (let i = 0; i < 9; i++) {
    board[i] = [];
    for (let j = 0; j < 9; j++) {
      const val = inputs[i * 9 + j].value;
      const num = parseInt(val);
      if (isNaN(num) || num < 1 || num > 9) {
        showMessage("❌ Incomplete or invalid entries.", "red");
        return;
      }
      board[i][j] = num;
    }
  }

  if (isValidSudoku(board)) {
    updateStats(true);
    showMessage("✅ Sudoku solved correctly!", "green");
  } else {
    showMessage("❌ Invalid solution. Try again.", "red");
  }
}

// Reset
function resetBoard() {
  if (confirm("Clear your progress?")) {
    const inputs = document.querySelectorAll('.cell-wrapper input:not([readonly])');
    inputs.forEach(input => input.value = '');
  }
}

// Hint
function giveHint() {
  const puzzle = getSamplePuzzle();
  const inputs = document.querySelectorAll('.cell-wrapper input');
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].value === '' && !inputs[i].readOnly) {
      const row = Math.floor(i / 9);
      const col = i % 9;
      inputs[i].value = puzzle[row][col];
      break;
    }
  }
}

// Dark mode
function toggleDarkMode() {
  document.body.classList.toggle('dark');
}

// Show message
function showMessage(text, color = "black") {
  const msg = document.getElementById("message");
  msg.textContent = text;
  msg.style.color = color;
}

// Validate Sudoku
function isValidSudoku(board) {
  const seen = new Set();
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const num = board[i][j];
      const rowKey = `row-${i}-${num}`;
      const colKey = `col-${j}-${num}`;
      const boxKey = `box-${Math.floor(i / 3)}-${Math.floor(j / 3)}-${num}`;
      if (seen.has(rowKey) || seen.has(colKey) || seen.has(boxKey)) return false;
      seen.add(rowKey, colKey, boxKey);
    }
  }
  return true;
}

// Puzzle Generator
function isSafe(board, row, col, num) {
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num || board[x][col] === num) return false;
  }
  const startRow = row - row % 3;
  const startCol = col - col % 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num) return false;
    }
  }
  return true;
}

function solveSudoku(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function fillBoard(board) {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const shuffled = [...nums].sort(() => Math.random() - 0.5);
        for (let num of shuffled) {
          if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function countSolutions(board) {
  let count = 0;
  function helper(b) {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (b[i][j] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isSafe(b, i, j, num)) {
              b[i][j] = num;
              helper(b);
              b[i][j] = 0;
            }
          }
          return;
        }
      }
    }
    count++;
  }
  helper(JSON.parse(JSON.stringify(board)));
  return count;
}

function makePuzzle(fullBoard, clues = 35) {
  const puzzle = JSON.parse(JSON.stringify(fullBoard));
  let removed = 0;
  while (removed < 81 - clues) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== 0) {
      const temp = puzzle[row][col];
      puzzle[row][col] = 0;
      if (countSolutions(JSON.parse(JSON.stringify(puzzle))) !== 1) {
        puzzle[row][col] = temp;
      } else {
        removed++;
      }
    }
  }
  return puzzle;
}

function generateUniquePuzzle(clues = 35) {
  const emptyBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillBoard(emptyBoard);
  return makePuzzle(emptyBoard, clues);
}

function getSamplePuzzle() {
  return generateUniquePuzzle(35);
}

// Score Tracking
function updateStats(success) {
  const stats = JSON.parse(localStorage.getItem('sudokuStats')) || {
    solved: 0,
    totalTime: 0,
    bestTime: null
  };

  if (success) {
    stats.solved++;
    stats.totalTime += secondsPassed;
    if (stats.bestTime === null || secondsPassed < stats.bestTime) {
      stats.bestTime = secondsPassed;
    }
  }

  localStorage.setItem('sudokuStats', JSON.stringify(stats));
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
  const inputs = Array.from(document.querySelectorAll('.cell-wrapper input'));
  const index = inputs.findIndex(i => i === document.activeElement);
  if (index === -1) return;

  const row = Math.floor(index / 9);
  const col = index % 9;

  switch (e.key) {
    case 'ArrowRight': inputs[index + 1]?.focus(); break;
    case 'ArrowLeft': inputs[index - 1]?.focus(); break;
    case 'ArrowDown': inputs[index + 9]?.focus(); break;
    case 'ArrowUp': inputs[index - 9]?.focus(); break;
    default:
      if (/^[1-9]$/.test(e.key)) inputs[index].value = e.key;
  }
});


function checkSolution() {
  const inputs = document.querySelectorAll('.cell-wrapper input');
  const board = [];

  for (let i = 0; i < 9; i++) {
    board[i] = [];
    for (let j = 0; j < 9; j++) {
      const val = inputs[i * 9 + j].value;
      const num = parseInt(val);
      if (isNaN(num) || num < 1 || num > 9) {
        showMessage("❌ Incomplete or invalid entries.", "red");
        return;
      }
      board[i][j] = num;
    }
  }

  if (isValidSudoku(board)) {
    updateStats(true);
    showMessage("✅ Sudoku solved correctly!", "green");
  } else {
    showMessage("❌ Invalid solution. Try again.", "red");
  }
}
