// ============================================
// state.js — Player state, CP, class, save/load
// ============================================

const DEFAULT_STATE = {
  playerName: "Student",
  classRank: "D",
  classPoints: 1000,
  totalScore: 0,
  quizzesTaken: 0,
  correctTotal: 0,
  questionsTotal: 0,
  bestStreak: 0,
  subjectStats: {
    math:    { correct: 0, total: 0, best: 0 },
    science: { correct: 0, total: 0, best: 0 },
    english: { correct: 0, total: 0, best: 0 }
  },
  dangerLevel: 0,
  protectionPoints: 1,
  specialExamsFailed: 0,
  expelled: false,
  aiSkills: {},   // { horikita: 0.87, ... }
  lastPlayed: null
};

const CLASS_THRESHOLDS = { A: 2000, B: 1600, C: 1300, D: 0 };

function loadState() {
  try {
    const raw = localStorage.getItem("anhs_state");
    if (!raw) return { ...DEFAULT_STATE, subjectStats: JSON.parse(JSON.stringify(DEFAULT_STATE.subjectStats)), aiSkills: {} };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      subjectStats: { ...DEFAULT_STATE.subjectStats, ...(parsed.subjectStats || {}) },
      aiSkills: parsed.aiSkills || {}
    };
  } catch (e) {
    console.warn("State load failed, using default.", e);
    return { ...DEFAULT_STATE, subjectStats: JSON.parse(JSON.stringify(DEFAULT_STATE.subjectStats)), aiSkills: {} };
  }
}

function saveState(state) {
  state.lastPlayed = new Date().toISOString();
  localStorage.setItem("anhs_state", JSON.stringify(state));
}

function resetState() {
  localStorage.removeItem("anhs_state");
  return { ...DEFAULT_STATE, subjectStats: JSON.parse(JSON.stringify(DEFAULT_STATE.subjectStats)), aiSkills: {} };
}

function computeClass(cp) {
  if (cp >= CLASS_THRESHOLDS.A) return "A";
  if (cp >= CLASS_THRESHOLDS.B) return "B";
  if (cp >= CLASS_THRESHOLDS.C) return "C";
  return "D";
}

function computeDanger(state) {
  let danger = 0;
  if (state.classPoints < 800) danger = 1;
  if (state.classPoints < 600) danger = 2;
  if (state.classPoints < 400 || state.specialExamsFailed >= 2) danger = 3;
  return danger;
}

function applyCPChange(state, delta) {
  state.classPoints = Math.max(0, state.classPoints + delta);
  state.classRank = computeClass(state.classPoints);
  state.dangerLevel = computeDanger(state);

  if (state.specialExamsFailed >= 3 || state.classPoints <= 0) {
    if (state.protectionPoints > 0) {
      state.protectionPoints -= 1;
      state.classPoints = Math.max(state.classPoints, 300);
      state.specialExamsFailed = 0;
      state.dangerLevel = computeDanger(state);
      state.classRank = computeClass(state.classPoints);
    } else {
      state.expelled = true;
    }
  }
  return state;
}

window.ANHS = {
  DEFAULT_STATE, CLASS_THRESHOLDS,
  loadState, saveState, resetState,
  computeClass, computeDanger, applyCPChange
};
