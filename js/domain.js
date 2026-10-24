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
}

export function showDomainView() {
  if (els.topbar) els.topbar.style.display = 'flex';
  setDomain('select');
}

function setDomain(domain) {
  state.domain = domain;
  state.drill = null;

  if (els.topbar) els.topbar.style.display = 'flex';
  if (els.picker) els.picker.classList.toggle('is-active', domain === 'select');
  if (els.drills) els.drills.classList.toggle('is-active', domain === 'mental');

  document.querySelectorAll('.drill-view').forEach(el => el.classList.remove('is-active'));

  if (els.tab) {
    els.tab.classList.toggle('is-active', domain !== 'select');
    els.tab.classList.toggle('is-open', domain !== 'select');
    els.tab.querySelector('.domain-tab-label').textContent =
      domain === 'select' ? 'Domain' : capitalize(domain);
  }
}

function openDrill(id) {
  state.drill = id;
  
  if (els.topbar) els.topbar.style.display = 'none';
  if (els.drills) els.drills.classList.remove('is-active');
  if (els.picker) els.picker.classList.remove('is-active');

  if (id === 'number-memory') {
    if (typeof window.__nmReset === 'function') window.__nmReset();
    const view = document.querySelector('[data-drill-view="number-memory"]');
    if (view) view.classList.add('is-active');
  } else if (id === 'sequence-memory') {
    if (typeof window.__smReset === 'function') window.__smReset();
    const view = document.querySelector('[data-drill-view="sequence-memory"]');
    if (view) view.classList.add('is-active');
  } else if (id === 'visual-memory') {
    if (typeof window.__vmReset === 'function') window.__vmReset();
    const view = document.querySelector('[data-drill-view="visual-memory"]');
    if (view) view.classList.add('is-active');
  }
}

export function closeDrill() {
  state.drill = null;
  document.querySelectorAll('.drill-view').forEach(el => el.classList.remove('is-active'));
  if (els.topbar) els.topbar.style.display = 'flex';
  if (els.drills) els.drills.classList.add('is-active');
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
