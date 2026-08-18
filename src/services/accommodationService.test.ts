import { describe, it, expect } from "vitest";
import { mapRowToAccommodation } from "./accommodationService";

describe("mapRowToAccommodation", () => {
  it("maps snake_case columns with defaults", () => {
    const row = {
      id: "ban-dara",
      name: "บ้านดารา",
      description: "ที่พัก",
      property_type: "homestay",
      price_range: "500-800",
      rating: "4.7",
      phone: "0812345678",
      booking_links: { direct: "https://x" },
      amenities: ["wifi"],
      room_types: [{ name: "ห้องพัก" }],
      images: ["https://x/a.jpg"],
      latitude: 17.5,
      longitude: 100.1,
      address: "พิชัย",
      marker_icon: "พ",
      marker_color: "bg-emerald-600",
      is_active: true,
      is_featured: true,
      sort_order: 3,
    };
    const a = mapRowToAccommodation(row);
    expect(a.id).toBe("ban-dara");
    expect(a.propertyType).toBe("homestay");
    expect(a.rating).toBe(4.7);
    expect(a.bookingLinks).toEqual({ direct: "https://x" });
    expect(a.amenities).toEqual(["wifi"]);
    expect(a.roomTypes).toEqual([{ name: "ห้องพัก" }]);
    expect(a.images).toEqual(["https://x/a.jpg"]);
    expect(a.checkInTime).toBe("14:00");
    expect(a.checkOutTime).toBe("12:00");
    expect(a.isActive).toBe(true);
    expect(a.isFeatured).toBe(true);
    expect(a.sortOrder).toBe(3);
  });

  it("defaults missing values", () => {
    const a = mapRowToAccommodation({ id: "x", name: "X", latitude: 0, longitude: 0 });
    expect(a.propertyType).toBe("hotel");
    expect(a.rating).toBe(4.0);
    expect(a.description).toBe("");
    expect(a.bookingLinks).toEqual({});
    expect(a.amenities).toEqual([]);
    expect(a.roomTypes).toEqual([]);
    expect(a.checkInTime).toBe("14:00");
    expect(a.isActive).toBe(true);
  });
});
