import {
  getConfig,
  saveConfig,
  resetConfig,
  loadConfig,
  applyConfigToDOM,
  defaultConfig
} from './config.js';

export function initSettings({ onClose } = {}) {
  const labNameInput = document.getElementById('labNameInput');
  const accentColorInput = document.getElementById('accentColorInput');
  const accentFontSelect = document.getElementById('accentFontSelect');
  const quoteInput = document.getElementById('quoteInput');
  const applyBtn = document.getElementById('applySettingsBtn');
  const resetBtn = document.getElementById('resetSettingsBtn');
  const closeBtn = document.getElementById('closeSettingsBtn');
  const themeToggle = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeToggleLabel');

  function syncInputs(config) {
    if (labNameInput) labNameInput.value = config.labName;
    if (accentColorInput) accentColorInput.value = config.accentColor;
    if (accentFontSelect) accentFontSelect.value = config.accentFont;
    if (quoteInput) quoteInput.value = config.quote;
    if (themeLabel) themeLabel.textContent = config.theme === 'dark' ? 'Dark' : 'Light';
  }

  // Populate from stored config
  syncInputs(loadConfig());

  // Live theme toggle — applies immediately, no need to press Apply.
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const cfg = getConfig();
      const next = cfg.theme === 'dark' ? 'light' : 'dark';
      saveConfig({ theme: next });
      applyConfigToDOM(getConfig());
      if (themeLabel) themeLabel.textContent = next === 'dark' ? 'Dark' : 'Light';
    });
  }

  applyBtn.addEventListener('click', () => {
    const cfg = getConfig();
    const next = {
      labName: (labNameInput.value.trim() || 'LAB'),
      accentColor: accentColorInput.value,
      accentFont: accentFontSelect.value,
      quote: (quoteInput.value.trim() || defaultConfig.quote),
      theme: cfg.theme // preserve whatever the toggle currently set
    };
    saveConfig(next);
    applyConfigToDOM(getConfig());
    if (typeof onClose === 'function') onClose();
  });

  resetBtn.addEventListener('click', () => {
    const next = resetConfig();
    syncInputs(next);
    applyConfigToDOM(next);
  });

  closeBtn.addEventListener('click', () => {
    if (typeof onClose === 'function') onClose();
  });
}
