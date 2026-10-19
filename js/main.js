import { loadConfig, applyConfigToDOM, onConfigChange } from './config.js';
import { initBackground } from './background.js';
import { initAuth, resetAuthForm } from './auth.js';
import { initSettings } from './settings.js';

const views = {
  landing: document.getElementById('view-landing'),
  auth: document.getElementById('view-auth'),
  settings: document.getElementById('view-settings')
};

function showView(name) {
  Object.entries(views).forEach(([key, el]) => {
    el.classList.toggle('is-active', key === name);
  });
}

async function boot() {
  // Wait until the classic script has installed window.SB
  if (!window.SB) {
    console.error('[lab] window.SB not available — check supabase-client.js load order.');
    return;
  }

  // ----- 1. Load and apply saved config -----
  const config = loadConfig();
  applyConfigToDOM(config);
  onConfigChange(applyConfigToDOM);

  // ----- 2. Init background (hook for future parallax) -----
  initBackground();

  // ----- 3. Init settings module -----
  initSettings({
    onClose: () => showView('landing')
  });

  // ----- 4. Init auth module -----
  initAuth({
    onSuccess: async (session) => {
      // Future phase: mount the lab training UI here.
      // For v0.2 we route to settings so the flow is demonstrable.
      console.log('[lab] authenticated as', session.user?.email);
      showView('settings');
    }
  });

  // ----- 5. Wire landing button (session-aware) -----
  const startBtn = document.getElementById('startBtn');
  startBtn.addEventListener('click', async () => {
    try {
      const session = await window.SB.getSession();
      if (session) {
        showView('settings'); // future: showView('lab')
        return;
      }
    } catch (e) { /* fall through to auth */ }
    showView('auth');
  });

  // ----- 6. Wire auth back button -----
  const authBackBtn = document.getElementById('authBackBtn');
  authBackBtn.addEventListener('click', () => {
    resetAuthForm();
    showView('landing');
  });

  // ----- 7. Initial view -----
  showView('landing');
}

document.addEventListener('DOMContentLoaded', boot);
