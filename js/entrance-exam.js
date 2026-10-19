// ============================================
// entrance-exam.js — 15 questions, mixed types
// ============================================

(function () {
  const SLOT = parseInt(new URLSearchParams(location.search).get("slot")) || null;
  if (!SLOT) { location.href = "slots.html"; return; }

  const QUESTIONS_PER_SUBJECT = 5;
  const TOTAL_QUESTIONS = 15;
  const TIME_PER_Q = 45;

  let pool = null;
  let questions = [];
  let idx = 0;
  let correct = 0;
  let totalTimeBonusSec = 0;
  let timeLeft = 0;
  let timer = null;
  let answered = false;

  function shuffle(a) {
    const b = a.slice();
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  }

  async function loadPool() {
    const r = await fetch("content/entrance-exam.json");
    if (!r.ok) throw new Error("Failed to load entrance exam pool");
    return await r.json();
  }

  function pickQuestions(allQuestions) {
    const bySubj = { math: [], science: [], english: [] };
    allQuestions.forEach(q => bySubj[q.subject].push(q));
    const picked = [];
    for (const sub of ["math", "science", "english"]) {
      const avail = shuffle(bySubj[sub]);
      picked.push(...avail.slice(0, QUESTIONS_PER_SUBJECT));
    }
    return shuffle(picked);
  }

  function render() {
    const q = questions[idx];
    document.getElementById("qProgress").textContent =
      `Question ${idx + 1} of ${questions.length}`;
    document.getElementById("qSubject").textContent =
      q.subject.charAt(0).toUpperCase() + q.subject.slice(1);
    document.getElementById("timer").textContent = timeLeft + "s";
    document.getElementById("timer").classList.toggle("warning", timeLeft <= 10);

    const qBody = document.getElementById("qBody");
    const d = q.data;

    if (q.type === "written") {
      document.getElementById("qText").textContent = d.q;
      qBody.innerHTML = d.a.map((opt, i) =>
        `<button class="answer-btn" data-idx="${i}" onclick="window.__ans(${i})">${opt}</button>`
      ).join("");
    } else if (q.type === "truefalse") {
      document.getElementById("qText").textContent = d.q;
      qBody.innerHTML = `
        <button class="answer-btn" onclick="window.__ans(true)">True</button>
        <button class="answer-btn" onclick="window.__ans(false)">False</button>
      `;
    } else if (q.type === "fillblank") {
      document.getElementById("qText").textContent = d.sentence;
      qBody.innerHTML = `
        <input id="fillInput" type="text" placeholder="Your answer…" autocomplete="off"
          style="padding:0.75rem; font-size:1rem; border-radius:6px; width:100%; margin-bottom:0.75rem;">
        <button class="btn" onclick="window.__ansFill()">Submit</button>
      `;
      setTimeout(() => document.getElementById("fillInput").focus(), 50);
    }

    // Progress dots
    const dots = document.getElementById("progressDots");
    dots.innerHTML = questions.map((_, i) =>
      `<span class="dot ${i < idx ? 'done' : i === idx ? 'active' : ''}"></span>`
    ).join("");

    answered = false;
    timeLeft = TIME_PER_Q;
    startTimer();
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
      timeLeft--;
      document.getElementById("timer").textContent = timeLeft + "s";
      document.getElementById("timer").classList.toggle("warning", timeLeft <= 10);
      if (timeLeft <= 0) {
        clearInterval(timer);
        if (!answered) answerInternal(false, 0);
      }
    }, 1000);
  }

  function checkAnswer(given) {
    const q = questions[idx];
    if (q.type === "written") return given === q.data.c;
    if (q.type === "truefalse") return given === q.data.answer;
    if (q.type === "fillblank") {
      return String(given).trim().toLowerCase() === q.data.answer.toLowerCase();
    }
    return false;
  }

  function answerInternal(given, bonusSec) {
    if (answered) return;
    answered = true;
    clearInterval(timer);

    const isCorrect = checkAnswer(given);
    if (isCorrect) {
      correct++;
      totalTimeBonusSec += timeLeft;
    }

    // Visual feedback
    const btns = document.querySelectorAll("#qBody .answer-btn");
    btns.forEach(b => b.disabled = true);

    if (questions[idx].type === "written") {
      const correctIdx = questions[idx].data.c;
      if (isCorrect) btns[given].classList.add("correct");
      else {
        if (given >= 0) btns[given].classList.add("wrong");
        btns[correctIdx].classList.add("correct");
      }
    } else if (questions[idx].type === "truefalse") {
      const ans = questions[idx].data.answer;
      btns.forEach(b => {
        const isT = b.textContent === "True";
        if (isT === ans) b.classList.add("correct");
        else if (isT === given) b.classList.add("wrong");
      });
    } else if (questions[idx].type === "fillblank") {
      const input = document.getElementById("fillInput");
      input.disabled = true;
      input.style.borderColor = isCorrect ? "var(--safe)" : "var(--danger)";
      if (!isCorrect) input.value = questions[idx].data.answer;
    }

    setTimeout(() => {
      idx++;
      if (idx >= questions.length) finish();
      else render();
    }, 900);
  }

  window.__ans = function (given) { answerInternal(given, 0); };
  window.__ansFill = function () {
    const input = document.getElementById("fillInput");
    answerInternal(input.value, 0);
  };

  async function finish() {
    const score = window.Sorting.computeScore(correct, totalTimeBonusSec);
    const cls = window.Sorting.classify(score);
    const showAdvice = window.Sorting.shouldShowAdvice(score);

    // Update the slot
    const st = window.ANHS.loadState(SLOT);
    st.slotId = SLOT;
    st.entranceExamScore = score;
    st.classRank = cls;
    st.classPoints = window.Sorting.STARTING_CP[cls];
    st.dangerLevel = window.ANHS.computeDanger(st);
    window.ANHS.saveState(st);

    // Advance the slot to active
    window.SlotManager.updateMeta(SLOT, st);
    window.ANHS.setActiveSlotId(SLOT);

    document.getElementById("examScreen").classList.add("hidden");
    const res = document.getElementById("resultScreen");
    res.classList.remove("hidden");

    if (showAdvice) {
      res.innerHTML = `
        <div class="card text-center" style="border-left-color:var(--danger);">
          <h2 style="color:var(--danger);">⚠ A Note from the Council</h2>
          <p style="margin:1rem 0; color:var(--anhs-grey); line-height:1.6;">
            This program may not be the best fit for everyone.<br>
            You may return to the title if you wish to reconsider.<br><br>
            However — those who persist may find their true potential here yet.
          </p>
          <div class="mt-2">
            <a href="index.html" class="btn btn-secondary">Return to Title</a>
            <button class="btn" onclick="window.__proceedToClass('${cls}')">Enter as Class ${cls}</button>
          </div>
        </div>`;
    } else {
      res.innerHTML = `
        <div class="text-center">
          <h2>Examination Complete</h2>
          <div class="mt-2 result-class-badge class-${cls}">CLASS ${cls}</div>
          <p class="subtitle mt-2">The path begins. Prove them wrong.</p>
          <a href="campus.html" class="btn mt-2">Enter Campus</a>
        </div>`;
    }
  }

  window.__proceedToClass = function () {
    location.href = "campus.html";
  };

  (async function init() {
    try {
      pool = await loadPool();
      questions = pickQuestions(pool.questions);
      render();
    } catch (e) {
      document.body.innerHTML = `<div class="container"><h1>Error</h1><p>${e.message}</p><a href="slots.html" class="btn">Back to Slots</a></div>`;
    }
  })();
})();
