// ============================================
// booklet.js — Reads puzzles & rewards from CONFIG
// ============================================

window.Booklet = (function () {

  let activeFillblank = null, activeMatching = null, activeLogic = null;

  function getPUZZLES() { return window.CONFIG.booklet; }
  function getRewards() { return window.CONFIG.rewards; }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---------- FILL BLANK ----------
  function startFillblank() {
    const pool = getPUZZLES().fillblank || [];
    if (!pool.length) return alert("No fill-blank puzzles configured.");
    activeFillblank = shuffle(pool).slice(0, Math.min(5, pool.length));
    activeFillblank.forEach(p => p.solved = false);
    renderFillblank();
  }

  function renderFillblank() {
    const wrap = document.getElementById("puzzleArea");
    wrap.innerHTML = `
      <h2>Fill in the Blank</h2>
      <p style="color:var(--anhs-grey); margin-bottom:1rem;">Complete each sentence. Case-insensitive.</p>
      <div id="fbList"></div>
      <div class="text-center mt-1">
        <button class="btn" onclick="Booklet.checkFillblank()">Check Answers</button>
      </div>`;
    document.getElementById("fbList").innerHTML = activeFillblank.map((p, i) => `
      <div class="card" style="margin-bottom:0.75rem; border-left-color:${p.solved ? 'var(--safe)' : 'var(--anhs-red)'};">
        <div>${p.sentence}</div>
        <input id="fbInput${i}" type="text" placeholder="Your answer…"
          style="margin-top:0.5rem; width:100%; padding:0.5rem; background:#1a1a1a; border:1px solid #444; border-radius:4px; color:white; font-size:1rem;"
          ${p.solved ? 'disabled value="' + p.answer + '"' : ''}>
        <div style="font-size:0.8rem; color:var(--anhs-grey); margin-top:0.25rem;">💡 ${p.hint || ""}</div>
        <div id="fbResult${i}" style="margin-top:0.25rem; font-weight:700;"></div>
      </div>`).join("");
  }

  function checkFillblank() {
    let correct = 0;
    activeFillblank.forEach((p, i) => {
      if (p.solved) { correct++; return; }
      const input = document.getElementById("fbInput" + i);
      const val = input.value.trim().toLowerCase();
      const res = document.getElementById("fbResult" + i);
      if (val === p.answer.toLowerCase()) {
        p.solved = true; input.disabled = true;
        input.style.borderColor = "var(--safe)";
        res.textContent = "✓ Correct"; res.style.color = "var(--safe)";
        correct++;
      } else {
        res.textContent = "✗ Try again"; res.style.color = "var(--danger)";
      }
    });
    if (correct === activeFillblank.length) {
      const R = getRewards();
      finishPuzzle(R.bookletFillblankBase + activeFillblank.length * R.bookletFillblankPerCorrect, "Fill-in-the-Blank");
    }
  }

  // ---------- MATCHING ----------
  function startMatching() {
    const pool = getPUZZLES().matching || [];
    if (!pool.length) return alert("No matching puzzles configured.");
    const puzzle = pool[Math.floor(Math.random() * pool.length)];
    activeMatching = {
      title: puzzle.title,
      pairs: puzzle.pairs,
      left: shuffle(puzzle.pairs.map(p => p.left)),
      right: shuffle(puzzle.pairs.map(p => p.right)),
      selectedLeft: null,
      matched: []
    };
    renderMatching();
  }

  function renderMatching() {
    const m = activeMatching;
    const wrap = document.getElementById("puzzleArea");
    wrap.innerHTML = `
      <h2>${m.title}</h2>
      <p style="color:var(--anhs-grey); margin-bottom:1rem;">Click a left item, then its match on the right.</p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
        <div id="mLeft"></div><div id="mRight"></div>
      </div>
      <div class="text-center mt-1">
        <button class="btn btn-secondary" onclick="Booklet.startMatching()">New Puzzle</button>
      </div>`;
    document.getElementById("mLeft").innerHTML = m.left.map(item => {
      const done = m.matched.some(p => p.left === item);
      return `<button class="answer-btn" style="width:100%; margin-bottom:0.5rem; ${done ? 'background:var(--safe); border-color:var(--safe);' : ''}" ${done ? 'disabled' : ''} onclick="Booklet.selectLeft('${item}')">${item}</button>`;
    }).join("");
    document.getElementById("mRight").innerHTML = m.right.map(item => {
      const done = m.matched.some(p => p.right === item);
      return `<button class="answer-btn" style="width:100%; margin-bottom:0.5rem; ${done ? 'background:var(--safe); border-color:var(--safe);' : ''}" ${done ? 'disabled' : ''} onclick="Booklet.selectRight('${item}')">${item}</button>`;
    }).join("");
  }

  function selectLeft(item) {
    activeMatching.selectedLeft = item;
    document.querySelectorAll("#mLeft button").forEach(b => {
      b.style.outline = b.textContent === item ? "2px solid var(--anhs-red)" : "none";
    });
  }

  function selectRight(item) {
    const m = activeMatching;
    if (!m.selectedLeft) { alert("Pick a left item first."); return; }
    const correctPair = m.pairs.find(p => p.left === m.selectedLeft);
    if (correctPair && correctPair.right === item) {
      m.matched.push({ left: m.selectedLeft, right: item });
      m.selectedLeft = null;
      renderMatching();
      if (m.matched.length === m.pairs.length) finishPuzzle(getRewards().bookletMatching, "Matching");
    } else {
      const btn = [...document.querySelectorAll("#mRight button")].find(b => b.textContent === item);
      if (btn) { btn.classList.add("wrong"); setTimeout(() => btn.classList.remove("wrong"), 500); }
      m.selectedLeft = null;
      renderMatching();
    }
  }

  // ---------- LOGIC ----------
  function startLogic() {
    const pool = getPUZZLES().logicgrid || [];
    if (!pool.length) return alert("No logic puzzles configured.");
    const puzzle = pool[Math.floor(Math.random() * pool.length)];
    activeLogic = { ...puzzle, assignments: {} };
    renderLogic();
  }

  function renderLogic() {
    const L = activeLogic;
    const wrap = document.getElementById("puzzleArea");
    const names = [...new Set(Object.values(L.answer))];
    wrap.innerHTML = `
      <h2>${L.title}</h2>
      <div class="card" style="border-left-color:var(--anhs-red);">
        <h3>Clues</h3>
        ${L.clues.map(c => `<div style="padding:0.25rem 0;">• ${c}</div>`).join("")}
      </div>
      <h3 style="margin-top:1rem;">Assign each seat</h3>
      ${Array.from({ length: L.seats }, (_, i) => i + 1).map(seat => `
        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.5rem;">
          <span style="font-weight:700; min-width:60px;">Seat ${seat}</span>
          <select id="logicSeat${seat}" style="flex:1; padding:0.5rem; background:#1a1a1a; border:1px solid #444; border-radius:4px; color:white;">
            <option value="">— choose —</option>
            ${names.map(n => `<option value="${n}" ${L.assignments[seat] === n ? 'selected' : ''}>${n}</option>`).join("")}
          </select>
        </div>`).join("")}
      <div class="text-center mt-1">
        <button class="btn" onclick="Booklet.checkLogic()">Submit Solution</button>
      </div>
      <div id="logicResult" class="text-center mt-1"></div>`;
  }

  function checkLogic() {
    const L = activeLogic;
    let allCorrect = true;
    for (let seat = 1; seat <= L.seats; seat++) {
      const sel = document.getElementById("logicSeat" + seat);
      if (sel.value !== L.answer[seat]) { allCorrect = false; sel.style.borderColor = "var(--danger)"; }
      else sel.style.borderColor = "var(--safe)";
    }
    const res = document.getElementById("logicResult");
    if (allCorrect) {
      res.innerHTML = `<span style="color:var(--safe); font-weight:700;">✓ Correct!</span>`;
      finishPuzzle(getRewards().bookletLogic, "Logic Grid");
    } else {
      res.innerHTML = `<span style="color:var(--danger); font-weight:700;">✗ Not quite. Re-read the clues.</span>`;
    }
  }

  function finishPuzzle(cpReward, name) {
    const st = window.ANHS.loadState();
    window.ANHS.applyCPChange(st, cpReward);
    const events = window.Ranking.evaluate(st);
    window.ANHS.saveState(st);
    const eventsHtml = events.length ? `<div class="card mt-1">${events.map(e => `<div>${e.message}</div>`).join("")}</div>` : "";
    document.getElementById("puzzleArea").innerHTML = `
      <div class="result-box">
        <h1 style="color:var(--safe);">SOLVED</h1>
        <p class="subtitle">${name} complete.</p>
        <div class="result-detail">CP: <strong style="color:var(--safe);">+${cpReward}</strong></div>
        ${eventsHtml}
        <div class="mt-2">
          <a href="index.html" class="btn">Dashboard</a>
          <button class="btn btn-secondary" onclick="location.reload()">New Puzzle</button>
        </div>
      </div>`;
  }

  return { startFillblank, startMatching, startLogic, selectLeft, selectRight, checkFillblank, checkLogic };
})();
