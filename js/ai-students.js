// ============================================
// ai-students.js — 4 AI classmates, personalities, performance, reactions
// ============================================

window.AI_STUDENTS = [
  {
    id: "horikita", name: "Horikita Suzune", specialty: "math",
    skill: 0.85, growth: 0.02, personality: "cold",
    tagline: "Results matter. Feelings do not.",
    lines: {
      win:   ["Expected. Don't let it get to your head.", "Adequate. Barely.", "You're improving. Marginally."],
      lose:  ["That was painful to watch.", "Do you even study?", "Pathetic. Try again."],
      tie:   ["A draw. How dull.", "We're even. For now."],
      help:  ["Here. Read this. Don't waste my time.", "I'll explain once. Pay attention."],
      taunt: ["You're slowing the class down.", "Class D suits you."],
      respect: ["You're... not hopeless.", "I underestimated you."]
    }
  },
  {
    id: "koenji", name: "Koenji Rokusuke", specialty: "science",
    skill: 0.82, growth: 0.015, personality: "arrogant",
    tagline: "Perfection is my natural state.",
    lines: {
      win:   ["Naturally. I am perfect.", "Did you expect otherwise?", "A trivial victory."],
      lose:  ["A fluke. Nothing more.", "Even the sun has off days.", "Don't celebrate. It's beneath me."],
      tie:   ["A tie? How boring.", "We match. Fascinating."],
      help:  ["Allow me to illuminate your ignorance.", "Watch and learn, peasant."],
      taunt: ["You're not even worth competing with.", "Try to keep up."],
      respect: ["Hmph. You have... potential.", "Perhaps you're not entirely dull."]
    }
  },
  {
    id: "kushida", name: "Kushida Kikyo", specialty: "english",
    skill: 0.78, growth: 0.02, personality: "friendly",
    tagline: "Let's all get along, okay? ♡",
    lines: {
      win:   ["Yay! I did it! ♡", "We're both doing great!", "Don't be too down, okay?"],
      lose:  ["Ah, I slipped up~ but you did great!", "It's okay! Next time!", "You're so good at this!"],
      tie:   ["A tie! How fun~ ♡", "We're neck and neck!"],
      help:  ["Let me help you! ♡", "I made notes — want them?"],
      taunt: ["Don't worry, I'll go easy on you~", "Are you trying your best? ♡"],
      respect: ["Wow, you're really good!", "You surprised me! ♡"]
    }
  },
  {
    id: "ayanokoji", name: "Ayanokoji Kiyotaka", specialty: "all",
    skill: 0.88, growth: 0.025, personality: "silent",
    tagline: "...",
    lines: {
      win:   ["...", "That's all.", "Hm."],
      lose:  ["Interesting.", "You've improved.", "Noted."],
      tie:   ["...", "Equal.", "Hm."],
      help:  ["Look here.", "The method is simple.", "Observe."],
      taunt: ["You're predictable.", "I already know how this ends."],
      respect: ["You're... different.", "I'll remember that."]
    }
  }
];

// Load persisted AI skills
(function loadAISkills() {
  const st = window.ANHS.loadState();
  if (st.aiSkills) {
    window.AI_STUDENTS.forEach(ai => {
      if (typeof st.aiSkills[ai.id] === "number") ai.skill = st.aiSkills[ai.id];
    });
  }
})();

window.aiLine = function (aiId, category) {
  const ai = AI_STUDENTS.find(a => a.id === aiId);
  if (!ai || !ai.lines[category]) return "...";
  const arr = ai.lines[category];
  return arr[Math.floor(Math.random() * arr.length)];
};

window.aiReactionCategory = function (aiScore, playerScore, gap = 50) {
  if (playerScore > aiScore + gap) return "lose";
  if (aiScore > playerScore + gap) return "win";
  return "tie";
};

window.aiSimulateAnswer = function (ai) {
  if (Math.random() < ai.skill) {
    return 100 + Math.floor(Math.random() * 40);
  }
  return 0;
};

// Grow skill and persist
window.aiGrow = function (ai) {
  ai.skill = Math.min(0.98, ai.skill + ai.growth);
  const st = window.ANHS.loadState();
  st.aiSkills = st.aiSkills || {};
  st.aiSkills[ai.id] = ai.skill;
  window.ANHS.saveState(st);
};
