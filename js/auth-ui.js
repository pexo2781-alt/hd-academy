// ============================================
// auth-ui.js — V5.1: tabbed sign-in/sign-up + polished UI
// ============================================

(function () {
  const statusEl       = document.getElementById("authStatus");
  const signedOutEl    = document.getElementById("signedOutView");
  const signedInEl     = document.getElementById("signedInView");
  const signInForm     = document.getElementById("signInForm");
  const signUpForm     = document.getElementById("signUpForm");
  const signInBtn      = document.getElementById("signInBtn");
  const signUpBtn      = document.getElementById("signUpBtn");
  const signOutBtn     = document.getElementById("signOutBtn");
  const pushBtn        = document.getElementById("pushBtn");
  const pullBtn        = document.getElementById("pullBtn");
  const exportBtn      = document.getElementById("exportBtn");
  const importInput    = document.getElementById("importInput");

  // ---------- TABS ----------
  document.querySelectorAll(".auth-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".auth-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const mode = tab.dataset.mode;
      if (mode === "signin") {
        signInForm.style.display = "";
        signUpForm.style.display = "none";
      } else {
        signInForm.style.display = "none";
        signUpForm.style.display = "";
      }
      hideStatus();
    });
  });

  // ---------- HELPERS ----------
  function showStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = "auth-status show " + (type === "safe" ? "safe" : "danger");
  }
  function hideStatus() {
    statusEl.className = "auth-status";
    statusEl.textContent = "";
  }
  function setBtnLoading(btn, loading, label) {
    if (loading) {
      btn.disabled = true;
      btn.dataset.original = btn.textContent;
      btn.textContent = label || "Please wait…";
    } else {
      btn.disabled = false;
      if (btn.dataset.original) btn.textContent = btn.dataset.original;
    }
  }

  // ---------- REFRESH UI ----------
  async function refresh() {
    const user = await window.SB.getUser();
    if (user) {
      signedOutEl.style.display = "none";
      signedInEl.style.display = "";
      document.getElementById("userEmail").textContent = user.email;
      document.getElementById("userInitial").textContent = user.email[0].toUpperCase();

      try {
        const save = await window.SB.loadSave();
        document.getElementById("saveStatus").textContent = save
          ? `Last cloud save: ${new Date(save.updated_at).toLocaleString()}`
          : "No cloud save yet — your progress will upload after your next save.";
      } catch (e) {
        document.getElementById("saveStatus").textContent = "Could not load cloud save info.";
      }
    } else {
      signedOutEl.style.display = "";
      signedInEl.style.display = "none";
    }
  }

  // ---------- SIGN IN ----------
  signInBtn.addEventListener("click", async () => {
    const email = document.getElementById("signInEmail").value.trim();
    const password = document.getElementById("signInPassword").value;
    if (!email || !password) return showStatus("Email and password required.", "danger");
    setBtnLoading(signInBtn, true, "Signing in…");
    try {
      await window.SB.signIn(email, password);
      showStatus("✓ Signed in.", "safe");
      await refresh();
      await maybeSyncOnSignIn();
    } catch (e) {
      showStatus("Sign-in failed: " + e.message, "danger");
    } finally {
      setBtnLoading(signInBtn, false);
    }
  });

  // ---------- SIGN UP ----------
  signUpBtn.addEventListener("click", async () => {
    const email = document.getElementById("signUpEmail").value.trim();
    const password = document.getElementById("signUpPassword").value;
    if (!email || !password) return showStatus("Email and password required.", "danger");
    if (password.length < 6) return showStatus("Password must be at least 6 characters.", "danger");
    setBtnLoading(signUpBtn, true, "Creating…");
    try {
      await window.SB.signUp(email, password);
      showStatus("✓ Account created. Check your email to confirm, then sign in.", "safe");
    } catch (e) {
      showStatus("Sign-up failed: " + e.message, "danger");
    } finally {
      setBtnLoading(signUpBtn, false);
    }
  });

  // ---------- SIGN OUT ----------
  signOutBtn.addEventListener("click", async () => {
    if (!confirm("Sign out? Your local progress stays on this device.")) return;
    await window.SB.signOut();
    showStatus("Signed out.", "safe");
    await refresh();
  });

  // ---------- PUSH ----------
  pushBtn.addEventListener("click", async () => {
    setBtnLoading(pushBtn, true, "Pushing…");
    try {
      const state = JSON.parse(localStorage.getItem("anhs_state") || "{}");
      const config = JSON.parse(localStorage.getItem("anhs_config") || "{}");
      await window.SB.saveCloud(state, config);
      showStatus("✓ Local progress pushed to cloud.", "safe");
      await refresh();
    } catch (e) {
      showStatus("Push failed: " + e.message, "danger");
    } finally {
      setBtnLoading(pushBtn, false);
    }
  });

  // ---------- PULL ----------
  pullBtn.addEventListener("click", async () => {
    if (!confirm("Pull cloud save and OVERWRITE local progress? This cannot be undone.")) return;
    setBtnLoading(pullBtn, true, "Pulling…");
    try {
      const save = await window.SB.loadSave();
      if (!save) {
        showStatus("No cloud save found.", "danger");
        return;
      }
      localStorage.setItem("anhs_state", JSON.stringify(save.state));
      localStorage.setItem("anhs_config", JSON.stringify(save.config));
      showStatus("✓ Cloud save pulled. Reloading…", "safe");
      setTimeout(() => location.reload(), 800);
    } catch (e) {
      showStatus("Pull failed: " + e.message, "danger");
    } finally {
      setBtnLoading(pullBtn, false);
    }
  });

  // ---------- EXPORT ----------
  exportBtn.addEventListener("click", () => {
    const state = JSON.parse(localStorage.getItem("anhs_state") || "{}");
    const config = JSON.parse(localStorage.getItem("anhs_config") || "{}");
    window.SB.exportSaveFile(state, config);
    showStatus("✓ Save file downloaded.", "safe");
  });

  // ---------- IMPORT ----------
  importInput.addEventListener("change", async (e) => {
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
    const hasLocal = localState && (JSON.parse(localState || "{}").quizzesTaken > 0);

    let cloudSave = null;
    try { cloudSave = await window.SB.loadSave(); } catch (e) { /* ignore */ }

    if (!cloudSave && hasLocal) {
      await window.SB.saveCloud(JSON.parse(localState), JSON.parse(localConfig || "{}"));
      showStatus("✓ Local progress uploaded to cloud.", "safe");
      return;
    }
    if (cloudSave && !hasLocal) {
      localStorage.setItem("anhs_state", JSON.stringify(cloudSave.state));
      localStorage.setItem("anhs_config", JSON.stringify(cloudSave.config));
      showStatus("✓ Cloud save pulled. Reloading…", "safe");
      setTimeout(() => location.reload(), 800);
      return;
    }
    if (cloudSave && hasLocal) {
      const choice = confirm(
        "You have BOTH a local save and a cloud save.\n\n" +
        "OK = use CLOUD save (overwrites local)\n" +
        "Cancel = keep LOCAL save (overwrites cloud)"
      );
      if (choice) {
        localStorage.setItem("anhs_state", JSON.stringify(cloudSave.state));
        localStorage.setItem("anhs_config", JSON.stringify(cloudSave.config));
        showStatus("✓ Cloud save loaded. Reloading…", "safe");
        setTimeout(() => location.reload(), 800);
      } else {
        await window.SB.saveCloud(JSON.parse(localState), JSON.parse(localConfig || "{}"));
        showStatus("✓ Local save kept and uploaded.", "safe");
      }
    }
  }

  // ---------- INIT ----------
  refresh();
  window.SB.client.auth.onAuthStateChange(() => refresh());
})();
