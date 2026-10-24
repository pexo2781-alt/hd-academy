/**
 * domain.js — Domain navigation + drill grid.
 */

const state = {
  domain: 'select',
  drill: null
};

const els = {};

export function initDomain({ onExit } = {}) {
  Object.assign(els, {
    nav: document.getElementById('domainNav'),
    topbar: document.getElementById('labTopbar'),
    tab: document.querySelector('.domain-tab'),
    picker: document.getElementById('domainPicker'),
    drills: document.getElementById('domainDrills'),
    backBtn: document.getElementById('domainBackBtn'),
    choices: Array.from(document.querySelectorAll('.domain-choice')),
    drillCards: Array.from(document.querySelectorAll('.drill-card')),
  });

  els.tab.addEventListener('click', () => setDomain('select'));

  els.choices.forEach(btn => {
    btn.addEventListener('click', () => {
      const d = btn.dataset.domain;
      if (btn.disabled || d === 'academic' || d === 'physical') return;
      setDomain(d);
    });
  });

  els.backBtn.addEventListener('click', () => setDomain('select'));

  els.drillCards.forEach(card => {
    card.addEventListener('click', () => {
      if (card.classList.contains('is-locked')) return;
      const id = card.dataset.drill;
      if (id) openDrill(id);
    });
  });

  setDomain('select');
}

export function showDomainView() {
  els.topbar.style.display = 'flex';
  setDomain('select');
}

function setDomain(domain) {
  state.domain = domain;
  state.drill = null;

  // Show topbar
  els.topbar.style.display = 'flex';

  // Toggle picker and drills
  els.picker.classList.toggle('is-active', domain === 'select');
  els.drills.classList.toggle('is-active', domain === 'mental');

  // Hide all drills
  document.querySelectorAll('.drill-view').forEach(el => el.classList.remove('is-active'));

  els.tab.classList.toggle('is-active', domain !== 'select');
  els.tab.classList.toggle('is-open', domain !== 'select');
  els.tab.querySelector('.domain-tab-label').textContent =
    domain === 'select' ? 'Domain' : capitalize(domain);
}

function openDrill(id) {
  state.drill = id;
  
  // Hide topbar, grid, picker
  els.topbar.style.display = 'none';
  els.drills.classList.remove('is-active');
  els.picker.classList.remove('is-active');

  if (id === 'number-memory') {
    if (typeof window.__nmReset === 'function') window.__nmReset();
    const view = document.querySelector('[data-drill-view="number-memory"]');
    if (view) view.classList.add('is-active');
  }
}

export function closeDrill() {
  state.drill = null;
  document.querySelectorAll('.drill-view').forEach(el => el.classList.remove('is-active'));
  els.topbar.style.display = 'flex';
  els.drills.classList.add('is-active');
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
