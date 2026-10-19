// ============================================
// slot-manager.js — Save slot CRUD
// ============================================

window.SlotManager = (function () {
  const KEY = "hda_slots";

  function loadAll() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultSlots();
      const parsed = JSON.parse(raw);
      // Ensure all 3 slots exist
      for (let i = 1; i <= 3; i++) {
        if (!parsed[i]) parsed[i] = { exists: false };
      }
      return parsed;
    } catch { return defaultSlots(); }
  }

  function defaultSlots() {
    return { "1": { exists: false }, "2": { exists: false }, "3": { exists: false } };
  }

  function saveAll(slots) {
    localStorage.setItem(KEY, JSON.stringify(slots));
  }

  function getMeta(slot) {
    return loadAll()[slot] || { exists: false };
  }

  function create(slot, { name, portrait }) {
    const slots = loadAll();
    if (slots[slot] && slots[slot].exists) throw new Error("Slot already occupied");

    // Init state
    const st = window.ANHS.getDEFAULT_STATE();
    st.slotId = slot;
    st.name = name;
    st.portrait = portrait;
    localStorage.setItem(window.ANHS.stateKeyFor(slot), JSON.stringify(st));

    slots[slot] = {
      exists: true,
      name,
      portrait,
      classRank: "D",
      classPoints: st.classPoints,
      personalPoints: 0,
      day: 0,
      lastPlayed: new Date().toISOString(),
      legacy: false
    };
    saveAll(slots);
    return st;
  }

  function updateMeta(slot, state) {
    const slots = loadAll();
    if (!slots[slot] || !slots[slot].exists) return;
    slots[slot].name = state.name;
    slots[slot].portrait = state.portrait;
    slots[slot].classRank = state.classRank;
    slots[slot].classPoints = state.classPoints;
    slots[slot].personalPoints = state.personalPoints || 0;
    slots[slot].day = state.day;
    slots[slot].lastPlayed = state.lastPlayed || new Date().toISOString();
    saveAll(slots);
  }

  function deleteSlot(slot) {
    const slots = loadAll();
    slots[slot] = { exists: false };
    saveAll(slots);
    localStorage.removeItem(window.ANHS.stateKeyFor(slot));
    // Clear active if this was it
    if (window.ANHS.getActiveSlotId() === slot) {
      localStorage.removeItem("hda_active_slot");
    }
    // Try cloud delete if signed in
    if (window.SB) {
      window.SB.deleteCloudSlot(slot).catch(() => {});
    }
  }

  function activate(slot) {
    const meta = getMeta(slot);
    if (!meta.exists) throw new Error("Slot is empty");
    window.ANHS.setActiveSlotId(slot);
  }

  return { loadAll, getMeta, create, updateMeta, deleteSlot, activate };
})();
