import { loadConfig, applyConfigToDOM, onConfigChange } from './config.js';
import { initBackground } from './background.js';
import { initAuth, resetAuthForm } from './auth.js';
import { initSettings } from './settings.js';
import { initDomain } from './domain.js';
import { initNumberMemory } from './number-memory.js';

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
  const cfg = loadConfig();
  cfg.theme = 'light';
  applyConfigToDOM(cfg);
  onConfigChange(applyConfigToDOM);

  initBackground();
  initSettings({ onClose: () => closeSettings() });
  initDomain();

  initNumberMemory({
    onExit: () => {
      // domain.js handles showing the drills grid
      const evt = new CustomEvent('nm:exit');
      window.dispatchEvent(evt);
    }
  });

  try {
    await waitFor(() => !!window.SB);
  } catch (e) {
    console.error('[lab] window.SB never became available.');
  }

  initAuth({
    onSuccess: (session) => {
      console.log('[lab] authenticated as', session?.user?.email);
      closeSettings();
      showView('lab');
    }
  });

  document.getElementById('startBtn').addEventListener('click', async () => {
    try {
      const session = window.SB ? await window.SB.getSession() : null;
      if (session) { showView('lab'); return; }
    } catch (e) { /* fall through */ }
    showView('auth');
  });

  document.getElementById('authBackBtn').addEventListener('click', () => {
    resetAuthForm();
    showView('landing');
  });

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

  signOutBtn.addEventListener('click', async () => {
    try { if (window.SB) await window.SB.signOut(); }
    catch (e) { console.warn('[lab] sign out failed:', e); }
    closeSettings();
    showView('landing');
  });

  showView('landing');
  console.log('[lab] booted · v0.34');
}

document.addEventListener('DOMContentLoaded', boot);
