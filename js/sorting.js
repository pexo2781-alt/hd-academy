// ============================================
// sorting.js — Entrance exam score → class assignment
// ============================================

window.Sorting = (function () {
  // Hidden thresholds — do NOT display score to player
  const THRESHOLDS = {
    A: 140,
    B: 120,
    C: 100,
    D: 0
  };

  const ADVICE_THRESHOLD = 50;  // below this → show "may not fit" screen

  // Score: correct * 10 + timeBonus
  // timeBonus = sum of remaining seconds per question / 10 (rounded down)
  function computeScore(correct, totalTimeBonusSec) {
    return correct * 10 + Math.floor((totalTimeBonusSec || 0) / 10);
  }

  function classify(score) {
    if (score >= THRESHOLDS.A) return "A";
    if (score >= THRESHOLDS.B) return "B";
    if (score >= THRESHOLDS.C) return "C";
    return "D";
  }

  function shouldShowAdvice(score) {
    return score < ADVICE_THRESHOLD;
  }

  // Starting CP by class
  const STARTING_CP = { A: 1000, B: 950, C: 900, D: 850 };

  return { computeScore, classify, shouldShowAdvice, STARTING_CP, THRESHOLDS };
})();
