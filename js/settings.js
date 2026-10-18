// ============================================
// settings.js — Settings page (basic + admin)
// V3: live preview, text color, browser title
// ============================================

(function () {
  const basicContainer = document.getElementById("basicSettings");
  const adminContainer = document.getElementById("adminSettings");
  const adminToggle = document.getElementById("adminToggle");
  const saveBtn = document.getElementById("saveSettings");
  const resetBtn = document.getElementById("resetSettings");
  const statusEl = document.getElementById("statusMsg");

  let cfg = window.CONFIG_API.load();
  window.CONFIG_API.applyTheme(cfg);

  // ---------- BASIC MODE ----------
  function renderBasic() {
    basicContainer.innerHTML = `
      <div class="card">
        <h3>Site</h3>
        <div class="setting-row"><label>Site Title (heading)</label>
          <input id="setTitle" type="text" value="${escapeAttr(cfg.site.title)}">
        </div>
        <div class="setting-row"><label>Subtitle</label>
          <input id="setSubtitle" type="text" value="${escapeAttr(cfg.site.subtitle)}">
        </div>
        <div class="setting-row"><label>Browser Tab Title</label>
          <input id="setBrowserTitle" type="text" value="${escapeAttr(cfg.site.browserTitle || "HDL")}">
        </div>
        <div class="setting-row"><label>Accent Color</label>
          <input id="setAccent" type="color" value="${cfg.site.accentColor}">
          <span id="accentPreview" style="background:${cfg.site.accentColor}; width:24px; height:24px; display:inline-block; border-radius:4px; margin-left:0.5rem;"></span>
        </div>
        <div class="setting-row"><label>Text Color</label>
          <input id="setTextColor" type="color" value="${cfg.site.textColor}">
          <span id="textPreview" style="background:${cfg.site.textColor}; width:24px; height:24px; display:inline-block; border-radius:4px; margin-left:0.5rem;"></span>
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
          <div style="padding:0.5rem 0; border-bottom:1px solid rgba(255,255,255,0.05);">
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

    // ⬇ LIVE PREVIEW HANDLERS ⬇
    document.getElementById("setAccent").addEventListener("input", e => {
      document.getElementById("accentPreview").style.background = e.target.value;
      const preview = { ...cfg, site: { ...cfg.site, accentColor: e.target.value } };
      window.CONFIG_API.applyTheme(preview);
    });
    document.getElementById("setTextColor").addEventListener("input", e => {
      document.getElementById("textPreview").style.background = e.target.value;
      const preview = { ...cfg, site: { ...cfg.site, textColor: e.target.value } };
      window.CONFIG_API.applyTheme(preview);
    });
    document.getElementById("setTheme").addEventListener("change", e => {
      const preview = { ...cfg, site: { ...cfg.site, theme: e.target.value } };
      window.CONFIG_API.applyTheme(preview);
    });
    document.getElementById("setBrowserTitle").addEventListener("input", e => {
      document.title = e.target.value || "HDL";
    });
  }

  // ---------- ADMIN MODE ----------
  function renderAdmin() {
    adminContainer.innerHTML = `
      <div class="card" style="border-left-color:var(--danger);">
        <h3 style="color:var(--danger);">⚠️ Admin Mode</h3>
        <p style="color:var(--anhs-grey); font-size:0.9rem;">
          Raw JSON editors. Invalid JSON will not save.
        </p>
      </div>
      ${adminSection("site", "Site", cfg.site)}
      ${adminSection("gameplay", "Gameplay", cfg.gameplay)}
      ${adminSection("ranking", "Ranking & Expulsion", cfg.ranking)}
      ${adminSection("rewards", "CP Rewards", cfg.rewards)}
      ${adminSection("aiStudents", "AI Classmates (full)", cfg.aiStudents)}
      <div class="card" style="border-left-color:var(--danger);">
        <h3>Danger Zone</h3>
        <button class="btn btn-secondary" onclick="window.resetAllConfig()">Reset ALL config</button>
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

  function collectBasic() {
    const g = id => document.getElementById(id);
    cfg.site.title = g("setTitle").value;
    cfg.site.subtitle = g("setSubtitle").value;
    cfg.site.browserTitle = g("setBrowserTitle").value || "HDL";
    cfg.site.accentColor = g("setAccent").value;
    cfg.site.textColor = g("setTextColor").value;
    cfg.site.theme = g("setTheme").value;

    cfg.gameplay.quizQuestionCount = parseInt(g("setQuizCount").value) || 8;
    cfg.gameplay.quizTimePerQuestion = parseInt(g("setQuizTime").value) || 15;
    cfg.gameplay.cpPerCorrect = parseInt(g("setCPCorrect").value) || 10;
    cfg.gameplay.cpPerWrong = parseInt(g("setCPWrong").value) || -5;
    cfg.gameplay.specialExamPassThreshold = parseInt(g("setExamPass").value) || 7;

    document.querySelectorAll(".ai-name").forEach(el => {
      cfg.aiStudents[parseInt(el.dataset.idx)].name = el.value;
    });
    document.querySelectorAll(".ai-tagline").forEach(el => {
      cfg.aiStudents[parseInt(el.dataset.idx)].tagline = el.value;
    });
  }

  function collectAdmin() {
    const errors = [];
    document.querySelectorAll(".admin-json").forEach(ta => {
      try { cfg[ta.dataset.key] = JSON.parse(ta.value); }
      catch (e) { errors.push(`${ta.dataset.key}: ${e.message}`); }
    });
    return errors;
  }

  function save() {
    if (adminToggle.checked) {
      const errors = collectAdmin();
      if (errors.length) {
        showStatus("JSON errors — nothing saved.", "danger");
        errors.forEach(e => console.error(e));
        return;
      }
    }
    if (document.getElementById("setTitle")) collectBasic();

    window.CONFIG_API.save(cfg);
    window.CONFIG = cfg;
    window.CONFIG_API.applyTheme(cfg);
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

  function onAdminToggle() {
    cfg.admin = adminToggle.checked;
    if (adminToggle.checked) {
      // Snapshot basic first
      collectBasic();
      window.CONFIG_API.save(cfg);
      adminContainer.classList.remove("hidden");
      renderAdmin();
    } else {
      adminContainer.classList.add("hidden");
    }
  }

  // ---------- GLOBAL HELPERS ----------
  window.resetAllConfig = function () {
    if (!confirm("Reset ALL settings AND question banks to defaults?")) return;
    cfg = window.CONFIG_API.reset();
    window.CONFIG = cfg;
    window.CONFIG_API.applyTheme(cfg);
    renderBasic();
    if (adminToggle.checked) renderAdmin();
    showStatus("✓ Config reset.", "safe");
  };

  window.resetQuestionsSection = function () {
    if (!confirm("Reset question banks to defaults?")) return;
    cfg.questions = JSON.parse(JSON.stringify(window.CONFIG_API.defaults.questions));
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

  function escapeAttr(s) { return String(s).replace(/"/g, "&quot;").replace(/</g, "&lt;"); }
})();
