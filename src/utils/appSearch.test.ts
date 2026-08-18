import { describe, it, expect } from "vitest";
import { appMenuSearchItemsTH, appMenuSearchItemsEN } from "./appSearch";
import { SCREENS } from "../router/screens";

describe("appMenuSearchItems", () => {
  it("has unique ids in both locales", () => {
    for (const items of [appMenuSearchItemsTH, appMenuSearchItemsEN]) {
      const ids = items.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("references only screens registered in the router", () => {
    for (const items of [appMenuSearchItemsTH, appMenuSearchItemsEN]) {
      for (const item of items) {
        expect(SCREENS[item.screenId], `screen ${item.screenId} for ${item.id}`).toBeDefined();
      }
    }
  });

  it("every item has search keywords", () => {
    for (const items of [appMenuSearchItemsTH, appMenuSearchItemsEN]) {
      for (const item of items) {
        expect(item.keywords.length, `keywords for ${item.id}`).toBeGreaterThan(0);
      }
    }
  });
});
