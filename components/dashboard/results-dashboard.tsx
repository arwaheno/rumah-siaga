"use client";

import Link from "next/link";
import { AlertTriangle, CalendarClock, Droplet, Droplets, Gauge, Info, ListChecks, Target, Users, XCircle } from "lucide-react";
import { useAssessment } from "@/lib/state/assessment-context";
import { formatDays, formatLiters, formatNumber } from "@/lib/formatting";
import { STATUS_LABEL } from "@/lib/calculations";
import { DimensionBadge, RiskBadge, STATUS_STYLE, StatusIcon } from "@/components/ui/badges";
import { EmptyState, SectionCard, Stat } from "@/components/ui/misc";
import { DemandBars, EnduranceBars, StockDonut } from "@/components/charts/charts";
import { cn } from "@/lib/utils";

export function ResultsDashboard() {
  const { ready, draft, results: r, recommendations } = useAssessment();

  if (!ready) return <div className="card h-64 animate-pulse bg-white" aria-busy="true" aria-label="Memuat hasil" />;

  const empty = draft.profile.occupants < 1 && draft.storage.length === 0;
  if (empty) {
    return (
      <EmptyState
        icon={<Gauge className="h-9 w-9" />}
        title="Belum ada data untuk dihitung"
        description="Isi profil rumah dan penyimpanan air terlebih dahulu. Hasil, grafik, dan rekomendasi akan muncul di sini."
        href="/calculator"
        cta="Mulai Perhitungan"
      />
    );
  }

  const st = STATUS_STYLE[r.status];
  const enduranceTone = r.totalEndurance === null ? "default" : r.totalEndurance >= r.targetDays ? "good" : r.totalEndurance >= r.targetDays / 2 ? "warn" : "bad";

  return (
    <div className="space-y-5">
      {/* Status kesiapan */}
      <section className={cn("rounded-xl2 border p-5", st.bg, st.border)} aria-labelledby="status-title">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3 lg:w-80 lg:shrink-0">
            <span className={st.text}>
              <StatusIcon status={r.status} className="h-10 w-10" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Status kesiapan</p>
              <h2 id="status-title" className={cn("text-2xl font-extrabold", st.text)}>
                {STATUS_LABEL[r.status]}
              </h2>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-ink">{r.statusSummary}</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-3">
              {r.dimensions.map((d) => (
                <li key={d.id} className="rounded-lg bg-white/80 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-navy">{d.label}</span>
                    <DimensionBadge status={d.status} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{d.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-xs text-ink-muted">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          Status ditentukan dari tiga dimensi terpisah (volume, akses, verifikasi air minum), bukan satu skor. Volume yang cukup tidak otomatis berarti siap. Ini bukan jaminan keselamatan.
        </p>
      </section>

      {/* Kartu ringkasan */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat icon={<Droplets className="h-4 w-4 text-teal" aria-hidden />} label="Stok air efektif" value={formatLiters(r.effectiveTotal)} sub={`Bisa diakses saat listrik padam: ${formatLiters(r.accessibleTotal)}`} />
        <Stat icon={<Droplet className="h-4 w-4 text-teal" aria-hidden />} label="Stok air minum" value={formatLiters(r.drinkingVerifiedAccessible)} sub={`Terverifikasi. Total minum/masak: ${formatLiters(r.drinkingStockTotal)}`} tone={r.drinkingVerifiedAccessible > 0 ? "default" : "bad"} />
        <Stat icon={<Users className="h-4 w-4 text-teal" aria-hidden />} label="Kebutuhan harian" value={`${formatNumber(r.dailyDemand)} L/hari`} sub={`${formatNumber(draft.profile.occupants)} orang × ${formatNumber(draft.profile.litersPerPersonPerDay, 1)} L`} />
        <Stat icon={<CalendarClock className="h-4 w-4 text-teal" aria-hidden />} label="Estimasi ketahanan" value={formatDays(r.totalEndurance)} sub={r.totalEnduranceIfAllAccessible !== null && r.totalEnduranceIfAllAccessible !== r.totalEndurance ? `Jika semua air bisa diakses: ${formatDays(r.totalEnduranceIfAllAccessible)}` : "Berdasarkan air yang bisa diakses"} tone={enduranceTone} />
        <Stat icon={<Target className="h-4 w-4 text-teal" aria-hidden />} label="Target ketahanan" value={`${formatNumber(r.targetDays, 1)} hari`} sub={`Air minum: ${formatDays(r.drinkingEndurance)}`} />
      </div>

      {/* Peringatan */}
      {r.warnings.length > 0 && (
        <SectionCard title="Peringatan penting" icon={<AlertTriangle className="h-4.5 w-4.5 text-warn-text" aria-hidden />}>
          <ul className="space-y-2">
            {r.warnings.map((w) => (
              <li key={w.id} className={cn("flex items-start gap-2 rounded-lg px-3 py-2 text-sm", w.level === "kritis" ? "bg-danger-soft text-danger" : w.level === "perhatian" ? "bg-warn-soft text-warn-text" : "bg-teal-soft text-navy")}>
                {w.level === "kritis" ? <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
                {w.text}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {/* Grafik */}
      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Komposisi stok air">
          <StockDonut composition={r.composition} total={r.effectiveTotal} />
        </SectionCard>
        <SectionCard title="Kebutuhan vs ketersediaan">
          <DemandBars r={r} />
          <p className="mt-1 text-xs text-ink-muted">Kebutuhan = penghuni × L/orang/hari × target hari (asumsi pengguna). Tersedia = volume efektif yang terkonfirmasi bisa diakses.</p>
        </SectionCard>
      </div>
      <SectionCard title="Estimasi ketahanan">
        <EnduranceBars r={r} />
        <p className="mt-1 text-xs text-ink-muted">
          Batang hijau-biru adalah hasil hitung dari data Anda; batang abu-abu dan garis merah putus-putus adalah target pilihan Anda (asumsi).
        </p>
      </SectionCard>

      {/* Risiko */}
      <SectionCard title="Panel risiko">
        <ul className="divide-y divide-line">
          {r.risks.map((x) => (
            <li key={x.id} className="grid gap-1 py-3 sm:grid-cols-[200px_1fr] sm:gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-navy">{x.label}</span>
                <RiskBadge level={x.level} />
              </div>
              <div className="text-sm">
                <p className="text-ink">{x.explanation}</p>
                <p className="mt-0.5 text-ink-muted">
                  <b className="text-navy">Tindakan:</b> {x.action}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Rekomendasi */}
      <SectionCard title="Rekomendasi prioritas" icon={<ListChecks className="h-5 w-5 text-teal" aria-hidden />}>
        <ol className="space-y-3">
          {recommendations.map((rec, i) => (
            <li key={rec.id} className="flex gap-3">
              <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white", rec.priority === 1 ? "bg-danger" : rec.priority === 2 ? "bg-warn text-navy-dark" : "bg-teal")}>
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-bold text-navy">
                  {rec.title}
                  <span className="ml-2 text-[11px] font-semibold text-ink-muted">Prioritas {rec.priority}</span>
                </p>
                <p className="text-sm text-ink-muted">{rec.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        {r.budgetTotal > 0 && (
          <p className="mt-4 rounded-lg bg-surface px-3 py-2 text-sm text-ink">
            Total perkiraan anggaran yang Anda masukkan: <b>Rp{formatNumber(r.budgetTotal)}</b>.
          </p>
        )}
      </SectionCard>

      <p className="text-center text-xs text-ink-muted">
        Hasil bergantung pada data dan asumsi yang Anda masukkan. Lihat <Link href="/assumptions" className="font-semibold text-teal underline">Asumsi & Referensi</Link> untuk metodologi dan batasan.
      </p>
    </div>
  );
}
