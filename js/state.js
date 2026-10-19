// ============================================
// state.js — V6.0: slot isolation + legacy migration
// ============================================

// ---------- SLOT-AWARE STORAGE KEYS ----------
function getActiveSlotId() {
  const n = parseInt(localStorage.getItem("hda_active_slot") || "0");
  return (n >= 1 && n <= 3) ? n : null;
}
function setActiveSlotId(n) {
  if (n >= 1 && n <= 3) localStorage.setItem("hda_active_slot", String(n));
  else localStorage.removeItem("hda_active_slot");
}
function stateKeyFor(slot) { return `hda_slot_${slot}_state`; }

// ---------- DEFAULT STATE ----------
function getDEFAULT_STATE() {
  const cfg = window.CONFIG || {};
  const r = (cfg.ranking) || {};
  return {
    slotId: null,
    name: "Student",
    portrait: { color: "#c8102e", emoji: "🎓" },

    classRank: "D",
    classPoints: r.startingCP ?? 1000,
    personalPoints: 0,
    protectionPoints: r.startingProtectionPoints ?? 1,

    day: 0,
    period: "school",           // "school" | "free" | "night"

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
    specialExamsFailed: 0,
    expelled: false,
    aiSkills: {},
    entranceExamScore: null,
    lastPlayed: null
  };
}

// ---------- LOAD ----------
function loadState(slot) {
  if (slot === undefined) slot = getActiveSlotId();
  if (!slot) return { ...getDEFAULT_STATE(), subjectStats: JSON.parse(JSON.stringify(getDEFAULT_STATE().subjectStats)) };
  try {
    const raw = localStorage.getItem(stateKeyFor(slot));
    const base = { ...getDEFAULT_STATE(), slotId: slot };
    if (!raw) return { ...base, subjectStats: JSON.parse(JSON.stringify(base.subjectStats)) };
    const parsed = JSON.parse(raw);
    return {
      ...base,
      ...parsed,
      slotId: slot,
      subjectStats: { ...base.subjectStats, ...(parsed.subjectStats || {}) },
      aiSkills: parsed.aiSkills || {}
    };
  } catch (e) {
    console.warn("State load failed for slot " + slot, e);
    const base = { ...getDEFAULT_STATE(), slotId: slot };
    return { ...base, subjectStats: JSON.parse(JSON.stringify(base.subjectStats)) };
  }
}

// ---------- SAVE ----------
let _syncTimer = null;
function scheduleCloudSync() {
  if (!window.SB) return;
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(async () => {
    try {
      const user = await window.SB.getUser();
      if (!user) return;
      const slot = getActiveSlotId();
      if (!slot) return;
      const state = JSON.parse(localStorage.getItem(stateKeyFor(slot)) || "{}");
      const config = JSON.parse(localStorage.getItem("hda_config") || "{}");
      await window.SB.saveCloud(state, config, slot);
    } catch (e) {
      console.warn("Cloud sync failed:", e.message);
    }
  }, 1500);
}

function saveState(state) {
  const slot = state.slotId || getActiveSlotId();
  if (!slot) { console.warn("No active slot — save skipped."); return; }
  state.lastPlayed = new Date().toISOString();
  localStorage.setItem(stateKeyFor(slot), JSON.stringify(state));
  // Update slot metadata
  if (window.SlotManager) window.SlotManager.updateMeta(slot, state);
  scheduleCloudSync();
}

function resetState() {
  const slot = getActiveSlotId();
  if (!slot) return getDEFAULT_STATE();
  localStorage.removeItem(stateKeyFor(slot));
  const base = { ...getDEFAULT_STATE(), slotId: slot };
  return { ...base, subjectStats: JSON.parse(JSON.stringify(base.subjectStats)) };
}

// ---------- CLASS/DANGER (unchanged logic) ----------
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

// ---------- LEGACY MIGRATION ----------
(function migrateLegacy() {
  try {
    const legacyState = localStorage.getItem("anhs_state");
    const slotsRaw = localStorage.getItem("hda_slots");
    // Only migrate if we have a legacy save AND no slots have been created yet
    if (legacyState && !slotsRaw) {
      const parsed = JSON.parse(legacyState);
      parsed.slotId = 1;
      parsed.name = "Legacy Student";
      parsed.portrait = { color: "#c8102e", emoji: "🎓" };
      parsed.day = 0;
      parsed.period = "school";
      parsed.personalPoints = parsed.personalPoints || 0;
      parsed.entranceExamScore = null;
      localStorage.setItem("hda_slot_1_state", JSON.stringify(parsed));

      // Also migrate config if it exists in old key
      const oldCfg = localStorage.getItem("anhs_config");
      if (oldCfg && !localStorage.getItem("hda_config")) {
        localStorage.setItem("hda_config", oldCfg);
      }

      // Create slot metadata
      const slots = {
        "1": {
          exists: true,
          name: parsed.name,
          portrait: parsed.portrait,
          classRank: parsed.classRank || "D",
          classPoints: parsed.classPoints || 1000,
          personalPoints: parsed.personalPoints || 0,
          day: 0,
          lastPlayed: new Date().toISOString(),
          legacy: true
        },
        "2": { exists: false },
        "3": { exists: false }
      };
      localStorage.setItem("hda_slots", JSON.stringify(slots));

      // Remove old keys
      localStorage.removeItem("anhs_state");
      localStorage.removeItem("anhs_config");
      console.log("[HDA] Legacy save migrated to slot 1.");
    }
  } catch (e) {
    console.warn("[HDA] Legacy migration failed:", e);
  }
})();

// ---------- EXPORTS ----------
window.ANHS = {
  getDEFAULT_STATE,
  loadState, saveState, resetState,
  computeClass, computeDanger, applyCPChange,
  getActiveSlotId, setActiveSlotId, stateKeyFor
};

// Temporary alias so old pages still work
window.HDA = window.ANHS;
