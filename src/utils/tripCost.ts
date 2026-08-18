import { TripBudgetLevel, TripCostBreakdown } from "../types";

interface CalculateTripCostInput {
  stopCount: number;
  travelers: number;
  duration: "half-day" | "1-day" | "2-days" | string;
  pace?: string;
  budgetLevel: TripBudgetLevel;
}

export function calculateTripCost({
  stopCount,
  travelers,
  duration,
  budgetLevel
}: CalculateTripCostInput): TripCostBreakdown {
  const safeTravelers = Math.max(1, travelers || 1);
  const safeStopCount = Math.max(1, stopCount || 1);

  const dayMultiplier =
    duration === "half-day"
      ? 0.6
      : duration === "2-days"
        ? 2
        : 1;

  const level = {
    low: {
      transportPerTrip: 120,
      foodPerPersonPerDay: 120,
      entrancePerStopPerPerson: 10,
      shoppingPerPerson: 80,
      miscPerPerson: 40
    },
    medium: {
      transportPerTrip: 250,
      foodPerPersonPerDay: 250,
      entrancePerStopPerPerson: 20,
      shoppingPerPerson: 200,
      miscPerPerson: 80
    },
    high: {
      transportPerTrip: 500,
      foodPerPersonPerDay: 450,
      entrancePerStopPerPerson: 40,
      shoppingPerPerson: 400,
      miscPerPerson: 150
    }
  }[budgetLevel];

  const transportCost = Math.round(level.transportPerTrip * dayMultiplier);
  const foodCost = Math.round(level.foodPerPersonPerDay * safeTravelers * dayMultiplier);
  const entranceCost = Math.round(level.entrancePerStopPerPerson * safeStopCount * safeTravelers);
  const shoppingCost = Math.round(level.shoppingPerPerson * safeTravelers);
  const miscCost = Math.round(level.miscPerPerson * safeTravelers * dayMultiplier);

  const totalCost =
    transportCost + foodCost + entranceCost + shoppingCost + miscCost;

  return {
    travelers: safeTravelers,
    budgetLevel,
    transportCost,
    foodCost,
    entranceCost,
    shoppingCost,
    miscCost,
    totalCost,
    costPerPerson: Math.round(totalCost / safeTravelers),
    note: "เป็นค่าใช้จ่ายโดยประมาณ สามารถปรับได้ตามการเดินทางจริง"
  };
}

export function formatThaiBaht(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0
  }).format(value || 0);
}
