import { supabase } from "../lib/supabaseClient";
import { Accommodation } from "../types";
import { ACCOMMODATIONS } from "../data";

export function mapRowToAccommodation(row: any): Accommodation {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    propertyType: row.property_type || "hotel",
    priceRange: row.price_range || "",
    rating: typeof row.rating === 'number' ? row.rating : parseFloat(row.rating || "4.0"),
    phone: row.phone || "",
    lineId: row.line_id || "",
    website: row.website || "",
    bookingLinks: row.booking_links || {},
    amenities: row.amenities || [],
    roomTypes: row.room_types || [],
    images: row.images || [],
    checkInTime: row.check_in_time || "14:00",
    checkOutTime: row.check_out_time || "12:00",
    cancellationPolicy: row.cancellation_policy || "",
    lat: typeof row.latitude === 'number' ? row.latitude : parseFloat(row.latitude || "0"),
    lng: typeof row.longitude === 'number' ? row.longitude : parseFloat(row.longitude || "0"),
    address: row.address || "",
    marker_icon: row.marker_icon,
    marker_color: row.marker_color,
    isActive: row.is_active ?? true,
    isFeatured: row.is_featured ?? false,
    sortOrder: row.sort_order ?? 0,
  };
}

export async function fetchAccommodations(): Promise<Accommodation[]> {
  try {
    const { data, error } = await supabase
      .from("accommodations")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.warn("Could not fetch accommodations from Supabase, falling back to ACCOMMODATIONS:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        fullError: error
      });
      return ACCOMMODATIONS;
    }

    if (!data || data.length === 0) {
      console.log("Supabase returned empty active accommodations list, falling back to ACCOMMODATIONS.");
      return ACCOMMODATIONS;
    }

    return data.map(mapRowToAccommodation);
  } catch (err: any) {
    console.error("Unexpected error fetching accommodations, using ACCOMMODATIONS fallback:", err);
    return ACCOMMODATIONS;
  }
}
