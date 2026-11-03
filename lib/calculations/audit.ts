import type { AuditAnswers } from "@/types/assessment";

export type AuditStatus = "baik" | "cukup" | "kurang" | "belum_lengkap";

export interface AuditSummary {
  total: number;
  relevant: number;
  sudah: number;
  belum: number;
  belumDiperiksa: number;
  tidakRelevan: number;
  /** Porsi butir relevan yang sudah diperiksa (jawaban bukan "belum diperiksa"). */
  checkedRatio: number;
  /** Porsi butir relevan yang sudah terpenuhi. */
  doneRatio: number;
  status: AuditStatus;
}

/**
 * Metodologi (transparan):
 * - Butir "Tidak relevan" dikeluarkan dari perhitungan.
 * - Bila < 50% butir relevan sudah diperiksa → "belum_lengkap".
 * - Selain itu: ≥ 80% terpenuhi → "baik", ≥ 50% → "cukup", sisanya "kurang".
 */
export function summarizeAudit(answers: AuditAnswers): AuditSummary {
  const values = Object.values(answers);
  const total = values.length;
  const tidakRelevan = values.filter((v) => v === "tidak_relevan").length;
  const sudah = values.filter((v) => v === "sudah").length;
  const belum = values.filter((v) => v === "belum").length;
  const belumDiperiksa = values.filter((v) => v === "belum_diperiksa").length;
  const relevant = total - tidakRelevan;

  const checkedRatio = relevant === 0 ? 1 : (sudah + belum) / relevant;
  const doneRatio = relevant === 0 ? 1 : sudah / relevant;

  let status: AuditStatus;
  if (relevant > 0 && checkedRatio < 0.5) status = "belum_lengkap";
  else if (doneRatio >= 0.8) status = "baik";
  else if (doneRatio >= 0.5) status = "cukup";
  else status = "kurang";

  return { total, relevant, sudah, belum, belumDiperiksa, tidakRelevan, checkedRatio, doneRatio, status };
}

export const AUDIT_STATUS_LABEL: Record<AuditStatus, string> = {
  baik: "Baik",
  cukup: "Cukup",
  kurang: "Perlu perbaikan",
  belum_lengkap: "Belum lengkap diperiksa",
};
