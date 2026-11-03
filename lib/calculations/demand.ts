import { safeNumber } from "./volume";

/** dailyDemand = occupants * litersPerPersonPerDay */
export function dailyDemand(occupants: number, litersPerPersonPerDay: number): number {
  return Math.floor(safeNumber(occupants)) * safeNumber(litersPerPersonPerDay);
}

/** targetDemand = dailyDemand * targetDays */
export function targetDemand(daily: number, targetDays: number): number {
  return safeNumber(daily) * safeNumber(targetDays);
}

/**
 * Ketahanan dalam hari = air yang dapat diakses / kebutuhan harian.
 * Mengembalikan null bila kebutuhan harian 0 (tidak dapat dihitung) — tidak pernah Infinity/NaN.
 */
export function enduranceDays(accessibleLiters: number, daily: number): number | null {
  const d = safeNumber(daily);
  if (d <= 0) return null;
  return safeNumber(accessibleLiters) / d;
}

/** shortage = max(0, targetDemand - available) */
export function shortage(target: number, availableLiters: number): number {
  return Math.max(0, safeNumber(target) - safeNumber(availableLiters));
}

export function surplus(target: number, availableLiters: number): number {
  return Math.max(0, safeNumber(availableLiters) - safeNumber(target));
}
