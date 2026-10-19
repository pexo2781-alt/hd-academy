import { loadConfig, applyConfigToDOM, onConfigChange } from './config.js';
import { initBackground } from './background.js';
import { initAuth, resetAuthForm } from './auth.js';
import { initSettings } from './settings.js';

const views = {
  landing: document.getElementById('view-landing'),
  auth: document.getElementById('view-auth'),
  lab: document.getElementById('view-lab')
};

const settingsOverlay = document.getElementById('settingsOverlay');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const signOutBtn = document.getElementById('signOutBtn');

function showView(name) {
  Object.entries(views).forEach(([key, el]) => {
    el.classList.toggle('is-active', key === name);
  });
}

function openSettings() {
  settingsOverlay.classList.add('is-open');
}

function closeSettings() {
  settingsOverlay.classList.remove('is-open');
}

/** Wait until a predicate is true, polling up to `timeout` ms. */
function waitFor(predicate, timeout = 5000, interval = 50) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (predicate()) return resolve();
      if (Date.now() - start > timeout) return reject(new Error('Timeout waiting for condition'));
      setTimeout(tick, interval);
    };
    tick();
  });
}

async function boot() {
  // ----- 1. Load and apply saved config -----
  const config = loadConfig();
   // ----- 1. Load and apply saved config -----
  const config = loadConfig();
  // Per spec: always start each page-load session in light mode,
  // regardless of what was stored. Stored theme is preserved for next session
  // but not auto-applied here — the user can toggle it live in Settings.
  config.theme = 'light';
  applyConfigToDOM(config);
  onConfigChange(applyConfigToDOM);

  // ----- 2. Background hook -----
  initBackground();

  // ----- 3. Settings module (overlay) -----
  initSettings({
    onClose: () => closeSettings()
  });

  // ----- 4. Wait for Supabase client to be ready -----
  try {
    await waitFor(() => !!window.SB);
  } catch (e) {
    console.error('[lab] window.SB never became available. Check that supabase-client.js loaded after the Supabase CDN script.');
    // Fail gracefully — the UI still works, just without auth.
  }

  // ----- 5. Init auth module -----
  initAuth({
    onSuccess: (session) => {
      console.log('[lab] authenticated as', session?.user?.email);
      closeSettings();
      showView('lab');
    }
  });

  // ----- 6. Landing → auth (or straight to lab if already signed in) -----
  document.getElementById('startBtn').addEventListener('click', async () => {
    try {
      const session = window.SB ? await window.SB.getSession() : null;
      if (session) {
        showView('lab');
        return;
      }
    } catch (e) { /* fall through to auth */ }
    showView('auth');
  });

  // ----- 7. Auth back button -----
  document.getElementById('authBackBtn').addEventListener('click', () => {
    resetAuthForm();
    showView('landing');
  });

  // ----- 8. Settings overlay controls -----
  openSettingsBtn.addEventListener('click', openSettings);
  closeSettingsBtn.addEventListener('click', closeSettings);
  settingsOverlay.addEventListener('click', (e) => {
    if (e.target === settingsOverlay) closeSettings();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsOverlay.classList.contains('is-open')) {
      closeSettings();
    }
  });

  // ----- 9. Sign out -----
  signOutBtn.addEventListener('click', async () => {
    try {
      if (window.SB) await window.SB.signOut();
    } catch (e) {
      console.warn('[lab] sign out failed:', e);
    }
    closeSettings();
    showView('landing');
  });

  // ----- 10. Initial view -----
  showView('landing');
}

document.addEventListener('DOMContentLoaded', boot);
