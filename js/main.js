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

  // --- SMART START BUTTON ---
  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.addEventListener('click', async () => {
      // Visually change button to indicate loading
      const originalText = startBtn.textContent;
      startBtn.textContent = 'Checking...';
      startBtn.disabled = true;

      let session = null;
      try {
        if (window.SB) {
          // Race the Supabase check against a 2.5 second timeout
          const sessionPromise = window.SB.getSession();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 2500)
          );
          session = await Promise.race([sessionPromise, timeoutPromise]);
        }
      } catch (e) {
        console.warn('[lab] Session check timed out or failed. Assuming no session.');
      } finally {
        // Reset button state
        startBtn.textContent = originalText;
        startBtn.disabled = false;
      }

      // Route based on result
      if (session) { 
        console.log('[lab] Valid session found, skipping login.');
        showView('lab'); 
        showDomainView();
      } else {
        console.log('[lab] No valid session, showing login.');
        showView('auth');
      }
    });
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
