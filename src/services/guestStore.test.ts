import { describe, it, expect, beforeEach } from "vitest";
import {
  addGuestCheckin,
  addGuestStamp,
  getGuestCheckins,
  getGuestStamps,
  addGuestBadge,
  getGuestBadges,
  clearGuestData,
} from "./guestStore";

// Node has no localStorage — stub it with an in-memory map.
const mem = new Map<string, string>();
beforeEach(() => {
  mem.clear();
  (globalThis as any).localStorage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => { mem.set(k, v); },
    removeItem: (k: string) => { mem.delete(k); },
  };
});

describe("guestStore", () => {
  it("adds and dedupes guest check-ins", () => {
    addGuestCheckin("wat_mahathat");
    addGuestCheckin("phichai_museum");
    addGuestCheckin("wat_mahathat"); // duplicate
    expect(getGuestCheckins()).toEqual(["wat_mahathat", "phichai_museum"]);
  });

  it("stores stamps with codes and ISO timestamps", () => {
    addGuestStamp("wat_mahathat");
    const stamps = getGuestStamps();
    expect(stamps).toHaveLength(1);
    expect(stamps[0].placeId).toBe("wat_mahathat");
    expect(stamps[0].stampCode).toBe("STAMP_WAT_MAHATHAT");
    expect(new Date(stamps[0].collectedAt).getTime()).not.toBeNaN();
  });

  it("re-stamping the same place replaces the old stamp", () => {
    addGuestStamp("wat_mahathat");
    addGuestStamp("wat_mahathat");
    expect(getGuestStamps()).toHaveLength(1);
  });

  it("collects badges without duplicates", () => {
    addGuestBadge("b2");
    addGuestBadge("b3");
    addGuestBadge("b2");
    expect(getGuestBadges()).toEqual(["b2", "b3"]);
  });

  it("clears all guest data", () => {
    addGuestCheckin("wat_mahathat");
    addGuestStamp("wat_mahathat");
    addGuestBadge("b2");
    clearGuestData();
    expect(getGuestCheckins()).toEqual([]);
    expect(getGuestStamps()).toEqual([]);
    expect(getGuestBadges()).toEqual([]);
  });
});
