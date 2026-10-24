import { closeDrill } from './domain.js';

/**
 * visual-memory.js — Visual Memory drill.
 */

const BEST_KEY = 'lab_vm_best';
const MAX_LIVES = 3;

const state = {
  running: false,
  level: 1,
  lives: MAX_LIVES,
  strikes: 0,       // wrong clicks in current level
  gridSize: 3,      // NxN
  targetCount: 3,   // number of lit tiles
  targetIndices: [],// indices of lit tiles
  matchedCount: 0,  // correct clicks in current level
  acceptingInput: false,
  timer: null
};

const els = {};

export function initVisualMemory() {
  Object.assign(els, {
    stageIntro: document.getElementById('vmStageIntro'),
    stagePlay: document.getElementById('vmStagePlay'),
    stageStats: document.getElementById('vmStageStats'),

    startBtn: document.getElementById('vmStartBtn'),
    retryBtn: document.getElementById('vmRetryBtn'),
    exitBtn: document.getElementById('vmExitBtn'),

    levelDisplay: document.getElementById('vmLevelDisplay'),
    livesDisplay: document.getElementById('vmLivesDisplay'),
    gridContainer: document.getElementById('vmGridContainer'),
    grid: document.getElementById('vmGrid'),
    statusText: document.getElementById('vmStatus'),

    statLevel: document.getElementById('vmStatLevel'),
    statBest: document.getElementById('vmStatBest')
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
  state.lives = MAX_LIVES;
  state.strikes = 0;
  updateLives();
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
  state.lives = MAX_LIVES;
  state.strikes = 0;
  updateLives();
  showStage('play');
  setupLevel();
}

function getLevelData(level) {
  if (level === 1) return { gridSize: 3, targetCount: 3 };
  if (level === 2) return { gridSize: 3, targetCount: 4 };
  
  if (level >= 3 && level <= 5) {
    return { gridSize: 4, targetCount: 4 + (level - 2) };
  }
  if (level >= 6 && level <= 8) {
    return { gridSize: 5, targetCount: 5 + (level - 3) };
  }
  if (level >= 9 && level <= 13) {
    return { gridSize: 6, targetCount: 6 + (level - 4) };
  }
  if (level >= 14 && level <= 18) {
    return { gridSize: 7, targetCount: 10 + level };
  }
  if (level >= 19) {
    return { gridSize: 8, targetCount: 10 + level };
  }
  
  return { gridSize: 3, targetCount: 3 };
}

function setupLevel() {
  cancelTimers();
  state.strikes = 0;
  state.matchedCount = 0;
  state.acceptingInput = false;
  
  const data = getLevelData(state.level);
  state.gridSize = data.gridSize;
  state.targetCount = data.targetCount;

  els.levelDisplay.textContent = state.level;
  els.statusText.textContent = 'Watch the squares.';

  buildGrid(state.gridSize);
  pickTargets(state.targetCount);
  
  playTargets();
}

function buildGrid(size) {
  els.grid.innerHTML = '';
  els.grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  els.grid.style.gridTemplateRows = `repeat(${size}, 1fr)`;
  
  const containerRect = els.gridContainer.getBoundingClientRect();
  const maxDim = Math.min(containerRect.width, containerRect.height) * 0.9;
  
  els.grid.style.width = `${maxDim}px`;
  els.grid.style.height = `${maxDim}px`;

  const totalTiles = size * size;
  for (let i = 0; i < totalTiles; i++) {
    const btn = document.createElement('button');
    btn.className = 'vm-btn';
    btn.dataset.index = i;
    btn.type = 'button';
    btn.addEventListener('click', () => handleTileClick(i));
    els.grid.appendChild(btn);
  }
}

function pickTargets(count) {
  state.targetIndices = [];
  const totalTiles = state.gridSize * state.gridSize;
  const available = Array.from({ length: totalTiles }, (_, i) => i);
  
  for (let i = 0; i < count; i++) {
    const randIndex = Math.floor(Math.random() * available.length);
    state.targetIndices.push(available.splice(randIndex, 1)[0]);
  }
}

async function playTargets() {
  // Short pause before the squares flip up
  await sleep(400); 

  // 1. Flip ALL target squares up at once
  for (const idx of state.targetIndices) {
    const btn = els.grid.querySelector(`[data-index="${idx}"]`);
    if (btn) btn.classList.add('is-lit');
  }

  // 2. HOLD THEM UP FOR 2.5 SECONDS (Change 2500 to adjust time)
  await sleep(2500);

  if (!state.running) return;

  // 3. Flip them all back down simultaneously
  for (const idx of state.targetIndices) {
    const btn = els.grid.querySelector(`[data-index="${idx}"]`);
    if (btn) btn.classList.remove('is-lit');
  }

  // 4. Allow player to click
  state.acceptingInput = true;
  els.statusText.textContent = 'Your turn.';
}

function handleTileClick(index) {
  if (!state.acceptingInput) return;
  if (state.targetIndices.includes(index)) {
    if (state.matchedCount === state.targetCount) return;
    
    const btn = els.grid.querySelector(`[data-index="${index}"]`);
    if (btn.classList.contains('is-matched')) return;

    btn.classList.add('is-matched');
    state.matchedCount++;

    if (state.matchedCount === state.targetCount) {
      state.acceptingInput = false;
      els.statusText.textContent = 'Level complete.';
      setTimeout(() => {
        state.level++;
        setupLevel();
      }, 800);
    }
  } else {
    handleStrike(index);
  }
}

function handleStrike(index) {
  state.strikes++;
  state.acceptingInput = false;
  
  const btn = els.grid.querySelector(`[data-index="${index}"]`);
  btn.classList.add('is-wrong');

  setTimeout(() => {
    btn.classList.remove('is-wrong');
    
    if (state.strikes >= 3) {
      state.lives--;
      updateLives();
      
      if (state.lives <= 0) {
        showStats();
      } else {
        els.statusText.textContent = 'Life lost. Restarting level.';
        setTimeout(() => setupLevel(), 1000);
      }
    } else {
      els.statusText.textContent = `Misses: ${state.strikes}/3`;
      state.acceptingInput = true;
    }
  }, 500);
}

function updateLives() {
  const hearts = els.livesDisplay.querySelectorAll('.vm-heart');
  hearts.forEach((h, i) => {
    h.classList.toggle('is-active', i < state.lives);
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

function sleep(ms) {
  return new Promise(resolve => {
    state.timer = setTimeout(resolve, ms);
  });
}

function cancelTimers() {
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
  }
}

window.__vmReset = resetToIntro;
