// ============================================
// question-bank.js — View/edit all questions & puzzles
// ============================================

(function () {
  let cfg = window.CONFIG_API.load();
  const tabs = ["math", "science", "english", "booklet:fillblank", "booklet:matching", "booklet:logicgrid"];
  let activeTab = "math";

  const tabLabels = {
    "math": "Math",
    "science": "Science",
    "english": "English",
    "booklet:fillblank": "Booklet — Fill-in-Blank",
    "booklet:matching": "Booklet — Matching",
    "booklet:logicgrid": "Booklet — Logic Grid"
  };

  const container = document.getElementById("qbContent");
  const tabBar = document.getElementById("qbTabs");

  function renderTabs() {
    tabBar.innerHTML = tabs.map(t =>
      `<button class="btn ${t === activeTab ? '' : 'btn-secondary'}" style="margin:0.25rem; font-size:0.85rem;" data-tab="${t}">${tabLabels[t]}</button>`
    ).join("");
    tabBar.querySelectorAll("button").forEach(b => {
      b.onclick = () => { activeTab = b.dataset.tab; renderTabs(); renderContent(); };
    });
  }

  function renderContent() {
    if (activeTab === "math" || activeTab === "science" || activeTab === "english") {
      renderMCQ(activeTab);
    } else if (activeTab === "booklet:fillblank") {
      renderFillblank();
    } else if (activeTab === "booklet:matching") {
      renderMatching();
    } else if (activeTab === "booklet:logicgrid") {
      renderLogic();
    }
  }

  // ---------- MCQs (Math/Science/English) ----------
  function renderMCQ(subject) {
    const list = cfg.questions[subject] || [];
    container.innerHTML = `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 style="margin:0;">${list.length} question(s) in <strong>${subject}</strong></h3>
          <button class="btn" onclick="window.qbAddMCQ('${subject}')">+ Add Question</button>
        </div>
        <div id="mcqList"></div>
      </div>`;

    document.getElementById("mcqList").innerHTML = list.map((q, i) => `
      <div class="card" style="background:#1a1a1a; margin-bottom:0.75rem;">
        <div style="display:flex; justify-content:space-between; gap:1rem; align-items:flex-start;">
          <div style="flex:1;">
            <div style="font-size:0.8rem; color:var(--anhs-grey); margin-bottom:0.25rem;">Q${i + 1}</div>
            <div style="font-weight:600; margin-bottom:0.5rem;">${escapeHtml(q.q)}</div>
            ${q.a.map((opt, j) => `
              <div style="padding:0.25rem 0.5rem; margin:0.25rem 0; border-radius:4px; ${j === q.c ? 'background:rgba(76,175,80,0.2); border-left:3px solid var(--safe);' : 'border-left:3px solid transparent;'}">
                ${j === q.c ? '✓ ' : ''}${escapeHtml(opt)}
              </div>`).join("")}
          </div>
          <div style="display:flex; flex-direction:column; gap:0.25rem;">
            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="window.qbEditMCQ('${subject}', ${i})">Edit</button>
            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem; border-color:var(--danger);" onclick="window.qbDeleteMCQ('${subject}', ${i})">Delete</button>
          </div>
        </div>
      </div>
    `).join("") || "<p style='color:var(--anhs-grey);'>No questions yet.</p>";
  }

  // ---------- FILL BLANK ----------
  function renderFillblank() {
    const list = cfg.booklet.fillblank || [];
    container.innerHTML = `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 style="margin:0;">${list.length} fill-in-the-blank puzzle(s)</h3>
          <button class="btn" onclick="window.qbAddFillblank()">+ Add Puzzle</button>
        </div>
        <div id="fbList"></div>
      </div>`;
    document.getElementById("fbList").innerHTML = list.map((p, i) => `
      <div class="card" style="background:#1a1a1a; margin-bottom:0.75rem;">
        <div style="display:flex; justify-content:space-between; gap:1rem;">
          <div style="flex:1;">
            <div style="font-size:0.8rem; color:var(--anhs-grey);">Puzzle ${i + 1}</div>
            <div style="margin:0.25rem 0;">${escapeHtml(p.sentence)}</div>
            <div style="color:var(--safe); font-weight:700;">Answer: ${escapeHtml(p.answer)}</div>
            <div style="color:var(--anhs-grey); font-size:0.85rem;">Hint: ${escapeHtml(p.hint || "")}</div>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.25rem;">
            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="window.qbEditFillblank(${i})">Edit</button>
            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem; border-color:var(--danger);" onclick="window.qbDeleteFillblank(${i})">Delete</button>
          </div>
        </div>
      </div>
    `).join("") || "<p style='color:var(--anhs-grey);'>No puzzles yet.</p>";
  }

  // ---------- MATCHING ----------
  function renderMatching() {
    const list = cfg.booklet.matching || [];
    container.innerHTML = `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 style="margin:0;">${list.length} matching puzzle(s)</h3>
          <button class="btn" onclick="window.qbAddMatching()">+ Add Matching Set</button>
        </div>
        <div id="matchingList"></div>
      </div>`;
    document.getElementById("matchingList").innerHTML = list.map((m, i) => `
      <div class="card" style="background:#1a1a1a; margin-bottom:0.75rem;">
        <div style="display:flex; justify-content:space-between; gap:1rem;">
          <div style="flex:1;">
            <div style="font-weight:700; margin-bottom:0.5rem;">${escapeHtml(m.title)}</div>
            ${m.pairs.map(p => `<div style="font-size:0.9rem; padding:0.15rem 0;">${escapeHtml(p.left)} ↔ ${escapeHtml(p.right)}</div>`).join("")}
          </div>
          <div style="display:flex; flex-direction:column; gap:0.25rem;">
            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="window.qbEditMatching(${i})">Edit</button>
            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem; border-color:var(--danger);" onclick="window.qbDeleteMatching(${i})">Delete</button>
          </div>
        </div>
      </div>
    `).join("") || "<p style='color:var(--anhs-grey);'>No matching sets yet.</p>";
  }

  // ---------- LOGIC ----------
  function renderLogic() {
    const list = cfg.booklet.logicgrid || [];
    container.innerHTML = `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 style="margin:0;">${list.length} logic puzzle(s)</h3>
          <button class="btn" onclick="window.qbAddLogic()">+ Add Logic Puzzle</button>
        </div>
        <div id="logicList"></div>
      </div>`;
    document.getElementById("logicList").innerHTML = list.map((l, i) => `
      <div class="card" style="background:#1a1a1a; margin-bottom:0.75rem;">
        <div style="display:flex; justify-content:space-between; gap:1rem;">
          <div style="flex:1;">
            <div style="font-weight:700; margin-bottom:0.5rem;">${escapeHtml(l.title)}</div>
            <div style="font-size:0.85rem; color:var(--anhs-grey); margin-bottom:0.25rem;">Clues:</div>
            ${l.clues.map(c => `<div style="font-size:0.85rem; padding:0.1rem 0;">• ${escapeHtml(c)}</div>`).join("")}
            <div style="font-size:0.85rem; color:var(--safe); margin-top:0.5rem;">
              Answer: ${Object.entries(l.answer).map(([s, n]) => `Seat ${s}=${n}`).join(", ")}
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.25rem;">
            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="window.qbEditLogic(${i})">Edit</button>
            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem; border-color:var(--danger);" onclick="window.qbDeleteLogic(${i})">Delete</button>
          </div>
        </div>
      </div>
    `).join("") || "<p style='color:var(--anhs-grey);'>No logic puzzles yet.</p>";
  }

  // ---------- EDITORS (use prompt/JSON for simplicity) ----------
  function persist() {
    window.CONFIG_API.save(cfg);
    window.CONFIG = cfg;
  }

  window.qbAddMCQ = function (subject) {
    const raw = prompt("Paste MCQ as JSON:\n{\"q\":\"...\",\"a\":[\"opt1\",\"opt2\",\"opt3\",\"opt4\"],\"c\":0}\n\n(c = index of correct answer, 0-based)");
    if (!raw) return;
    try {
      const obj = JSON.parse(raw);
      if (!obj.q || !Array.isArray(obj.a) || typeof obj.c !== "number") throw new Error("Missing q/a/c");
      cfg.questions[subject].push(obj);
      persist();
      renderContent();
    } catch (e) { alert("Invalid JSON: " + e.message); }
  };

  window.qbEditMCQ = function (subject, idx) {
    const q = cfg.questions[subject][idx];
    const raw = prompt("Edit MCQ as JSON:", JSON.stringify(q, null, 2));
    if (!raw) return;
    try {
      const obj = JSON.parse(raw);
      cfg.questions[subject][idx] = obj;
      persist(); renderContent();
    } catch (e) { alert("Invalid JSON: " + e.message); }
  };

  window.qbDeleteMCQ = function (subject, idx) {
    if (!confirm("Delete this question?")) return;
    cfg.questions[subject].splice(idx, 1);
    persist(); renderContent();
  };

  window.qbAddFillblank = function () {
    const raw = prompt("Paste fill-blank as JSON:\n{\"sentence\":\"The sky is ___.\",\"answer\":\"blue\",\"hint\":\"Color\"}");
    if (!raw) return;
    try {
      const obj = JSON.parse(raw);
      cfg.booklet.fillblank.push(obj);
      persist(); renderContent();
    } catch (e) { alert("Invalid JSON: " + e.message); }
  };

  window.qbEditFillblank = function (idx) {
    const p = cfg.booklet.fillblank[idx];
    const raw = prompt("Edit puzzle:", JSON.stringify(p, null, 2));
    if (!raw) return;
    try { cfg.booklet.fillblank[idx] = JSON.parse(raw); persist(); renderContent(); }
    catch (e) { alert("Invalid JSON: " + e.message); }
  };

  window.qbDeleteFillblank = function (idx) {
    if (!confirm("Delete this puzzle?")) return;
    cfg.booklet.fillblank.splice(idx, 1);
    persist(); renderContent();
  };

  window.qbAddMatching = function () {
    const raw = prompt("Paste matching set as JSON:\n{\"title\":\"Match X\",\"pairs\":[{\"left\":\"A\",\"right\":\"1\"},{\"left\":\"B\",\"right\":\"2\"}]}");
    if (!raw) return;
    try { cfg.booklet.matching.push(JSON.parse(raw)); persist(); renderContent(); }
    catch (e) { alert("Invalid JSON: " + e.message); }
  };

  window.qbEditMatching = function (idx) {
    const m = cfg.booklet.matching[idx];
    const raw = prompt("Edit matching set:", JSON.stringify(m, null, 2));
    if (!raw) return;
    try { cfg.booklet.matching[idx] = JSON.parse(raw); persist(); renderContent(); }
    catch (e) { alert("Invalid JSON: " + e.message); }
  };

  window.qbDeleteMatching = function (idx) {
    if (!confirm("Delete this matching set?")) return;
    cfg.booklet.matching.splice(idx, 1);
    persist(); renderContent();
  };

  window.qbAddLogic = function () {
    const raw = prompt("Paste logic puzzle as JSON:\n{\"title\":\"...\",\"clues\":[\"...\"],\"seats\":4,\"answer\":{\"1\":\"A\",\"2\":\"B\",\"3\":\"C\",\"4\":\"D\"}}");
    if (!raw) return;
    try { cfg.booklet.logicgrid.push(JSON.parse(raw)); persist(); renderContent(); }
    catch (e) { alert("Invalid JSON: " + e.message); }
  };

  window.qbEditLogic = function (idx) {
    const l = cfg.booklet.logicgrid[idx];
    const raw = prompt("Edit logic puzzle:", JSON.stringify(l, null, 2));
    if (!raw) return;
    try { cfg.booklet.logicgrid[idx] = JSON.parse(raw); persist(); renderContent(); }
    catch (e) { alert("Invalid JSON: " + e.message); }
  };

  window.qbDeleteLogic = function (idx) {
    if (!confirm("Delete this logic puzzle?")) return;
    cfg.booklet.logicgrid.splice(idx, 1);
    persist(); renderContent();
  };

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ---------- INIT ----------
  renderTabs();
  renderContent();
})();
