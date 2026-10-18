// ============================================
// ranking.js — Class demotion, protection, expulsion
// ============================================

window.Ranking = (function () {
  const CLASS_ORDER = ["D", "C", "B", "A"];

  function getR() { return (window.CONFIG && window.CONFIG.ranking) || {}; }

  function evaluate(st) {
    const oldClass = st.classRank;
    st.classRank = window.ANHS.computeClass(st.classPoints);
    st.dangerLevel = window.ANHS.computeDanger(st);

    let events = [];

    if (st.classRank !== oldClass) {
      const promoted = CLASS_ORDER.indexOf(st.classRank) > CLASS_ORDER.indexOf(oldClass);
      events.push({
        type: promoted ? "promotion" : "demotion",
        from: oldClass, to: st.classRank,
        message: promoted
          ? `Promoted to Class ${st.classRank}! The elite recognize you.`
          : `Demoted to Class ${st.classRank}. The fall is swift.`
      });
    }

    if (st.dangerLevel >= 3 && !st.expelled) {
      events.push({ type: "danger", message: "CRITICAL: You are one failure away from expulsion." });
    }

    const r = getR();
    const expelLimit = r.examsFailedForExpulsion ?? 3;
    if (st.specialExamsFailed >= expelLimit || st.classPoints <= 0) {
      if (st.protectionPoints > 0) {
        st.protectionPoints--;
        st.classPoints = Math.max(st.classPoints, 300);
        st.specialExamsFailed = 0;
        st.dangerLevel = window.ANHS.computeDanger(st);
        st.classRank = window.ANHS.computeClass(st.classPoints);
        events.push({ type: "protected", message: `Protection Point consumed! You survived. (${st.protectionPoints} left)` });
      } else {
        st.expelled = true;
        events.push({ type: "expelled", message: "You have been expelled from ANHS." });
      }
    }
    return events;
  }

  function failSpecialExam(st) {
    const r = getR();
    st.specialExamsFailed++;
    st.classPoints = Math.max(0, st.classPoints - (r.failExamCPPenalty ?? 200));
    return evaluate(st);
  }

  function passSpecialExam(st) {
    const r = getR();
    st.specialExamsFailed = Math.max(0, st.specialExamsFailed - 1);
    st.classPoints += (r.passExamCPReward ?? 300);
    return evaluate(st);
  }

  function awardProtection(st) { st.protectionPoints++; return evaluate(st); }

  function classProgress(st) {
    const cfg = window.CONFIG || {};
    const thresholds = (cfg.ranking && cfg.ranking.classThresholds) || { A: 2000, B: 1600, C: 1300, D: 0 };
    const order = ["D", "C", "B", "A"];
    const idx = order.indexOf(st.classRank);
    const nextClass = idx < order.length - 1 ? order[idx + 1] : null;
    const nextThreshold = nextClass ? thresholds[nextClass] : null;
    const currentThreshold = thresholds[st.classRank];

    let progressPct = 100;
    if (nextThreshold !== null) {
      const range = nextThreshold - currentThreshold;
      const inRange = st.classPoints - currentThreshold;
      progressPct = Math.min(100, Math.max(0, Math.round((inRange / range) * 100)));
    }
    return { current: st.classRank, next: nextClass, progressPct, currentCP: st.classPoints, nextThreshold };
  }

  return { evaluate, failSpecialExam, passSpecialExam, awardProtection, classProgress };
})();
