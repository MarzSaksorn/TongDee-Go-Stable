import { supabase } from "../lib/supabaseClient";
import { Attraction } from "../types";
import { ATTRACTIONS } from "../data";

/**
 * Maps a single row from the `tourism_locations` Supabase database table
 * into the existing frontend `Attraction` typing format.
 */
export function mapLocationRowToAttraction(row: any): Attraction {
  return {
    id: row.id,
    name: row.name,
    desc: row.description || "",
    distance: row.distance_label || "",
    locationCategory: row.location_category || "วัฒนธรรม",
    rating: typeof row.rating === 'number' ? row.rating : parseFloat(row.rating || "4.5"),
    historySummary: row.history_summary || "",
    culturalHighlights: row.cultural_highlights || "",
    bestTime: row.best_time || "",
    needToKnow: row.need_to_know || "",
    image: row.image_url || "",
    audioStory: row.audio_story || "",
    lat: typeof row.latitude === 'number' ? row.latitude : parseFloat(row.latitude || "0"),
    lng: typeof row.longitude === 'number' ? row.longitude : parseFloat(row.longitude || "0"),
    marker_icon: row.marker_icon,
    marker_color: row.marker_color,
    video_url: row.video_url ?? null,
    videoUrl: row.video_url ?? null
  };
}

/**
 * Fetches all active location rows from the `tourism_locations` Supabase database table.
 * Falls back to `ATTRACTIONS` from static `src/data.ts` if the request fails or is empty.
 */
export async function fetchTourismLocations(): Promise<Attraction[]> {
  try {
    const { data, error } = await supabase
      .from("tourism_locations")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.warn("Could not fetch locations from Supabase, falling back to ATTRACTIONS:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        fullError: error
      });
      return ATTRACTIONS;
    }

    if (!data || data.length === 0) {
      console.log("Supabase returned empty active tourism locations list, falling back to ATTRACTIONS.");
      return ATTRACTIONS;
    }

    return data.map(mapLocationRowToAttraction);
  } catch (err: any) {
    console.error("Unexpected error fetching tourism locations, using ATTRACTIONS fallback:", err);
    return ATTRACTIONS;
  }
}
