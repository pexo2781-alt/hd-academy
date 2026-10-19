const STORAGE_KEY = 'lab_config_v3';

export const defaultConfig = {
  labName: 'SUBJECT 001',
  accentColor: '#ffffff',
  accentFont: "'Inter', system-ui, sans-serif",
  quote: '“The self is the only laboratory that matters.”',
  theme: 'light'
};

let currentConfig = { ...defaultConfig };
const listeners = new Set();

export function getConfig() { return { ...currentConfig }; }

export function loadConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) currentConfig = { ...defaultConfig, ...JSON.parse(stored) };
  } catch (e) { currentConfig = { ...defaultConfig }; }
  return getConfig();
}

export function saveConfig(patch) {
  currentConfig = { ...currentConfig, ...patch };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(currentConfig)); } catch (e) {}
  listeners.forEach(fn => fn(getConfig()));
  return getConfig();
}

export function resetConfig() {
  currentConfig = { ...defaultConfig };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(currentConfig)); } catch (e) {}
  listeners.forEach(fn => fn(getConfig()));
  return getConfig();
}

export function onConfigChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ---------- Helpers ----------

export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function accentLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 1;
  return (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
}

/** True when the stored accent is the default sentinel — theme will resolve it. */
export function isAccentDefault(hex) {
  const n = (hex || '').toLowerCase();
  return n === '#ffffff' || n === '';
}

/**
 * Applies accent to the document.
 *
 * If accent is default (#ffffff sentinel) → we DON'T write --accent directly.
 * Instead we tag data-accent-default="1" and let CSS resolve --accent from theme
 * (black in light, white in dark).
 *
 * If accent is custom → we write it inline and tag data-accent-default="0",
 * plus data-accent="light"|"dark" for contrast helpers (--on-accent).
 */
export function applyAccent(color) {
  const root = document.documentElement;

  if (isAccentDefault(color)) {
    root.setAttribute('data-accent-default', '1');
    root.removeAttribute('data-accent');
    // Clear any inline overrides — let CSS drive it.
    root.style.removeProperty('--accent');
    root.style.removeProperty('--accent-rgb');
    root.style.removeProperty('--accent-muted');
    root.style.removeProperty('--accent-dim');
    root.style.removeProperty('--accent-faint');
    root.style.removeProperty('--accent-glow');
    return;
  }

  root.setAttribute('data-accent-default', '0');

  const rgb = hexToRgb(color);
  if (!rgb) return;

  root.style.setProperty('--accent', color);
  root.style.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  root.style.setProperty('--accent-muted', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`);
  root.style.setProperty('--accent-dim', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
  root.style.setProperty('--accent-faint', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.04)`);
  root.style.setProperty('--accent-glow', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`);

  const lum = accentLuminance(color);
  root.setAttribute('data-accent', lum > 0.55 ? 'light' : 'dark');
}

export function applyAccentFont(fontFamily) {
  document.documentElement.style.setProperty('--font-accent', fontFamily);
}

export function applyTheme(theme) {
  const t = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', t);
}

export function applyConfigToDOM(config) {
  // Order matters: theme first so accent-default resolution sees the right theme.
  applyTheme(config.theme);
  applyAccent(config.accentColor);
  applyAccentFont(config.accentFont);

  const titleEl = document.getElementById('labTitle');
  if (titleEl) titleEl.textContent = config.labName.toUpperCase();

  const quoteEl = document.getElementById('labQuote');
  if (quoteEl) quoteEl.textContent = config.quote;

  const footerEl = document.getElementById('labFooter');
  if (footerEl) footerEl.textContent = `LAB · ${config.labName.toUpperCase()} · v0.31`;
}
