// ============================================
// auth-ui.js — Auth UI logic for account.html
// ============================================

(function () {
  const statusEl = document.getElementById("authStatus");
  const signedOutEl = document.getElementById("signedOutView");
  const signedInEl = document.getElementById("signedInView");

  async function refresh() {
    const user = await window.SB.getUser();
    if (user) {
      signedOutEl.classList.add("hidden");
      signedInEl.classList.remove("hidden");
      document.getElementById("userEmail").textContent = user.email;
      document.getElementById("userInitial").textContent = user.email[0].toUpperCase();

      // Show save status
      try {
        const save = await window.SB.loadSave();
        document.getElementById("saveStatus").textContent = save
          ? `Last cloud save: ${new Date(save.updated_at).toLocaleString()}`
          : "No cloud save yet. Your local progress will upload on next save.";
      } catch (e) {
        document.getElementById("saveStatus").textContent = "Could not load cloud save info.";
      }
    } else {
      signedOutEl.classList.remove("hidden");
      signedInEl.classList.add("hidden");
    }
  }

  // ---------- SIGN UP ----------
  document.getElementById("signUpBtn").addEventListener("click", async () => {
    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;
    if (!email || !password) return showStatus("Email and password required.", "danger");
    if (password.length < 6) return showStatus("Password must be at least 6 characters.", "danger");

    try {
      await window.SB.signUp(email, password);
      showStatus("✓ Account created. Check your email to confirm (if enabled), then sign in.", "safe");
    } catch (e) {
      showStatus("Sign-up failed: " + e.message, "danger");
    }
  });

  // ---------- SIGN IN ----------
  document.getElementById("signInBtn").addEventListener("click", async () => {
    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;
    if (!email || !password) return showStatus("Email and password required.", "danger");

    try {
      await window.SB.signIn(email, password);
      showStatus("✓ Signed in.", "safe");
      await refresh();
      await maybeSyncOnSignIn();
    } catch (e) {
      showStatus("Sign-in failed: " + e.message, "danger");
    }
  });

  // ---------- SIGN OUT ----------
  document.getElementById("signOutBtn").addEventListener("click", async () => {
    await window.SB.signOut();
    showStatus("Signed out.", "safe");
    await refresh();
  });

  // ---------- MANUAL SYNC ----------
  document.getElementById("pushBtn").addEventListener("click", async () => {
    try {
      const state = JSON.parse(localStorage.getItem("anhs_state") || "{}");
      const config = JSON.parse(localStorage.getItem("anhs_config") || "{}");
      await window.SB.saveCloud(state, config);
      showStatus("✓ Pushed local save to cloud.", "safe");
      await refresh();
    } catch (e) {
      showStatus("Push failed: " + e.message, "danger");
    }
  });

  document.getElementById("pullBtn").addEventListener("click", async () => {
    if (!confirm("Pull cloud save and OVERWRITE local progress? This cannot be undone.")) return;
    try {
      const save = await window.SB.loadSave();
      if (!save) return showStatus("No cloud save found.", "danger");
      localStorage.setItem("anhs_state", JSON.stringify(save.state));
      localStorage.setItem("anhs_config", JSON.stringify(save.config));
      showStatus("✓ Cloud save pulled. Reloading…", "safe");
      setTimeout(() => location.reload(), 800);
    } catch (e) {
      showStatus("Pull failed: " + e.message, "danger");
    }
  });

  // ---------- EXPORT ----------
  document.getElementById("exportBtn").addEventListener("click", () => {
    const state = JSON.parse(localStorage.getItem("anhs_state") || "{}");
    const config = JSON.parse(localStorage.getItem("anhs_config") || "{}");
    window.SB.exportSaveFile(state, config);
    showStatus("✓ Save file downloaded.", "safe");
  });

  // ---------- IMPORT ----------
  document.getElementById("importInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const parsed = await window.SB.importSaveFile(file);
      if (!confirm("Import this save? It will OVERWRITE your current local progress and config.")) return;
      localStorage.setItem("anhs_state", JSON.stringify(parsed.state));
      localStorage.setItem("anhs_config", JSON.stringify(parsed.config));
      showStatus("✓ Save imported. Reloading…", "safe");
      setTimeout(() => location.reload(), 800);
    } catch (err) {
      showStatus("Import failed: " + err.message, "danger");
    } finally {
      e.target.value = "";
    }
  });

  // ---------- SYNC ON SIGN-IN ----------
  async function maybeSyncOnSignIn() {
    const localState = localStorage.getItem("anhs_state");
    const localConfig = localStorage.getItem("anhs_config");
    const hasLocal = localState && JSON.parse(localState || "{}").quizzesTaken > 0;

    let cloudSave = null;
    try { cloudSave = await window.SB.loadSave(); } catch (e) { /* ignore */ }

    if (!cloudSave && hasLocal) {
      // No cloud save yet — upload local
      await window.SB.saveCloud(
        JSON.parse(localState),
        JSON.parse(localConfig || "{}")
      );
      showStatus("✓ Uploaded local progress to cloud.", "safe");
      return;
    }

    if (cloudSave && !hasLocal) {
      // Cloud has data, local is empty — pull
      localStorage.setItem("anhs_state", JSON.stringify(cloudSave.state));
      localStorage.setItem("anhs_config", JSON.stringify(cloudSave.config));
      showStatus("✓ Pulled cloud save. Reloading…", "safe");
      setTimeout(() => location.reload(), 800);
      return;
    }

    if (cloudSave && hasLocal) {
      // Both exist — ask user
      const choice = confirm(
        "You have BOTH a local save and a cloud save.\n\n" +
        "Click OK to use CLOUD save (overwrites local).\n" +
        "Click Cancel to keep LOCAL save (overwrites cloud on next save)."
      );
      if (choice) {
        localStorage.setItem("anhs_state", JSON.stringify(cloudSave.state));
        localStorage.setItem("anhs_config", JSON.stringify(cloudSave.config));
        showStatus("✓ Loaded cloud save. Reloading…", "safe");
        setTimeout(() => location.reload(), 800);
      } else {
        await window.SB.saveCloud(
          JSON.parse(localState),
          JSON.parse(localConfig || "{}")
        );
        showStatus("✓ Local save kept and uploaded.", "safe");
      }
    }
  }

  function showStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.style.color = type === "safe" ? "var(--safe)" : "var(--danger)";
  }

  // ---------- INIT ----------
  refresh();

  // Listen for auth changes
  window.SB.client.auth.onAuthStateChange(() => refresh());
})();
