import type { Assessment, RiskLevel, StorageType } from "@/types/assessment";
import { STORAGE_CHART_LABEL } from "@/lib/constants";
import { summarizeAudit, type AuditSummary } from "./audit";
import { dailyDemand, enduranceDays, shortage, surplus, targetDemand } from "./demand";
import {
  bump,
  distributionRisk,
  levelFromPoints,
  pumpRisk,
  sourcesRisk,
  worstOf,
  type RiskAssessment,
} from "./risk";
import { headroomLiters, safeNumber, unitVolumes } from "./volume";

export type ReadinessStatus = "siap" | "perlu_perhatian" | "belum_siap" | "data_belum_lengkap";
export type DimensionStatus = "baik" | "perhatian" | "kurang" | "belum_lengkap";

export interface StorageRow {
  id: string;
  name: string;
  type: StorageType;
  quantity: number;
  capacityTotal: number;
  physicalTotal: number;
  effectiveTotal: number;
  accessible: boolean;
  accessUnknown: boolean;
  isDrinkingUse: boolean;
  verifiedDrinking: boolean;
  intendedUse: Assessment["storage"][number]["intendedUse"];
  quality: Assessment["storage"][number]["quality"];
}

export interface CompositionSlice {
  label: string;
  liters: number;
  percent: number;
}

export interface RiskEntry extends RiskAssessment {
  id: "sumber" | "penyimpanan" | "pompa" | "distribusi" | "air_minum";
  label: string;
}

export interface Dimension {
  id: "volume" | "akses" | "kualitas";
  label: string;
  status: DimensionStatus;
  detail: string;
}

export interface Warning {
  id: string;
  level: "info" | "perhatian" | "kritis";
  text: string;
}

export interface Results {
  rows: StorageRow[];

  physicalTotal: number;
  /** Seluruh volume efektif (termasuk yang belum tentu bisa diakses saat listrik padam). */
  effectiveTotal: number;
  /** Volume efektif yang terkonfirmasi dapat diakses saat listrik padam. */
  accessibleTotal: number;
  /** Volume efektif dengan akses belum diketahui — tidak dihitung sebagai akses. */
  unknownAccessTotal: number;

  drinkingStockTotal: number;
  drinkingAccessible: number;
  drinkingVerifiedAccessible: number;
  drinkingUnverified: number;

  dailyDemand: number;
  dailyDrinkingDemand: number;
  targetDays: number;
  targetDemand: number;
  targetDrinkingDemand: number;

  /** Hari, berbasis air yang terkonfirmasi dapat diakses. null = tidak dapat dihitung. */
  totalEndurance: number | null;
  /** Hari, bila semua air efektif dapat diakses (listrik normal). */
  totalEnduranceIfAllAccessible: number | null;
  drinkingEndurance: number | null;

  shortage: number;
  surplus: number;
  drinkingShortage: number;
  /** Ruang kosong pada wadah yang sudah ada (liter efektif tambahan bila diisi penuh). */
  headroom: number;

  composition: CompositionSlice[];
  risks: RiskEntry[];
  dimensions: Dimension[];
  audit: AuditSummary;
  status: ReadinessStatus;
  statusSummary: string;
  warnings: Warning[];
  missing: string[];
  budgetTotal: number;
}

export function computeResults(a: Assessment): Results {
  const occupants = Math.floor(safeNumber(a.profile.occupants));
  const targetDays = safeNumber(a.profile.targetDays);

  /* ---------- Penyimpanan ---------- */
  const rows: StorageRow[] = a.storage.map((u) => {
    const v = unitVolumes(u);
    const isDrinkingUse = u.intendedUse === "minum" || u.intendedUse === "memasak";
    return {
      id: u.id,
      name: u.name,
      type: u.type,
      quantity: Math.max(0, Math.floor(safeNumber(u.quantity))),
      capacityTotal: safeNumber(u.capacity) * Math.max(0, Math.floor(safeNumber(u.quantity))),
      physicalTotal: v.physicalTotal,
      effectiveTotal: v.effectiveTotal,
      accessible: u.accessDuringOutage === "ya",
      accessUnknown: u.accessDuringOutage === "belum_diketahui",
      isDrinkingUse,
      verifiedDrinking: isDrinkingUse && u.quality === "terverifikasi",
      intendedUse: u.intendedUse,
      quality: u.quality,
    };
  });

  const sum = (f: (r: StorageRow) => number, pred: (r: StorageRow) => boolean = () => true) =>
    rows.filter(pred).reduce((acc, r) => acc + f(r), 0);

  const physicalTotal = sum((r) => r.physicalTotal);
  const effectiveTotal = sum((r) => r.effectiveTotal);
  const accessibleTotal = sum((r) => r.effectiveTotal, (r) => r.accessible);
  const unknownAccessTotal = sum((r) => r.effectiveTotal, (r) => r.accessUnknown);

  // Air minum: hanya wadah yang diperuntukkan minum/memasak. Tidak dicampur dengan air umum.
  const drinkingStockTotal = sum((r) => r.effectiveTotal, (r) => r.isDrinkingUse);
  const drinkingAccessible = sum((r) => r.effectiveTotal, (r) => r.isDrinkingUse && r.accessible);
  const drinkingVerifiedAccessible = sum((r) => r.effectiveTotal, (r) => r.verifiedDrinking && r.accessible);
  const drinkingUnverified = sum((r) => r.effectiveTotal, (r) => r.isDrinkingUse && !r.verifiedDrinking);

  /* ---------- Kebutuhan ---------- */
  const daily = dailyDemand(occupants, a.profile.litersPerPersonPerDay);
  const dailyDrinking = dailyDemand(occupants, a.drinking.litersPerPersonPerDay);
  const tDemand = targetDemand(daily, targetDays);
  const tDrinkingDemand = targetDemand(dailyDrinking, targetDays);

  const totalEndurance = enduranceDays(accessibleTotal, daily);
  const totalEnduranceIfAllAccessible = enduranceDays(effectiveTotal, daily);
  const drinkingEndurance = enduranceDays(drinkingVerifiedAccessible, dailyDrinking);

  const short = shortage(tDemand, accessibleTotal);
  const sur = surplus(tDemand, accessibleTotal);
  const drinkShort = shortage(tDrinkingDemand, drinkingVerifiedAccessible);
  const headroom = a.storage.reduce((acc, u) => acc + headroomLiters(u), 0);

  /* ---------- Komposisi ---------- */
  const byLabel = new Map<string, number>();
  for (const r of rows) {
    if (r.effectiveTotal <= 0) continue;
    const label = STORAGE_CHART_LABEL[r.type];
    byLabel.set(label, (byLabel.get(label) ?? 0) + r.effectiveTotal);
  }
  const composition: CompositionSlice[] = [...byLabel.entries()]
    .map(([label, liters]) => ({ label, liters, percent: effectiveTotal > 0 ? (liters / effectiveTotal) * 100 : 0 }))
    .sort((x, y) => y.liters - x.liters);

  /* ---------- Risiko ---------- */
  const src = sourcesRisk(a.sources);
  const pump = pumpRisk(a.pump);
  const dist = distributionRisk(a.distribution);

  // Risiko penyimpanan
  let storage: RiskAssessment;
  if (rows.length === 0 || effectiveTotal <= 0) {
    storage = {
      level: rows.length === 0 ? "belum_diketahui" : "tinggi",
      explanation: rows.length === 0 ? "Belum ada wadah penyimpanan yang dicatat." : "Semua wadah kosong atau tidak memiliki volume yang dapat dipakai.",
      action: "Catat wadah air Anda, lalu isi data kapasitas dan tingkat keterisian.",
    };
  } else if (daily <= 0 || targetDays <= 0) {
    storage = { level: "belum_diketahui", explanation: "Jumlah penghuni atau target ketahanan belum diisi.", action: "Lengkapi profil rumah." };
  } else {
    const ratio = accessibleTotal / tDemand;
    let level: RiskLevel = ratio >= 1 ? "rendah" : ratio >= 0.5 ? "sedang" : "tinggi";
    let explanation =
      ratio >= 1
        ? "Volume air yang terkonfirmasi dapat diakses mencukupi target."
        : `Volume air yang terkonfirmasi dapat diakses baru ${Math.round(ratio * 100)}% dari kebutuhan selama target.`;
    if (unknownAccessTotal > 0) {
      explanation += " Sebagian air belum diketahui bisa diakses saat listrik padam, jadi belum dihitung.";
      if (level === "rendah") level = "sedang";
    }
    if (a.drinking.storageHygiene === "buruk" || a.drinking.containerCondition === "buruk") {
      level = bump(level, 1);
      explanation += " Kondisi wadah/kebersihan penyimpanan dilaporkan buruk.";
    }
    storage = {
      level,
      explanation,
      action: level === "rendah" ? "Pertahankan keterisian wadah dan jadwalkan pembersihan rutin." : "Isi wadah yang belum penuh dan pastikan semua air dapat diambil tanpa listrik.",
    };
  }

  // Risiko kualitas air minum
  let drinkRisk: RiskAssessment;
  if (daily <= 0 || dailyDrinking <= 0 || targetDays <= 0) {
    drinkRisk = { level: "belum_diketahui", explanation: "Kebutuhan air minum belum dapat dihitung.", action: "Lengkapi profil rumah dan kebutuhan air minum." };
  } else if (drinkingStockTotal <= 0) {
    drinkRisk = {
      level: "tinggi",
      explanation: "Belum ada cadangan air yang diperuntukkan khusus untuk minum/memasak.",
      action: "Sediakan dan pisahkan cadangan air minum, lalu verifikasi kualitasnya dengan cara yang Anda percayai.",
    };
  } else {
    const ratio = (drinkingEndurance ?? 0) / targetDays;
    let level: RiskLevel = ratio >= 1 ? "rendah" : ratio >= 0.5 ? "sedang" : "tinggi";
    let explanation: string;
    if (drinkingVerifiedAccessible <= 0) {
      explanation = "Cadangan air minum ada, tetapi belum ada yang Anda tandai terverifikasi sehingga belum dihitung sebagai air minum. Ini bukan berarti airnya tidak aman — hanya belum terverifikasi.";
    } else if (ratio >= 1) {
      explanation = "Cadangan air minum terverifikasi mencukupi target.";
    } else {
      explanation = `Cadangan air minum terverifikasi baru ${Math.round(ratio * 100)}% dari kebutuhan selama target.`;
    }
    if (drinkingUnverified > 0 && drinkingVerifiedAccessible > 0) {
      explanation += ` Sebanyak ${Math.round(drinkingUnverified)} liter air minum/masak belum terverifikasi dan tidak dihitung.`;
    }
    if (a.drinking.storageHygiene === "buruk" || a.drinking.containerCondition === "buruk") {
      level = bump(level, 1);
      explanation += " Kebersihan/kondisi wadah air minum dilaporkan buruk.";
    }
    drinkRisk = {
      level,
      explanation,
      action: level === "rendah" ? "Pertahankan, dan rotasi cadangan air minum secara berkala." : "Tambah dan verifikasi cadangan air minum agar mencukupi target; ikuti panduan kesehatan setempat.",
    };
  }

  const risks: RiskEntry[] = [
    { id: "sumber", label: "Risiko sumber air", ...src },
    { id: "penyimpanan", label: "Risiko penyimpanan", ...storage },
    { id: "pompa", label: "Risiko pompa/listrik", ...pump },
    { id: "distribusi", label: "Risiko distribusi", ...dist },
    { id: "air_minum", label: "Risiko kualitas air minum", ...drinkRisk },
  ];

  /* ---------- Dimensi & status ---------- */
  const missing: string[] = [];
  if (occupants < 1) missing.push("Jumlah penghuni belum diisi");
  if (targetDays <= 0) missing.push("Target ketahanan belum diisi");
  if (a.storage.length === 0) missing.push("Belum ada wadah penyimpanan");
  if (unknownAccessTotal > 0) missing.push("Akses air saat listrik padam belum diketahui untuk sebagian wadah");
  if (pump.level === "belum_diketahui") missing.push("Ketergantungan pada pompa/listrik belum diketahui");

  let volumeDim: Dimension;
  if (occupants < 1 || targetDays <= 0 || a.storage.length === 0) {
    volumeDim = { id: "volume", label: "Kecukupan volume", status: "belum_lengkap", detail: "Data penghuni, target, atau wadah belum lengkap." };
  } else {
    const ratio = accessibleTotal / tDemand;
    volumeDim = {
      id: "volume",
      label: "Kecukupan volume",
      status: ratio >= 1 ? "baik" : ratio >= 0.5 ? "perhatian" : "kurang",
      detail:
        ratio >= 1
          ? `Cukup untuk target ${targetDays} hari.`
          : `Baru ${Math.round(ratio * 100)}% dari kebutuhan ${targetDays} hari.`,
    };
  }

  // Akses = pompa, distribusi, dan sumber (sumber yang belum diketahui tidak menahan status).
  const accessWorst = worstOf([pump.level, dist.level, src.level === "belum_diketahui" ? "rendah" : src.level]);
  const anyAccessUnknown = [pump.level, dist.level].includes("belum_diketahui");
  const accessDim: Dimension = {
    id: "akses",
    label: "Keandalan akses",
    status:
      accessWorst === "tinggi"
        ? "kurang"
        : accessWorst === "sedang"
          ? "perhatian"
          : anyAccessUnknown
            ? "belum_lengkap"
            : "baik",
    detail:
      accessWorst === "tinggi"
        ? "Ada risiko tinggi pada akses air saat gangguan."
        : accessWorst === "sedang"
          ? "Ada risiko sedang pada akses air."
          : anyAccessUnknown
            ? "Sebagian aspek akses belum diketahui."
            : "Akses air tampak andal berdasarkan data.",
  };

  const qualityDim: Dimension = {
    id: "kualitas",
    label: "Verifikasi air minum",
    status:
      drinkRisk.level === "tinggi"
        ? "kurang"
        : drinkRisk.level === "sedang"
          ? "perhatian"
          : drinkRisk.level === "belum_diketahui"
            ? "belum_lengkap"
            : "baik",
    detail: drinkRisk.explanation,
  };

  const dimensions = [volumeDim, accessDim, qualityDim];

  let status: ReadinessStatus;
  const hardIncomplete = occupants < 1 || targetDays <= 0 || a.storage.length === 0;
  if (hardIncomplete) status = "data_belum_lengkap";
  else if (dimensions.some((d) => d.status === "kurang")) status = "belum_siap";
  else if (dimensions.some((d) => d.status === "belum_lengkap") || unknownAccessTotal > 0) status = "data_belum_lengkap";
  else if (dimensions.some((d) => d.status === "perhatian")) status = "perlu_perhatian";
  else status = "siap";

  const statusSummary = {
    siap: "Berdasarkan data yang dimasukkan, volume, akses, dan verifikasi air minum memenuhi target. Ini bukan jaminan keselamatan.",
    perlu_perhatian: "Sebagian aspek masih perlu diperbaiki agar siap menghadapi gangguan.",
    belum_siap: "Ada aspek yang belum memenuhi target. Lihat rekomendasi prioritas di bawah.",
    data_belum_lengkap: "Data belum cukup untuk menyimpulkan kesiapan. Lengkapi data yang masih kosong atau belum diketahui.",
  }[status];

  /* ---------- Peringatan ---------- */
  const warnings: Warning[] = [];
  if (hardIncomplete) warnings.push({ id: "incomplete", level: "perhatian", text: "Data belum lengkap — hasil perhitungan belum dapat diandalkan." });
  if (!hardIncomplete && short > 0) {
    warnings.push({ id: "shortage", level: accessibleTotal / tDemand < 0.5 ? "kritis" : "perhatian", text: `Kekurangan air sekitar ${Math.ceil(short)} liter untuk target ${targetDays} hari.` });
  }
  if (!hardIncomplete && pump.level === "tinggi") {
    warnings.push({ id: "pump", level: "kritis", text: "Akses air sangat bergantung pada pompa/listrik tanpa jalur cadangan terkonfirmasi." });
  }
  if (!hardIncomplete && drinkingVerifiedAccessible <= 0) {
    warnings.push({ id: "drink", level: "kritis", text: "Belum ada air minum terverifikasi yang dapat dihitung. Air umum tidak dianggap layak minum." });
  } else if (!hardIncomplete && drinkShort > 0) {
    warnings.push({ id: "drinkshort", level: "perhatian", text: `Air minum terverifikasi kurang sekitar ${Math.ceil(drinkShort)} liter untuk target.` });
  }
  if (unknownAccessTotal > 0) {
    warnings.push({ id: "unknownaccess", level: "perhatian", text: `${Math.round(unknownAccessTotal)} liter belum diketahui bisa diakses saat listrik padam, sehingga tidak dihitung.` });
  }
  // Konsistensi data: toren ditandai bisa diakses tanpa listrik padahal pompa tidak punya cadangan.
  const tankClaimsAccess = a.storage.some((u) => u.type === "toren" && u.accessDuringOutage === "ya");
  if (tankClaimsAccess && pump.level === "tinggi") {
    warnings.push({ id: "consistency", level: "info", text: "Toren ditandai bisa diakses saat listrik padam, padahal pompa bergantung listrik tanpa cadangan. Pastikan memang ada keran/akses di toren yang tidak memerlukan pompa." });
  }

  return {
    rows,
    physicalTotal,
    effectiveTotal,
    accessibleTotal,
    unknownAccessTotal,
    drinkingStockTotal,
    drinkingAccessible,
    drinkingVerifiedAccessible,
    drinkingUnverified,
    dailyDemand: daily,
    dailyDrinkingDemand: dailyDrinking,
    targetDays,
    targetDemand: tDemand,
    targetDrinkingDemand: tDrinkingDemand,
    totalEndurance,
    totalEnduranceIfAllAccessible,
    drinkingEndurance,
    shortage: short,
    surplus: sur,
    drinkingShortage: drinkShort,
    headroom,
    composition,
    risks,
    dimensions,
    audit: summarizeAudit(a.audit),
    status,
    statusSummary,
    warnings,
    missing,
    budgetTotal: a.budget.reduce((acc, b) => acc + safeNumber(b.amountIdr), 0),
  };
}

export { levelFromPoints };

export const STATUS_LABEL: Record<ReadinessStatus, string> = {
  siap: "Siap",
  perlu_perhatian: "Perlu Perhatian",
  belum_siap: "Belum Siap",
  data_belum_lengkap: "Data Belum Lengkap",
};

export const RISK_LABEL: Record<RiskLevel, string> = {
  rendah: "Rendah",
  sedang: "Sedang",
  tinggi: "Tinggi",
  belum_diketahui: "Belum diketahui",
};
