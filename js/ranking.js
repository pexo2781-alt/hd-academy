
// ============================================
// ranking.js — Class demotion, protection points, expulsion, AI expulsion
// ============================================

window.Ranking = (function () {

  const CLASS_ORDER = ["D", "C", "B", "A"]; // D = lowest

  // Called after a quiz or special exam to update class + danger
  function evaluate(st) {
    const oldClass = st.classRank;
    st.classRank = window.ANHS.computeClass(st.classPoints);
    st.dangerLevel = window.ANHS.computeDanger(st);

    let events = [];

    // Class change?
    if (st.classRank !== oldClass) {
      const promoted = CLASS_ORDER.indexOf(st.classRank) > CLASS_ORDER.indexOf(oldClass);
      events.push({
        type: promoted ? "promotion" : "demotion",
        from: oldClass,
        to: st.classRank,
        message: promoted
          ? `Promoted to Class ${st.classRank}! The elite recognize you.`
          : `Demoted to Class ${st.classRank}. The fall is swift.`
      });
    }

    // Danger escalation
    if (st.dangerLevel >= 3 && !st.expelled) {
      events.push({
        type: "danger",
        message: "CRITICAL: You are one failure away from expulsion."
      });
    }

    // Expulsion check
    if (st.specialExamsFailed >= 3 || st.classPoints <= 0) {
      if (st.protectionPoints > 0) {
        st.protectionPoints--;
        st.classPoints = Math.max(st.classPoints, 300);
        st.specialExamsFailed = 0;
        st.dangerLevel = window.ANHS.computeDanger(st);
        st.classRank = window.ANHS.computeClass(st.classPoints);
        events.push({
          type: "protected",
          message: `Protection Point consumed! You survived expulsion. (${st.protectionPoints} left)`
        });
      } else {
        st.expelled = true;
        events.push({
          type: "expelled",
          message: "You have been expelled from ANHS."
        });
      }
    }

    return events;
  }

  // Called when a special exam is failed
  function failSpecialExam(st) {
    st.specialExamsFailed++;
    st.classPoints = Math.max(0, st.classPoints - 200);
    return evaluate(st);
  }

  // Called when a special exam is passed
  function passSpecialExam(st) {
    st.specialExamsFailed = Math.max(0, st.specialExamsFailed - 1);
    st.classPoints += 300;
    return evaluate(st);
  }

  // Award a protection point (e.g., 5 perfect quizzes in a row — future feature)
  function awardProtection(st) {
    st.protectionPoints++;
    return evaluate(st);
  }

  // Get class progress info
  function classProgress(st) {
    const thresholds = window.ANHS.CLASS_THRESHOLDS;
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

    return {
      current: st.classRank,
      next: nextClass,
      progressPct,
      currentCP: st.classPoints,
      nextThreshold
    };
  }

  return { evaluate, failSpecialExam, passSpecialExam, awardProtection, classProgress };
})();
