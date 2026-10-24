import { closeDrill } from './domain.js';

/**
 * chimp-test.js — Chimp Test drill.
 */

const BEST_KEY = 'lab_ct_best';
const MAX_STRIKES = 3;

const state = {
  running: false,
  level: 1,
  strikes: 0,
  numbers: [],
  nextTarget: 1,
  tiles: [],
  acceptingInput: false,
  timer: null
};

const els = {};

export function initChimpTest() {
  Object.assign(els, {
    stageIntro: document.getElementById('ctStageIntro'),
    stagePlay: document.getElementById('ctStagePlay'),
    stageStats: document.getElementById('ctStageStats'),

    startBtn: document.getElementById('ctStartBtn'),
    retryBtn: document.getElementById('ctRetryBtn'),
    exitBtn: document.getElementById('ctExitBtn'),

    levelDisplay: document.getElementById('ctLevelDisplay'),
    livesDisplay: document.getElementById('ctLivesDisplay'),
    gridContainer: document.getElementById('ctGridContainer'),
    grid: document.getElementById('ctGrid'),
    statusText: document.getElementById('ctStatus'),

    statLevel: document.getElementById('ctStatLevel'),
    statBest: document.getElementById('ctStatBest')
  });

  els.startBtn.addEventListener('click', startSession);
  els.retryBtn.addEventListener('click', startSession);
  els.exitBtn.addEventListener('click', () => {
    closeDrill();
    resetToIntro();
  });

  resetToIntro();
}

export function resetToIntro() {
  cancelTimers();
  state.running = false;
  state.level = 1;
  state.strikes = 0;
  updateStrikes();
  showStage('intro');
}

function showStage(name) {
  const map = {
    intro: els.stageIntro,
    play: els.stagePlay,
    stats: els.stageStats
  };
  Object.entries(map).forEach(([k, el]) => {
    el.classList.toggle('is-active', k === name);
  });
}

function startSession() {
  state.running = true;
  state.level = 1;
  state.strikes = 0;
  updateStrikes();
  showStage('play');
  setupLevel();
}

function setupLevel() {
  cancelTimers();
  state.nextTarget = 1;
  state.acceptingInput = true;
  
  els.levelDisplay.textContent = state.level;
  els.statusText.textContent = 'Click in order.';

  const count = state.level + 3; // Level 1 = 4, Level 2 = 5, etc.
  buildBoard(count);
}

function buildBoard(count) {
  els.grid.innerHTML = '';
  
  const containerRect = els.gridContainer.getBoundingClientRect();
  const boardSize = Math.min(containerRect.width, containerRect.height) * 0.85;
  
  els.grid.style.width = `${boardSize}px`;
  els.grid.style.height = `${boardSize}px`;

  state.tiles = [];
  
  // Determine a grid size that can fit N elements comfortably
  let gridDim = Math.ceil(Math.sqrt(count));
  // Add a little extra padding so it's not cramped if it exactly fits
  if (gridDim * gridDim === count) gridDim++; 
  
  const cellSize = boardSize / gridDim;
  const tileSize = Math.max(30, cellSize * 0.8); // Leave 20% gap

  // Create all possible cells
  const cells = [];
  for (let r = 0; r < gridDim; r++) {
    for (let c = 0; c < gridDim; c++) {
      cells.push({ r, c });
    }
  }

  // Shuffle cells and pick `count` of them
  cells.sort(() => Math.random() - 0.5);
  const selectedCells = cells.slice(0, count);

  // Create numbers 1..count and shuffle them
  const numbers = Array.from({ length: count }, (_, i) => i + 1);
  numbers.sort(() => Math.random() - 0.5);

  // Build DOM elements
  for (let i = 0; i < count; i++) {
    const num = numbers[i];
    const cell = selectedCells[i];
    
    // Center the tile in its grid cell
    const centerX = (cell.c * cellSize) + (cellSize / 2);
    const centerY = (cell.r * cellSize) + (cellSize / 2);
    
    const x = centerX - (tileSize / 2);
    const y = centerY - (tileSize / 2);

    const btn = document.createElement('button');
    btn.className = 'ct-btn';
    btn.type = 'button';
    btn.textContent = num;
    btn.style.width = `${tileSize}px`;
    btn.style.height = `${tileSize}px`;
    btn.style.left = `${x}px`;
    btn.style.top = `${y}px`;
    btn.dataset.number = num;

    btn.addEventListener('click', () => handleTileClick(num, btn));
    
    els.grid.appendChild(btn);
    state.tiles.push({ number: num, element: btn });
  }
}

function handleTileClick(num, btn) {
  if (!state.acceptingInput) return;

  if (num === state.nextTarget) {
    // Correct
    btn.classList.add('is-correct');
    
    // If they clicked 1 AND it's level 2+, hide all remaining visible numbers
    if (state.nextTarget === 1 && state.level > 1) {
      state.tiles.forEach(t => {
        if (!t.element.classList.contains('is-correct')) {
          t.element.classList.add('is-hidden');
        }
      });
    }

    state.nextTarget++;

    // Check level complete
    if (state.nextTarget > state.level + 3) {
      state.acceptingInput = false;
      els.statusText.textContent = 'Level complete.';
      setTimeout(() => {
        state.level++;
        setupLevel();
      }, 800);
    }
  } else {
    // Wrong
    handleStrike(btn);
  }
}

function handleStrike(btn) {
  state.acceptingInput = false;
  state.strikes++;
  updateStrikes();
  
  btn.classList.add('is-wrong');
  els.statusText.textContent = 'Incorrect.';

  // Show all numbers to see what they missed
  state.tiles.forEach(t => t.element.classList.remove('is-hidden'));

  setTimeout(() => {
    if (state.strikes >= MAX_STRIKES) {
      showStats();
    } else {
      // Restart level
      setupLevel();
    }
  }, 1200);
}

function updateStrikes() {
  const bolts = els.livesDisplay.querySelectorAll('.ct-bolt');
  bolts.forEach((b, i) => {
    b.classList.toggle('is-active', i < (MAX_STRIKES - state.strikes));
  });
}

function showStats() {
  cancelTimers();
  state.running = false;

  const levelReached = state.level;
  
  els.statLevel.textContent = levelReached;

  const prevBest = Number(localStorage.getItem(BEST_KEY) || 0);
  const newBest = Math.max(prevBest, levelReached);
  if (newBest > prevBest) {
    try { localStorage.setItem(BEST_KEY, String(newBest)); } catch (e) {}
  }
  els.statBest.textContent = newBest;

  showStage('stats');
}

function cancelTimers() {
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
  }
}

window.__ctReset = resetToIntro;
