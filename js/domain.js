/**
 * domain.js — Domain navigation + drill grid.
 * Owns the domain picker, the mental drills grid, and the stub drill view.
 */

const state = {
  domain: 'select',   // 'select' | 'mental'
  drill: null         // null | 'number-memory'
};

const els = {};

export function initDomain({ onExit } = {}) {
  Object.assign(els, {
    nav: document.getElementById('domainNav'),
    tab: document.querySelector('.domain-tab'),
    picker: document.getElementById('domainPicker'),
    drills: document.getElementById('domainDrills'),
    drillView: document.getElementById('drillNumberMemory'),
    backBtn: document.getElementById('domainBackBtn'),
    drillBackBtn: document.getElementById('drillBackBtn'),
    choices: Array.from(document.querySelectorAll('.domain-choice')),
    drillCards: Array.from(document.querySelectorAll('.drill-card'))
  });

  // Click on the "Domain" tab toggles back to the picker
  els.tab.addEventListener('click', () => {
    setDomain('select');
  });

  // Domain choices
  els.choices.forEach(btn => {
    btn.addEventListener('click', () => {
      const d = btn.dataset.domain;
      if (btn.disabled || d === 'academic' || d === 'physical') return;
      setDomain(d);
    });
  });

  // Back from drills → picker
  els.backBtn.addEventListener('click', () => setDomain('select'));

  // Drill cards
  els.drillCards.forEach(card => {
    card.addEventListener('click', () => {
      if (card.classList.contains('is-locked')) return;
      const id = card.dataset.drill;
      if (id) openDrill(id);
    });
  });

  // Back from drill → drills grid
  els.drillBackBtn.addEventListener('click', () => closeDrill());

  setDomain('select');
}

function setDomain(domain) {
  state.domain = domain;
  state.drill = null;

  els.picker.classList.toggle('is-active', domain === 'select');
  els.drills.classList.toggle('is-active', domain === 'mental');
  els.drillView.classList.remove('is-active');

  els.tab.classList.toggle('is-active', domain !== 'select');
  els.tab.classList.toggle('is-open', domain !== 'select');
  els.tab.querySelector('.domain-tab-label').textContent =
    domain === 'select' ? 'Domain' : capitalize(domain);
}

function openDrill(id) {
  state.drill = id;
  els.drills.classList.remove('is-active');
  els.drillView.classList.add('is-active');
}

function closeDrill() {
  state.drill = null;
  els.drillView.classList.remove('is-active');
  els.drills.classList.add('is-active');
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
