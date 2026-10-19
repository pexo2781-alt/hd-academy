// ============================================
// supabase-client.js — Clean single-save version
// ============================================

const SUPABASE_URL = "https://umhoyvxagsrmxvadfaxd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaG95dnhhZ3NybXh2YWRmYXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MDE5NjQsImV4cCI6MjEwNzk3Nzk2NH0.Ep8yOut5Kpvo5hQuNBKuE0fwgjrI-_nu8WSGIVLWKBQ";

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

  // ---------- CLOUD SAVE (single row per user) ----------
  async loadSave() {
    const user = await this.getUser();
    if (!user) return null;
    const { data, error } = await client
      .from("saves")
      .select("state, config, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async saveCloud(state, config) {
    const user = await this.getUser();
    if (!user) throw new Error("Not signed in");
    const { error } = await client
      .from("saves")
      .upsert(
        {
          user_id: user.id,
          state,
          config,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
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
    a.download = `hda-save-${new Date().toISOString().slice(0, 10)}.json`;
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
    } catch {
      throw new Error("File is not valid JSON.");
    }
    if (!parsed || parsed._format !== "hdl-save-v1") {
      throw new Error("Not a valid HDA save file.");
    }
    if (!parsed.state || !parsed.config) {
      throw new Error("Save file missing state or config.");
    }
    return parsed;
  },
};
