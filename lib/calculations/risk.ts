import type {
  DistributionAssessment,
  PumpAssessment,
  RiskLevel,
  WaterSource,
} from "@/types/assessment";

const ORDER: RiskLevel[] = ["rendah", "sedang", "tinggi"];

export function levelFromPoints(points: number): Exclude<RiskLevel, "belum_diketahui"> {
  if (points <= 0) return "rendah";
  if (points === 1) return "sedang";
  return "tinggi";
}

export function bump(level: RiskLevel, by: number): RiskLevel {
  if (level === "belum_diketahui") return level;
  const i = Math.max(0, Math.min(2, ORDER.indexOf(level) + by));
  return ORDER[i];
}

export function worstOf(levels: RiskLevel[]): RiskLevel {
  if (levels.includes("tinggi")) return "tinggi";
  if (levels.includes("sedang")) return "sedang";
  if (levels.includes("belum_diketahui")) return "belum_diketahui";
  return "rendah";
}

export interface RiskAssessment {
  level: RiskLevel;
  explanation: string;
  action: string;
}

/* ------------------------------- Pompa & listrik ------------------------------ */

export function pumpRisk(p: PumpAssessment): RiskAssessment {
  const hasNoPump = p.hasPump === "tidak" || p.pumpType === "tidak_ada";

  if (!hasNoPump && p.powerDependency === "belum_diketahui") {
    return {
      level: "belum_diketahui",
      explanation: "Belum diketahui apakah air Anda bergantung pada listrik/pompa.",
      action: "Periksa apakah keran masih mengalir saat listrik dipadamkan sebentar, lalu isi kembali datanya.",
    };
  }

  const depends = !hasNoPump && (p.powerDependency === "bergantung" || p.powerDependency === "sebagian");
  const mitigations =
    (p.backupPower === "ya" ? 1 : 0) + (p.gravityFed === "ya" ? 1 : 0) + (p.alternativeAccess === "ya" ? 1 : 0);
  const unconfirmed = [p.backupPower, p.gravityFed, p.alternativeAccess].filter((v) => v === "belum_diketahui").length;

  let level: RiskLevel;
  let explanation: string;

  if (!depends) {
    level = "rendah";
    explanation = hasNoPump
      ? "Tidak ada pompa; ketersediaan air tidak bergantung pada pompa listrik."
      : "Pasokan air tidak bergantung pada listrik.";
  } else if (p.powerDependency === "bergantung") {
    if (mitigations === 0) {
      level = "tinggi";
      explanation = "Air bergantung pada pompa/listrik dan belum ada akses cadangan yang terkonfirmasi (listrik cadangan, gravitasi, atau akses alternatif).";
    } else if (mitigations === 1) {
      level = "sedang";
      explanation = "Air bergantung pada pompa/listrik, tetapi ada satu jalur cadangan yang terkonfirmasi.";
    } else {
      level = "rendah";
      explanation = "Air bergantung pada pompa/listrik, namun ada lebih dari satu jalur cadangan terkonfirmasi.";
    }
  } else {
    // sebagian
    if (mitigations === 0) {
      level = "sedang";
      explanation = "Sebagian akses air bergantung pada listrik dan belum ada jalur cadangan terkonfirmasi.";
    } else {
      level = "rendah";
      explanation = "Sebagian akses air bergantung pada listrik, tetapi ada jalur cadangan terkonfirmasi.";
    }
  }

  if (depends || !hasNoPump) {
    if (p.pumpStatus === "tidak_berfungsi") {
      level = bump(level, 2);
      explanation += " Pompa dilaporkan tidak berfungsi.";
    } else if (p.pumpStatus === "bermasalah") {
      level = bump(level, 1);
      explanation += " Pompa dilaporkan bermasalah.";
    }
  }
  if (depends && p.operationKnowledge === "tidak") {
    level = bump(level, 1);
    explanation += " Belum ada anggota keluarga yang memahami cara mengoperasikan pompa.";
  }
  if (depends && unconfirmed > 0 && level !== "tinggi") {
    explanation += " Beberapa jalur cadangan belum dipastikan.";
  }

  const action =
    level === "rendah"
      ? "Pertahankan, dan uji jalur cadangan secara berkala."
      : "Siapkan cara mengambil air saat listrik padam (misalnya wadah cadangan yang terisi atau keran yang bisa diakses tanpa pompa). Perubahan instalasi listrik/pompa sebaiknya dikerjakan teknisi berkompeten.";

  return { level, explanation, action };
}

/* -------------------------------- Distribusi -------------------------------- */

export function distributionRisk(d: DistributionAssessment): RiskAssessment {
  const unknowns = [
    d.pipeCondition === "belum_diperiksa",
    d.leakage === "belum_diperiksa",
    d.storageAccessibility === "belum_diketahui",
    d.distributeWithoutPower === "belum_diketahui",
  ].filter(Boolean).length;

  let points = 0;
  let severe = false;
  const notes: string[] = [];
  /** Temuan berat bernilai 2 poin dan sendirian cukup untuk risiko tinggi; temuan ringan bernilai 1. */
  const add = (weight: 1 | 2, note: string) => {
    points += weight;
    if (weight === 2) severe = true;
    notes.push(note);
  };

  if (d.pipeCondition === "buruk") add(2, "kondisi pipa buruk");
  else if (d.pipeCondition === "cukup") add(1, "kondisi pipa cukup");

  if (d.leakage === "signifikan") add(2, "ada kebocoran signifikan");
  else if (d.leakage === "kecil") add(1, "ada kebocoran kecil");

  // Nilai bawaan 0 ambigu: bila sebagian besar aspek lain belum diperiksa, anggap formulir belum diisi.
  if (d.usableTaps <= 0) {
    if (unknowns < 3) add(2, "tidak ada keran yang dapat dipakai");
  }
  else if (d.usableTaps === 1) add(1, "hanya satu keran dapat dipakai");

  if (d.storageAccessibility === "tidak_bisa") add(2, "wadah air tidak bisa dijangkau");
  else if (d.storageAccessibility === "sulit") add(1, "wadah air sulit dijangkau");

  if (d.distributeWithoutPower === "tidak") add(2, "air tidak dapat disalurkan tanpa listrik");
  else if (d.distributeWithoutPower === "sebagian") add(1, "penyaluran tanpa listrik hanya sebagian");

  if (unknowns >= 3 && points < 2) {
    return {
      level: "belum_diketahui",
      explanation: "Sebagian besar aspek distribusi belum diperiksa.",
      action: "Periksa kondisi pipa, kebocoran, dan akses ke wadah air, lalu isi kembali datanya.",
    };
  }

  // Tinggi: ada temuan berat, atau akumulasi temuan ringan >= 3 poin. Dua temuan ringan = sedang.
  const level: RiskLevel = points === 0 ? "rendah" : severe || points >= 3 ? "tinggi" : "sedang";
  const explanation =
    notes.length > 0
      ? `Temuan: ${notes.join(", ")}.`
      : "Jalur distribusi dalam kondisi baik berdasarkan data yang dimasukkan.";
  const action =
    level === "rendah"
      ? "Lakukan pengecekan rutin pipa, keran, dan sambungan."
      : "Periksa dan perbaiki bagian yang bermasalah (kebocoran, keran, atau akses ke wadah) agar air mudah disalurkan.";
  return { level, explanation, action };
}

/* ---------------------------------- Sumber ---------------------------------- */

export function sourcesRisk(sources: WaterSource[]): RiskAssessment {
  const usable = sources.filter((s) => s.role !== "tersimpan" && s.availability !== "tidak_tersedia");
  if (sources.length === 0) {
    return {
      level: "belum_diketahui",
      explanation: "Belum ada sumber air yang dicatat.",
      action: "Catat sumber air yang Anda miliki (PDAM, sumur, air hujan, atau lainnya).",
    };
  }
  if (usable.length === 0) {
    return {
      level: "tinggi",
      explanation: "Tidak ada sumber air kontinu atau alternatif yang tersedia selain air yang sudah tersimpan.",
      action: "Identifikasi setidaknya satu sumber air alternatif yang realistis dan dapat dijangkau.",
    };
  }

  const best = usable.some((s) => s.reliability === "tinggi" && s.availability === "tersedia")
    ? "tinggi"
    : usable.some((s) => s.reliability === "sedang")
      ? "sedang"
      : usable.some((s) => s.reliability === "rendah")
        ? "rendah"
        : "belum_diketahui";

  if (best === "belum_diketahui") {
    return {
      level: "belum_diketahui",
      explanation: "Keandalan sumber air belum diketahui.",
      action: "Catat seberapa sering sumber air Anda tersedia atau terputus.",
    };
  }

  let points = best === "tinggi" ? 0 : best === "sedang" ? 1 : 2;
  const notes: string[] = [];
  const distinctTypes = new Set(usable.map((s) => s.type));
  if (distinctTypes.size >= 2 && points > 0) { points -= 1; notes.push("ada lebih dari satu jenis sumber"); }
  if (usable.every((s) => s.dependsOnElectricity === "ya") && points < 2) {
    points += 1;
    notes.push("semua sumber bergantung pada listrik");
  }

  const level = levelFromPoints(points);
  const explanation =
    `Keandalan sumber terbaik: ${best}.` + (notes.length ? ` Catatan: ${notes.join("; ")}.` : "");
  const action =
    level === "rendah"
      ? "Pertahankan, dan pastikan sumber cadangan tetap dapat dijangkau."
      : "Cari sumber cadangan yang tidak bergantung pada listrik atau pada satu penyedia saja.";
  return { level, explanation, action };
}
