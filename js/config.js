// ============================================
// config.js — Central configuration, defaults, load/save
// Everything the game uses is read from here.
// ============================================

// Default question data (moved from questions.js)
const DEFAULT_QUESTIONS = {
  math: [
    { q: "What is 7 × 8?", a: ["54", "56", "48", "64"], c: 1 },
    { q: "Solve: 3x + 6 = 21. What is x?", a: ["3", "5", "7", "9"], c: 1 },
    { q: "What is the next number: 2, 4, 8, 16, ?", a: ["20", "24", "32", "30"], c: 2 },
    { q: "What is 15% of 200?", a: ["15", "25", "30", "35"], c: 2 },
    { q: "Simplify: (x²)(x³)", a: ["x⁵", "x⁶", "x⁹", "x"], c: 0 },
    { q: "What is √144?", a: ["10", "11", "12", "14"], c: 2 },
    { q: "If a triangle has angles 90° and 45°, the third is?", a: ["30°", "45°", "60°", "90°"], c: 1 },
    { q: "What is 9² − 4²?", a: ["65", "55", "45", "75"], c: 0 },
    { q: "Solve: 2(x − 3) = 10. What is x?", a: ["5", "6", "7", "8"], c: 3 },
    { q: "What is 1/4 + 1/2?", a: ["1/2", "3/4", "1/3", "2/3"], c: 1 },
    { q: "Pattern: 1, 1, 2, 3, 5, 8, ?", a: ["11", "12", "13", "14"], c: 2 },
    { q: "What is 100 ÷ 4 × 2?", a: ["12.5", "25", "50", "200"], c: 2 },
    { q: "If f(x) = 2x + 1, what is f(4)?", a: ["7", "8", "9", "10"], c: 2 },
    { q: "How many degrees in a full circle?", a: ["180", "270", "360", "540"], c: 2 },
    { q: "What is 0.75 as a fraction?", a: ["3/4", "7/10", "1/3", "2/5"], c: 0 },
    { q: "What is 5! (5 factorial)?", a: ["20", "60", "100", "120"], c: 3 },
    { q: "Solve: x² = 49, x positive?", a: ["5", "6", "7", "8"], c: 2 },
    { q: "What is the average of 4, 8, 12, 16?", a: ["8", "9", "10", "11"], c: 2 },
    { q: "What is 2³ × 2²?", a: ["32", "16", "64", "10"], c: 0 },
    { q: "If 5 pens cost $15, how much do 8 cost?", a: ["$20", "$22", "$24", "$26"], c: 2 },
    { q: "What is 1/3 of 90?", a: ["20", "25", "30", "35"], c: 2 },
    { q: "What is 11 × 11?", a: ["111", "121", "131", "112"], c: 1 },
    { q: "Which is largest: 3/4, 2/3, 4/5, 1/2?", a: ["3/4", "2/3", "4/5", "1/2"], c: 2 },
    { q: "What is 20% of 20% of 500?", a: ["10", "20", "25", "30"], c: 1 },
    { q: "If 3x = 9, and 2y = 10, what is x + y?", a: ["6", "7", "8", "9"], c: 2 }
  ],
  science: [
    { q: "What is the chemical symbol for water?", a: ["H₂O", "O₂", "CO₂", "HO"], c: 0 },
    { q: "What planet is closest to the Sun?", a: ["Venus", "Mercury", "Mars", "Earth"], c: 1 },
    { q: "What gas do plants absorb for photosynthesis?", a: ["Oxygen", "Nitrogen", "CO₂", "Hydrogen"], c: 2 },
    { q: "What is the powerhouse of the cell?", a: ["Nucleus", "Ribosome", "Mitochondria", "Golgi"], c: 2 },
    { q: "How many bones in the adult human body?", a: ["186", "196", "206", "216"], c: 2 },
    { q: "What is the speed of light (approx)?", a: ["300,000 km/s", "150,000 km/s", "1,000 km/s", "30,000 km/s"], c: 0 },
    { q: "Which element has symbol 'Au'?", a: ["Silver", "Gold", "Copper", "Aluminum"], c: 1 },
    { q: "What force keeps planets in orbit?", a: ["Magnetism", "Friction", "Gravity", "Inertia"], c: 2 },
    { q: "What is the most abundant gas in Earth's atmosphere?", a: ["Oxygen", "Nitrogen", "CO₂", "Argon"], c: 1 },
    { q: "What is H in E=mc²?", a: ["Energy", "Mass", "Light", "Heat"], c: 0 },
    { q: "What is the study of life called?", a: ["Geology", "Biology", "Chemistry", "Physics"], c: 1 },
    { q: "Water freezes at what temperature (°C)?", a: ["-10", "0", "10", "100"], c: 1 },
    { q: "What organ pumps blood?", a: ["Lungs", "Liver", "Heart", "Kidney"], c: 2 },
    { q: "Which is a noble gas?", a: ["Oxygen", "Helium", "Nitrogen", "Chlorine"], c: 1 },
    { q: "What is the chemical symbol for gold?", a: ["Ag", "Au", "Gd", "Go"], c: 1 },
    { q: "What do we call a group of atoms bonded together?", a: ["Cell", "Molecule", "Element", "Ion"], c: 1 },
    { q: "What is the hardest natural substance?", a: ["Iron", "Quartz", "Diamond", "Granite"], c: 2 },
    { q: "What is the pH of pure water?", a: ["0", "5", "7", "14"], c: 2 },
    { q: "What process do plants use to make food?", a: ["Respiration", "Photosynthesis", "Digestion", "Fermentation"], c: 1 },
    { q: "How many planets in the solar system?", a: ["7", "8", "9", "10"], c: 1 },
    { q: "What is the largest organ in the human body?", a: ["Liver", "Brain", "Skin", "Lungs"], c: 2 },
    { q: "What does DNA stand for?", a: ["Deoxyribonucleic acid", "Dinucleic acid", "Deoxy acid", "Double nucleic acid"], c: 0 },
    { q: "What type of energy does a moving object have?", a: ["Potential", "Kinetic", "Thermal", "Chemical"], c: 1 },
    { q: "What is the boiling point of water at sea level (°C)?", a: ["90", "95", "100", "110"], c: 2 },
    { q: "Which planet is known as the Red Planet?", a: ["Venus", "Mars", "Jupiter", "Saturn"], c: 1 }
  ],
  english: [
    { q: "Choose the correct spelling:", a: ["Recieve", "Receive", "Receeve", "Receve"], c: 1 },
    { q: "What is the past tense of 'run'?", a: ["Runned", "Ran", "Runs", "Running"], c: 1 },
    { q: "Which is a synonym for 'happy'?", a: ["Sad", "Joyful", "Angry", "Tired"], c: 1 },
    { q: "Identify the noun: 'The cat sleeps.'", a: ["The", "Cat", "Sleeps", "None"], c: 1 },
    { q: "Which is an antonym for 'brave'?", a: ["Cowardly", "Bold", "Fearless", "Strong"], c: 0 },
    { q: "Choose the correct sentence:", a: ["She don't like it.", "She doesn't likes it.", "She doesn't like it.", "She not like it."], c: 2 },
    { q: "What is the plural of 'child'?", a: ["Childs", "Childes", "Children", "Child"], c: 2 },
    { q: "Which is a verb?", a: ["Quickly", "Run", "Beautiful", "Table"], c: 1 },
    { q: "What does 'benevolent' mean?", a: ["Cruel", "Kind", "Rich", "Weak"], c: 1 },
    { q: "Choose the correct: 'Their/There/They're going home.'", a: ["Their", "There", "They're", "Thier"], c: 2 },
    { q: "What is a synonym for 'begin'?", a: ["End", "Start", "Stop", "Pause"], c: 1 },
    { q: "What is the past tense of 'go'?", a: ["Goed", "Gone", "Went", "Going"], c: 2 },
    { q: "Identify the adjective: 'The tall man walks.'", a: ["The", "Tall", "Man", "Walks"], c: 1 },
    { q: "Which is a conjunction?", a: ["And", "Quickly", "Blue", "Run"], c: 0 },
    { q: "What does 'ambiguous' mean?", a: ["Clear", "Unclear", "Loud", "Quiet"], c: 1 },
    { q: "Correct spelling:", a: ["Neccessary", "Necesary", "Necessary", "Necessery"], c: 2 },
    { q: "Which is a pronoun?", a: ["He", "Run", "Blue", "Fast"], c: 0 },
    { q: "What is the opposite of 'ancient'?", a: ["Old", "Modern", "Historic", "Past"], c: 1 },
    { q: "Choose correct: 'I have ___ finished.'", a: ["yet", "already", "still", "ever"], c: 1 },
    { q: "Which sentence is correct?", a: ["Me and him went.", "Him and me went.", "He and I went.", "I and he went."], c: 2 },
    { q: "What is a synonym for 'quick'?", a: ["Slow", "Fast", "Heavy", "Light"], c: 1 },
    { q: "What is the plural of 'mouse'?", a: ["Mouses", "Mice", "Mouse", "Mices"], c: 1 },
    { q: "Which word is an adverb?", a: ["Quickly", "Quick", "Quickness", "Quicken"], c: 0 },
    { q: "What does 'terse' mean?", a: ["Long-winded", "Brief and to the point", "Confusing", "Polite"], c: 1 },
    { q: "Choose correct: 'Neither of them ___ ready.'", a: ["are", "is", "were", "be"], c: 1 }
  ]
};

const DEFAULT_BOOKLET = {
  fillblank: [
    { sentence: "The mitochondria is the ___ of the cell.", answer: "powerhouse", hint: "Think energy." },
    { sentence: "Water is made of hydrogen and ___.", answer: "oxygen", hint: "Chemical symbol O." },
    { sentence: "The past tense of 'run' is ___.", answer: "ran", hint: "3 letters." },
    { sentence: "7 × 8 = ___.", answer: "56", hint: "Between 50 and 60." },
    { sentence: "The capital of France is ___.", answer: "paris", hint: "City of Light." },
    { sentence: "A triangle has ___ sides.", answer: "3", hint: "Small number." },
    { sentence: "The opposite of 'ancient' is ___.", answer: "modern", hint: "New." },
    { sentence: "√81 = ___.", answer: "9", hint: "Single digit." },
    { sentence: "The chemical symbol for gold is ___.", answer: "au", hint: "Two letters." },
    { sentence: "The plural of 'child' is ___.", answer: "children", hint: "Irregular." }
  ],
  matching: [
    { title: "Match the Element to its Symbol", pairs: [
      { left: "Hydrogen", right: "H" }, { left: "Oxygen", right: "O" },
      { left: "Gold", right: "Au" }, { left: "Iron", right: "Fe" } ] },
    { title: "Match the Word to its Synonym", pairs: [
      { left: "Happy", right: "Joyful" }, { left: "Brave", right: "Bold" },
      { left: "Quick", right: "Fast" }, { left: "Begin", right: "Start" } ] },
    { title: "Match the Math Expression to its Value", pairs: [
      { left: "3²", right: "9" }, { left: "√16", right: "4" },
      { left: "5!", right: "120" }, { left: "2⁴", right: "16" } ] }
  ],
  logicgrid: [
    { title: "Who owns the fish?", clues: [
      "Ayanokoji sits next to Horikita.", "Koenji does NOT sit in seat 1.",
      "Kushida is in seat 2.", "Horikita is not in seat 4." ],
      seats: 4, answer: { 1: "Ayanokoji", 2: "Kushida", 3: "Horikita", 4: "Koenji" } },
    { title: "Subject Order", clues: [
      "Math is before Science.", "English is last.", "Science is not first." ],
      seats: 3, answer: { 1: "Math", 2: "Science", 3: "English" } }
  ]
};

const DEFAULT_AI = [
  { id: "horikita", name: "Horikita Suzune", specialty: "math", skill: 0.85, growth: 0.02,
    tagline: "Results matter. Feelings do not.",
    lines: {
      win:   ["Expected. Don't let it get to your head.", "Adequate. Barely.", "You're improving. Marginally."],
      lose:  ["That was painful to watch.", "Do you even study?", "Pathetic. Try again."],
      tie:   ["A draw. How dull.", "We're even. For now."],
      help:  ["Here. Read this. Don't waste my time.", "I'll explain once. Pay attention."],
      taunt: ["You're slowing the class down.", "Class D suits you."],
      respect: ["You're... not hopeless.", "I underestimated you."]
    } },
  { id: "koenji", name: "Koenji Rokusuke", specialty: "science", skill: 0.82, growth: 0.015,
    tagline: "Perfection is my natural state.",
    lines: {
      win:   ["Naturally. I am perfect.", "Did you expect otherwise?", "A trivial victory."],
      lose:  ["A fluke. Nothing more.", "Even the sun has off days.", "Don't celebrate. It's beneath me."],
      tie:   ["A tie? How boring.", "We match. Fascinating."],
      help:  ["Allow me to illuminate your ignorance.", "Watch and learn, peasant."],
      taunt: ["You're not even worth competing with.", "Try to keep up."],
      respect: ["Hmph. You have... potential.", "Perhaps you're not entirely dull."]
    } },
  { id: "kushida", name: "Kushida Kikyo", specialty: "english", skill: 0.78, growth: 0.02,
    tagline: "Let's all get along, okay? ♡",
    lines: {
      win:   ["Yay! I did it! ♡", "We're both doing great!", "Don't be too down, okay?"],
      lose:  ["Ah, I slipped up~ but you did great!", "It's okay! Next time!", "You're so good at this!"],
      tie:   ["A tie! How fun~ ♡", "We're neck and neck!"],
      help:  ["Let me help you! ♡", "I made notes — want them?"],
      taunt: ["Don't worry, I'll go easy on you~", "Are you trying your best? ♡"],
      respect: ["Wow, you're really good!", "You surprised me! ♡"]
    } },
  { id: "ayanokoji", name: "Ayanokoji Kiyotaka", specialty: "all", skill: 0.88, growth: 0.025,
    tagline: "...",
    lines: {
      win:   ["...", "That's all.", "Hm."],
      lose:  ["Interesting.", "You've improved.", "Noted."],
      tie:   ["...", "Equal.", "Hm."],
      help:  ["Look here.", "The method is simple.", "Observe."],
      taunt: ["You're predictable.", "I already know how this ends."],
      respect: ["You're... different.", "I'll remember that."]
    } }
];

// Master default config
const DEFAULT_CONFIG = {
  // -------- BASIC (editable without admin) --------
  site: {
    title: "Classroom of the Elite",
    subtitle: "Welcome back, Student. The hierarchy awaits.",
    accentColor: "#c8102e",     // red
    theme: "dark"               // dark | light
  },
  gameplay: {
    quizQuestionCount: 8,
    quizTimePerQuestion: 15,
    specialExamQuestionCount: 10,
    specialExamTimePerQuestion: 10,
    specialExamPassThreshold: 7,
    whiteRoomQuestionCount: 15,
    whiteRoomTimePerQuestion: 5,
    cpPerCorrect: 10,
    cpPerWrong: -5
  },
  ranking: {
    classThresholds: { A: 2000, B: 1600, C: 1300, D: 0 },
    startingCP: 1000,
    startingProtectionPoints: 1,
    failExamCPPenalty: 200,
    passExamCPReward: 300,
    startingDangerTier1: 800,
    startingDangerTier2: 600,
    startingDangerTier3: 400,
    examsFailedForDanger3: 2,
    examsFailedForExpulsion: 3
  },
  rewards: {
    bookletFillblankBase: 50,
    bookletFillblankPerCorrect: 10,
    bookletMatching: 80,
    bookletLogic: 100,
    whiteRoomTier1: 200,  // 90%+
    whiteRoomTier2: 100,  // 70%+
    whiteRoomTier3: 20,   // 50%+
    whiteRoomFail: -80
  },

  // -------- ADVANCED (admin only) --------
  questions: DEFAULT_QUESTIONS,     // see above
  booklet: DEFAULT_BOOKLET,
  aiStudents: DEFAULT_AI,

  admin: false
};

// ---------- LOAD / SAVE ----------
function deepMerge(base, override) {
  if (Array.isArray(base)) return override !== undefined ? override : base;
  if (typeof base !== "object" || base === null) return override !== undefined ? override : base;
  const out = { ...base };
  for (const k of Object.keys(override || {})) {
    out[k] = deepMerge(base[k], override[k]);
  }
  return out;
}

function loadConfig() {
  try {
    const raw = localStorage.getItem("anhs_config");
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    const parsed = JSON.parse(raw);
    return deepMerge(DEFAULT_CONFIG, parsed);
  } catch (e) {
    console.warn("Config load failed, using default.", e);
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }
}

function saveConfig(cfg) {
  localStorage.setItem("anhs_config", JSON.stringify(cfg));
}

function resetConfig() {
  localStorage.removeItem("anhs_config");
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

function resetConfigSection(section) {
  const cfg = loadConfig();
  cfg[section] = JSON.parse(JSON.stringify(DEFAULT_CONFIG[section]));
  saveConfig(cfg);
  return cfg;
}

// Apply accent color + theme as CSS variables / classes
function applyTheme(cfg) {
  document.documentElement.style.setProperty("--anhs-red", cfg.site.accentColor);
  document.body.classList.toggle("light-theme", cfg.site.theme === "light");
}

// Load and expose
window.CONFIG = loadConfig();

window.CONFIG_API = {
  load: loadConfig,
  save: saveConfig,
  reset: resetConfig,
  resetSection: resetConfigSection,
  defaults: DEFAULT_CONFIG,
  applyTheme
};

// Apply theme on load
applyTheme(window.CONFIG);
