// ============================================
// campus.js — Campus map
// ============================================

(function () {
  const slot = window.ANHS.getActiveSlotId();
  if (!slot) { location.href = "slots.html"; return; }

  const st = window.ANHS.loadState();

  // Render topbar (uses the <nav id="nav"> in campus.html)
  window.renderNav("campus");

  // Stats bar
  const cpEl = document.getElementById("statCP");
  const ppEl = document.getElementById("statPP");
  const dayEl = document.getElementById("statDay");
  if (cpEl) cpEl.textContent = st.classPoints;
  if (ppEl) ppEl.textContent = st.personalPoints || 0;
  if (dayEl) dayEl.textContent = st.day;

  // Buildings — clickable (locked ones have no data-href)
  document.querySelectorAll(".building[data-href]").forEach(card => {
    card.addEventListener("click", () => {
      const href = card.dataset.href;
      if (href) location.href = href;
    });
  });
})();
