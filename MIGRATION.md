# V5 → V6.0 Migration

## 1. Back up
Commit or zip your current working version.

## 2. Add new files
- `content/entrance-exam.json` (create folder `content/` if missing)
- `js/slot-manager.js`
- `js/sorting.js`
- `js/entrance-exam.js`
- `js/campus.js`
- `js/dorm.js`
- `slots.html`
- `new-game.html`
- `entrance-exam.html`
- `campus.html`
- `dorm.html`
- `supabase-migration.sql`
- `MIGRATION.md`

## 3. Replace files
- `js/state.js` ← File 2
- `js/nav.js` ← File 5
- `js/quiz-engine.js` ← File 11 (two patches)
- `index.html` ← File 13
- `classroom.html` ← File 18

## 4. Patch files
- `js/config.js`: add motto + browserTitle to site; add motto injection in applyTheme
- `js/supabase-client.js`: replace `loadSave`, `saveCloud`, add `loadAllSlotsMeta` + `deleteCloudSlot`
- `css/style.css`: append the V6.0 CSS block (File 12) — **include the `#qBody` overrides** at the end

## 5. Update Supabase
Run `supabase-migration.sql` in the SQL Editor.

## 6. Delete nothing
Old pages (`quiz.html`, `booklet.html`, `whiteroom.html`, `special-exam.html`, `question-bank.html`, `settings.html`, `account.html`) stay. They're hidden from nav but still work if visited directly. They'll be reintegrated in later phases.

## 7. Test
1. Open site → Title screen loads with HDA logo animation
2. Click Start → Slot picker
3. Slot 1 shows "Legacy Student" (from your V5 save) — continue it OR delete it and start fresh
4. Click empty slot → Create Profile → name + color + emoji
5. Take entrance exam (15 questions, mixed types)
6. See Class X reveal → Enter Campus
7. Click Classroom → take a Math lesson → finish
8. Click Dorm → check stats
9. Sign in to Account page → confirm 3 slots sync correctly
10. Sign out → sign back in on another device → verify slots appear

## 8. Verify migration
- Old `anhs_state` key should be gone from localStorage
- New keys: `hda_slot_1_state`, `hda_slots`, `hda_config`, `hda_active_slot`
- Legacy slot 1 has `legacy: true` in its metadata
