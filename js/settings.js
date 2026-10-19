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

  function syncInputs(config) {
    if (labNameInput) labNameInput.value = config.labName;
    if (accentColorInput) accentColorInput.value = config.accentColor;
    if (accentFontSelect) accentFontSelect.value = config.accentFont;
    if (quoteInput) quoteInput.value = config.quote;
  }

  // Populate from stored config
  syncInputs(loadConfig());

  applyBtn.addEventListener('click', () => {
    const next = {
      labName: (labNameInput.value.trim() || 'LAB'),
      accentColor: accentColorInput.value,
      accentFont: accentFontSelect.value,
      quote: (quoteInput.value.trim() || defaultConfig.quote)
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
