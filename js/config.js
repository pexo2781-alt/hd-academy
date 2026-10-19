// ============================================
// config.js — Central configuration, defaults, load/save
// V6.0: added motto + browserTitle, motto injection
// ============================================

// ---- Per-subject defaults ----
const DEFAULT_QUESTIONS = {
  math: {
    written: [
      { q: "What is 7 × 8?", a: ["54", "56", "48", "64"], c: 1 },
      { q: "Solve: 3x + 6 = 21. What is x?", a: ["3", "5", "7", "9"], c: 1 },
      { q: "What is the next number: 2, 4, 8, 16, ?", a: ["20", "24", "32", "30"], c: 2 },
      { q: "What is 15% of 200?", a: ["15", "25", "30", "35"], c: 2 },
      { q: "Simplify: (x²)(x³)", a: ["x⁵", "x⁶", "x⁹", "x"], c: 0 },
      { q: "What is √144?", a: ["10", "11", "12", "14"], c: 2 },
      { q: "If a triangle has angles 90° and 45°, the third is?", a: ["30°", "45°", "60°", "90°"], c: 1 },
      { q: "What is 9² − 4²?", a: ["65", "55", "45", "75"], c: 0 },
      { q: "What is 1/4 + 1/2?", a: ["1/2", "3/4", "1/3", "2/3"], c: 1 },
      { q: "Pattern: 1, 1, 2, 3, 5, 8, ?", a: ["11", "12", "13", "14"], c: 2 }
    ],
    fillblank: [
      { sentence: "7 × 8 = ___.", answer: "56", hint: "Between 50 and 60." },
      { sentence: "√81 = ___.", answer: "9", hint: "Single digit." },
      { sentence: "A triangle has ___ sides.", answer: "3", hint: "Small number." }
    ],
    matching: [
      { title: "Match the Expression to its Value", pairs: [
        { left: "3²", right: "9" }, { left: "√16", right: "4" },
        { left: "5!", right: "120" }, { left: "2⁴", right: "16" } ] }
    ],
    logic: [
      { title: "Number Order", clues: [
        "5 is not first.", "2 is before 4.", "The last number is 9." ],
        seats: 3, answer: { 1: "2", 2: "5", 3: "9" } }
    ]
  },
  science: {
    written: [
      { q: "What is the chemical symbol for water?", a: ["H₂O", "O₂", "CO₂", "HO"], c: 0 },
      { q: "What planet is closest to the Sun?", a: ["Venus", "Mercury", "Mars", "Earth"], c: 1 },
      { q: "What gas do plants absorb for photosynthesis?", a: ["Oxygen", "Nitrogen", "CO₂", "Hydrogen"], c: 2 },
      { q: "What is the powerhouse of the cell?", a: ["Nucleus", "Ribosome", "Mitochondria", "Golgi"], c: 2 },
      { q: "How many bones in the adult human body?", a: ["186", "196", "206", "216"], c: 2 },
      { q: "Which element has symbol 'Au'?", a: ["Silver", "Gold", "Copper", "Aluminum"], c: 1 },
      { q: "What force keeps planets in orbit?", a: ["Magnetism", "Friction", "Gravity", "Inertia"], c: 2 },
      { q: "What is the pH of pure water?", a: ["0", "5", "7", "14"], c: 2 },
      { q: "How many planets in the solar system?", a: ["7", "8", "9", "10"], c: 1 },
      { q: "Which planet is known as the Red Planet?", a: ["Venus", "Mars", "Jupiter", "Saturn"], c: 1 }
    ],
    fillblank: [
      { sentence: "Water is made of hydrogen and ___.", answer: "oxygen", hint: "Chemical symbol O." },
      { sentence: "The chemical symbol for gold is ___.", answer: "au", hint: "Two letters." },
      { sentence: "Water freezes at ___ °C.", answer: "0", hint: "Zero degrees." }
    ],
    matching: [
      { title: "Match the Element to its Symbol", pairs: [
        { left: "Hydrogen", right: "H" }, { left: "Oxygen", right: "O" },
        { left: "Gold", right: "Au" }, { left: "Iron", right: "Fe" } ] }
    ],
    logic: [
      { title: "Planet Order", clues: [
        "Mercury is first.", "Earth is not last.", "Mars is after Earth." ],
        seats: 3, answer: { 1: "Mercury", 2: "Earth", 3: "Mars" } }
    ]
  },
  english: {
    written: [
      { q: "Choose the correct spelling:", a: ["Recieve", "Receive", "Receeve", "Receve"], c: 1 },
      { q: "What is the past tense of 'run'?", a: ["Runned", "Ran", "Runs", "Running"], c: 1 },
      { q: "Which is a synonym for 'happy'?", a: ["Sad", "Joyful", "Angry", "Tired"], c: 1 },
      { q: "What is the plural of 'child'?", a: ["Childs", "Childes", "Children", "Child"], c: 2 },
      { q: "What does 'benevolent' mean?", a: ["Cruel", "Kind", "Rich", "Weak"], c: 1 },
      { q: "What is a synonym for 'begin'?", a: ["End", "Start", "Stop", "Pause"], c: 1 },
      { q: "What does 'ambiguous' mean?", a: ["Clear", "Unclear", "Loud", "Quiet"], c: 1 },
      { q: "What is the plural of 'mouse'?", a: ["Mouses", "Mice", "Mouse", "Mices"], c: 1 },
      { q: "Which word is an adverb?", a: ["Quickly", "Quick", "Quickness", "Quicken"], c: 0 },
      { q: "What does 'terse' mean?", a: ["Long-winded", "Brief and to the point", "Confusing", "Polite"], c: 1 }
    ],
    fillblank: [
      { sentence: "The past tense of 'run' is ___.", answer: "ran", hint: "3 letters." },
      { sentence: "The opposite of 'ancient' is ___.", answer: "modern", hint: "New." },
      { sentence: "The plural of 'child' is ___.", answer: "children", hint: "Irregular." }
    ],
    matching: [
      { title: "Match the Word to its Synonym", pairs: [
        { left: "Happy", right: "Joyful" }, { left: "Brave", right: "Bold" },
        { left: "Quick", right: "Fast" }, { left: "Begin", right: "Start" } ] }
    ],
    logic: [
      { title: "Word Order", clues: [
        "Nouns come first.", "Adverbs are last.", "Verbs are not first." ],
        seats: 3, answer: { 1: "Nouns", 2: "Verbs", 3: "Adverbs" } }
    ]
  }
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

const DEFAULT_CONFIG = {
  site: {
    title: "Human Development Academy",
    subtitle: "Where the capable rise.",
    motto: "Where the capable rise.",
    browserTitle: "HDA",
    accentColor: "#c8102e",
    textColor: "#f5f5f5",
    theme: "dark"
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
    whiteRoomTier1: 200,
    whiteRoomTier2: 100,
    whiteRoomTier3: 20,
    whiteRoomFail: -80
  },
  questions: DEFAULT_QUESTIONS,
  aiStudents: DEFAULT_AI,
  admin: false
};

// ---------- MIGRATION: old flat-array schema → new per-type schema ----------
function migrateQuestions(q) {
  if (!q) return JSON.parse(JSON.stringify(DEFAULT_QUESTIONS));
  const out = {};
  for (const sub of ["math", "science", "english"]) {
    const old = q[sub];
    if (!old) { out[sub] = JSON.parse(JSON.stringify(DEFAULT_QUESTIONS[sub])); continue; }

    if (!Array.isArray(old) && typeof old === "object") {
      out[sub] = {
        written:   old.written   || [],
        fillblank: old.fillblank || [],
        matching:  old.matching  || [],
        logic:     old.logic     || []
      };
    } else if (Array.isArray(old)) {
      out[sub] = {
        written:   old,
        fillblank: JSON.parse(JSON.stringify(DEFAULT_QUESTIONS[sub].fillblank)),
        matching:  JSON.parse(JSON.stringify(DEFAULT_QUESTIONS[sub].matching)),
        logic:     JSON.parse(JSON.stringify(DEFAULT_QUESTIONS[sub].logic))
      };
    }
  }
  return out;
}

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
    // Try new key first, then legacy
    const raw = localStorage.getItem("hda_config") || localStorage.getItem("anhs_config");
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    const parsed = JSON.parse(raw);
    parsed.questions = migrateQuestions(parsed.questions);
    if (parsed.booklet) delete parsed.booklet;
    const merged = deepMerge(DEFAULT_CONFIG, parsed);
    merged.questions = migrateQuestions(merged.questions);
    return merged;
  } catch (e) {
    console.warn("Config load failed, using default.", e);
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }
}

function saveConfig(cfg) {
  localStorage.setItem("hda_config", JSON.stringify(cfg));
  if (window.ANHS && window.ANHS.saveState) {
    const st = window.ANHS.loadState();
    if (st.slotId) window.ANHS.saveState(st);
  }
}

function resetConfig() {
  localStorage.removeItem("hda_config");
  localStorage.removeItem("anhs_config");
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

function resetConfigSection(section) {
  const cfg = loadConfig();
  cfg[section] = JSON.parse(JSON.stringify(DEFAULT_CONFIG[section]));
  saveConfig(cfg);
  return cfg;
}

// ---------- THEME APPLICATION ----------
function applyTheme(cfg) {
  const root = document.documentElement;
  const accent = cfg.site.accentColor || "#c8102e";
  const text = cfg.site.textColor || "#f5f5f5";

  root.style.setProperty("--anhs-red", accent);
  root.style.setProperty("--anhs-text", text);
  root.style.setProperty("--anhs-red-hover", darkenHex(accent, 15));

  const rgb = hexToRgb(accent);
  if (rgb) root.style.setProperty("--anhs-red-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);

  document.body.classList.toggle("light-theme", cfg.site.theme === "light");
  document.title = cfg.site.browserTitle || "HDA";

  // Motto injection
  const mottoEl = document.getElementById("siteMotto");
  if (mottoEl) mottoEl.textContent = cfg.site.motto || cfg.site.subtitle || "";

  // Title injection (if page has siteTitle element)
  const titleEl = document.getElementById("siteTitle");
  if (titleEl) titleEl.textContent = cfg.site.title || "";
  const subtitleEl = document.getElementById("siteSubtitle");
  if (subtitleEl) subtitleEl.textContent = cfg.site.subtitle || "";
}

// Simple hex darken
function darkenHex(hex, pct) {
  try {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const f = 1 - pct / 100;
    const nr = Math.max(0, Math.round(r * f));
    const ng = Math.max(0, Math.round(g * f));
    const nb = Math.max(0, Math.round(b * f));
    return "#" + [nr, ng, nb].map(v => v.toString(16).padStart(2, "0")).join("");
  } catch { return hex; }
}

function hexToRgb(hex) {
  try {
    const h = hex.replace("#", "");
    if (h.length !== 6) return null;
    return {
      r: parseInt(h.substring(0, 2), 16),
      g: parseInt(h.substring(2, 4), 16),
      b: parseInt(h.substring(4, 6), 16)
    };
  } catch { return null; }
}

// Load and expose
window.CONFIG = loadConfig();

window.CONFIG_API = {
  load: loadConfig,
  save: saveConfig,
  reset: resetConfig,
  resetSection: resetConfigSection,
  defaults: DEFAULT_CONFIG,
  applyTheme,
  migrateQuestions,
  darkenHex,
  hexToRgb
};

applyTheme(window.CONFIG);
