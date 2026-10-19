import { loadConfig, applyConfigToDOM, onConfigChange, getConfig } from './config.js';
import { initBackground } from './background.js';
import { initAuth, resetAuthForm } from './auth.js';
import { initSettings } from './settings.js';
import { supabase } from './supabase-client.js';

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
      // Placeholder for next phase: once signed in,
      // this is where the lab (training UI) will mount.
      // For now we just route to settings so the v0.2 flow is demonstrable.
      console.log('[lab] authenticated as', session.user?.email);
      showView('settings');
    }
  });

  // ----- 5. Wire landing button -----
  const startBtn = document.getElementById('startBtn');
  startBtn.addEventListener('click', async () => {
    // If we already have a session, skip straight to the lab.
    const { data } = await supabase.auth.getSession();
    if (data?.session) {
      showView('settings'); // future: showView('lab')
      return;
    }
    showView('auth');
  });

  // ----- 6. Wire auth back button -----
  const authBackBtn = document.getElementById('authBackBtn');
  authBackBtn.addEventListener('click', () => {
    resetAuthForm();
    showView('landing');
  });

  // ----- 7. Deep link handling: if returning from email confirmation -----
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session && views.auth.classList.contains('is-active')) {
      showView('settings'); // future: showView('lab')
    }
  });

  // ----- 8. Initial view -----
  showView('landing');
}

document.addEventListener('DOMContentLoaded', boot);
