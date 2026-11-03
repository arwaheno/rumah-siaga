/**
 * Rumah Siaga — domain types.
 * Semua nilai yang berasal dari input pengguna. Tidak ada angka bawaan yang
 * "dianggap benar" di sini; default ada di lib/constants dan dapat diubah pengguna.
 */

export type HousingType = "rumah" | "kontrakan" | "apartemen" | "lainnya";
export type DemandScenario = "darurat" | "transisi" | "perkotaan" | "custom";

export interface Profile {
  houseName: string;
  location: string;
  housingType: HousingType;
  occupants: number;
  children: number;
  elderly: number;
  /** Target ketahanan dalam hari. */
  targetDays: number;
  /** Preset yang dipilih; "custom" berarti targetDays diisi manual. */
  targetPreset: 1 | 3 | 7 | 14 | "custom";
  scenario: DemandScenario;
  /** Liter/orang/hari untuk seluruh kebutuhan air rumah tangga (dapat diubah). */
  litersPerPersonPerDay: number;
}

/* ------------------------------ Sumber air ------------------------------ */

export type SourceType = "pdam" | "sumur" | "hujan" | "kemasan" | "lainnya";
/** kontinu = pasokan berjalan, alternatif = sumber cadangan potensial, tersimpan = sudah ditampung (hitung di Penyimpanan). */
export type SourceRole = "kontinu" | "alternatif" | "tersimpan";
export type Availability = "tersedia" | "terbatas" | "tidak_tersedia";
export type Reliability = "tinggi" | "sedang" | "rendah" | "belum_diketahui";
export type QualityStatus = "terverifikasi" | "belum_diverifikasi" | "bukan_untuk_diminum";
export type TriState = "ya" | "tidak" | "belum_diketahui";

export interface WaterSource {
  id: string;
  name: string;
  type: SourceType;
  role: SourceRole;
  availability: Availability;
  reliability: Reliability;
  quality: QualityStatus;
  dependsOnElectricity: TriState;
  notes: string;
}

/* ----------------------------- Penyimpanan air ----------------------------- */

export type StorageType = "toren" | "galon" | "jeriken" | "drum" | "lainnya";
export type IntendedUse = "minum" | "memasak" | "umum" | "sanitasi";

export interface StorageUnit {
  id: string;
  name: string;
  type: StorageType;
  /** Jumlah wadah identik. */
  quantity: number;
  /** Kapasitas total per wadah, liter. */
  capacity: number;
  /** Persentase terisi saat ini (0–100). */
  fillPercent: number;
  /** Volume yang tidak dapat dipakai per wadah (endapan di dasar, di bawah keran), liter. */
  unusable: number;
  intendedUse: IntendedUse;
  quality: QualityStatus;
  /** Apakah air ini dapat diambil saat listrik padam. */
  accessDuringOutage: TriState;
}

/* ----------------------------- Pompa & listrik ----------------------------- */

export type RiskLevel = "rendah" | "sedang" | "tinggi" | "belum_diketahui";
export type YesNoUnknown = "ya" | "tidak" | "belum_diketahui";

export interface PumpAssessment {
  hasPump: YesNoUnknown;
  pumpType: "listrik" | "manual" | "lainnya" | "tidak_ada";
  powerDependency: "bergantung" | "sebagian" | "tidak_bergantung" | "belum_diketahui";
  backupPower: YesNoUnknown;
  alternativeAccess: YesNoUnknown;
  gravityFed: YesNoUnknown;
  pumpStatus: "baik" | "bermasalah" | "tidak_berfungsi" | "belum_diperiksa";
  operationKnowledge: "semua" | "sebagian" | "tidak" | "belum_diketahui";
}

/* -------------------------------- Distribusi -------------------------------- */

export interface DistributionAssessment {
  mainPath: "toren_gravitasi" | "pompa_langsung" | "pdam_langsung" | "manual" | "lainnya";
  pipeCondition: "baik" | "cukup" | "buruk" | "belum_diperiksa";
  leakage: "tidak_ada" | "kecil" | "signifikan" | "belum_diperiksa";
  usableTaps: number;
  storageAccessibility: "mudah" | "sulit" | "tidak_bisa" | "belum_diketahui";
  gravityAccess: YesNoUnknown;
  distributeWithoutPower: "ya" | "sebagian" | "tidak" | "belum_diketahui";
}

/* -------------------------------- Air minum -------------------------------- */

export type ConditionStatus = "baik" | "cukup" | "buruk" | "belum_diperiksa";

export interface DrinkingAssessment {
  /** Kebutuhan air minum + memasak, liter/orang/hari (dapat diubah). */
  litersPerPersonPerDay: number;
  storageHygiene: ConditionStatus;
  containerCondition: ConditionStatus;
  verificationNote: string;
}

/* ---------------------------------- Audit ---------------------------------- */

export type AuditAnswer = "sudah" | "belum" | "belum_diperiksa" | "tidak_relevan";
export type AuditItemId =
  | "storage_clean"
  | "storage_covered"
  | "storage_volume_known"
  | "pump_dependency_known"
  | "pump_backup_evaluated"
  | "pump_operation_understood"
  | "dist_pipes_work"
  | "dist_leaks_checked"
  | "dist_accessible"
  | "drink_separate_storage"
  | "drink_quality_known"
  | "drink_conditions_adequate";

export type AuditAnswers = Record<AuditItemId, AuditAnswer>;

export interface BudgetItem {
  id: string;
  label: string;
  /** Rupiah, dimasukkan oleh pengguna. */
  amountIdr: number;
}

export interface Assessment {
  id: string;
  createdAt: string;
  updatedAt: string;
  /** Langkah wizard terakhir yang dibuka (1–8). */
  step: number;
  completed: boolean;
  profile: Profile;
  sources: WaterSource[];
  storage: StorageUnit[];
  pump: PumpAssessment;
  distribution: DistributionAssessment;
  drinking: DrinkingAssessment;
  audit: AuditAnswers;
  budget: BudgetItem[];
}
