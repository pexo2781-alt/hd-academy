const STORAGE_KEY = 'lab_config_v3';

export const defaultConfig = {
  labName: 'SUBJECT 001',
  accentColor: '#ffffff',
  accentFont: "'Inter', system-ui, sans-serif",
  quote: '“The self is the only laboratory that matters.”',
  theme: 'light'   // 'light' | 'dark'  — defaults to light per spec
};

let currentConfig = { ...defaultConfig };
const listeners = new Set();

export function getConfig() {
  return { ...currentConfig };
}

export function loadConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      currentConfig = { ...defaultConfig, ...JSON.parse(stored) };
    }
  } catch (e) {
    currentConfig = { ...defaultConfig };
  }
  // Per spec: on first load of a new session we always start in light mode.
  // We still respect the *stored* accent color, lab name, font, and quote.
  // The stored theme value is retained but not applied until the user toggles.
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

/** Rough luminance — returns 0..1. Used to decide if accent is "light" or "dark". */
export function accentLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 1;
  return (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
}

export function isAccentDefault(hex) {
  const n = (hex || '').toLowerCase();
  return n === '#ffffff' || n === '#000000';
}

export function applyAccent(color) {
  document.documentElement.style.setProperty('--accent', color);
  const rgb = hexToRgb(color);
  if (rgb) {
    document.documentElement.style.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    document.documentElement.style.setProperty('--accent-muted', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`);
    document.documentElement.style.setProperty('--accent-dim', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
    document.documentElement.style.setProperty('--accent-faint', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.04)`);
    document.documentElement.style.setProperty('--accent-glow', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`);
  }

  // Mark whether the accent is inherently light or dark so contrast helpers
  // (--on-accent) resolve to a readable foreground.
  const lum = accentLuminance(color);
  document.documentElement.setAttribute('data-accent', lum > 0.55 ? 'light' : 'dark');
}

export function applyAccentFont(fontFamily) {
  document.documentElement.style.setProperty('--font-accent', fontFamily);
}

export function applyTheme(theme) {
  const t = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', t);
}

export function applyConfigToDOM(config) {
  applyAccent(config.accentColor);
  applyAccentFont(config.accentFont);
  applyTheme(config.theme);

  const titleEl = document.getElementById('labTitle');
  if (titleEl) titleEl.textContent = config.labName.toUpperCase();

  const quoteEl = document.getElementById('labQuote');
  if (quoteEl) quoteEl.textContent = config.quote;

  const footerEl = document.getElementById('labFooter');
  if (footerEl) footerEl.textContent = `LAB · ${config.labName.toUpperCase()} · v0.31`;
}
