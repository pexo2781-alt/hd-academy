// ============================================
// npc-generator.js — Generates 104 generic NPCs
// V6.1: multicultural name pools
// ============================================

(function () {
  // ============ CULTURALLY DIVERSE NAME POOLS ============
  // Each culture = { label, first, last }
  const CULTURES = [
    {
      label: "japanese",
      first: ["Akari","Ayaka","Chika","Daichi","Eri","Fumiya","Hana","Haruto","Ichika","Jiro","Kaede","Kaito","Mio","Nao","Natsuki","Ren","Rin","Ryo","Saki","Sota","Tsubaki","Yui","Yuki","Yuuto","Aoi","Chiaki","Emi","Hikari","Issei","Jun","Kenji","Mao","Nanami","Rei","Sho","Taiga","Umi","Wataru","Yoshiko","Aiko"],
      last: ["Amano","Beppu","Chiba","Doi","Endo","Fujita","Goto","Hara","Ikeda","Jinno","Kaneko","Matsuda","Nagai","Ogawa","Sano","Takagi","Uchida","Watanabe","Yamada","Ando","Baba","Date","Eto","Fujii","Hasegawa","Inoue","Kudo","Mizuno","Nakamura","Ono","Sasaki","Tanaka","Ueda","Yoshida"]
    },
    {
      label: "chinese",
      first: ["Wei","Fang","Jing","Lei","Xiu","Ming","Hui","Lian","Qiang","Yan","Mei","Jian","Xin","Tao","Lan","Bo","Chen","Dan","Feng","Guo"],
      last: ["Wang","Li","Zhang","Liu","Chen","Yang","Huang","Zhao","Wu","Zhou","Xu","Sun","Ma","Zhu","Hu","Guo","He","Gao","Lin","Luo"]
    },
    {
      label: "korean",
      first: ["Min-jun","Seo-yeon","Ji-ho","Ha-eun","Tae-yang","Ji-woo","Hyun-woo","Yu-na","Dong-hyun","Soo-ah","Jun-ho","Ye-jin","Sang-hoon","Hye-jin","Jae-won"],
      last: ["Kim","Lee","Park","Choi","Jung","Kang","Cho","Yoon","Jang","Lim","Han","Oh","Seo","Shin","Kwon"]
    },
    {
      label: "indian",
      first: ["Aarav","Priya","Rohan","Ananya","Vikram","Diya","Arjun","Meera","Karan","Sneha","Aditya","Riya","Nikhil","Kavya","Rahul","Isha","Dev","Tara"],
      last: ["Patel","Sharma","Singh","Kumar","Gupta","Reddy","Rao","Iyer","Nair","Mehta","Joshi","Desai","Chopra","Kapoor","Malhotra"]
    },
    {
      label: "british",
      first: ["Oliver","Emily","Jack","Sophie","Harry","Charlotte","George","Amelia","Thomas","Isla","James","Ava","William","Mia","Henry","Ella"],
      last: ["Smith","Johnson","Williams","Brown","Taylor","Davies","Wilson","Evans","Thomas","Roberts","Walker","Wright","Robinson","Thompson","White"]
    },
    {
      label: "french",
      first: ["Lucas","Emma","Louis","Chloé","Hugo","Léa","Nathan","Manon","Théo","Camille","Gabriel","Inès","Jules","Sarah","Adam"],
      last: ["Martin","Bernard","Dubois","Thomas","Robert","Richard","Petit","Durand","Leroy","Moreau","Simon","Laurent","Lefebvre","Michel","Garcia"]
    },
    {
      label: "spanish",
      first: ["Hugo","Lucía","Martín","Sofía","Pablo","Valeria","Álvaro","Daniela","Diego","Carmen","Javier","Elena","Adrián","Marina"],
      last: ["García","Rodríguez","González","Fernández","López","Martínez","Sánchez","Pérez","Gómez","Martín","Jiménez","Ruiz","Hernández","Díaz"]
    },
    {
      label: "arabic",
      first: ["Omar","Layla","Yusuf","Amira","Karim","Noor","Sami","Zara","Tariq","Leila","Hamza","Yasmin","Ali","Fatima"],
      last: ["Hassan","Ahmed","Ali","Ibrahim","Khalil","Rahman","Saleh","Aziz","Farouk","Nasser","Karim","Mansour"]
    },
    {
      label: "african",
      first: ["Kwame","Zara","Chidi","Nia","Tunde","Amara","Kofi","Malia","Femi","Kesi","Sefu","Ayo","Juma","Zola"],
      last: ["Mensah","Okafor","Adeyemi","Nkemelu","Adebayo","Kone","Mbeki","Achebe","Nkwame","Diallo","Osei","Ndlovu"]
    },
    {
      label: "slavic",
      first: ["Ivan","Olga","Dmitri","Anastasia","Pavel","Natalia","Alexei","Katya","Sergei","Ludmila","Nikolai","Irina"],
      last: ["Ivanov","Petrov","Sokolov","Volkov","Kozlov","Lebedev","Novikov","Morozov","Pavlov","Semenov","Kuznetsov","Popov"]
    },
    {
      label: "german",
      first: ["Maximilian","Anna","Leon","Sophie","Felix","Maria","Jonas","Lena","Paul","Julia","Lukas","Hannah"],
      last: ["Müller","Schmidt","Schneider","Fischer","Weber","Meyer","Wagner","Becker","Schulz","Hoffmann","Koch","Richter"]
    },
    {
      label: "brazilian",
      first: ["João","Ana","Pedro","Maria","Lucas","Beatriz","Gabriel","Camila","Rafael","Larissa","Thiago","Letícia"],
      last: ["Silva","Santos","Oliveira","Souza","Lima","Pereira","Costa","Ferreira","Rodrigues","Almeida","Nascimento"]
    }
  ];

  // ============ PORTRAIT POOLS ============
  const EMOJI_POOL = [
    "🎓","📘","🎯","🔥","⚡","🌙","🎨","🧠","🌊","🎭","🏹","🌸",
    "🍀","⚔","🎐","🌿","🍂","🌺","🦋","🗡","🛡","🎴","🪶","🌾"
  ];
  const COLOR_POOL = [
    "#c8102e","#2e7d32","#1565c0","#f9a825","#6a1b9a","#00838f",
    "#d84315","#455a64","#7e57c2","#ec407a","#26a69a","#ef6c00",
    "#5d4037","#8d6e63","#ad1457","#00695c","#283593","#558b2f"
  ];

  const SPECIALTIES = ["math", "science", "english"];

  // ============ GENERIC DIALOGUE POOLS ============
  const GENERIC_LINES = {
    win: [
      "Hah, got it.", "Nice try.", "Better luck next time.",
      "We're still ahead.", "Keep up.", "Not even close."
    ],
    lose: [
      "Good job!", "Wow, you're good.", "Not bad at all.",
      "I'll train harder.", "You got me.", "Well played."
    ],
    tie: [
      "A tie.", "Even match.", "Interesting.",
      "Let's go again.", "Not bad at all."
    ],
    help: [
      "Here's a tip.", "Try it this way.", "Read it again.",
      "You'll get it.", "Focus on the basics.", "Break it down."
    ],
    taunt: [
      "Try harder.", "You've got a long way to go.",
      "Step it up.", "We're watching.", "Is that all?"
    ],
    respect: [
      "Not bad.", "You've got potential.", "I see you.",
      "Keep it up.", "Interesting.", "You're improving."
    ]
  };

  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  function generateName(usedNames) {
    for (let attempt = 0; attempt < 100; attempt++) {
      // Weight Japanese slightly higher since it's an anime-inspired setting
      const culture = Math.random() < 0.30
        ? CULTURES[0]  // Japanese 30%
        : rand(CULTURES);  // Others split the rest
      const fn = rand(culture.first);
      const ln = rand(culture.last);
      const name = `${ln} ${fn}`;
      if (!usedNames.has(name)) {
        usedNames.add(name);
        return name;
      }
    }
    return `Student ${randInt(1000, 9999)}`;
  }

  function generateGenericNPC(classRank, usedNames, usedPortraits) {
    const name = generateName(usedNames);
    const specialty = rand(SPECIALTIES);
    const skill = 0.4 + Math.random() * 0.35;
    const id = `generic_${classRank}_${Math.random().toString(36).slice(2, 10)}`;

    // Unique portrait
    let emoji, color, key, attempts = 0;
    do {
      emoji = rand(EMOJI_POOL);
      color = rand(COLOR_POOL);
      key = color + emoji;
      attempts++;
    } while (usedPortraits.has(key) && attempts < 100);
    usedPortraits.add(key);

    return {
      id,
      name,
      class: classRank,
      specialty,
      skill,
      growth: 0.015,
      personality: "generic",
      tagline: "",
      portrait: { color, emoji },
      isGeneric: true,
      lines: {
        win:   [rand(GENERIC_LINES.win), rand(GENERIC_LINES.win)],
        lose:  [rand(GENERIC_LINES.lose), rand(GENERIC_LINES.lose)],
        tie:   [rand(GENERIC_LINES.tie)],
        help:  [rand(GENERIC_LINES.help)],
        taunt: [rand(GENERIC_LINES.taunt)],
        respect: [rand(GENERIC_LINES.respect)]
      }
    };
  }

  function generateAll() {
    const importantByClass = {};
    (window.IMPORTANT_NPCS || []).forEach(n => {
      importantByClass[n.class] = importantByClass[n.class] || [];
      importantByClass[n.class].push(n);
    });

    const allNPCs = [];
    const usedNames = new Set();
    const usedPortraits = new Set();

    // Important NPCs first
    (window.IMPORTANT_NPCS || []).forEach(n => {
      usedNames.add(n.name);
      if (n.portrait) usedPortraits.add(n.portrait.color + n.portrait.emoji);
      allNPCs.push({ ...n, isGeneric: false });
    });

    // Fill generic slots
    const targetPerClass = window.NPC_COUNTS.perClass;
    for (const classRank of ["A", "B", "C", "D"]) {
      const currentCount = (importantByClass[classRank] || []).length;
      const genericNeeded = targetPerClass[classRank] - currentCount;
      for (let i = 0; i < genericNeeded; i++) {
        allNPCs.push(generateGenericNPC(classRank, usedNames, usedPortraits));
      }
    }

    return allNPCs;
  }

  window.ALL_NPCS = generateAll();

  console.log(
    `[HDA] Generated ${window.ALL_NPCS.length} NPCs ` +
    `(${window.ALL_NPCS.filter(n => !n.isGeneric).length} important, ` +
    `${window.ALL_NPCS.filter(n => n.isGeneric).length} generic)`
  );
})();
