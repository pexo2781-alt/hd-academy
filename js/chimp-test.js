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
  numbers: [],      // e.g., [1, 2, 3, 4]
  nextTarget: 1,
  tiles: [],        // { id, number, element }
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

  // Determine how many numbers for this level
  const count = state.level + 3; // Level 1 = 4, Level 2 = 5, etc.
  buildBoard(count);
}

function buildBoard(count) {
  els.grid.innerHTML = '';
  
  // Calculate dynamic container size
  const containerRect = els.gridContainer.getBoundingClientRect();
  // Use up to 80% of the smallest dimension to ensure it fits and leaves room
  const boardSize = Math.min(containerRect.width, containerRect.height) * 0.85;
  
  els.grid.style.width = `${boardSize}px`;
  els.grid.style.height = `${boardSize}px`;

  state.tiles = [];
  
  // Create an array of numbers 1 to N
  const numbers = Array.from({ length: count }, (_, i) => i + 1);

  // Generate random non-overlapping positions
  const positions = [];
  const tileSize = Math.max(30, boardSize / 6); // Scale tile size based on board
  const maxAttempts = 1000;
  let attempts = 0;

  for (let i = 0; i < count; i++) {
    let placed = false;
    while (!placed && attempts < maxAttempts) {
      // Ensure tiles don't spawn right on the edges
      const padding = 10;
      const x = Math.random() * (boardSize - tileSize - padding * 2) + padding;
      const y = Math.random() * (boardSize - tileSize - padding * 2) + padding;

      // Check collision with existing tiles
      let overlaps = false;
      for (const pos of positions) {
        const dist = Math.hypot(x - pos.x, y - pos.y);
        if (dist < tileSize * 1.2) { // Add some gap
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        positions.push({ x, y });
        placed = true;
      }
      attempts++;
    }
  }

  // Shuffle numbers so they don't appear in sequence
  numbers.sort(() => Math.random() - 0.5);

  // Build DOM elements
  for (let i = 0; i < count; i++) {
    const num = numbers[i];
    const pos = positions[i];
    
    const btn = document.createElement('button');
    btn.className = 'ct-btn';
    btn.type = 'button';
    btn.textContent = num;
    btn.style.width = `${tileSize}px`;
    btn.style.height = `${tileSize}px`;
    btn.style.left = `${pos.x}px`;
    btn.style.top = `${pos.y}px`;
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
    
    // If they clicked 1, hide all remaining visible numbers
    if (state.nextTarget === 1) {
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
