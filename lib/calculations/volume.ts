import type { StorageUnit } from "@/types/assessment";

/** Pastikan angka valid dan tidak negatif. NaN/Infinity → 0. */
export function safeNumber(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) && v > 0 ? v : 0;
}

export function clampPercent(n: number): number {
  const v = safeNumber(n);
  return Math.min(100, v);
}

/** physicalVolume = capacity * fillPercentage / 100 (per wadah). */
export function physicalVolume(capacity: number, fillPercent: number): number {
  return (safeNumber(capacity) * clampPercent(fillPercent)) / 100;
}

/** effectiveVolume = max(0, physicalVolume - unusableVolume) (per wadah). */
export function effectiveVolume(physical: number, unusable: number): number {
  return Math.max(0, safeNumber(physical) - safeNumber(unusable));
}

export interface UnitVolumes {
  physicalPerUnit: number;
  effectivePerUnit: number;
  physicalTotal: number;
  effectiveTotal: number;
}

/** Volume satu catatan penyimpanan (dikalikan jumlah wadah identik). */
export function unitVolumes(u: Pick<StorageUnit, "capacity" | "fillPercent" | "unusable" | "quantity">): UnitVolumes {
  const qty = Math.max(0, Math.floor(safeNumber(u.quantity)));
  const physicalPerUnit = physicalVolume(u.capacity, u.fillPercent);
  const effectivePerUnit = effectiveVolume(physicalPerUnit, u.unusable);
  return {
    physicalPerUnit,
    effectivePerUnit,
    physicalTotal: physicalPerUnit * qty,
    effectiveTotal: effectivePerUnit * qty,
  };
}

/** Ruang kosong yang masih bisa diisi (liter), memperhitungkan volume tak terpakai. */
export function headroomLiters(u: Pick<StorageUnit, "capacity" | "fillPercent" | "unusable" | "quantity">): number {
  const qty = Math.max(0, Math.floor(safeNumber(u.quantity)));
  const full = effectiveVolume(safeNumber(u.capacity), u.unusable);
  const now = unitVolumes(u).effectivePerUnit;
  return Math.max(0, full - now) * qty;
}
