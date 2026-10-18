// ============================================
// quiz-engine.js — Timer, scoring, streaks, results
// ============================================

window.QuizEngine = (function () {

  const QUESTIONS_PER_QUIZ = 8;
  const TIME_PER_QUESTION = 15; // seconds

  let state = {
    subject: "math",
    questions: [],
    currentIdx: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    score: 0,
    timer: null,
    timeLeft: 0,
    answered: false
  };

  // Simple 1v1+AI score simulation for this drop (real AI in Drop 2)
  const AI_NAMES = ["Horikita", "Koenji", "Kushida", "Ayanokoji"];
  let aiScores = {};

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function start(subject) {
    state.subject = subject;
    const bank = window.QUESTIONS[subject];
    if (!bank || bank.length === 0) { alert("No questions for subject: " + subject); return; }

    // Pick questions, shuffle answer options
    const picked = shuffle(bank).slice(0, Math.min(QUESTIONS_PER_QUIZ, bank.length)).map(q => {
      const indexed = q.a.map((text, i) => ({ text, isCorrect: i === q.c }));
      const shuffled = shuffle(indexed);
      return {
        q: q.q,
        options: shuffled.map(o => o.text),
        correctIdx: shuffled.findIndex(o => o.isCorrect)
      };
    });

    state.questions = picked;
    state.currentIdx = 0;
    state.correct = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.score = 0;
    state.answered = false;

    aiScores = {};
    AI_NAMES.forEach(n => aiScores[n] = 0);

    renderQuestion();
  }

  function renderQuestion() {
    const q = state.questions[state.currentIdx];
    state.answered = false;
    state.timeLeft = TIME_PER_QUESTION;

    document.getElementById("quizProgress").textContent =
      `Question ${state.currentIdx + 1} / ${state.questions.length}`;
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
    const timerEl = document.getElementById("timer");
    timerEl.textContent = state.timeLeft + "s";
    timerEl.classList.remove("warning");

    state.timer = setInterval(() => {
      state.timeLeft--;
      timerEl.textContent = state.timeLeft + "s";
      if (state.timeLeft <= 5) timerEl.classList.add("warning");
      if (state.timeLeft <= 0) {
        clearInterval(state.timer);
        if (!state.answered) handleAnswer(-1); // timeout
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
      // Base 100 + streak bonus + time bonus
      const base = 100;
      const streakBonus = state.streak * 20;
      const timeBonus = state.timeLeft * 5;
      state.score += base + streakBonus + timeBonus;
    } else {
      if (idx >= 0) btns[idx].classList.add("wrong");
      btns[q.correctIdx].classList.add("correct");
      state.streak = 0;
    }

    document.getElementById("scoreDisplay").textContent = state.score;
    document.getElementById("streakDisplay").textContent = state.streak;

    // Simulated AI performance
    AI_NAMES.forEach(n => {
      if (Math.random() < 0.65) aiScores[n] += 80 + Math.floor(Math.random() * 100);
    });
    renderScoreboard();

    setTimeout(() => {
      state.currentIdx++;
      if (state.currentIdx >= state.questions.length) {
        finish();
      } else {
        renderQuestion();
      }
    }, 1400);
  }

  function renderScoreboard() {
    const sb = document.getElementById("scoreboard");
    if (!sb) return;
    const rows = [
      { name: "YOU", score: state.score, player: true },
      ...AI_NAMES.map(n => ({ name: n, score: aiScores[n], player: false }))
    ].sort((a, b) => b.score - a.score);

    sb.innerHTML = rows.map(r =>
      `<div class="scoreboard-row ${r.player ? 'player' : ''}">
        <span>${r.name}</span><span>${r.score}</span>
      </div>`
    ).join("");
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

    // CP change: +correct * 10, -wrong * 5
    const wrong = state.questions.length - state.correct;
    const cpDelta = state.correct * 10 - wrong * 5;
    window.ANHS.applyCPChange(st, cpDelta);

    window.ANHS.saveState(st);

    document.getElementById("quizScreen").classList.add("hidden");
    const result = document.getElementById("resultScreen");
    result.classList.remove("hidden");
    result.innerHTML = `
      <div class="result-box">
        <h2>Quiz Complete</h2>
        <div class="result-score">${state.correct} / ${state.questions.length}</div>
        <div class="result-detail">Score: ${state.score} · Best Streak: ${state.bestStreak}</div>
        <div class="result-detail">CP Change: <span style="color:${cpDelta >= 0 ? 'var(--safe)' : 'var(--danger)'}; font-weight:700;">${cpDelta >= 0 ? '+' : ''}${cpDelta}</span></div>
        <div class="mt-2">
          <a href="index.html" class="btn">Back to Dashboard</a>
          <button class="btn btn-secondary" onclick="location.reload()">Retry</button>
        </div>
      </div>`;
  }

  return { start };
})();
