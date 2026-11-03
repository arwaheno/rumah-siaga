import { z } from "zod";

const num = (label: string) => z.number({ error: `${label} harus berupa angka` }).finite(`${label} harus berupa angka`);
const nonNeg = (label: string) => num(label).min(0, `${label} tidak boleh negatif`);
const posInt = (label: string, min = 1, max = 100) =>
  num(label)
    .int(`${label} harus bilangan bulat`)
    .min(min, `${label} minimal ${min}`)
    .max(max, `${label} maksimal ${max}`);

const triState = z.enum(["ya", "tidak", "belum_diketahui"]);
const quality = z.enum(["terverifikasi", "belum_diverifikasi", "bukan_untuk_diminum"]);

export const profileSchema = z
  .object({
    houseName: z.string().trim().min(1, "Nama rumah wajib diisi").max(80, "Maksimal 80 karakter"),
    location: z.string().trim().max(120, "Maksimal 120 karakter"),
    housingType: z.enum(["rumah", "kontrakan", "apartemen", "lainnya"]),
    occupants: posInt("Jumlah penghuni", 1, 50),
    children: posInt("Jumlah anak", 0, 50),
    elderly: posInt("Jumlah lansia", 0, 50),
    targetPreset: z.union([z.literal(1), z.literal(3), z.literal(7), z.literal(14), z.literal("custom")]),
    targetDays: num("Target ketahanan").min(0.5, "Target minimal 0,5 hari").max(90, "Target maksimal 90 hari"),
    scenario: z.enum(["darurat", "transisi", "perkotaan", "custom"]),
    litersPerPersonPerDay: num("Kebutuhan air").min(1, "Minimal 1 liter/orang/hari").max(500, "Maksimal 500 liter/orang/hari"),
  })
  .refine((v) => v.children + v.elderly <= v.occupants, {
    path: ["children"],
    message: "Jumlah anak + lansia tidak boleh melebihi jumlah penghuni",
  });

export const sourceSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, "Nama sumber wajib diisi").max(60, "Maksimal 60 karakter"),
  type: z.enum(["pdam", "sumur", "hujan", "kemasan", "lainnya"]),
  role: z.enum(["kontinu", "alternatif", "tersimpan"]),
  availability: z.enum(["tersedia", "terbatas", "tidak_tersedia"]),
  reliability: z.enum(["tinggi", "sedang", "rendah", "belum_diketahui"]),
  quality,
  dependsOnElectricity: triState,
  notes: z.string().max(300, "Maksimal 300 karakter"),
});
export const sourcesSchema = z.object({ sources: z.array(sourceSchema) });

export const storageUnitSchema = z
  .object({
    id: z.string(),
    name: z.string().trim().min(1, "Nama wadah wajib diisi").max(60, "Maksimal 60 karakter"),
    type: z.enum(["toren", "galon", "jeriken", "drum", "lainnya"]),
    quantity: posInt("Jumlah", 1, 500),
    capacity: num("Kapasitas").gt(0, "Kapasitas harus lebih dari 0").max(100000, "Kapasitas terlalu besar"),
    fillPercent: num("Isi saat ini").min(0, "Minimal 0%").max(100, "Maksimal 100%"),
    unusable: nonNeg("Volume tak terpakai"),
    intendedUse: z.enum(["minum", "memasak", "umum", "sanitasi"]),
    quality,
    accessDuringOutage: triState,
  })
  .refine((u) => u.unusable <= u.capacity, {
    path: ["unusable"],
    message: "Volume tak terpakai tidak boleh melebihi kapasitas",
  });
export const storageSchema = z.object({ storage: z.array(storageUnitSchema) });

export const pumpSchema = z.object({
  hasPump: triState,
  pumpType: z.enum(["listrik", "manual", "lainnya", "tidak_ada"]),
  powerDependency: z.enum(["bergantung", "sebagian", "tidak_bergantung", "belum_diketahui"]),
  backupPower: triState,
  alternativeAccess: triState,
  gravityFed: triState,
  pumpStatus: z.enum(["baik", "bermasalah", "tidak_berfungsi", "belum_diperiksa"]),
  operationKnowledge: z.enum(["semua", "sebagian", "tidak", "belum_diketahui"]),
});

export const distributionSchema = z.object({
  mainPath: z.enum(["toren_gravitasi", "pompa_langsung", "pdam_langsung", "manual", "lainnya"]),
  pipeCondition: z.enum(["baik", "cukup", "buruk", "belum_diperiksa"]),
  leakage: z.enum(["tidak_ada", "kecil", "signifikan", "belum_diperiksa"]),
  usableTaps: posInt("Jumlah keran", 0, 100),
  storageAccessibility: z.enum(["mudah", "sulit", "tidak_bisa", "belum_diketahui"]),
  gravityAccess: triState,
  distributeWithoutPower: z.enum(["ya", "sebagian", "tidak", "belum_diketahui"]),
});

export const drinkingSchema = z.object({
  litersPerPersonPerDay: num("Kebutuhan air minum").min(0.5, "Minimal 0,5 liter/orang/hari").max(20, "Maksimal 20 liter/orang/hari"),
  storageHygiene: z.enum(["baik", "cukup", "buruk", "belum_diperiksa"]),
  containerCondition: z.enum(["baik", "cukup", "buruk", "belum_diperiksa"]),
  verificationNote: z.string().max(300, "Maksimal 300 karakter"),
});

export const budgetItemSchema = z.object({
  id: z.string(),
  label: z.string().trim().min(1, "Keterangan wajib diisi").max(80, "Maksimal 80 karakter"),
  amountIdr: nonNeg("Biaya").max(1_000_000_000, "Nilai terlalu besar"),
});
export const budgetSchema = z.object({ budget: z.array(budgetItemSchema) });

export const auditSchema = z.object({
  audit: z.record(z.string(), z.enum(["sudah", "belum", "belum_diperiksa", "tidak_relevan"])),
});

export type ProfileForm = z.infer<typeof profileSchema>;
export type SourcesForm = z.infer<typeof sourcesSchema>;
export type StorageForm = z.infer<typeof storageSchema>;
export type BudgetForm = z.infer<typeof budgetSchema>;

/** Validasi ringan untuk data yang diimpor (JSON) atau dibaca ulang dari LocalStorage. */
export function isValidAssessmentShape(v: unknown): boolean {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.profile === "object" && o.profile !== null &&
    Array.isArray(o.sources) &&
    Array.isArray(o.storage) &&
    typeof o.pump === "object" && o.pump !== null &&
    typeof o.distribution === "object" && o.distribution !== null &&
    typeof o.drinking === "object" && o.drinking !== null &&
    typeof o.audit === "object" && o.audit !== null
  );
}
