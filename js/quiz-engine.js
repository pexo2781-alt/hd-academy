// ============================================
// quiz-engine.js — Reads counts/time/CP from CONFIG
// ============================================

window.QuizEngine = (function () {

  let state = {};

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function start(subject) {
    const cfg = window.CONFIG.gameplay;
   const bank = (window.CONFIG.questions[subject] && window.CONFIG.questions[subject].written) || [];
    if (!bank || bank.length === 0) { alert("No questions for subject: " + subject); return; }

    const N = Math.min(cfg.quizQuestionCount, bank.length);
    const picked = shuffle(bank).slice(0, N).map(q => {
      const indexed = q.a.map((text, i) => ({ text, isCorrect: i === q.c }));
      const shuffled = shuffle(indexed);
      return { q: q.q, options: shuffled.map(o => o.text), correctIdx: shuffled.findIndex(o => o.isCorrect) };
    });

    state = {
      subject, questions: picked, currentIdx: 0, correct: 0, streak: 0,
      bestStreak: 0, score: 0, timer: null, timeLeft: 0, answered: false, aiScores: {}
    };
    window.AI_STUDENTS.forEach(ai => state.aiScores[ai.id] = 0);
    renderQuestion();
  }

  function renderQuestion() {
    const q = state.questions[state.currentIdx];
    state.answered = false;
    state.timeLeft = window.CONFIG.gameplay.quizTimePerQuestion;

    document.getElementById("quizProgress").textContent = `Question ${state.currentIdx + 1} / ${state.questions.length}`;
    document.getElementById("questionText").textContent = q.q;
    document.getElementById("scoreDisplay").textContent = state.score;
    document.getElementById("streakDisplay").textContent = state.streak;

    const answersDiv = document.getElementById("answers");
    answersDiv.innerHTML = "";
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "answer-btn";
      btn.textContent = opt;
      btn.onclick = () => handleAnswer(i);
      answersDiv.appendChild(btn);
    });
    startTimer();
  }

  function startTimer() {
    clearInterval(state.timer);
    const el = document.getElementById("timer");
    el.textContent = state.timeLeft + "s";
    el.classList.remove("warning");
    state.timer = setInterval(() => {
      state.timeLeft--;
      el.textContent = state.timeLeft + "s";
      if (state.timeLeft <= 5) el.classList.add("warning");
      if (state.timeLeft <= 0) {
        clearInterval(state.timer);
        if (!state.answered) handleAnswer(-1);
      }
    }, 1000);
  }

  function handleAnswer(idx) {
    if (state.answered) return;
    state.answered = true;
    clearInterval(state.timer);

    const q = state.questions[state.currentIdx];
    const btns = document.querySelectorAll(".answer-btn");
    btns.forEach(b => b.disabled = true);

    if (idx === q.correctIdx) {
      btns[idx].classList.add("correct");
      state.correct++;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      state.score += 100 + state.streak * 20 + state.timeLeft * 5;
    } else {
      if (idx >= 0) btns[idx].classList.add("wrong");
      btns[q.correctIdx].classList.add("correct");
      state.streak = 0;
    }
    document.getElementById("scoreDisplay").textContent = state.score;
    document.getElementById("streakDisplay").textContent = state.streak;

    window.AI_STUDENTS.forEach(ai => { state.aiScores[ai.id] += window.aiSimulateAnswer(ai); });
    renderScoreboard();

    setTimeout(() => {
      state.currentIdx++;
      if (state.currentIdx >= state.questions.length) finish();
      else renderQuestion();
    }, 1400);
  }

  function renderScoreboard() {
    const sb = document.getElementById("scoreboard");
    if (!sb) return;
    const rows = [
      { name: "YOU", score: state.score, player: true },
      ...window.AI_STUDENTS.map(ai => ({ name: ai.name.split(" ")[0], score: state.aiScores[ai.id], player: false }))
    ].sort((a, b) => b.score - a.score);
    sb.innerHTML = rows.map(r => `<div class="scoreboard-row ${r.player ? 'player' : ''}"><span>${r.name}</span><span>${r.score}</span></div>`).join("");
  }

  function finish() {
    clearInterval(state.timer);
    const st = window.ANHS.loadState();
    st.quizzesTaken++;
    st.totalScore += state.score;
    st.correctTotal += state.correct;
    st.questionsTotal += state.questions.length;
    st.bestStreak = Math.max(st.bestStreak, state.bestStreak);

    const subj = st.subjectStats[state.subject];
    subj.correct += state.correct;
    subj.total += state.questions.length;
    subj.best = Math.max(subj.best, state.correct);

    const g = window.CONFIG.gameplay;
    const cpDelta = state.correct * g.cpPerCorrect + (state.questions.length - state.correct) * g.cpPerWrong;
    window.ANHS.applyCPChange(st, cpDelta);
    const events = window.Ranking.evaluate(st);

    const reactions = window.AI_STUDENTS.map(ai => {
      const aiScore = state.aiScores[ai.id];
      const cat = window.aiReactionCategory(aiScore, state.score);
      return { ai, aiScore, line: window.aiLine(ai.id, cat) };
    }).sort((a, b) => b.aiScore - a.aiScore);

    window.AI_STUDENTS.forEach(ai => window.aiGrow(ai));
    window.ANHS.saveState(st);

    document.getElementById("quizScreen").classList.add("hidden");
    const result = document.getElementById("resultScreen");
    result.classList.remove("hidden");

    if (st.expelled) {
      result.innerHTML = `<div class="result-box"><h1 style="color:var(--danger);">EXPELLED</h1><p class="subtitle">You have been removed from ANHS.</p><button class="btn" onclick="ANHS.resetState(); location.reload();">Appeal (Reset)</button></div>`;
      return;
    }

    const eventsHtml = events.length
      ? `<div class="card" style="border-left-color:${events.some(e => e.type === 'expelled' || e.type === 'demotion') ? 'var(--danger)' : 'var(--safe)'}; margin-top:1rem;">${events.map(e => `<div style="padding:0.25rem 0;">${e.message}</div>`).join("")}</div>`
      : "";

    const reactionsHtml = reactions.map(r => {
      const beat = r.aiScore < state.score;
      return `<div style="display:flex; justify-content:space-between; gap:1rem; padding:0.5rem 0; border-bottom:1px solid #333;">
        <div>
          <strong style="color:${beat ? 'var(--safe)' : 'var(--danger)'};">${r.ai.name}</strong>
          <div style="color:var(--anhs-grey); font-size:0.9rem; font-style:italic;">"${r.line}"</div>
        </div>
        <div style="font-weight:700;">${r.aiScore}</div>
      </div>`;
    }).join("");

    result.innerHTML = `
      <div class="result-box">
        <h2>Quiz Complete</h2>
        <div class="result-score">${state.correct} / ${state.questions.length}</div>
        <div class="result-detail">Score: ${state.score} · Best Streak: ${state.bestStreak}</div>
        <div class="result-detail">CP Change: <span style="color:${cpDelta >= 0 ? 'var(--safe)' : 'var(--danger)'}; font-weight:700;">${cpDelta >= 0 ? '+' : ''}${cpDelta}</span></div>
      </div>
      <div class="card mt-1"><h3>Classmate Reactions</h3>${reactionsHtml}</div>
      ${eventsHtml}
      <div class="mt-2 text-center">
        <a href="index.html" class="btn">Back to Dashboard</a>
        <button class="btn btn-secondary" onclick="location.reload()">Retry</button>
      </div>`;
  }

  return { start };
})();
