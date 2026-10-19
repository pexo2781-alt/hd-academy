// ============================================
// class-roster.js — Renders NPC roster cards
// ============================================

window.ClassRoster = (function () {

  function renderNPCGrid(npcs) {
    return npcs.map(n => `
      <div class="npc-card" onclick="window.NPCTalk.open('${n.id}')">
        <div class="npc-portrait" style="background:${n.portrait.color}">${n.portrait.emoji}</div>
        <div class="npc-name">${n.name}</div>
        <div class="npc-meta">${n.specialty === "all" ? "All-Rounder" : n.specialty.charAt(0).toUpperCase() + n.specialty.slice(1)}</div>
      </div>
    `).join("");
  }

  function renderRoster(containerEl, classRank, options) {
    const opts = options || {};
    const npcs = window.getNPCsByClass(classRank);

    const important = npcs.filter(n => !n.isGeneric);
    const generic = npcs.filter(n => n.isGeneric);

    let html = "";
    if (important.length) {
      html += `
        <div style="margin-bottom:1.25rem;">
          <h3 class="roster-heading">Important Classmates</h3>
          <div class="npc-grid">${renderNPCGrid(important)}</div>
        </div>`;
    }
    if (generic.length) {
      html += `
        <div>
          <h3 class="roster-heading">Classmates</h3>
          <div class="npc-grid">${renderNPCGrid(generic)}</div>
        </div>`;
    }
    containerEl.innerHTML = html;
  }

  return { renderRoster };
})();
