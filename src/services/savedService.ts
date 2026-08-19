// Saved places & hotels — single source of truth for the feature.
// Logged-in users persist to the saved_places table; guests use
// localStorage (via guestStore). The UI state in App.tsx is the only
// thing that renders — every save button reads from and writes to it.

import { supabase } from "../lib/supabaseClient";
import { getGuestSaved, addGuestSaved, removeGuestSaved, clearGuestSaved } from "./guestStore";

export interface SavedItem {
  id: string;
  kind: "place" | "hotel";
}

function normalizeKind(kind: string | null | undefined): "place" | "hotel" {
  return kind === "hotel" ? "hotel" : "place";
}

export async function loadSavedItems(): Promise<SavedItem[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return getGuestSaved();
  }
  const { data, error } = await supabase
    .from("saved_places")
    .select("place_id, kind")
    .eq("user_id", session.user.id);
  if (error) {
    console.error("Failed to load saved items:", error);
    return [];
  }
  return (data ?? []).map((row) => ({
    id: row.place_id,
    kind: normalizeKind(row.kind)
  }));
}

export async function saveItem(kind: "place" | "hotel", id: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    addGuestSaved(id, kind);
    return;
  }
  const { error } = await supabase
    .from("saved_places")
    .upsert({ user_id: session.user.id, place_id: id, kind }, { onConflict: "user_id,place_id" });
  if (error) {
    throw error;
  }
}

export async function removeSavedItem(kind: "place" | "hotel", id: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    removeGuestSaved(id, kind);
    return;
  }
  const { error } = await supabase
    .from("saved_places")
    .delete()
    .eq("user_id", session.user.id)
    .eq("place_id", id)
    .eq("kind", kind);
  if (error) {
    throw error;
  }
}

export async function migrateGuestSavedToAccount(): Promise<SavedItem[]> {
  const guestSaved = getGuestSaved();
  if (guestSaved.length === 0) {
    return [];
  }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return guestSaved;
  }
  for (const item of guestSaved) {
    const { error } = await supabase
      .from("saved_places")
      .upsert({ user_id: session.user.id, place_id: item.id, kind: item.kind }, { onConflict: "user_id,place_id" });
    if (error) {
      console.error("Failed to migrate guest saved item:", error);
    }
  }
  clearGuestSaved();
  return guestSaved;
}
