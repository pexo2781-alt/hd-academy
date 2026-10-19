// ============================================
// dorm.js — Your profile & stats
// ============================================

(function () {
  const slot = window.ANHS.getActiveSlotId();
  if (!slot) { location.href = "slots.html"; return; }

  const st = window.ANHS.loadState();
  window.renderNav("dorm");

  // Profile
  document.getElementById("portraitEmoji").textContent = st.portrait.emoji;
  document.getElementById("portraitEmoji").style.background = st.portrait.color;
  document.getElementById("profileName").textContent = st.name;
  document.getElementById("profileClass").textContent = "Class " + st.classRank;
  document.getElementById("profileClass").className = "class-badge class-" + st.classRank;
  document.getElementById("profileDay").textContent = "Day " + st.day;

  // Stats
  document.getElementById("statCP").textContent = st.classPoints;
  document.getElementById("statPP").textContent = st.personalPoints || 0;
  document.getElementById("statProtection").textContent = st.protectionPoints;
  document.getElementById("statQuizzes").textContent = st.quizzesTaken;
  document.getElementById("statStreak").textContent = st.bestStreak;
  const acc = st.questionsTotal > 0 ? Math.round((st.correctTotal / st.questionsTotal) * 100) + "%" : "—";
  document.getElementById("statAccuracy").textContent = acc;

  // Actions
  document.getElementById("resetBtn").addEventListener("click", () => {
    if (!confirm("Delete this profile? This cannot be undone.")) return;
    window.SlotManager.deleteSlot(slot);
    location.href = "slots.html";
  });
})();
