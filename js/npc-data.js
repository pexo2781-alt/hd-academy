// ============================================
// npc-data.js — 15 important NPCs (original names)
// + invokes generator for 104 generic
// ============================================

window.IMPORTANT_NPCS = [
  // ===== CLASS D (your classmates) =====
  {
    id: "shirayuki",
    name: "Shirayuki Reika",
    class: "D",
    specialty: "math",
    skill: 0.85,
    growth: 0.02,
    personality: "cold",
    tagline: "Results matter. Feelings do not.",
    portrait: { color: "#c8102e", emoji: "❄" },
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
    id: "amamiya",
    name: "Amamiya Ren",
    class: "D",
    specialty: "science",
    skill: 0.82,
    growth: 0.015,
    personality: "arrogant",
    tagline: "Perfection is my natural state.",
    portrait: { color: "#f9a825", emoji: "👑" },
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
    id: "hoshino",
    name: "Hoshino Yui",
    class: "D",
    specialty: "english",
    skill: 0.78,
    growth: 0.02,
    personality: "friendly",
    tagline: "Let's all get along, okay? ♡",
    portrait: { color: "#f48fb1", emoji: "🌸" },
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
    id: "kuroda",
    name: "Kuroda Sōta",
    class: "D",
    specialty: "all",
    skill: 0.88,
    growth: 0.025,
    personality: "silent",
    tagline: "...",
    portrait: { color: "#455a64", emoji: "🌑" },
    lines: {
      win:   ["...", "That's all.", "Hm."],
      lose:  ["Interesting.", "You've improved.", "Noted."],
      tie:   ["...", "Equal.", "Hm."],
      help:  ["Look here.", "The method is simple.", "Observe."],
      taunt: ["You're predictable.", "I already know how this ends."],
      respect: ["You're... different.", "I'll remember that."]
    }
  },

  // ===== CLASS A (elite rivals) =====
  {
    id: "ishigami",
    name: "Ishigami Ayaka",
    class: "A",
    specialty: "math",
    skill: 0.92,
    growth: 0.02,
    personality: "calculating",
    tagline: "Everything is a move on the board.",
    portrait: { color: "#7e57c2", emoji: "♟" },
    lines: {
      win:   ["Predictable.", "I saw that coming from three moves ago.", "Class D, isn't it?"],
      lose:  ["...Fascinating.", "A flaw in my model.", "Noted."],
      tie:   ["A draw. How unexpected.", "You're learning."],
      help:  ["Observe the pattern.", "There is always a solution."],
      taunt: ["Class A will not fall to the likes of you.", "You're a piece, not a player."],
      respect: ["You might be... interesting.", "I'll keep watching you."]
    }
  },
  {
    id: "todo",
    name: "Tōdō Haruki",
    class: "A",
    specialty: "science",
    skill: 0.84,
    growth: 0.02,
    personality: "charming",
    tagline: "Let's keep this friendly, shall we?",
    portrait: { color: "#26a69a", emoji: "🎩" },
    lines: {
      win:   ["Well played, but not well enough.", "Class A stays on top.", "Close, though."],
      lose:  ["...Interesting.", "Well done.", "Consider me impressed."],
      tie:   ["A tie. Let's not make this a habit.", "Noted."],
      help:  ["A small hint, between us.", "Consider it a favour."],
      taunt: ["Class A is Class A for a reason.", "Try harder next time."],
      respect: ["You have potential.", "I'll be watching."]
    }
  },
  {
    id: "kurosaki",
    name: "Kurosaki Mei",
    class: "A",
    specialty: "english",
    skill: 0.83,
    growth: 0.02,
    personality: "blunt",
    tagline: "Don't waste my time.",
    portrait: { color: "#ef6c00", emoji: "🖤" },
    lines: {
      win:   ["Obviously.", "Was that supposed to be a challenge?", "Class A doesn't lose."],
      lose:  ["...Tch.", "Fine.", "Lucky."],
      tie:   ["Whatever.", "Draws are boring."],
      help:  ["Here, but don't expect me to repeat it.", "Just this once."],
      taunt: ["You're not our level.", "Class D is where you belong."],
      respect: ["...You're not completely useless.", "Hmph."]
    }
  },
  {
    id: "hikari",
    name: "Hikari Nazuna",
    class: "A",
    specialty: "science",
    skill: 0.80,
    growth: 0.02,
    personality: "bubbly",
    tagline: "Let's all do our best!",
    portrait: { color: "#42a5f5", emoji: "☀" },
    lines: {
      win:   ["Yay! Class A stays strong!", "Don't give up, okay?", "You did well though!"],
      lose:  ["Wow, you got me!", "That was amazing!", "You're really improving!"],
      tie:   ["A tie! Fun!", "We both did great!"],
      help:  ["Here's a tip! ♡", "You can do this!"],
      taunt: ["Don't worry, you'll get there someday!", "Class A is just built different~"],
      respect: ["You're getting really good!", "I'm impressed!"]
    }
  },

  // ===== CLASS B (competent rivals) =====
  {
    id: "mizusawa",
    name: "Mizusawa Hina",
    class: "B",
    specialty: "all",
    skill: 0.86,
    growth: 0.025,
    personality: "leader",
    tagline: "We rise together.",
    portrait: { color: "#66bb6a", emoji: "🌟" },
    lines: {
      win:   ["Good game!", "That was close!", "You're strong."],
      lose:  ["Wow, really well done!", "That was impressive.", "I need to train harder."],
      tie:   ["A tie! Let's both improve next time.", "Well matched."],
      help:  ["Here, take this. We all rise together.", "Let me explain."],
      taunt: ["Class B won't lose to anyone.", "Come at us."],
      respect: ["You have real talent.", "I'm glad we're rivals."]
    }
  },
  {
    id: "kanzaki",
    name: "Kanzaki Ryō",
    class: "B",
    specialty: "math",
    skill: 0.79,
    growth: 0.02,
    personality: "athletic",
    tagline: "Give it your all!",
    portrait: { color: "#ffa726", emoji: "🔥" },
    lines: {
      win:   ["Ha! That's how we do it!", "Class B's got this!", "Nice try!"],
      lose:  ["Good job!", "You got me.", "Well played."],
      tie:   ["A tie — no way!", "Let's go again!"],
      help:  ["Here's a trick I use.", "Try it this way."],
      taunt: ["Class D? Come on, step it up.", "You'll need more than that."],
      respect: ["You're actually good!", "Respect."]
    }
  },
  {
    id: "shiraishi",
    name: "Shiraishi Yume",
    class: "B",
    specialty: "english",
    skill: 0.76,
    growth: 0.02,
    personality: "sweet",
    tagline: "Let's be friends!",
    portrait: { color: "#ec407a", emoji: "🍬" },
    lines: {
      win:   ["Yay! I did it!", "Don't be sad, okay?", "You were close!"],
      lose:  ["Ahh, you're so good!", "I need to study more!", "Well done!"],
      tie:   ["A tie! Fun!", "Let's both do better!"],
      help:  ["Want me to explain?", "I can help!"],
      taunt: ["Class B is pretty tough, huh?", "Keep trying!"],
      respect: ["You're so smart!", "I look up to you!"]
    }
  },
  {
    id: "matsuda",
    name: "Matsuda Kōhei",
    class: "B",
    specialty: "science",
    skill: 0.83,
    growth: 0.02,
    personality: "stoic",
    tagline: "Discipline wins wars.",
    portrait: { color: "#8d6e63", emoji: "🛡" },
    lines: {
      win:   ["Predictable.", "Discipline.", "Class B stands firm."],
      lose:  ["...Respect.", "You earned that.", "Noted."],
      tie:   ["A draw.", "Prepare better next time."],
      help:  ["Study this.", "Do it again tomorrow."],
      taunt: ["You lack discipline.", "Class D will fall."],
      respect: ["You're consistent.", "That matters."]
    }
  },

  // ===== CLASS C (rising underdogs) =====
  {
    id: "sakaguchi",
    name: "Sakaguchi Kakeru",
    class: "C",
    specialty: "math",
    skill: 0.87,
    growth: 0.025,
    personality: "aggressive",
    tagline: "I win. That's all.",
    portrait: { color: "#5d4037", emoji: "💀" },
    lines: {
      win:   ["Crushed you.", "Class D trash.", "Hah!"],
      lose:  ["...Tch.", "You got lucky.", "This isn't over."],
      tie:   ["A tie? Pathetic.", "We'll meet again."],
      help:  ["Only because it amuses me.", "Don't expect this again."],
      taunt: ["Class D will burn.", "You're a cockroach."],
      respect: ["You're not worthless after all.", "Interesting."]
    }
  },
  {
    id: "ibara",
    name: "Ibara Mio",
    class: "C",
    specialty: "science",
    skill: 0.80,
    growth: 0.02,
    personality: "fierce",
    tagline: "Show me what you've got.",
    portrait: { color: "#d32f2f", emoji: "⚡" },
    lines: {
      win:   ["Too easy.", "Is that all?", "Class C won't lose."],
      lose:  ["...Damn.", "You're better than I thought.", "Not bad."],
      tie:   ["A draw. Boring.", "Let's go again."],
      help:  ["Here. Don't tell anyone.", "Just this once."],
      taunt: ["Class D is a joke.", "Fight me."],
      respect: ["You've got fire.", "I'll take you seriously now."]
    }
  },
  {
    id: "yamashiro",
    name: "Yamashiro Rika",
    class: "C",
    specialty: "english",
    skill: 0.75,
    growth: 0.02,
    personality: "timid",
    tagline: "I-I'll try my best!",
    portrait: { color: "#9575cd", emoji: "🌱" },
    lines: {
      win:   ["S-sorry! I tried my best!", "I did it!", "Don't be mad, okay?"],
      lose:  ["You're so good!", "I'll train harder!", "C-congrats!"],
      tie:   ["A tie! That's okay!", "We both did our best!"],
      help:  ["H-here, this might help.", "Let me try explaining."],
      taunt: ["Class C is stronger than you think!", "Please don't underestimate us!"],
      respect: ["You're amazing!", "I look up to you!"]
    }
  }
];

window.NPC_COUNTS = {
  important: 15,
  generic: 104,
  total: 119,
  perClass: { A: 30, B: 30, C: 30, D: 29 }
};

window.getNPCById = function (id) {
  const all = (window.ALL_NPCS || []);
  return all.find(n => n.id === id);
};

window.getNPCsByClass = function (classRank) {
  return (window.ALL_NPCS || []).filter(n => n.class === classRank);
};
