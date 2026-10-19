import {
  getConfig,
  saveConfig,
  resetConfig,
  loadConfig,
  applyConfigToDOM,
  defaultConfig
} from './config.js';

export function initSettings({ onClose } = {}) {
  const labNameInput     = document.getElementById('labNameInput');
  const accentColorInput = document.getElementById('accentColorInput');
  const textColorInput   = document.getElementById('textColorInput');
  const resetTextBtn     = document.getElementById('resetTextColorBtn');
  const accentFontSelect = document.getElementById('accentFontSelect');
  const quoteInput       = document.getElementById('quoteInput');
  const applyBtn         = document.getElementById('applySettingsBtn');
  const resetBtn         = document.getElementById('resetSettingsBtn');
  const closeBtn         = document.getElementById('closeSettingsBtn');
  const themeToggle      = document.getElementById('themeToggle');
  const themeLabel       = document.getElementById('themeToggleLabel');

  function syncInputs(config) {
    if (labNameInput)     labNameInput.value = config.labName;
    if (accentColorInput) accentColorInput.value = config.accentColor;
    if (accentFontSelect) accentFontSelect.value = config.accentFont;
    if (quoteInput)       quoteInput.value = config.quote;
    if (themeLabel)       themeLabel.textContent = config.theme === 'dark' ? 'Dark' : 'Light';

    // Text input: show the theme-resolved color if sentinel
    if (textColorInput) {
      const isSentinel = !config.textColor || config.textColor.toLowerCase() === '#ffffff';
      const theme = config.theme || 'light';
      textColorInput.value = isSentinel
        ? (theme === 'dark' ? '#ffffff' : '#000000')
        : config.textColor;
    }
  }

  syncInputs(loadConfig());

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const cfg = getConfig();
      const next = cfg.theme === 'dark' ? 'light' : 'dark';
      saveConfig({ theme: next });
      applyConfigToDOM(getConfig());
      if (themeLabel) themeLabel.textContent = next === 'dark' ? 'Dark' : 'Light';
      syncInputs(getConfig()); // refresh color pickers for new theme-resolved sentinels
    });
  }

  // "Auto" — reset text color to theme default
  if (resetTextBtn) {
    resetTextBtn.addEventListener('click', () => {
      saveConfig({ textColor: '#ffffff' });
      applyConfigToDOM(getConfig());
      syncInputs(getConfig());
    });
  }

  applyBtn.addEventListener('click', () => {
    const cfg = getConfig();
    // Detect "user didn't change the color picker" → keep sentinel
    const isTextSameAsResolved = (() => {
      const resolved = (cfg.theme === 'dark') ? '#ffffff' : '#000000';
      return textColorInput.value.toLowerCase() === resolved;
    })();

    const next = {
      labName: (labNameInput.value.trim() || 'LAB'),
      accentColor: accentColorInput.value,
      textColor: isTextSameAsResolved ? '#ffffff' : textColorInput.value,
      accentFont: accentFontSelect.value,
      quote: (quoteInput.value.trim() || defaultConfig.quote),
      theme: cfg.theme
    };
    saveConfig(next);
    applyConfigToDOM(getConfig());
    syncInputs(getConfig());
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
