// ============================================
// nav.js — Shared navigation injection
// ============================================

window.renderNav = function(activePage) {
  const pages = [
    { id: "home",          label: "Dashboard",     href: "index.html" },
    { id: "quiz",          label: "Quiz Arena",    href: "quiz.html" },
    { id: "booklet",       label: "Booklet",       href: "booklet.html" },
    { id: "whiteroom",     label: "White Room",    href: "whiteroom.html" },
    { id: "classroom",     label: "Classroom",     href: "classroom.html" },
    { id: "exam",          label: "Special Exam",  href: "special-exam.html" },
    { id: "question-bank", label: "Question Bank", href: "question-bank.html" },
    { id: "settings",      label: "Settings",      href: "settings.html" }
  ];
  const nav = document.getElementById("nav");
  if (!nav) return;
  nav.className = "nav";
  nav.innerHTML = pages.map(p =>
    `<a href="${p.href}" class="${p.id === activePage ? 'active' : ''}">${p.label}</a>`
  ).join("");
};
