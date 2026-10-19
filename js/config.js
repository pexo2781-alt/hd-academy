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
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function luminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 1;
  const ch = v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * ch(rgb.r) + 0.7152 * ch(rgb.g) + 0.0722 * ch(rgb.b);
}

export function isSentinel(hex) {
  const n = (hex || '').toLowerCase();
  return n === '#ffffff' || n === '';
}

/** What the accent will actually render as, given the current theme. */
export function resolveAccent(stored, theme) {
  if (isSentinel(stored)) return theme === 'dark' ? '#ffffff' : '#000000';
  return stored;
}

/** What the text will actually render as, given the current theme. */
export function resolveText(stored, theme) {
  if (isSentinel(stored)) return theme === 'dark' ? '#ffffff' : '#000000';
  return stored;
}

function writeRgbVars(prefix, color, opts) {
  const rgb = hexToRgb(color);
  if (!rgb) return;
  const root = document.documentElement;
  root.style.setProperty(`--${prefix}`, color);
  root.style.setProperty(`--${prefix}-rgb`, `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  root.style.setProperty(`--${prefix}-muted`, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opts.muted})`);
  root.style.setProperty(`--${prefix}-dim`,   `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opts.dim})`);
  root.style.setProperty(`--${prefix}-faint`, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opts.faint})`);
}

function clearVars(prefix) {
  const root = document.documentElement;
  ['', '-rgb', '-muted', '-dim', '-faint', '-glow'].forEach(suffix => {
    root.style.removeProperty(`--${prefix}${suffix}`);
  });
}

export function applyAccent(color) {
  const root = document.documentElement;
  const theme = root.getAttribute('data-theme') || 'light';
  const rendered = resolveAccent(color, theme);

  if (isSentinel(color)) {
    root.setAttribute('data-accent-default', '1');
    clearVars('accent');
  } else {
    root.setAttribute('data-accent-default', '0');
    writeRgbVars('accent', color, { muted: 0.75, dim: 0.16, faint: 0.06 });
    root.style.setProperty('--accent-glow', `rgba(${hexToRgb(color).r}, ${hexToRgb(color).g}, ${hexToRgb(color).b}, 0.25)`);
  }

  const lum = luminance(rendered);
  root.setAttribute('data-on-accent', lum > 0.55 ? 'dark' : 'light');
}

export function applyText(color) {
  const root = document.documentElement;
  const theme = root.getAttribute('data-theme') || 'light';

  if (isSentinel(color)) {
    root.setAttribute('data-text-default', '1');
    clearVars('text');
  } else {
    root.setAttribute('data-text-default', '0');
    writeRgbVars('text', color, { muted: 0.65, dim: 0.18, faint: 0.06 });
  }
}

export function applyAccentFont(fontFamily) {
  document.documentElement.style.setProperty('--font-accent', fontFamily);
}

export function applyTheme(theme) {
  const t = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', t);
}

export function applyConfigToDOM(config) {
  applyTheme(config.theme);
  applyAccent(config.accentColor);
  applyText(config.textColor);
  applyAccentFont(config.accentFont);

  const titleEl = document.getElementById('labTitle');
  if (titleEl) titleEl.textContent = config.labName.toUpperCase();

  const quoteEl = document.getElementById('labQuote');
  if (quoteEl) quoteEl.textContent = config.quote;

  const footerEl = document.getElementById('labFooter');
  if (footerEl) footerEl.textContent = `LAB · ${config.labName.toUpperCase()} · v0.32`;
}
