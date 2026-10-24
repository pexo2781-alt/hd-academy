import { closeDrill } from './domain.js';

/**
 * sequence-memory.js — Sequence Memory drill.
 */

const BEST_KEY = 'lab_sm_best';

const state = {
  running: false,
  level: 1,
  sequence: [],
  userIndex: 0,
  acceptingInput: false,
  flashTimer: null
};

const els = {};

export function initSequenceMemory() {
  Object.assign(els, {
    stageIntro: document.getElementById('smStageIntro'),
    stagePlay: document.getElementById('smStagePlay'),
    stageStats: document.getElementById('smStageStats'),

    startBtn: document.getElementById('smStartBtn'),
    retryBtn: document.getElementById('smRetryBtn'),
    exitBtn: document.getElementById('smExitBtn'),
    
    levelDisplay: document.getElementById('smLevelDisplay'),
    statusText: document.getElementById('smStatus'),
    grid: document.getElementById('smGrid'),
    buttons: Array.from(document.querySelectorAll('.sm-btn')),

    statLevel: document.getElementById('smStatLevel'),
    statBest: document.getElementById('smStatBest')
  });

  els.startBtn.addEventListener('click', startSession);
  els.retryBtn.addEventListener('click', startSession);
  els.exitBtn.addEventListener('click', () => {
    closeDrill();
    resetToIntro();
  });

  els.buttons.forEach(btn => {
    btn.addEventListener('click', () => handleUserClick(parseInt(btn.dataset.index, 10)));
  });

  resetToIntro();
}

export function resetToIntro() {
  cancelTimers();
  state.running = false;
  state.level = 1;
  state.sequence = [];
  state.userIndex = 0;
  state.acceptingInput = false;
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
  state.sequence = [];
  state.userIndex = 0;
  state.acceptingInput = false;
  els.levelDisplay.textContent = state.level;
  showStage('play');
  nextLevel();
}

function nextLevel() {
  state.userIndex = 0;
  state.acceptingInput = false;
  els.statusText.textContent = 'Watch the pattern.';

  // Add one random step to the sequence
  const nextStep = Math.floor(Math.random() * 4);
  state.sequence.push(nextStep);

  // Play sequence
  playSequence();
}

async function playSequence() {
  await sleep(500); // Initial pause before playback

  for (let i = 0; i < state.sequence.length; i++) {
    if (!state.running) return;
    
    const step = state.sequence[i];
    flashButton(step, true);
    await sleep(300); // How long it stays lit
    flashButton(step, false);
    await sleep(150); // Gap between flashes
  }

  if (!state.running) return;

  // Now wait for user input
  state.acceptingInput = true;
  els.statusText.textContent = 'Your turn.';
}

function flashButton(index, isLit) {
  const btn = els.buttons[index];
  if (!btn) return;
  if (isLit) {
    btn.classList.add('is-lit');
  } else {
    btn.classList.remove('is-lit');
  }
}

function handleUserClick(index) {
  if (!state.acceptingInput) return;

  // Visual click feedback
  flashButton(index, true);
  setTimeout(() => flashButton(index, false), 150);

  const expected = state.sequence[state.userIndex];

  if (index !== expected) {
    // Fail state
    state.acceptingInput = false;
    els.statusText.textContent = 'Incorrect sequence.';
    flashButton(index, false);
    
    // Show wrong flash
    els.buttons[index].classList.add('is-wrong');
    
    setTimeout(() => {
      els.buttons[index].classList.remove('is-wrong');
      showStats();
    }, 800);
    return;
  }

  state.userIndex++;

  if (state.userIndex >= state.sequence.length) {
    // Level complete
    state.acceptingInput = false;
    els.statusText.textContent = 'Correct.';
    
    setTimeout(() => {
      state.level++;
      els.levelDisplay.textContent = state.level;
      nextLevel();
    }, 800);
  }
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
    state.flashTimer = setTimeout(resolve, ms);
  });
}

function cancelTimers() {
  if (state.flashTimer) {
    clearTimeout(state.flashTimer);
    state.flashTimer = null;
  }
  // Clear all visual states
  els.buttons.forEach(btn => btn.classList.remove('is-lit', 'is-wrong'));
}

window.__smReset = resetToIntro;
