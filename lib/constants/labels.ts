import type {
  Availability,
  ConditionStatus,
  DistributionAssessment,
  IntendedUse,
  PumpAssessment,
  QualityStatus,
  Reliability,
  SourceRole,
  TriState,
} from "@/types/assessment";

/** Label tampilan untuk nilai enum (dipakai laporan cetak dan ringkasan). */

export const YNU_LABEL: Record<TriState, string> = {
  ya: "Ya",
  tidak: "Tidak",
  belum_diketahui: "Belum diketahui",
};

export const PUMP_TYPE_LABEL: Record<PumpAssessment["pumpType"], string> = {
  listrik: "Pompa listrik",
  manual: "Pompa manual / tangan",
  lainnya: "Lainnya",
  tidak_ada: "Tidak ada pompa",
};

export const POWER_DEP_LABEL: Record<PumpAssessment["powerDependency"], string> = {
  bergantung: "Bergantung penuh",
  sebagian: "Sebagian bergantung",
  tidak_bergantung: "Tidak bergantung",
  belum_diketahui: "Belum diketahui",
};

export const PUMP_STATUS_LABEL: Record<PumpAssessment["pumpStatus"], string> = {
  baik: "Berfungsi baik",
  bermasalah: "Bermasalah / kadang gagal",
  tidak_berfungsi: "Tidak berfungsi",
  belum_diperiksa: "Belum diperiksa",
};

export const OPERATION_LABEL: Record<PumpAssessment["operationKnowledge"], string> = {
  semua: "Ya, semua dewasa",
  sebagian: "Sebagian saja",
  tidak: "Belum ada yang paham",
  belum_diketahui: "Belum diketahui",
};

export const MAIN_PATH_LABEL: Record<DistributionAssessment["mainPath"], string> = {
  toren_gravitasi: "Toren di atas → keran (gravitasi)",
  pompa_langsung: "Pompa → keran",
  pdam_langsung: "PDAM langsung ke keran",
  manual: "Diangkut manual (ember/jeriken)",
  lainnya: "Lainnya",
};

export const PIPE_LABEL: Record<DistributionAssessment["pipeCondition"], string> = {
  baik: "Baik",
  cukup: "Cukup",
  buruk: "Buruk",
  belum_diperiksa: "Belum diperiksa",
};

export const LEAK_LABEL: Record<DistributionAssessment["leakage"], string> = {
  tidak_ada: "Tidak ada",
  kecil: "Ada, kecil",
  signifikan: "Ada, signifikan",
  belum_diperiksa: "Belum diperiksa",
};

export const STORAGE_ACCESS_LABEL: Record<DistributionAssessment["storageAccessibility"], string> = {
  mudah: "Mudah dijangkau",
  sulit: "Sulit dijangkau",
  tidak_bisa: "Tidak bisa dijangkau",
  belum_diketahui: "Belum diketahui",
};

export const NO_POWER_DIST_LABEL: Record<DistributionAssessment["distributeWithoutPower"], string> = {
  ya: "Ya, ke semua titik",
  sebagian: "Sebagian titik saja",
  tidak: "Tidak bisa",
  belum_diketahui: "Belum diketahui",
};

export const COND_LABEL: Record<ConditionStatus, string> = {
  baik: "Baik",
  cukup: "Cukup",
  buruk: "Buruk",
  belum_diperiksa: "Belum diperiksa",
};

export const QUALITY_LABEL: Record<QualityStatus, string> = {
  terverifikasi: "Terverifikasi (menurut pengguna)",
  belum_diverifikasi: "Belum diverifikasi",
  bukan_untuk_diminum: "Bukan untuk diminum",
};

export const USE_LABEL: Record<IntendedUse, string> = {
  minum: "Air minum",
  memasak: "Memasak",
  umum: "Keperluan umum",
  sanitasi: "Sanitasi",
};

export const SOURCE_ROLE_LABEL: Record<SourceRole, string> = {
  kontinu: "Pasokan berkelanjutan",
  alternatif: "Sumber alternatif",
  tersimpan: "Sudah tersimpan",
};

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  tersedia: "Tersedia",
  terbatas: "Terbatas",
  tidak_tersedia: "Tidak tersedia",
};

export const RELIABILITY_LABEL: Record<Reliability, string> = {
  tinggi: "Tinggi",
  sedang: "Sedang",
  rendah: "Rendah",
  belum_diketahui: "Belum diketahui",
};
