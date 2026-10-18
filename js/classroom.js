// ============================================
// classroom.js — Classroom view with AI classmates + dialogue
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  const st = window.ANHS.loadState();
  const container = document.getElementById("classmatesGrid");
  if (!container) return;

  container.innerHTML = window.AI_STUDENTS.map(ai => {
    const specialty = ai.specialty === "all" ? "All-Rounder" : ai.specialty.charAt(0).toUpperCase() + ai.specialty.slice(1);
    const skillPct = Math.round(ai.skill * 100);
    return `
      <div class="card" style="margin-bottom:0;" data-ai="${ai.id}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h3 style="margin-bottom:0.25rem;">${ai.name}</h3>
            <div style="color:var(--anhs-grey); font-size:0.85rem; font-style:italic;">"${ai.tagline}"</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.7rem; color:var(--anhs-grey); text-transform:uppercase;">Specialty</div>
            <div style="font-weight:700; color:var(--anhs-red);">${specialty}</div>
          </div>
        </div>
        <div style="margin-top:0.75rem;">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--anhs-grey); margin-bottom:0.25rem;">
            <span>Skill</span><span>${skillPct}%</span>
          </div>
          <div class="danger-meter"><div class="danger-fill" style="width:${skillPct}%; background:var(--anhs-red);"></div></div>
        </div>
        <div class="mt-1" style="display:flex; gap:0.5rem;">
          <button class="btn btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.85rem;" onclick="talkTo('${ai.id}')">Talk</button>
          <button class="btn btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.85rem;" onclick="studyWith('${ai.id}')">Study Help</button>
        </div>
        <div id="dialog-${ai.id}" style="margin-top:0.75rem; font-style:italic; color:var(--anhs-light); min-height:1.2rem;"></div>
      </div>`;
  }).join("");
});

window.talkTo = function (aiId) {
  const ai = window.AI_STUDENTS.find(a => a.id === aiId);
  const st = window.ANHS.loadState();
  // Pick category based on class rank
  let cat = "taunt";
  if (st.classRank === "A" || st.classRank === "B") cat = "respect";
  else if (st.dangerLevel >= 2) cat = "taunt";
  const line = window.aiLine(aiId, cat);
  document.getElementById(`dialog-${aiId}`).textContent = `${ai.name.split(" ")[0]}: "${line}"`;
};

window.studyWith = function (aiId) {
  const ai = window.AI_STUDENTS.find(a => a.id === aiId);
  const line = window.aiLine(aiId, "help");
  document.getElementById(`dialog-${aiId}`).textContent = `${ai.name.split(" ")[0]}: "${line}"`;
};
