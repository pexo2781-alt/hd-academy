import { loadConfig, applyConfigToDOM, onConfigChange } from './config.js';
import { initBackground } from './background.js';
import { initAuth, resetAuthForm } from './auth.js';
import { initSettings } from './settings.js';
import { initDomain, showDomainView } from './domain.js';
import { initNumberMemory } from './number-memory.js';
import { initSequenceMemory } from './sequence-memory.js';
import { initVisualMemory } from './visual-memory.js';

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
    if (el) el.classList.toggle('is-active', key === name);
  });
}

function openSettings()  { if (settingsOverlay) settingsOverlay.classList.add('is-open'); }
function closeSettings() { if (settingsOverlay) settingsOverlay.classList.remove('is-open'); }

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
  initNumberMemory();
  initSequenceMemory();
  initVisualMemory();

  try {
    await waitFor(() => !!window.SB);
  } catch (e) {
    console.warn('[lab] window.SB not available yet.');
  }

  initAuth({
    onSuccess: (session) => {
      console.log('[lab] authenticated as', session?.user?.email);
      closeSettings();
      showView('lab');
      showDomainView();
    }
  });

  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.addEventListener('click', async () => {
      const originalText = startBtn.textContent;
      startBtn.textContent = 'Checking...';
      startBtn.disabled = true;

      let session = null;
      let connectionFailed = false;

      try {
        if (window.SB) {
          const sessionPromise = window.SB.getSession();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 3000)
          );
          session = await Promise.race([sessionPromise, timeoutPromise]);
        }
      } catch (e) {
        console.warn('[lab] Session check failed or timed out:', e);
        connectionFailed = true;
      }

      if (connectionFailed) {
        startBtn.textContent = 'Server Unavailable';
        startBtn.style.color = '#ff5555';
        startBtn.style.borderColor = '#ff5555';
        
        setTimeout(() => {
          startBtn.textContent = originalText;
          startBtn.style.color = '';
          startBtn.style.borderColor = '';
          startBtn.disabled = false;
          showView('auth');
        }, 1000);
        return;
      }

      startBtn.textContent = originalText;
      startBtn.disabled = false;

      if (session) { 
        showView('lab'); 
        showDomainView();
      } else {
        showView('auth');
      }
    });
  }

  const authBackBtn = document.getElementById('authBackBtn');
  if (authBackBtn) {
    authBackBtn.addEventListener('click', () => {
      resetAuthForm();
      showView('landing');
    });
  }

  if (openSettingsBtn) openSettingsBtn.addEventListener('click', openSettings);
  if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettings);
  if (settingsOverlay) {
    settingsOverlay.addEventListener('click', (e) => {
      if (e.target === settingsOverlay) closeSettings();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsOverlay && settingsOverlay.classList.contains('is-open')) {
      closeSettings();
    }
  });

  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      try { if (window.SB) await window.SB.signOut(); }
      catch (e) { console.warn('[lab] sign out failed:', e); }
      closeSettings();
      showView('landing');
    });
  }

  showView('landing');
  console.log('[lab] booted · v0.37');
}

document.addEventListener('DOMContentLoaded', boot);
