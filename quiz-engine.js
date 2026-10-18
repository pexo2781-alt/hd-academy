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
