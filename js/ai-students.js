// ============================================
// ai-students.js — Loads from CONFIG.aiStudents
// ============================================

window.AI_STUDENTS = (window.CONFIG && window.CONFIG.aiStudents)
  ? JSON.parse(JSON.stringify(window.CONFIG.aiStudents))
  : [];

// Restore persisted skills
(function loadAISkills() {
  const st = window.ANHS.loadState();
  if (st.aiSkills) {
    window.AI_STUDENTS.forEach(ai => {
      if (typeof st.aiSkills[ai.id] === "number") ai.skill = st.aiSkills[ai.id];
    });
  }
})();

window.aiLine = function (aiId, category) {
  const ai = AI_STUDENTS.find(a => a.id === aiId);
  if (!ai || !ai.lines || !ai.lines[category]) return "...";
  const arr = ai.lines[category];
  return arr[Math.floor(Math.random() * arr.length)];
};

window.aiReactionCategory = function (aiScore, playerScore, gap = 50) {
  if (playerScore > aiScore + gap) return "lose";
  if (aiScore > playerScore + gap) return "win";
  return "tie";
};

window.aiSimulateAnswer = function (ai) {
  if (Math.random() < ai.skill) return 100 + Math.floor(Math.random() * 40);
  return 0;
};

window.aiGrow = function (ai) {
  ai.skill = Math.min(0.98, ai.skill + (ai.growth || 0.02));
  const st = window.ANHS.loadState();
  st.aiSkills = st.aiSkills || {};
  st.aiSkills[ai.id] = ai.skill;
  window.ANHS.saveState(st);
};
