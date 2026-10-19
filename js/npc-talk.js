// ============================================
// npc-talk.js — Talk modal for NPC interaction
// ============================================

window.NPCTalk = (function () {
  function open(npcId) {
    const npc = window.getNPCById(npcId);
    if (!npc) return;

    const st = window.ANHS.loadState();
    let category = "taunt";
    if (npc.class === st.classRank) {
      // Same class → friendlier
      category = (st.quizzesTaken >= 5 || (st.totalScore || 0) > 500) ? "respect" : "win";
    } else {
      // Different class
      if (st.classRank === "A" || st.classRank === "B") category = "respect";
      else if (st.dangerLevel >= 2) category = "taunt";
    }

    const line = randomLine(npc, category);
    renderModal(npc, line);
  }

  function randomLine(npc, category) {
    const pool = (npc.lines && npc.lines[category]) || ["..."];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function renderModal(npc, line) {
    close();
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.id = "npcTalkModal";
    const specialtyLabel = npc.specialty === "all"
      ? "All-Rounder"
      : npc.specialty.charAt(0).toUpperCase() + npc.specialty.slice(1);
    const skillPct = Math.round(npc.skill * 100);

    backdrop.innerHTML = `
      <div class="modal" style="max-width: 500px; text-align: center;">
        <div class="npc-talk-portrait" style="background:${npc.portrait.color}">${npc.portrait.emoji}</div>
        <h2 style="margin-top:0.5rem;">${npc.name}</h2>
        <div style="color:var(--anhs-grey); font-size:0.85rem; margin-bottom:0.25rem;">
          Class ${npc.class} · ${specialtyLabel} · Skill ${skillPct}%
        </div>
        ${npc.tagline ? `<div style="font-style:italic; color:var(--anhs-grey); font-size:0.9rem; margin-bottom:1rem;">"${npc.tagline}"</div>` : ""}
        <div class="npc-talk-line">"${line}"</div>
        <div class="modal-actions" style="justify-content:center; margin-top:1.25rem;">
          <button class="btn btn-secondary" onclick="window.NPCTalk.close()">Close</button>
        </div>
      </div>`;
    document.body.appendChild(backdrop);
  }

  function close() {
    const m = document.getElementById("npcTalkModal");
    if (m) m.remove();
  }

  return { open, close };
})();
