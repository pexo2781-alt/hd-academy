// ============================================
// state.js — Player state, CP, class, save/load
// ============================================

const DEFAULT_STATE = {
  playerName: "Student",
  classRank: "D",           // A, B, C, D
  classPoints: 1000,         // CP — starts at 1000 like COTE
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
  dangerLevel: 0,            // 0-3 (3 = expulsion imminent)
  protectionPoints: 1,
  specialExamsFailed: 0,
  expelled: false,
  lastPlayed: null
};

// Class thresholds (CP required to BE in that class)
const CLASS_THRESHOLDS = {
  A: 2000,
  B: 1600,
  C: 1300,
  D: 0
};

function loadState() {
  try {
    const raw = localStorage.getItem("anhs_state");
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed, subjectStats: { ...DEFAULT_STATE.subjectStats, ...(parsed.subjectStats || {}) } };
  } catch (e) {
    console.warn("State load failed, using default.", e);
    return { ...DEFAULT_STATE };
  }
}

function saveState(state) {
  state.lastPlayed = new Date().toISOString();
  localStorage.setItem("anhs_state", JSON.stringify(state));
}

function resetState() {
  localStorage.removeItem("anhs_state");
  return { ...DEFAULT_STATE };
}

// Compute class from CP
function computeClass(cp) {
  if (cp >= CLASS_THRESHOLDS.A) return "A";
  if (cp >= CLASS_THRESHOLDS.B) return "B";
  if (cp >= CLASS_THRESHOLDS.C) return "C";
  return "D";
}

// Recalculate danger level based on CP + failed exams
function computeDanger(state) {
  let danger = 0;
  if (state.classPoints < 800) danger = 1;
  if (state.classPoints < 600) danger = 2;
  if (state.classPoints < 400 || state.specialExamsFailed >= 2) danger = 3;
  return danger;
}

// Apply CP change + recompute class/danger + check expulsion
function applyCPChange(state, delta) {
  state.classPoints = Math.max(0, state.classPoints + delta);
  state.classRank = computeClass(state.classPoints);
  state.dangerLevel = computeDanger(state);

  // Expulsion check: 3 failed special exams OR CP hits 0
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

// Expose globally
window.ANHS = {
  DEFAULT_STATE,
  CLASS_THRESHOLDS,
  loadState,
  saveState,
  resetState,
  computeClass,
  computeDanger,
  applyCPChange
};
