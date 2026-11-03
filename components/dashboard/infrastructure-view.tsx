"use client";

import Link from "next/link";
import { Pencil, Settings2, Workflow } from "lucide-react";
import { useAssessment } from "@/lib/state/assessment-context";
import { RiskBadge } from "@/components/ui/badges";
import { SectionCard } from "@/components/ui/misc";
import { pumpRisk, distributionRisk } from "@/lib/calculations";

export const PUMP_LABELS = {
  hasPump: { ya: "Ada", tidak: "Tidak ada", belum_diketahui: "Belum diketahui" },
  pumpType: { listrik: "Pompa listrik", manual: "Pompa manual", lainnya: "Lainnya", tidak_ada: "Tidak ada pompa" },
  powerDependency: { bergantung: "Bergantung penuh", sebagian: "Sebagian bergantung", tidak_bergantung: "Tidak bergantung", belum_diketahui: "Belum diketahui" },
  yn: { ya: "Ya", tidak: "Tidak", belum_diketahui: "Belum diketahui" },
  pumpStatus: { baik: "Berfungsi baik", bermasalah: "Bermasalah", tidak_berfungsi: "Tidak berfungsi", belum_diperiksa: "Belum diperiksa" },
  operationKnowledge: { semua: "Semua dewasa paham", sebagian: "Sebagian paham", tidak: "Belum ada yang paham", belum_diketahui: "Belum diketahui" },
} as const;

export const DIST_LABELS = {
  mainPath: { toren_gravitasi: "Toren di atas → keran (gravitasi)", pompa_langsung: "Pompa → keran", pdam_langsung: "PDAM langsung", manual: "Diangkut manual", lainnya: "Lainnya" },
  pipeCondition: { baik: "Baik", cukup: "Cukup", buruk: "Buruk", belum_diperiksa: "Belum diperiksa" },
  leakage: { tidak_ada: "Tidak ada", kecil: "Kecil", signifikan: "Signifikan", belum_diperiksa: "Belum diperiksa" },
  storageAccessibility: { mudah: "Mudah dijangkau", sulit: "Sulit dijangkau", tidak_bisa: "Tidak bisa dijangkau", belum_diketahui: "Belum diketahui" },
  distributeWithoutPower: { ya: "Ya, ke semua titik", sebagian: "Sebagian titik", tidak: "Tidak bisa", belum_diketahui: "Belum diketahui" },
} as const;

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line/70 py-2 text-sm last:border-0">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right font-semibold text-navy">{value}</dd>
    </div>
  );
}

export function InfrastructureView() {
  const { ready, draft } = useAssessment();
  if (!ready) return <div className="card h-48 animate-pulse bg-white" aria-busy="true" />;

  const p = draft.pump;
  const d = draft.distribution;
  const pr = pumpRisk(p);
  const dr = distributionRisk(d);
  const yn = PUMP_LABELS.yn;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <SectionCard
        title="Pompa & listrik"
        icon={<Settings2 className="h-5 w-5 text-teal" aria-hidden />}
        action={
          <Link href="/calculator?step=4" className="btn-secondary px-3 py-1.5 text-xs">
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            Ubah
          </Link>
        }
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <RiskBadge level={pr.level} />
          <span className="text-xs text-ink-muted">{pr.explanation}</span>
        </div>
        <dl>
          <Row label="Pompa utama" value={PUMP_LABELS.hasPump[p.hasPump]} />
          <Row label="Jenis pompa" value={PUMP_LABELS.pumpType[p.pumpType]} />
          <Row label="Ketergantungan listrik" value={PUMP_LABELS.powerDependency[p.powerDependency]} />
          <Row label="Listrik cadangan" value={yn[p.backupPower]} />
          <Row label="Akses alternatif tanpa listrik" value={yn[p.alternativeAccess]} />
          <Row label="Distribusi gravitasi" value={yn[p.gravityFed]} />
          <Row label="Kondisi pompa" value={PUMP_LABELS.pumpStatus[p.pumpStatus]} />
          <Row label="Pemahaman operasi pompa" value={PUMP_LABELS.operationKnowledge[p.operationKnowledge]} />
        </dl>
        <p className="mt-3 text-xs text-ink-muted"><b className="text-navy">Tindakan:</b> {pr.action}</p>
      </SectionCard>

      <SectionCard
        title="Distribusi air"
        icon={<Workflow className="h-5 w-5 text-teal" aria-hidden />}
        action={
          <Link href="/calculator?step=5" className="btn-secondary px-3 py-1.5 text-xs">
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            Ubah
          </Link>
        }
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <RiskBadge level={dr.level} />
          <span className="text-xs text-ink-muted">{dr.explanation}</span>
        </div>
        <dl>
          <Row label="Jalur utama" value={DIST_LABELS.mainPath[d.mainPath]} />
          <Row label="Kondisi pipa" value={DIST_LABELS.pipeCondition[d.pipeCondition]} />
          <Row label="Kebocoran" value={DIST_LABELS.leakage[d.leakage]} />
          <Row label="Keran yang bisa dipakai" value={`${d.usableTaps} keran`} />
          <Row label="Akses ke wadah" value={DIST_LABELS.storageAccessibility[d.storageAccessibility]} />
          <Row label="Aliran gravitasi ke keran" value={yn[d.gravityAccess]} />
          <Row label="Distribusi tanpa listrik" value={DIST_LABELS.distributeWithoutPower[d.distributeWithoutPower]} />
        </dl>
        <p className="mt-3 text-xs text-ink-muted"><b className="text-navy">Tindakan:</b> {dr.action}</p>
      </SectionCard>
    </div>
  );
}
