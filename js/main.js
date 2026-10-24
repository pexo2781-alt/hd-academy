import { loadConfig, applyConfigToDOM, onConfigChange } from './config.js';
import { initBackground } from './background.js';
import { initAuth, resetAuthForm } from './auth.js';
import { initSettings } from './settings.js';
import { initDomain } from './domain.js';

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

function openSettings()  { settingsOverlay.classList.add('is-open'); }
function closeSettings() { settingsOverlay.classList.remove('is-open'); }

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
  // ----- 1. Load saved config, force light for this session -----
  const cfg = loadConfig();
  cfg.theme = 'light';
  applyConfigToDOM(cfg);
  onConfigChange(applyConfigToDOM);

  // ----- 2. Background hook -----
  initBackground();

  // ----- 3. Settings module -----
  initSettings({ onClose: () => closeSettings() });

  // ----- 4. Domain module -----
  initDomain();

  // ----- 5. Wait for Supabase client -----
  try {
    await waitFor(() => !!window.SB);
  } catch (e) {
    console.error('[lab] window.SB never became available.');
  }

  // ----- 6. Auth module -----
  initAuth({
    onSuccess: (session) => {
      console.log('[lab] authenticated as', session?.user?.email);
      closeSettings();
      showView('lab');
    }
  });

  // ----- 7. Landing → auth (or straight to lab if signed in) -----
  document.getElementById('startBtn').addEventListener('click', async () => {
    try {
      const session = window.SB ? await window.SB.getSession() : null;
      if (session) { showView('lab'); return; }
    } catch (e) { /* fall through */ }
    showView('auth');
  });

  // ----- 8. Auth back -----
  document.getElementById('authBackBtn').addEventListener('click', () => {
    resetAuthForm();
    showView('landing');
  });

  // ----- 9. Settings overlay controls -----
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

  // ----- 10. Sign out -----
  signOutBtn.addEventListener('click', async () => {
    try { if (window.SB) await window.SB.signOut(); }
    catch (e) { console.warn('[lab] sign out failed:', e); }
    closeSettings();
    showView('landing');
  });

  // ----- 11. Initial view -----
  showView('landing');
  console.log('[lab] booted · v0.33');
}

document.addEventListener('DOMContentLoaded', boot);
