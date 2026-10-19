import { supabase } from './supabase-client.js';

/**
 * auth.js — handles all login/signup UI and Supabase auth flow.
 *
 * Expects supabase-client.js to export a configured `supabase` client.
 * Adjust the import path / export name if your existing file differs.
 */

let currentMode = 'login'; // 'login' | 'signup'

const els = {};

export function initAuth({ onSuccess } = {}) {
  Object.assign(els, {
    view: document.getElementById('view-auth'),
    form: document.getElementById('authForm'),
    email: document.getElementById('authEmail'),
    password: document.getElementById('authPassword'),
    passwordConfirm: document.getElementById('authPasswordConfirm'),
    confirmField: document.getElementById('confirmField'),
    message: document.getElementById('authMessage'),
    submitBtn: document.getElementById('authSubmitBtn'),
    submitLabel: els.submitLabel || document.querySelector('.auth-submit-label'),
    title: document.getElementById('authTitle'),
    footerText: document.getElementById('authFooterText'),
    backBtn: document.getElementById('authBackBtn'),
    tabs: Array.from(document.querySelectorAll('.auth-tab')),
    indicator: document.getElementById('authTabIndicator')
  });

  els._onSuccess = onSuccess;

  els.tabs.forEach(tab => {
    tab.addEventListener('click', () => setMode(tab.dataset.mode));
  });

  els.form.addEventListener('submit', handleSubmit);

  // Keep footer status in sync with inputs
  [els.email, els.password, els.passwordConfirm].forEach(input => {
    input.addEventListener('input', updateFooterStatus);
  });

  setMode('login');
  initPasswordToggle();
}

function initPasswordToggle() {
  // Nothing fancy — the brutalist aesthetic favors visibility over hidden state.
}

function setMode(mode) {
  if (mode === currentMode) return;
  currentMode = mode;

  els.tabs.forEach(t => t.classList.toggle('is-active', t.dataset.mode === mode));

  // Move indicator
  if (els.indicator) {
    els.indicator.style.transform = mode === 'signup' ? 'translateX(100%)' : 'translateX(0)';
  }

  // Toggle confirm field
  if (els.confirmField) {
    els.confirmField.hidden = mode !== 'signup';
    els.passwordConfirm.required = mode === 'signup';
  }

  // Update labels
  if (els.title) els.title.textContent = mode === 'signup' ? 'Create account' : 'Sign in';
  if (els.submitLabel) {
    els.submitLabel.textContent = mode === 'signup' ? 'Create operator' : 'Authenticate';
  }

  clearMessage();
  updateFooterStatus();
}

function updateFooterStatus() {
  if (!els.footerText) return;
  const hasEmail = els.email.value.trim().length > 0;
  const hasPass = els.password.value.length > 0;

  if (!hasEmail && !hasPass) {
    els.footerText.textContent = 'STATUS // AWAITING CREDENTIALS';
  } else if (hasEmail && !hasPass) {
    els.footerText.textContent = 'STATUS // PASSWORD REQUIRED';
  } else if (!hasEmail && hasPass) {
    els.footerText.textContent = 'STATUS // EMAIL REQUIRED';
  } else {
    els.footerText.textContent = currentMode === 'signup'
      ? 'STATUS // READY TO REGISTER'
      : 'STATUS // READY TO AUTHENTICATE';
  }
}

function clearMessage() {
  if (!els.message) return;
  els.message.textContent = '';
  els.message.classList.remove('is-error', 'is-success');
}

function showMessage(text, type = 'error') {
  if (!els.message) return;
  els.message.textContent = text;
  els.message.classList.remove('is-error', 'is-success');
  els.message.classList.add(type === 'error' ? 'is-error' : 'is-success');
}

function setLoading(loading) {
  if (!els.submitBtn) return;
  els.submitBtn.disabled = loading;
  els.submitBtn.classList.toggle('is-loading', loading);
}

async function handleSubmit(e) {
  e.preventDefault();
  clearMessage();

  const email = els.email.value.trim();
  const password = els.password.value;

  if (!email || !password) {
    showMessage('Email and password are required.');
    return;
  }

  if (currentMode === 'signup') {
    const confirm = els.passwordConfirm.value;
    if (password !== confirm) {
      showMessage('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      showMessage('Password must be at least 6 characters.');
      return;
    }
  }

  setLoading(true);

  try {
    if (currentMode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showMessage('Access granted. Initializing lab…', 'success');
      await handleAuthSuccess(data.session);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.session) {
        showMessage('Operator registered. Entering lab…', 'success');
        await handleAuthSuccess(data.session);
      } else {
        // Email confirmation required by Supabase project settings
        showMessage('Check your email to confirm your account.', 'success');
        setLoading(false);
      }
    }
  } catch (err) {
    const msg = err?.message || 'Authentication failed. Try again.';
    showMessage(msg.charAt(0).toUpperCase() + msg.slice(1));
    setLoading(false);
  }
}

async function handleAuthSuccess(session) {
  if (!session) {
    setLoading(false);
    return;
  }

  // Small delay so the success message is readable — feels like a boot sequence
  await new Promise(r => setTimeout(r, 600));

  if (typeof els._onSuccess === 'function') {
    els._onSuccess(session);
  }
  setLoading(false);
}

/** Reset the form fields (call when leaving the auth view). */
export function resetAuthForm() {
  els.form?.reset();
  clearMessage();
  updateFooterStatus();
}
