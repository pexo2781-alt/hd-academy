// ============================================
// state.js — Player state, CP, class, save/load
// V5: auto-sync to cloud on save (if signed in)
// ============================================

function getDEFAULT_STATE() {
  const cfg = window.CONFIG || {};
  const r = (cfg.ranking) || {};
  return {
    playerName: "Student",
    classRank: "D",
    classPoints: r.startingCP ?? 1000,
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
    protectionPoints: r.startingProtectionPoints ?? 1,
    specialExamsFailed: 0,
    expelled: false,
    aiSkills: {},
    lastPlayed: null
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem("anhs_state");
    const base = getDEFAULT_STATE();
    if (!raw) return { ...base, subjectStats: JSON.parse(JSON.stringify(base.subjectStats)) };
    const parsed = JSON.parse(raw);
    return {
      ...base,
      ...parsed,
      subjectStats: { ...base.subjectStats, ...(parsed.subjectStats || {}) },
      aiSkills: parsed.aiSkills || {}
    };
  } catch (e) {
    console.warn("State load failed, using default.", e);
    const base = getDEFAULT_STATE();
    return { ...base, subjectStats: JSON.parse(JSON.stringify(base.subjectStats)) };
  }
}

// Debounced cloud sync
let _syncTimer = null;
function scheduleCloudSync() {
  if (!window.SB) return; // Supabase not loaded on this page
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(async () => {
    try {
      const user = await window.SB.getUser();
      if (!user) return; // Not signed in
      const state = JSON.parse(localStorage.getItem("anhs_state") || "{}");
      const config = JSON.parse(localStorage.getItem("anhs_config") || "{}");
      await window.SB.saveCloud(state, config);
    } catch (e) {
      console.warn("Cloud sync failed:", e.message);
    }
  }, 1500); // 1.5s debounce
}

function saveState(state) {
  state.lastPlayed = new Date().toISOString();
  localStorage.setItem("anhs_state", JSON.stringify(state));
  scheduleCloudSync();
}

function resetState() {
  localStorage.removeItem("anhs_state");
  const base = getDEFAULT_STATE();
  return { ...base, subjectStats: JSON.parse(JSON.stringify(base.subjectStats)) };
}

function computeClass(cp) {
  const cfg = window.CONFIG || {};
  const T = (cfg.ranking && cfg.ranking.classThresholds) || { A: 2000, B: 1600, C: 1300, D: 0 };
  if (cp >= T.A) return "A";
  if (cp >= T.B) return "B";
  if (cp >= T.C) return "C";
  return "D";
}

function computeDanger(state) {
  const r = (window.CONFIG && window.CONFIG.ranking) || {};
  const t1 = r.startingDangerTier1 ?? 800;
  const t2 = r.startingDangerTier2 ?? 600;
  const t3 = r.startingDangerTier3 ?? 400;
  const failT3 = r.examsFailedForDanger3 ?? 2;
  let danger = 0;
  if (state.classPoints < t1) danger = 1;
  if (state.classPoints < t2) danger = 2;
  if (state.classPoints < t3 || state.specialExamsFailed >= failT3) danger = 3;
  return danger;
}

function applyCPChange(state, delta) {
  state.classPoints = Math.max(0, state.classPoints + delta);
  state.classRank = computeClass(state.classPoints);
  state.dangerLevel = computeDanger(state);
  const r = (window.CONFIG && window.CONFIG.ranking) || {};
  const expelLimit = r.examsFailedForExpulsion ?? 3;

  if (state.specialExamsFailed >= expelLimit || state.classPoints <= 0) {
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
  getDEFAULT_STATE,
  loadState, saveState, resetState,
  computeClass, computeDanger, applyCPChange
};
