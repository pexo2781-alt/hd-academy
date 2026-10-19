// ============================================
// campus.js — Campus map
// ============================================

(function () {
  const slot = window.ANHS.getActiveSlotId();
  if (!slot) { location.href = "slots.html"; return; }

  const st = window.ANHS.loadState();
  document.getElementById("topbarMount").innerHTML = "";
  window.renderNav("campus");

  // Stats bar
  document.getElementById("statCP").textContent = st.classPoints;
  document.getElementById("statPP").textContent = st.personalPoints || 0;
  document.getElementById("statDay").textContent = st.day;

  // Buildings — clickable
  document.querySelectorAll(".building[data-href]").forEach(card => {
    card.addEventListener("click", () => {
      const href = card.dataset.href;
      if (href) location.href = href;
    });
  });
})();
