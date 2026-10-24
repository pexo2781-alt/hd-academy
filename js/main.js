import { loadConfig, applyConfigToDOM, onConfigChange } from './config.js';
import { initBackground } from './background.js';
import { initAuth, resetAuthForm } from './auth.js';
import { initSettings } from './settings.js';
import { initDomain, showDomainView } from './domain.js';
import { initNumberMemory } from './number-memory.js';
import { initSequenceMemory } from './sequence-memory.js';

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
  console.log('[lab] switching view to:', name);
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

  try {
    await waitFor(() => !!window.SB);
    console.log('[lab] Supabase client found.');
  } catch (e) {
    console.error('[lab] window.SB never became available. Check your network tab.');
  }

  initAuth({
    onSuccess: (session) => {
      console.log('[lab] authenticated as', session?.user?.email);
      closeSettings();
      showView('lab');
      showDomainView();
    }
  });

  // --- START BUTTON ---
  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.addEventListener('click', async () => {
      console.log('[lab] Begin clicked.');
      
      // Safety timeout in case Supabase hangs
      let session = null;
      try {
        if (window.SB) {
          const sessionPromise = window.SB.getSession();
          // Race the network call against a 1-second timeout
          session = await Promise.race([
            sessionPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000))
          ]);
        }
      } catch (e) {
        console.warn('[lab] getSession failed or timed out:', e);
      }
      
      // If we got a session, go to lab. If not, go to auth.
      if (session) { 
        showView('lab'); 
        showDomainView();
      } else {
        showView('auth');
      }
    });
  } else {
    console.error('[lab] Could not find #startBtn in the DOM.');
  }

  // --- AUTH BACK BUTTON ---
  const authBackBtn = document.getElementById('authBackBtn');
  if (authBackBtn) {
    authBackBtn.addEventListener('click', () => {
      resetAuthForm();
      showView('landing');
    });
  }

  // --- SETTINGS ---
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

  // --- SIGN OUT ---
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      try { if (window.SB) await window.SB.signOut(); }
      catch (e) { console.warn('[lab] sign out failed:', e); }
      closeSettings();
      showView('landing');
    });
  }

  showView('landing');
  console.log('[lab] booted · v0.36');
}

document.addEventListener('DOMContentLoaded', boot);
