import { describe, it, expect } from "vitest";
import { SCREENS, isGuestSafeScreen } from "./screens";

describe("screen registry", () => {
  it("registers all 30 screens", () => {
    expect(Object.keys(SCREENS).length).toBe(30);
  });

  it("guest-safe screens are a subset of restorable screens", () => {
    for (const meta of Object.values(SCREENS)) {
      if (meta.guestSafe) {
        expect(meta.restorable, `screen ${meta.id}`).toBe(true);
      }
    }
  });

  it("classifies known screens correctly", () => {
    expect(isGuestSafeScreen(4)).toBe(true);  // Home
    expect(isGuestSafeScreen(27)).toBe(false); // Active trip needs in-memory state
    expect(isGuestSafeScreen(40)).toBe(false); // Admin
    expect(isGuestSafeScreen(999)).toBe(false); // unknown
    expect(SCREENS[27]?.restorable).toBe(false);
    expect(SCREENS[40]?.restorable).toBe(true);
  });

  it("tabs are valid (0-4 or -1)", () => {
    for (const meta of Object.values(SCREENS)) {
      expect(meta.tab, `screen ${meta.id}`).toBeGreaterThanOrEqual(-1);
      expect(meta.tab, `screen ${meta.id}`).toBeLessThanOrEqual(4);
    }
  });

  it("backFallbacks reference registered screens", () => {
    for (const meta of Object.values(SCREENS)) {
      expect(SCREENS[meta.backFallback], `screen ${meta.id}`).toBeDefined();
    }
  });
});
