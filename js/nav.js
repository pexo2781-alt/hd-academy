// ============================================
// nav.js — V6.0: minimal top bar (profile chip + logout)
// ============================================

// The old renderNav() is kept as a stub so old pages (quiz.html etc.) don't crash.
window.renderNav = function(activePage) {
  // Old pages had <nav id="nav">. We keep it functional but simplified.
  const nav = document.getElementById("nav");
  if (!nav) return;
  const slot = window.ANHS.getActiveSlotId();
  if (!slot) { nav.style.display = "none"; return; }
  const st = window.ANHS.loadState();
  nav.className = "topbar";
  nav.innerHTML = `
    <div class="topbar-left">
      <a href="campus.html" class="topbar-brand">HDA</a>
    </div>
    <div class="topbar-right">
      <div class="topbar-profile">
        <span class="topbar-emoji" style="background:${st.portrait.color}">${st.portrait.emoji}</span>
        <span class="topbar-name">${st.name}</span>
        <span class="topbar-class class-${st.classRank}">${st.classRank}</span>
      </div>
      <a href="dorm.html" class="topbar-btn" title="Dorm">🏠</a>
      <a href="settings.html" class="topbar-btn" title="Settings">⚙</a>
      <button class="topbar-btn" onclick="logoutFromCampus()" title="Log out">⎋</button>
    </div>
  `;
};

window.logoutFromCampus = function () {
  if (!confirm("Log out? Your progress is saved.")) return;
  localStorage.removeItem("hda_active_slot");
  location.href = "index.html";
};
