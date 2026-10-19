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
  // WCAG-style relative luminance (linearized channels)
  const ch = v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * ch(rgb.r) + 0.7152 * ch(rgb.g) + 0.0722 * ch(rgb.b);
}

/** True when the stored accent is the default sentinel. */
export function isAccentDefault(hex) {
  const n = (hex || '').toLowerCase();
  return n === '#ffffff' || n === '';
}

/**
 * Resolves the accent that will actually be *rendered* given the current
 * theme + stored accent. This is what --on-accent must be computed from.
 */
export function resolveRenderedAccent(storedAccent, theme) {
  if (isAccentDefault(storedAccent)) {
    // Default sentinel: black in light, white in dark
    return theme === 'dark' ? '#ffffff' : '#000000';
  }
  return storedAccent;
}

export function applyAccent(color) {
  const root = document.documentElement;
  const theme = root.getAttribute('data-theme') || 'light';
  const rendered = resolveRenderedAccent(color, theme);

  if (isAccentDefault(color)) {
    root.setAttribute('data-accent-default', '1');
    root.removeAttribute('data-accent');
    // Clear inline overrides — CSS resolves --accent from theme
    root.style.removeProperty('--accent');
    root.style.removeProperty('--accent-rgb');
    root.style.removeProperty('--accent-muted');
    root.style.removeProperty('--accent-dim');
    root.style.removeProperty('--accent-faint');
    root.style.removeProperty('--accent-glow');
  } else {
    root.setAttribute('data-accent-default', '0');
    const rgb = hexToRgb(color);
    if (rgb) {
      root.style.setProperty('--accent', color);
      root.style.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
      root.style.setProperty('--accent-muted', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.75)`);
      root.style.setProperty('--accent-dim', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.16)`);
      root.style.setProperty('--accent-faint', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.06)`);
      root.style.setProperty('--accent-glow', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`);
    }
  }

  // Compute contrast foreground from the *rendered* accent
  const lum = accentLuminance(rendered);
  // Threshold ~0.55 keeps mid-bright colors readable
  root.setAttribute('data-on-accent', lum > 0.55 ? 'dark' : 'light');
}

export function applyAccentFont(fontFamily) {
  document.documentElement.style.setProperty('--font-accent', fontFamily);
}

export function applyTheme(theme) {
  const t = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', t);
}

export function applyConfigToDOM(config) {
  // Theme first — accent resolution depends on it
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
