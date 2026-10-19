// Central config store for the lab. All persistent user settings flow through here.

const STORAGE_KEY = 'lab_config_v2';

export const defaultConfig = {
  labName: 'SUBJECT 001',
  accentColor: '#ffffff',
  accentFont: "'Inter', system-ui, sans-serif",
  quote: '“The self is the only laboratory that matters.”'
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

// ---------- Application helpers ----------

export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
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
}

export function applyAccentFont(fontFamily) {
  document.documentElement.style.setProperty('--font-accent', fontFamily);
}

export function applyConfigToDOM(config) {
  applyAccent(config.accentColor);
  applyAccentFont(config.accentFont);

  const titleEl = document.getElementById('labTitle');
  if (titleEl) titleEl.textContent = config.labName.toUpperCase();

  const quoteEl = document.getElementById('labQuote');
  if (quoteEl) quoteEl.textContent = config.quote;

  const footerEl = document.getElementById('labFooter');
  if (footerEl) footerEl.textContent = `LAB · ${config.labName.toUpperCase()} · v0.2`;
}
