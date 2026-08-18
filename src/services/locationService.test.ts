import { describe, it, expect } from "vitest";
import { mapLocationRowToAttraction } from "./locationService";

describe("mapLocationRowToAttraction", () => {
  it("maps snake_case columns to the Attraction shape", () => {
    const row = {
      id: "wat_mahathat",
      name: "วัดหน้าพระธาตุ",
      description: "วัดเก่าแก่",
      distance_label: "ใจกลางเมือง",
      location_category: "วัฒนธรรม",
      rating: "4.9",
      history_summary: "ประวัติ",
      cultural_highlights: "ไฮไลท์",
      best_time: "08:00-17:00",
      need_to_know: "แต่งกายสุภาพ",
      image_url: "https://example.com/a.jpg",
      audio_story: "เรื่องเล่า",
      latitude: "17.3043",
      longitude: "100.0720",
      marker_icon: "i",
      marker_color: "red",
      video_url: "https://example.com/v.mp4",
    };
    const a = mapLocationRowToAttraction(row);
    expect(a.id).toBe("wat_mahathat");
    expect(a.desc).toBe("วัดเก่าแก่");
    expect(a.distance).toBe("ใจกลางเมือง");
    expect(a.locationCategory).toBe("วัฒนธรรม");
    expect(a.rating).toBe(4.9);
    expect(a.historySummary).toBe("ประวัติ");
    expect(a.lat).toBeCloseTo(17.3043, 4);
    expect(a.lng).toBeCloseTo(100.072, 3);
    expect(a.videoUrl).toBe("https://example.com/v.mp4");
  });

  it("applies defaults for missing optional fields", () => {
    const a = mapLocationRowToAttraction({ id: "x", name: "X", latitude: 1, longitude: 2 });
    expect(a.desc).toBe("");
    expect(a.locationCategory).toBe("วัฒนธรรม");
    expect(a.rating).toBe(4.5);
    expect(a.historySummary).toBe("");
    expect(a.videoUrl).toBeNull();
  });
});
