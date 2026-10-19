const STORAGE_KEY = 'lab_config_v3';

export const defaultConfig = {
  labName: 'SUBJECT 001',
  accentColor: '#ffffff',   // default sentinel — theme-resolved
  textColor:   '#ffffff',   // default sentinel — theme-resolved
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
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d
