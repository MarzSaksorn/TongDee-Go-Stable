import { describe, it, expect } from "vitest";
import { getDistanceKm, formatDistanceKm } from "./distance";

describe("getDistanceKm", () => {
  it("returns 0 for identical coordinates", () => {
    expect(getDistanceKm(17.3, 100.07, 17.3, 100.07)).toBe(0);
  });

  it("matches haversine distance for a known pair (~37 km)", () => {
    // Phichai (17.2877, 100.0869) to Uttaradit city (17.6206, 100.0995)
    const km = getDistanceKm(17.2877, 100.0869, 17.6206, 100.0995);
    expect(km).toBeGreaterThan(35);
    expect(km).toBeLessThan(40);
  });
});

describe("formatDistanceKm", () => {
  it("formats sub-kilometer distances in meters rounded to 50", () => {
    expect(formatDistanceKm(0.62, "TH")).toBe("600 ม.");
    expect(formatDistanceKm(0.62, "EN")).toBe("600 m");
  });

  it("formats kilometer distances with one decimal", () => {
    expect(formatDistanceKm(2.847, "TH")).toBe("2.8 กม.");
    expect(formatDistanceKm(2.847, "EN")).toBe("2.8 km");
  });
});
