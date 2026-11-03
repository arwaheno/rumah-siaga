import { newAssessment, newId } from "@/lib/constants";
import type { Assessment, PumpAssessment, StorageUnit } from "@/types/assessment";

export function unit(p: Partial<StorageUnit>): StorageUnit {
  return {
    id: newId(),
    name: "Wadah",
    type: "toren",
    quantity: 1,
    capacity: 100,
    fillPercent: 100,
    unusable: 0,
    intendedUse: "umum",
    quality: "belum_diverifikasi",
    accessDuringOutage: "ya",
    ...p,
  };
}

export function base(over: Partial<Assessment> = {}): Assessment {
  const a = newAssessment();
  a.profile.occupants = 4;
  a.profile.targetDays = 3;
  a.profile.targetPreset = 3;
  a.profile.litersPerPersonPerDay = 15;
  a.drinking.litersPerPersonPerDay = 3;
  return { ...a, ...over };
}

export function pump(p: Partial<PumpAssessment>): PumpAssessment {
  return {
    hasPump: "ya",
    pumpType: "listrik",
    powerDependency: "belum_diketahui",
    backupPower: "belum_diketahui",
    alternativeAccess: "belum_diketahui",
    gravityFed: "belum_diketahui",
    pumpStatus: "baik",
    operationKnowledge: "semua",
    ...p,
  };
}
