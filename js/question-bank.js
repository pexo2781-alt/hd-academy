// ============================================
// question-bank.js — V3: per-subject, per-type, modal editors
// ============================================

(function () {
  let cfg = window.CONFIG_API.load();
  const SUBJECTS = ["math", "science", "english"];
  const TYPES = ["written", "fillblank", "matching", "logic"];
  const TYPE_LABELS = {
    written: "Written (MCQ)",
    fillblank: "Fill in the Blank",
    matching: "Matching",
    logic: "Logic Grid"
  };

  let activeSubject = "math";
  let activeType = "written";

  const tabsEl = document.getElementById("qbTabs");
  const contentEl = document.getElementById("qbContent");

  // ---------- TABS ----------
  function renderTabs() {
    tabsEl.innerHTML = `
      <div style="margin-bottom:0.75rem;">
        <strong style="color:var(--anhs-grey); font-size:0.8rem; text-transform:uppercase;">Subject:</strong>
        ${SUBJECTS.map(s =>
          `<button class="btn ${s === activeSubject ? '' : 'btn-secondary'}" style="margin:0.25rem; font-size:0.85rem;" onclick="window.qbSetSubject('${s}')">${s}</button>`
        ).join("")}
      </div>
      <div>
        <strong style="color:var(--anhs-grey); font-size:0.8rem; text-transform:uppercase;">Type:</strong>
        ${TYPES.map(t =>
          `<button class="btn ${t === activeType ? '' : 'btn-secondary'}" style="margin:0.25rem; font-size:0.85rem;" onclick="window.qbSetType('${t}')">${TYPE_LABELS[t]}</button>`
        ).join("")}
      </div>
    `;
  }

  window.qbSetSubject = function (s) { activeSubject = s; renderTabs(); renderContent(); };
  window.qbSetType = function (t) { activeType = t; renderTabs(); renderContent(); };

  // ---------- CONTENT ROUTER ----------
  function renderContent() {
    const bank = (cfg.questions[activeSubject] || {})[activeType] || [];
    if (activeType === "written") renderMCQList(bank);
    else if (activeType === "fillblank") renderFillblankList(bank);
    else if (activeType === "matching") renderMatchingList(bank);
    else if (activeType === "logic") renderLogicList(bank);
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function escapeAttr(s) { return String(s).replace(/"/g, "&quot;").replace(/</g, "&lt;"); }

  function header(title, count, addLabel, addFn) {
    return `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
      <h3 style="margin:0;">${count} ${title} <span style="color:var(--anhs-grey); font-size:0.85rem;">— ${activeSubject}/${activeType}</span></h3>
      <button class="btn" onclick="window.${addFn}()">${addLabel}</button>
    </div>`;
  }

  // ---------- LIST: WRITTEN ----------
  function renderMCQList(list) {
    contentEl.innerHTML = `<div class="card">${header("question(s)", list.length, "+ Add Question", "qbAddMCQ")}<div id="mcqList"></div></div>`;
    document.getElementById("mcqList").innerHTML = list.map((q, i) => `
      <div class="card" style="background:var(--anhs-dark); margin-bottom:0.75rem;">
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
            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="window.qbEditMCQ(${i})">Edit</button>
            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem; border-color:var(--danger); color:var(--danger);" onclick="window.qbDeleteMCQ(${i})">Delete</button>
          </div>
        </div>
      </div>
    `).join("") || "<p style='color:var(--anhs-grey);'>No questions yet. Click + Add.</p>";
  }

  // ---------- LIST: FILLBLANK ----------
  function renderFillblankList(list) {
    contentEl.innerHTML = `<div class="card">${header("puzzle(s)", list.length, "+ Add Puzzle", "qbAddFillblank")}<div id="fbList"></div></div>`;
    document.getElementById("fbList").innerHTML = list.map((p, i) => `
      <div class="card" style="background:var(--anhs-dark); margin-bottom:0.75rem;">
        <div style="display:flex; justify-content:space-between; gap:1rem;">
          <div style="flex:1;">
            <div style="font-size:0.8rem; color:var(--anhs-grey);">Puzzle ${i + 1}</div>
            <div style="margin:0.25rem 0;">${escapeHtml(p.sentence)}</div>
            <div style="color:var(--safe); font-weight:700;">Answer: ${escapeHtml(p.answer)}</div>
            <div style="color:var(--anhs-grey); font-size:0.85rem;">Hint: ${escapeHtml(p.hint || "")}</div>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.25rem;">
            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="window.qbEditFillblank(${i})">Edit</button>
            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem; border-color:var(--danger); color:var(--danger);" onclick="window.qbDeleteFillblank(${i})">Delete</button>
          </div>
        </div>
      </div>
    `).join("") || "<p style='color:var(--anhs-grey);'>No puzzles yet.</p>";
  }

  // ---------- LIST: MATCHING ----------
  function renderMatchingList(list) {
    contentEl.innerHTML = `<div class="card">${header("matching set(s)", list.length, "+ Add Matching Set", "qbAddMatching")}<div id="matchingList"></div></div>`;
    document.getElementById("matchingList").innerHTML = list.map((m, i) => `
      <div class="card" style="background:var(--anhs-dark); margin-bottom:0.75rem;">
        <div style="display:flex; justify-content:space-between; gap:1rem;">
          <div style="flex:1;">
            <div style="font-weight:700; margin-bottom:0.5rem;">${escapeHtml(m.title)}</div>
            ${m.pairs.map(p => `<div style="font-size:0.9rem; padding:0.15rem 0;">${escapeHtml(p.left)} ↔ ${escapeHtml(p.right)}</div>`).join("")}
          </div>
          <div style="display:flex; flex-direction:column; gap:0.25rem;">
            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="window.qbEditMatching(${i})">Edit</button>
            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem; border-color:var(--danger); color:var(--danger);" onclick="window.qbDeleteMatching(${i})">Delete</button>
          </div>
        </div>
      </div>
    `).join("") || "<p style='color:var(--anhs-grey);'>No matching sets yet.</p>";
  }

  // ---------- LIST: LOGIC ----------
  function renderLogicList(list) {
    contentEl.innerHTML = `<div class="card">${header("logic puzzle(s)", list.length, "+ Add Logic Puzzle", "qbAddLogic")}<div id="logicList"></div></div>`;
    document.getElementById("logicList").innerHTML = list.map((l, i) => `
      <div class="card" style="background:var(--anhs-dark); margin-bottom:0.75rem;">
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
            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem; border-color:var(--danger); color:var(--danger);" onclick="window.qbDeleteLogic(${i})">Delete</button>
          </div>
        </div>
      </div>
    `).join("") || "<p style='color:var(--anhs-grey);'>No logic puzzles yet.</p>";
  }

  // ---------- MODAL SYSTEM ----------
  function openModal(title, bodyHtml, onSave) {
    closeModal();
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.id = "qbModal";
    backdrop.innerHTML = `
      <div class="modal">
        <h2>${title}</h2>
        <div id="modalBody">${bodyHtml}</div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="window.qbCloseModal()">Cancel</button>
          <button class="btn" id="modalSaveBtn">Save</button>
        </div>
      </div>`;
    document.body.appendChild(backdrop);
    document.getElementById("modalSaveBtn").onclick = () => {
      const ok = onSave();
      if (ok !== false) closeModal();
    };
  }

  window.qbCloseModal = function () {
    const m = document.getElementById("qbModal");
    if (m) m.remove();
  };

  function closeModal() { window.qbCloseModal(); }

  function persist() {
    window.CONFIG_API.save(cfg);
    window.CONFIG = cfg;
  }

  // ---------- WRITTEN EDITOR ----------
  function openMCQEditor(index) {
    const isNew = index === undefined || index === null;
    const q = isNew ? { q: "", a: ["", "", "", ""], c: 0 } : JSON.parse(JSON.stringify(cfg.questions[activeSubject].written[index]));

    function renderOptions() {
      return q.a.map((opt, i) => `
        <div class="option-row">
          <input type="radio" name="correctOpt" ${i === q.c ? "checked" : ""} onchange="window.qbSetCorrect(${i})">
          <input type="text" class="opt-input" data-idx="${i}" value="${escapeAttr(opt)}" placeholder="Option ${i + 1}" oninput="window.qbUpdateOpt(${i}, this.value)">
          ${q.a.length > 2 ? `<button class="remove-opt" onclick="window.qbRemoveOpt(${i})">×</button>` : ""}
        </div>`).join("");
    }

    window.qbSetCorrect = function (i) { q.c = i; };
    window.qbUpdateOpt = function (i, v) { q.a[i] = v; };
    window.qbRemoveOpt = function (i) {
      q.a.splice(i, 1);
      if (q.c >= q.a.length) q.c = 0;
      document.getElementById("optList").innerHTML = renderOptions();
    };
    window.qbAddOpt = function () {
      q.a.push("");
      document.getElementById("optList").innerHTML = renderOptions();
    };

    openModal(
      isNew ? "New Written Question" : "Edit Written Question",
      `
        <div class="form-row">
          <label>Question</label>
          <input type="text" id="mcqQuestion" value="${escapeAttr(q.q)}" placeholder="What is 2+2?">
        </div>
        <div class="form-row">
          <label>Options (select radio for correct answer)</label>
          <div id="optList">${renderOptions()}</div>
          <button class="add-row-btn" onclick="window.qbAddOpt()">+ Add option</button>
        </div>
      `,
      () => {
        q.q = document.getElementById("mcqQuestion").value.trim();
        if (!q.q) { alert("Question is required."); return false; }
        if (q.a.length < 2) { alert("Need at least 2 options."); return false; }
        if (q.a.some(o => !o.trim())) { alert("All options must be filled."); return false; }

        if (isNew) cfg.questions[activeSubject].written.push(q);
        else cfg.questions[activeSubject].written[index] = q;
        persist();
        renderContent();
        return true;
      }
    );
  }

  // ---------- FILLBLANK EDITOR ----------
  function openFillblankEditor(index) {
    const isNew = index === undefined || index === null;
    const p = isNew ? { sentence: "", answer: "", hint: "" } : JSON.parse(JSON.stringify(cfg.questions[activeSubject].fillblank[index]));

    openModal(
      isNew ? "New Fill-in-Blank" : "Edit Fill-in-Blank",
      `
        <div class="form-row"><label>Sentence (use ___ for blank)</label>
          <input type="text" id="fbSentence" value="${escapeAttr(p.sentence)}" placeholder="The sky is ___.">
        </div>
        <div class="form-row"><label>Answer (case-insensitive)</label>
          <input type="text" id="fbAnswer" value="${escapeAttr(p.answer)}" placeholder="blue">
        </div>
        <div class="form-row"><label>Hint (optional)</label>
          <input type="text" id="fbHint" value="${escapeAttr(p.hint || "")}" placeholder="A color">
        </div>
      `,
      () => {
        p.sentence = document.getElementById("fbSentence").value.trim();
        p.answer = document.getElementById("fbAnswer").value.trim();
        p.hint = document.getElementById("fbHint").value.trim();
        if (!p.sentence || !p.answer) { alert("Sentence and answer required."); return false; }
        if (isNew) cfg.questions[activeSubject].fillblank.push(p);
        else cfg.questions[activeSubject].fillblank[index] = p;
        persist(); renderContent();
        return true;
      }
    );
  }

  // ---------- MATCHING EDITOR ----------
  function openMatchingEditor(index) {
    const isNew = index === undefined || index === null;
    const m = isNew ? { title: "", pairs: [{ left: "", right: "" }, { left: "", right: "" }] } : JSON.parse(JSON.stringify(cfg.questions[activeSubject].matching[index]));

    function renderPairs() {
      return m.pairs.map((p, i) => `
        <div class="pair-row">
          <input type="text" data-side="left" data-idx="${i}" value="${escapeAttr(p.left)}" placeholder="Left ${i + 1}"
            oninput="window.qbUpdatePair(${i}, 'left', this.value)">
          <span>↔</span>
          <input type="text" data-side="right" data-idx="${i}" value="${escapeAttr(p.right)}" placeholder="Right ${i + 1}"
            oninput="window.qbUpdatePair(${i}, 'right', this.value)">
          ${m.pairs.length > 1 ? `<button class="remove-opt" onclick="window.qbRemovePair(${i})">×</button>` : ""}
        </div>`).join("");
    }

    window.qbUpdatePair = function (i, side, v) { m.pairs[i][side] = v; };
    window.qbRemovePair = function (i) {
      m.pairs.splice(i, 1);
      document.getElementById("pairList").innerHTML = renderPairs();
    };
    window.qbAddPair = function () {
      m.pairs.push({ left: "", right: "" });
      document.getElementById("pairList").innerHTML = renderPairs();
    };

    openModal(
      isNew ? "New Matching Set" : "Edit Matching Set",
      `
        <div class="form-row"><label>Title</label>
          <input type="text" id="mTitle" value="${escapeAttr(m.title)}" placeholder="Match the Elements">
        </div>
        <div class="form-row"><label>Pairs (left ↔ right)</label>
          <div id="pairList">${renderPairs()}</div>
          <button class="add-row-btn" onclick="window.qbAddPair()">+ Add pair</button>
        </div>
      `,
      () => {
        m.title = document.getElementById("mTitle").value.trim();
        if (!m.title) { alert("Title required."); return false; }
        if (m.pairs.length < 1) { alert("Need at least 1 pair."); return false; }
        if (m.pairs.some(p => !p.left.trim() || !p.right.trim())) { alert("All pairs must be filled."); return false; }
        if (isNew) cfg.questions[activeSubject].matching.push(m);
        else cfg.questions[activeSubject].matching[index] = m;
        persist(); renderContent();
        return true;
      }
    );
  }

  // ---------- LOGIC EDITOR ----------
  function openLogicEditor(index) {
    const isNew = index === undefined || index === null;
    const l = isNew
      ? { title: "", clues: ["", ""], seats: 3, answer: { 1: "", 2: "", 3: "" } }
      : JSON.parse(JSON.stringify(cfg.questions[activeSubject].logic[index]));

    function renderClues() {
      return l.clues.map((c, i) => `
        <div class="clue-row">
          <input type="text" value="${escapeAttr(c)}" placeholder="Clue ${i + 1}"
            oninput="window.qbUpdateClue(${i}, this.value)">
          ${l.clues.length > 1 ? `<button class="remove-opt" onclick="window.qbRemoveClue(${i})">×</button>` : ""}
        </div>`).join("");
    }

    function renderSeatInputs() {
      return Object.keys(l.answer).sort((a, b) => parseInt(a) - parseInt(b)).map(seat => `
        <div class="pair-row">
          <label style="min-width:70px; color:var(--anhs-grey); font-size:0.85rem;">Seat ${seat}</label>
          <input type="text" value="${escapeAttr(l.answer[seat])}" placeholder="e.g. Ayanokoji"
            oninput="window.qbSetSeat('${seat}', this.value)">
        </div>`).join("");
    }

    window.qbUpdateClue = function (i, v) { l.clues[i] = v; };
    window.qbRemoveClue = function (i) {
      l.clues.splice(i, 1);
      document.getElementById("clueList").innerHTML = renderClues();
    };
    window.qbAddClue = function () {
      l.clues.push("");
      document.getElementById("clueList").innerHTML = renderClues();
    };
    window.qbSetSeat = function (seat, v) { l.answer[seat] = v; };
    window.qbSetSeats = function (n) {
      n = Math.max(2, Math.min(8, parseInt(n) || 3));
      l.seats = n;
      const newAns = {};
      for (let i = 1; i <= n; i++) newAns[i] = l.answer[i] || "";
      l.answer = newAns;
      document.getElementById("seatInputs").innerHTML = renderSeatInputs();
    };

    openModal(
      isNew ? "New Logic Puzzle" : "Edit Logic Puzzle",
      `
        <div class="form-row"><label>Title</label>
          <input type="text" id="lTitle" value="${escapeAttr(l.title)}" placeholder="Who owns the fish?">
        </div>
        <div class="form-row"><label>Number of seats</label>
          <input type="number" id="lSeats" min="2" max="8" value="${l.seats}" onchange="window.qbSetSeats(this.value)">
        </div>
        <div class="form-row"><label>Clues</label>
          <div id="clueList">${renderClues()}</div>
          <button class="add-row-btn" onclick="window.qbAddClue()">+ Add clue</button>
        </div>
        <div class="form-row"><label>Correct Answer per Seat</label>
          <div id="seatInputs">${renderSeatInputs()}</div>
        </div>
      `,
      () => {
        l.title = document.getElementById("lTitle").value.trim();
        if (!l.title) { alert("Title required."); return false; }
        if (l.clues.some(c => !c.trim())) { alert("All clues must be filled."); return false; }
        if (Object.values(l.answer).some(v => !v.trim())) { alert("All seat answers required."); return false; }
        if (isNew) cfg.questions[activeSubject].logic.push(l);
        else cfg.questions[activeSubject].logic[index] = l;
        persist(); renderContent();
        return true;
      }
    );
  }

  // ---------- PUBLIC ADD/EDIT/DELETE ----------
  window.qbAddMCQ = () => openMCQEditor();
  window.qbEditMCQ = (i) => openMCQEditor(i);
  window.qbDeleteMCQ = (i) => {
    if (!confirm("Delete this question?")) return;
    cfg.questions[activeSubject].written.splice(i, 1);
    persist(); renderContent();
  };

  window.qbAddFillblank = () => openFillblankEditor();
  window.qbEditFillblank = (i) => openFillblankEditor(i);
  window.qbDeleteFillblank = (i) => {
    if (!confirm("Delete this puzzle?")) return;
    cfg.questions[activeSubject].fillblank.splice(i, 1);
    persist(); renderContent();
  };

  window.qbAddMatching = () => openMatchingEditor();
  window.qbEditMatching = (i) => openMatchingEditor(i);
  window.qbDeleteMatching = (i) => {
    if (!confirm("Delete this matching set?")) return;
    cfg.questions[activeSubject].matching.splice(i, 1);
    persist(); renderContent();
  };

  window.qbAddLogic = () => openLogicEditor();
  window.qbEditLogic = (i) => openLogicEditor(i);
  window.qbDeleteLogic = (i) => {
    if (!confirm("Delete this logic puzzle?")) return;
    cfg.questions[activeSubject].logic.splice(i, 1);
    persist(); renderContent();
  };

  // ---------- INIT ----------
  renderTabs();
  renderContent();
})();
