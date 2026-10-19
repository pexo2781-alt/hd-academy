// ============================================
// supabase-client.js — Supabase client + auth helpers
// V5: cloud saves via Supabase
// ============================================

// ⚠️ REPLACE THESE with your own values from Supabase Dashboard → Settings → API
const SUPABASE_URL = "https://umhoyvxagsrmxvadfaxd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaG95dnhhZ3NybXh2YWRmYXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MDE5NjQsImV4cCI6MjEwNzk3Nzk2NH0.Ep8yOut5Kpvo5hQuNBKuE0fwgjrI-_nu8WSGIVLWKBQ";

// Loaded via CDN <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// That exposes a global `supabase` object with `createClient`
const { createClient } = window.supabase;
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.SB = {
  client,

  // ---------- AUTH ----------
  async signUp(email, password) {
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await client.auth.signOut();
    if (error) throw error;
  },

  async getUser() {
    const { data } = await client.auth.getUser();
    return data.user || null;
  },

  async getSession() {
    const { data } = await client.auth.getSession();
    return data.session || null;
  },

  // ---------- CLOUD SAVE ----------
   async loadSave(slot) {
    const user = await this.getUser();
    if (!user) return null;
    const s = slot || window.ANHS.getActiveSlotId() || 1;
    const { data, error } = await client
      .from("saves")
      .select("state, config, updated_at, slot")
      .eq("user_id", user.id)
      .eq("slot", s)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async saveCloud(state, config, slot) {
    const user = await this.getUser();
    if (!user) throw new Error("Not signed in");
    const s = slot || (state && state.slotId) || window.ANHS.getActiveSlotId() || 1;
    const { error } = await client
      .from("saves")
      .upsert(
        {
          user_id: user.id,
          slot: s,
          state,
          config,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,slot" }
      );
    if (error) throw error;
  },

  async loadAllSlotsMeta() {
    const user = await this.getUser();
    if (!user) return [];
    const { data, error } = await client
      .from("saves")
      .select("slot, state, updated_at")
      .eq("user_id", user.id)
      .order("slot");
    if (error) throw error;
    return data || [];
  },

  async deleteCloudSlot(slot) {
    const user = await this.getUser();
    if (!user) return;
    const { error } = await client
      .from("saves")
      .delete()
      .eq("user_id", user.id)
      .eq("slot", slot);
    if (error) throw error;
  },

  // ---------- EXPORT / IMPORT ----------
  exportSaveFile(state, config) {
    const payload = {
      _format: "hdl-save-v1",
      _exportedAt: new Date().toISOString(),
      state,
      config,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hdl-save-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  async importSaveFile(file) {
    const text = await file.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      throw new Error("File is not valid JSON.");
    }
    if (!parsed || parsed._format !== "hdl-save-v1") {
      throw new Error("Not a valid HDL save file (missing _format).");
    }
    if (!parsed.state || !parsed.config) {
      throw new Error("Save file missing state or config.");
    }
    return parsed;
  },
};
