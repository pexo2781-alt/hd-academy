// ============================================
// settings.js — Settings page logic (basic + admin)
// ============================================

(function () {
  const basicContainer = document.getElementById("basicSettings");
  const adminContainer = document.getElementById("adminSettings");
  const adminToggle = document.getElementById("adminToggle");
  const saveBtn = document.getElementById("saveSettings");
  const resetBtn = document.getElementById("resetSettings");
  const statusEl = document.getElementById("statusMsg");

  let cfg = window.CONFIG_API.load();

  // Apply theme immediately
  window.CONFIG_API.applyTheme(cfg);

  // ---------- BASIC MODE ----------
  function renderBasic() {
    basicContainer.innerHTML = `
      <div class="card">
        <h3>Site</h3>
        <div class="setting-row"><label>Site Title</label>
          <input id="setTitle" type="text" value="${escapeAttr(cfg.site.title)}">
        </div>
        <div class="setting-row"><label>Subtitle</label>
          <input id="setSubtitle" type="text" value="${escapeAttr(cfg.site.subtitle)}">
        </div>
        <div class="setting-row"><label>Accent Color</label>
          <input id="setAccent" type="color" value="${cfg.site.accentColor}">
          <span id="accentPreview" style="background:${cfg.site.accentColor}; width:24px; height:24px; display:inline-block; border-radius:4px; margin-left:0.5rem;"></span>
        </div>
        <div class="setting-row"><label>Theme</label>
          <select id="setTheme">
            <option value="dark" ${cfg.site.theme === "dark" ? "selected" : ""}>Dark</option>
            <option value="light" ${cfg.site.theme === "light" ? "selected" : ""}>Light</option>
          </select>
        </div>
      </div>

      <div class="card">
        <h3>Gameplay</h3>
        <div class="setting-row"><label>Quiz: Questions per quiz</label>
          <input id="setQuizCount" type="number" min="1" max="50" value="${cfg.gameplay.quizQuestionCount}">
        </div>
        <div class="setting-row"><label>Quiz: Seconds per question</label>
          <input id="setQuizTime" type="number" min="3" max="120" value="${cfg.gameplay.quizTimePerQuestion}">
        </div>
        <div class="setting-row"><label>CP per correct answer</label>
          <input id="setCPCorrect" type="number" value="${cfg.gameplay.cpPerCorrect}">
        </div>
        <div class="setting-row"><label>CP per wrong answer</label>
          <input id="setCPWrong" type="number" value="${cfg.gameplay.cpPerWrong}">
        </div>
        <div class="setting-row"><label>Special Exam: pass threshold</label>
          <input id="setExamPass" type="number" min="1" value="${cfg.gameplay.specialExamPassThreshold}">
        </div>
      </div>

      <div class="card">
        <h3>Classmates (names & taglines)</h3>
        ${cfg.aiStudents.map((ai, i) => `
          <div style="padding:0.5rem 0; border-bottom:1px solid #333;">
            <div class="setting-row"><label>Name</label>
              <input class="ai-name" data-idx="${i}" type="text" value="${escapeAttr(ai.name)}">
            </div>
            <div class="setting-row"><label>Tagline</label>
              <input class="ai-tagline" data-idx="${i}" type="text" value="${escapeAttr(ai.tagline)}">
            </div>
          </div>
        `).join("")}
      </div>
    `;

    document.getElementById("setAccent").addEventListener("input", e => {
      document.getElementById("accentPreview").style.background = e.target.value;
      document.documentElement.style.setProperty("--anhs-red", e.target.value);
    });
  }

  // ---------- ADMIN MODE ----------
  function renderAdmin() {
    adminContainer.innerHTML = `
      <div class="card" style="border-left-color:var(--danger);">
        <h3 style="color:var(--danger);">⚠️ Admin Mode</h3>
        <p style="color:var(--anhs-grey); font-size:0.9rem;">
          Edit raw JSON below. Changes are applied when you click Save. Invalid JSON will fail to apply.
        </p>
      </div>

      ${adminSection("site", "Site", cfg.site)}
      ${adminSection("gameplay", "Gameplay", cfg.gameplay)}
      ${adminSection("ranking", "Ranking & Expulsion", cfg.ranking)}
      ${adminSection("rewards", "CP Rewards", cfg.rewards)}
      ${adminSection("booklet", "Booklet Puzzles", cfg.booklet)}
      ${adminSection("aiStudents", "AI Classmates (full)", cfg.aiStudents)}

      <div class="card" style="border-left-color:var(--danger);">
        <h3>Danger Zone</h3>
        <button class="btn btn-secondary" onclick="window.resetAllConfig()">Reset ALL config to defaults</button>
        <button class="btn btn-secondary" onclick="window.resetQuestionsSection()">Reset question banks only</button>
      </div>
    `;
  }

  function adminSection(key, label, data) {
    return `
      <div class="card">
        <h3>${label} <code style="color:var(--anhs-grey); font-size:0.8rem;">(${key})</code></h3>
        <textarea class="admin-json" data-key="${key}" spellcheck="false">${JSON.stringify(data, null, 2)}</textarea>
      </div>`;
  }

  // ---------- SAVE ----------
  function collectBasic() {
    const g = id => document.getElementById(id);
    cfg.site.title = g("setTitle").value;
    cfg.site.subtitle = g("setSubtitle").value;
    cfg.site.accentColor = g("setAccent").value;
    cfg.site.theme = g("setTheme").value;

    cfg.gameplay.quizQuestionCount = parseInt(g("setQuizCount").value) || 8;
    cfg.gameplay.quizTimePerQuestion = parseInt(g("setQuizTime").value) || 15;
    cfg.gameplay.cpPerCorrect = parseInt(g("setCPCorrect").value) || 10;
    cfg.gameplay.cpPerWrong = parseInt(g("setCPWrong").value) || -5;
    cfg.gameplay.specialExamPassThreshold = parseInt(g("setExamPass").value) || 7;

    document.querySelectorAll(".ai-name").forEach(el => {
      const i = parseInt(el.dataset.idx);
      cfg.aiStudents[i].name = el.value;
    });
    document.querySelectorAll(".ai-tagline").forEach(el => {
      const i = parseInt(el.dataset.idx);
      cfg.aiStudents[i].tagline = el.value;
    });
  }

  function collectAdmin() {
    let errors = [];
    document.querySelectorAll(".admin-json").forEach(ta => {
      const key = ta.dataset.key;
      try {
        cfg[key] = JSON.parse(ta.value);
      } catch (e) {
        errors.push(`${key}: ${e.message}`);
      }
    });
    return errors;
  }

  function save() {
    if (adminToggle.checked) {
      const errors = collectAdmin();
      if (errors.length) {
        showStatus("JSON errors — see console. Nothing saved.", "danger");
        errors.forEach(e => console.error(e));
        return;
      }
    }
    // Always collect basic (basic fields still exist when admin off)
    if (document.getElementById("setTitle")) collectBasic();
    // Re-apply if admin edited site
    if (adminToggle.checked && cfg.site) {
      // Sync basic fields that admin may have edited
      document.getElementById("setTitle").value = cfg.site.title || document.getElementById("setTitle").value;
      document.getElementById("setSubtitle").value = cfg.site.subtitle || document.getElementById("setSubtitle").value;
    }

    window.CONFIG_API.save(cfg);
    window.CONFIG = cfg;
    window.CONFIG_API.applyTheme(cfg);
    // Update AI in-memory
    if (window.AI_STUDENTS) {
      cfg.aiStudents.forEach(newAI => {
        const existing = window.AI_STUDENTS.find(a => a.id === newAI.id);
        if (existing) Object.assign(existing, newAI);
      });
    }
    showStatus("✓ Settings saved.", "safe");
  }

  function showStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.style.color = type === "safe" ? "var(--safe)" : "var(--danger)";
    setTimeout(() => { statusEl.textContent = ""; }, 3000);
  }

  // ---------- TOGGLE ADMIN ----------
  function onAdminToggle() {
    cfg.admin = adminToggle.checked;
    if (adminToggle.checked) {
      adminContainer.classList.remove("hidden");
      renderAdmin();
    } else {
      adminContainer.classList.add("hidden");
    }
  }

  // ---------- GLOBAL HELPERS ----------
  window.resetAllConfig = function () {
    if (!confirm("Reset ALL settings AND question banks to defaults? Player progress (CP, stats) is NOT affected.")) return;
    cfg = window.CONFIG_API.reset();
    window.CONFIG = cfg;
    window.CONFIG_API.applyTheme(cfg);
    renderBasic();
    if (adminToggle.checked) renderAdmin();
    showStatus("✓ Config reset to defaults.", "safe");
  };

  window.resetQuestionsSection = function () {
    if (!confirm("Reset question banks (Math/Science/English + Booklet) to defaults?")) return;
    cfg.questions = JSON.parse(JSON.stringify(window.CONFIG_API.defaults.questions));
    cfg.booklet = JSON.parse(JSON.stringify(window.CONFIG_API.defaults.booklet));
    window.CONFIG_API.save(cfg);
    window.CONFIG = cfg;
    if (adminToggle.checked) renderAdmin();
    showStatus("✓ Question banks reset.", "safe");
  };

  // ---------- INIT ----------
  renderBasic();
  adminToggle.checked = cfg.admin || false;
  if (adminToggle.checked) {
    adminContainer.classList.remove("hidden");
    renderAdmin();
  }
  adminToggle.addEventListener("change", onAdminToggle);
  saveBtn.addEventListener("click", save);
  resetBtn.addEventListener("click", window.resetAllConfig);

  // Keep local cfg in sync when admin is toggled (basic edits lost otherwise)
  adminToggle.addEventListener("change", () => {
    if (adminToggle.checked) {
      // Save basic before entering admin mode
      collectBasic();
      window.CONFIG_API.save(cfg);
    }
  });

  function escapeAttr(s) {
    return String(s).replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }
})();
