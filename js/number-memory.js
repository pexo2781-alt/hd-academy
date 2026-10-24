import { closeDrill } from './domain.js';

/**
 * number-memory.js — Number Memory drill.
 */

const BEST_KEY = 'lab_nm_best';
const BASE_MS = 5000;
const PER_LEVEL_MS = 2000; // Gives extra time as numbers get longer

const state = {
  running: false,
  level: 1,
  currentNumber: '',
  displayDurationMs: 0,
  displayStartedAt: 0,
  answerStartedAt: 0,
  displayTimer: null,
  rafId: null,
  history: [],
  answerInputLocked: false
};

const els = {};

export function initNumberMemory() {
  Object.assign(els, {
    view: document.getElementById('drillNumberMemory'),
    stageIntro: document.getElementById('nmStageIntro'),
    stageDisplay: document.getElementById('nmStageDisplay'),
    stageAnswer: document.getElementById('nmStageAnswer'),
    stageResult: document.getElementById('nmStageResult'),
    stageStats: document.getElementById('nmStageStats'),

    startBtn: document.getElementById('nmStartBtn'),
    form: document.getElementById('nmAnswerForm'),
    answerInput: document.getElementById('nmAnswerInput'),
    submitBtn: document.getElementById('nmSubmitBtn'),
    nextBtn: document.getElementById('nmNextBtn'),
    retryBtn: document.getElementById('nmRetryBtn'),
    exitBtn: document.getElementById('nmExitBtn'),

    digitDisplay: document.getElementById('nmDigitDisplay'),
    timerFill: document.getElementById('nmTimerFill'),

    levelDisplay: document.getElementById('nmLevelDisplay'),
    levelAnswer: document.getElementById('nmLevelAnswer'),
    levelResult: document.getElementById('nmLevelResult'),

    resultNumber: document.getElementById('nmResultNumber'),
    resultAnswer: document.getElementById('nmResultAnswer'),

    statLevel: document.getElementById('nmStatLevel'),
    statAccuracy: document.getElementById('nmStatAccuracy'),
    statAvg: document.getElementById('nmStatAvg'),
    statTotal: document.getElementById('nmStatTotal'),
    statBest: document.getElementById('nmStatBest')
  });

  els.startBtn.addEventListener('click', startSession);
  els.form.addEventListener('submit', handleSubmit);
  els.nextBtn.addEventListener('click', advanceLevel);
  els.retryBtn.addEventListener('click', startSession);
  els.exitBtn.addEventListener('click', () => {
    closeDrill();
    resetToIntro();
  });

  // Allow full numbers
  els.answerInput.addEventListener('input', () => {
    const v = els.answerInput.value.replace(/\D/g, '');
    if (v !== els.answerInput.value) els.answerInput.value = v;
  });

  resetToIntro();
}

export function resetToIntro() {
  cancelTimers();
  state.running = false;
  state.level = 1;
  state.history = [];
  state.currentNumber = '';
  state.displayDurationMs = 0;
  state.answerInputLocked = false;
  showStage('intro');
}

function showStage(name) {
  const map = {
    intro:   els.stageIntro,
    display: els.stageDisplay,
    answer:  els.stageAnswer,
    result:  els.stageResult,
    stats:   els.stageStats
  };
  Object.entries(map).forEach(([k, el]) => {
    el.classList.toggle('is-active', k === name);
  });
}

function startSession() {
  state.running = true;
  state.level = 1;
  state.history = [];
  state.answerInputLocked = false;
  beginDisplayStage();
}

function beginDisplayStage() {
  const lvl = state.level;
  els.levelDisplay.textContent = lvl;
  els.levelAnswer.textContent = lvl;
  els.levelResult.textContent = lvl;

  // Generate N numbers
  let numStr = '';
  for (let i = 0; i < lvl; i++) {
    numStr += Math.floor(Math.random() * 10);
  }
  state.currentNumber = numStr;
  els.digitDisplay.textContent = state.currentNumber;

  // 5s base + (N * 2s)
  const totalMs = BASE_MS + (lvl * PER_LEVEL_MS);
  state.displayDurationMs = totalMs;

  els.timerFill.classList.remove('is-danger');
  els.timerFill.style.transform = 'scaleX(1)';
  state.displayStartedAt = performance.now();

  showStage('display');
  startRafTimer(totalMs);

  state.displayTimer = setTimeout(() => {
    cancelRafTimer();
    beginAnswerStage();
  }, totalMs);
}

function startRafTimer(totalMs) {
  const tick = (now) => {
    const elapsed = now - state.displayStartedAt;
    const remaining = Math.max(0, 1 - elapsed / totalMs);
    els.timerFill.style.transform = `scaleX(${remaining})`;
    els.timerFill.classList.toggle('is-danger', remaining < 0.2);
    if (remaining > 0) {
      state.rafId = requestAnimationFrame(tick);
    }
  };
  state.rafId = requestAnimationFrame(tick);
}

function cancelRafTimer() {
  if (state.rafId) {
    cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }
}

function beginAnswerStage() {
  els.answerInput.value = '';
  els.answerInput.disabled = false;
  els.submitBtn.disabled = false;
  state.answerInputLocked = false;
  state.answerStartedAt = performance.now();
  showStage('answer');
  setTimeout(() => els.answerInput.focus(), 50);
}

function handleSubmit(e) {
  e.preventDefault();
  if (state.answerInputLocked) return;

  const answer = els.answerInput.value.trim();
  if (!answer) {
    els.answerInput.focus();
    return;
  }

  state.answerInputLocked = true;
  els.answerInput.disabled = true;
  els.submitBtn.disabled = true;

  const responseMs = performance.now() - state.answerStartedAt;
  const correct = answer === state.currentNumber;

  state.history.push({
    level: state.level,
    number: state.currentNumber,
    answer,
    correct,
    responseMs,
    displayMs: state.displayDurationMs
  });

  if (correct) {
    els.resultNumber.textContent = state.currentNumber;
    els.resultAnswer.textContent = answer;
    showStage('result');
  } else {
    setTimeout(() => showStats(), 200);
  }
}

function advanceLevel() {
  state.level += 1;
  beginDisplayStage();
}

function showStats() {
  cancelTimers();
  state.running = false;

  const attempts = state.history.length;
  const correct = state.history.filter(h => h.correct).length;
  const accuracy = attempts === 0 ? 0 : Math.round((correct / attempts) * 100);

  const avgMs = attempts === 0
    ? 0
    : state.history.reduce((s, h) => s + h.responseMs, 0) / attempts;
  const avgSec = (avgMs / 1000).toFixed(2);

  const totalDisplayMs = state.history.reduce((s, h) => s + h.displayMs, 0);
  const totalAnswerMs = state.history.reduce((s, h) => s + h.responseMs, 0);
  const totalSec = ((totalDisplayMs + totalAnswerMs) / 1000).toFixed(1);

  // Best level = how many digits they successfully got
  const highestCorrect = state.history.filter(h => h.correct).reduce(
    (m, h) => Math.max(m, h.level),
    0
  );

  els.statLevel.textContent = highestCorrect;
  els.statAccuracy.textContent = `${accuracy}%`;
  els.statAvg.textContent = `${avgSec}s`;
  els.statTotal.textContent = `${totalSec}s`;

  const prevBest = Number(localStorage.getItem(BEST_KEY) || 0);
  const newBest = Math.max(prevBest, highestCorrect);
  if (newBest > prevBest) {
    try { localStorage.setItem(BEST_KEY, String(newBest)); } catch (e) {}
  }
  els.statBest.textContent = newBest;

  showStage('stats');
}

function cancelTimers() {
  if (state.displayTimer) {
    clearTimeout(state.displayTimer);
    state.displayTimer = null;
  }
  cancelRafTimer();
}

window.__nmReset = resetToIntro;
