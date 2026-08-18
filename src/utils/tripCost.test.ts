import { describe, it, expect } from "vitest";
import { calculateTripCost, formatThaiBaht } from "./tripCost";

describe("calculateTripCost", () => {
  it("clamps zero travelers and stops to 1", () => {
    const r = calculateTripCost({ stopCount: 0, travelers: 0, duration: "1-day", budgetLevel: "low" });
    expect(r.travelers).toBe(1);
    // low: 120 transport + 120 food + 10 entrance + 80 shopping + 40 misc
    expect(r.totalCost).toBe(370);
  });

  it("applies the half-day multiplier", () => {
    const half = calculateTripCost({ stopCount: 2, travelers: 1, duration: "half-day", budgetLevel: "medium" });
    const full = calculateTripCost({ stopCount: 2, travelers: 1, duration: "1-day", budgetLevel: "medium" });
    expect(half.transportCost).toBe(150); // 250 * 0.6
    expect(half.totalCost).toBeLessThan(full.totalCost);
  });

  it("scales entrance cost by stops and travelers", () => {
    const r = calculateTripCost({ stopCount: 4, travelers: 3, duration: "1-day", budgetLevel: "low" });
    expect(r.entranceCost).toBe(10 * 4 * 3);
  });

  it("computes cost per person from the total", () => {
    const r = calculateTripCost({ stopCount: 3, travelers: 2, duration: "1-day", budgetLevel: "high" });
    expect(r.costPerPerson).toBe(Math.round(r.totalCost / 2));
  });

  it("formats Thai baht", () => {
    expect(formatThaiBaht(1234)).toContain("1,234");
  });
});
