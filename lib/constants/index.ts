import type {
  Assessment,
  AuditAnswers,
  AuditItemId,
  DemandScenario,
  DistributionAssessment,
  DrinkingAssessment,
  Profile,
  PumpAssessment,
  SourceType,
  StorageType,
} from "@/types/assessment";

export const APP_NAME = "Rumah Siaga";
export const TAGLINE = "Kenali. Hitung. Siapkan.";
export const STORAGE_PREFIX = "rumahsiaga";
export const PRIVACY_NOTICE =
  "Data perhitungan disimpan secara lokal di perangkat/browser Anda pada versi MVP ini.";

/** Skenario kebutuhan air: parameter simulasi yang dapat diubah, BUKAN standar keselamatan universal. */
export const DEMAND_SCENARIOS: Record<
  Exclude<DemandScenario, "custom">,
  { label: string; liters: number; hint: string }
> = {
  darurat: { label: "Darurat", liters: 15, hint: "Kebutuhan sangat minimal" },
  transisi: { label: "Transisi", liters: 20, hint: "Hemat, tetap layak" },
  perkotaan: { label: "Perkotaan", liters: 50, hint: "Kebutuhan rumah tangga umum" },
};

export const DEFAULT_DRINKING_LITERS = 3;

export const TARGET_PRESETS = [1, 3, 7, 14] as const;

export const HOUSING_LABEL: Record<Profile["housingType"], string> = {
  rumah: "Rumah",
  kontrakan: "Kontrakan",
  apartemen: "Apartemen",
  lainnya: "Lainnya",
};

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  pdam: "PDAM",
  sumur: "Air tanah / sumur",
  hujan: "Air hujan",
  kemasan: "Air kemasan",
  lainnya: "Lainnya",
};

export const SOURCE_DEFAULT_ROLE: Record<SourceType, "kontinu" | "alternatif" | "tersimpan"> = {
  pdam: "kontinu",
  sumur: "kontinu",
  hujan: "alternatif",
  kemasan: "tersimpan",
  lainnya: "alternatif",
};

export const STORAGE_TYPE_LABEL: Record<StorageType, string> = {
  toren: "Toren / tangki",
  galon: "Galon / air kemasan",
  jeriken: "Jeriken",
  drum: "Drum",
  lainnya: "Wadah lain",
};

/** Kategori untuk grafik komposisi. */
export const STORAGE_CHART_LABEL: Record<StorageType, string> = {
  toren: "Toren",
  galon: "Galon",
  jeriken: "Jeriken",
  drum: "Lainnya",
  lainnya: "Lainnya",
};

export const AUDIT_ITEMS: { id: AuditItemId; group: string; label: string; help: string }[] = [
  { id: "storage_clean", group: "Penyimpanan", label: "Wadah air bersih", help: "Tidak ada lumut, kotoran, atau endapan berlebih." },
  { id: "storage_covered", group: "Penyimpanan", label: "Wadah tertutup rapat", help: "Tertutup agar tidak kemasukan debu, serangga, atau jentik." },
  { id: "storage_volume_known", group: "Penyimpanan", label: "Volume penyimpanan diketahui", help: "Anda tahu kapasitas dan isi wadah saat ini." },
  { id: "pump_dependency_known", group: "Pompa", label: "Ketergantungan listrik diketahui", help: "Anda tahu apakah air masih bisa diambil saat listrik padam." },
  { id: "pump_backup_evaluated", group: "Pompa", label: "Akses cadangan sudah dievaluasi", help: "Ada rencana mengambil air tanpa pompa listrik." },
  { id: "pump_operation_understood", group: "Pompa", label: "Cara kerja pompa dipahami", help: "Anggota keluarga tahu cara menyalakan/mematikan dengan aman." },
  { id: "dist_pipes_work", group: "Distribusi", label: "Pipa dan keran berfungsi", help: "Keran mengalir normal dan tidak macet." },
  { id: "dist_leaks_checked", group: "Distribusi", label: "Kebocoran sudah diperiksa", help: "Sambungan pipa, keran, dan toren dicek berkala." },
  { id: "dist_accessible", group: "Distribusi", label: "Air mudah diakses", help: "Wadah dan keran bisa dijangkau tanpa alat khusus." },
  { id: "drink_separate_storage", group: "Air minum", label: "Ada penyimpanan air minum terpisah", help: "Air minum tidak dicampur dengan air keperluan umum." },
  { id: "drink_quality_known", group: "Air minum", label: "Status kualitas air minum diketahui", help: "Anda tahu bagaimana air minum Anda diverifikasi." },
  { id: "drink_conditions_adequate", group: "Air minum", label: "Kondisi penyimpanan air minum memadai", help: "Wadah bersih, tertutup, dan tidak terkena panas langsung." },
];

export const AUDIT_ANSWER_LABEL = {
  sudah: "Sudah",
  belum: "Belum",
  belum_diperiksa: "Belum diperiksa",
  tidak_relevan: "Tidak relevan",
} as const;

export function emptyAudit(): AuditAnswers {
  return Object.fromEntries(AUDIT_ITEMS.map((i) => [i.id, "belum_diperiksa"])) as AuditAnswers;
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function defaultProfile(): Profile {
  return {
    houseName: "",
    location: "",
    housingType: "rumah",
    occupants: 0,
    children: 0,
    elderly: 0,
    targetDays: 3,
    targetPreset: 3,
    scenario: "darurat",
    litersPerPersonPerDay: DEMAND_SCENARIOS.darurat.liters,
  };
}

export function defaultPump(): PumpAssessment {
  return {
    hasPump: "belum_diketahui",
    pumpType: "listrik",
    powerDependency: "belum_diketahui",
    backupPower: "belum_diketahui",
    alternativeAccess: "belum_diketahui",
    gravityFed: "belum_diketahui",
    pumpStatus: "belum_diperiksa",
    operationKnowledge: "belum_diketahui",
  };
}

export function defaultDistribution(): DistributionAssessment {
  return {
    mainPath: "toren_gravitasi",
    pipeCondition: "belum_diperiksa",
    leakage: "belum_diperiksa",
    usableTaps: 0,
    storageAccessibility: "belum_diketahui",
    gravityAccess: "belum_diketahui",
    distributeWithoutPower: "belum_diketahui",
  };
}

export function defaultDrinking(): DrinkingAssessment {
  return {
    litersPerPersonPerDay: DEFAULT_DRINKING_LITERS,
    storageHygiene: "belum_diperiksa",
    containerCondition: "belum_diperiksa",
    verificationNote: "",
  };
}

export function newAssessment(): Assessment {
  const now = new Date().toISOString();
  return {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    step: 1,
    completed: false,
    profile: defaultProfile(),
    sources: [],
    storage: [],
    pump: defaultPump(),
    distribution: defaultDistribution(),
    drinking: defaultDrinking(),
    audit: emptyAudit(),
    budget: [],
  };
}

export const WIZARD_STEPS = [
  { n: 1, title: "Profil Rumah", short: "Profil" },
  { n: 2, title: "Sumber Air", short: "Sumber" },
  { n: 3, title: "Penyimpanan Air", short: "Simpan" },
  { n: 4, title: "Pompa & Listrik", short: "Pompa" },
  { n: 5, title: "Distribusi Air", short: "Distribusi" },
  { n: 6, title: "Air Minum", short: "Minum" },
  { n: 7, title: "Audit & Konfirmasi", short: "Audit" },
  { n: 8, title: "Hasil Perhitungan", short: "Hasil" },
] as const;
