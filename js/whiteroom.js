// ============================================
// whiteroom.js — Rapid-fire stress drills
// ============================================

window.WhiteRoom = (function () {

  const DRILL_TIME = 5;         // seconds per question — intense
  const DRILL_COUNT = 15;       // questions per session

  let drill = null;

  // Generate on-the-fly rapid questions (no reuse from bank)
  function genMathQuestion() {
    const ops = ["+", "-", "×"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, answer;
    if (op === "+") { a = rnd(10, 99); b = rnd(10, 99); answer = a + b; }
    else if (op === "-") { a = rnd(30, 99); b = rnd(1, 29); answer = a - b; }
    else { a = rnd(3, 12); b = rnd(3, 12); answer = a * b; }

    const wrongs = new Set();
    while (wrongs.size < 3) {
      const delta = rnd(-10, 10);
      const w = answer + (delta === 0 ? 5 : delta);
      if (w !== answer) wrongs.add(w);
    }
    const opts = shuffle([answer, ...wrongs]);
    return { q: `${a} ${op} ${b} = ?`, options: opts.map(String), correctIdx: opts.indexOf(answer) };
  }

  function genPatternQuestion() {
    const step = rnd(2, 9);
    const start = rnd(1, 10);
    const seq = [start, start + step, start + step * 2, start + step * 3];
    const answer = start + step * 4;
    const wrongs = new Set();
    while (wrongs.size < 3) {
      const w = answer + rnd(-step * 2, step * 2);
      if (w !== answer) wrongs.add(w);
    }
    const opts = shuffle([answer, ...wrongs]);
    return { q: `Next: ${seq.join(", ")}, ?`, options: opts.map(String), correctIdx: opts.indexOf(answer) };
  }

  function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function start() {
    const qs = [];
    for (let i = 0; i < DRILL_COUNT; i++) {
      qs.push(i % 2 === 0 ? genMathQuestion() : genPatternQuestion());
    }
    drill = { questions: qs, idx: 0, correct: 0, timer: null, timeLeft: DRILL_TIME, answered: false };
    document.getElementById("introCard").classList.add("hidden");
    document.getElementById("drillScreen").classList.remove("hidden");
    renderQuestion();
  }

  function renderQuestion() {
    const q = drill.questions[drill.idx];
    drill.answered = false;
    drill.timeLeft = DRILL_TIME;

    document.getElementById("drillProgress").textContent = `${drill.idx + 1} / ${drill.questions.length}`;
    document.getElementById("drillCorrect").textContent = drill.correct;
    document.getElementById("drillQuestion").textContent = q.q;

    const wrap = document.getElementById("drillAnswers");
    wrap.innerHTML = "";
    q.options.forEach((opt, i) => {
      const b = document.createElement("button");
      b.className = "answer-btn";
      b.textContent = opt;
      b.onclick = () => answer(i);
      wrap.appendChild(b);
    });

    startTimer();
  }

  function startTimer() {
    clearInterval(drill.timer);
    const el = document.getElementById("drillTimer");
    el.textContent = drill.timeLeft + "s";
    el.classList.add("warning");

    drill.timer = setInterval(() => {
      drill.timeLeft--;
      el.textContent = drill.timeLeft + "s";
      if (drill.timeLeft <= 0) {
        clearInterval(drill.timer);
        if (!drill.answered) answer(-1);
      }
    }, 1000);
  }

  function answer(idx) {
    if (drill.answered) return;
    drill.answered = true;
    clearInterval(drill.timer);

    const q = drill.questions[drill.idx];
    const btns = document.querySelectorAll("#drillAnswers .answer-btn");
    btns.forEach(b => b.disabled = true);

    if (idx === q.correctIdx) {
      btns[idx].classList.add("correct");
      drill.correct++;
    } else {
      if (idx >= 0) btns[idx].classList.add("wrong");
      btns[q.correctIdx].classList.add("correct");
    }
    document.getElementById("drillCorrect").textContent = drill.correct;

    setTimeout(() => {
      drill.idx++;
      if (drill.idx >= drill.questions.length) finish();
      else renderQuestion();
    }, 500);
  }

  function finish() {
    clearInterval(drill.timer);
    const st = window.ANHS.loadState();
    const acc = drill.correct / drill.questions.length;
    let cpDelta;
    if (acc >= 0.9) cpDelta = 200;
    else if (acc >= 0.7) cpDelta = 100;
    else if (acc >= 0.5) cpDelta = 20;
    else cpDelta = -80; // White Room is punishing

    window.ANHS.applyCPChange(st, cpDelta);
    const events = window.Ranking.evaluate(st);
    window.ANHS.saveState(st);

    document.getElementById("drillScreen").classList.add("hidden");
    const res = document.getElementById("drillResult");
    res.classList.remove("hidden");

    if (st.expelled) {
      res.innerHTML = `<div class="result-box"><h1 style="color:var(--danger);">EXPELLED</h1><p class="subtitle">The White Room broke you.</p><button class="btn" onclick="ANHS.resetState(); location.reload();">Appeal (Reset)</button></div>`;
      return;
    }

    const eventsHtml = events.length
      ? `<div class="card mt-1">${events.map(e => `<div>${e.message}</div>`).join("")}</div>`
      : "";

    const verdict = acc >= 0.9 ? "ELITE" : acc >= 0.7 ? "STRONG" : acc >= 0.5 ? "ADEQUATE" : "FAILED";

    res.innerHTML = `
      <div class="result-box">
        <h1>${verdict}</h1>
        <div class="result-score">${drill.correct} / ${drill.questions.length}</div>
        <div class="result-detail">CP Change: <strong style="color:${cpDelta >= 0 ? 'var(--safe)' : 'var(--danger)'};">${cpDelta >= 0 ? '+' : ''}${cpDelta}</strong></div>
        ${eventsHtml}
        <div class="mt-2">
          <a href="index.html" class="btn">Dashboard</a>
          <button class="btn btn-secondary" onclick="location.reload()">Run Again</button>
        </div>
      </div>`;
  }

  return { start };
})();
