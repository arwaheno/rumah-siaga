"use client";

import Link from "next/link";
import { Container, Pencil, Waves } from "lucide-react";
import { useAssessment } from "@/lib/state/assessment-context";
import { HOUSING_LABEL, SOURCE_TYPE_LABEL, STORAGE_TYPE_LABEL } from "@/lib/constants";
import { formatLiters, formatNumber } from "@/lib/formatting";
import { EmptyState, SectionCard } from "@/components/ui/misc";
import { StockDonut } from "@/components/charts/charts";

export const USE_LABEL = { minum: "Air minum", memasak: "Memasak", umum: "Umum", sanitasi: "Sanitasi" } as const;
export const QUALITY_LABEL = { terverifikasi: "Terverifikasi (oleh pengguna)", belum_diverifikasi: "Belum diverifikasi", bukan_untuk_diminum: "Bukan untuk diminum" } as const;
export const ACCESS_LABEL = { ya: "Ya", tidak: "Tidak", belum_diketahui: "Belum diketahui" } as const;
export const ROLE_LABEL = { kontinu: "Pasokan berkelanjutan", alternatif: "Sumber alternatif", tersimpan: "Air tersimpan" } as const;
export const AVAIL_LABEL = { tersedia: "Tersedia", terbatas: "Terbatas", tidak_tersedia: "Tidak tersedia" } as const;
export const REL_LABEL = { tinggi: "Tinggi", sedang: "Sedang", rendah: "Rendah", belum_diketahui: "Belum diketahui" } as const;

export function InventoryView() {
  const { ready, draft, results: r } = useAssessment();
  if (!ready) return <div className="card h-48 animate-pulse bg-white" aria-busy="true" />;

  return (
    <div className="space-y-5">
      <SectionCard
        title="Inventaris penyimpanan air"
        icon={<Container className="h-5 w-5 text-teal" aria-hidden />}
        action={
          <Link href="/calculator?step=3" className="btn-secondary px-3 py-1.5 text-xs">
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            Ubah
          </Link>
        }
      >
        {r.rows.length === 0 ? (
          <EmptyState title="Belum ada wadah penyimpanan" description="Tambahkan toren, galon, jeriken, atau wadah lain di Langkah 3 kalkulator." href="/calculator?step=3" cta="Tambah penyimpanan" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-bold uppercase tracking-wide text-ink-muted">
                  <th className="py-2 pr-3">No</th>
                  <th className="py-2 pr-3">Wadah</th>
                  <th className="py-2 pr-3 text-right">Kapasitas (L)</th>
                  <th className="py-2 pr-3 text-right">Terisi (L)</th>
                  <th className="py-2 pr-3 text-right">Efektif (L)</th>
                  <th className="py-2 pr-3">Peruntukan</th>
                  <th className="py-2">Akses saat listrik padam</th>
                </tr>
              </thead>
              <tbody>
                {r.rows.map((row, i) => (
                  <tr key={row.id} className="border-b border-line/70">
                    <td className="py-2.5 pr-3 text-ink-muted">{i + 1}</td>
                    <td className="py-2.5 pr-3 font-semibold text-navy">
                      {row.name}
                      {row.quantity > 1 && <span className="font-normal text-ink-muted"> ({row.quantity} unit)</span>}
                      <span className="block text-xs font-normal text-ink-muted">{STORAGE_TYPE_LABEL[row.type]}</span>
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{formatNumber(row.capacityTotal, 1)}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{formatNumber(row.physicalTotal, 1)}</td>
                    <td className="py-2.5 pr-3 text-right font-semibold tabular-nums">{formatNumber(row.effectiveTotal, 1)}</td>
                    <td className="py-2.5 pr-3">
                      {USE_LABEL[row.intendedUse]}
                      <span className="block text-xs text-ink-muted">{QUALITY_LABEL[row.quality]}</span>
                    </td>
                    <td className="py-2.5">{row.accessible ? "Ya" : row.accessUnknown ? "Belum diketahui" : "Tidak"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-warn-soft/60 font-bold text-navy">
                  <td colSpan={4} className="py-2.5 pl-3">Total volume efektif</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">{formatLiters(r.effectiveTotal)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </SectionCard>

      {r.composition.length > 0 && (
        <SectionCard title="Komposisi air tersedia">
          <StockDonut composition={r.composition} total={r.effectiveTotal} />
        </SectionCard>
      )}

      <SectionCard
        title="Sumber air"
        icon={<Waves className="h-5 w-5 text-teal" aria-hidden />}
        action={
          <Link href="/calculator?step=2" className="btn-secondary px-3 py-1.5 text-xs">
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            Ubah
          </Link>
        }
      >
        {draft.sources.length === 0 ? (
          <p className="text-sm text-ink-muted">Belum ada sumber air yang dicatat.</p>
        ) : (
          <ul className="divide-y divide-line">
            {draft.sources.map((s) => (
              <li key={s.id} className="grid gap-1 py-3 text-sm sm:grid-cols-[220px_1fr]">
                <div>
                  <p className="font-semibold text-navy">{s.name}</p>
                  <p className="text-xs text-ink-muted">{SOURCE_TYPE_LABEL[s.type]} · {ROLE_LABEL[s.role]}</p>
                </div>
                <p className="text-ink-muted">
                  {AVAIL_LABEL[s.availability]} · Keandalan {REL_LABEL[s.reliability].toLowerCase()} · Listrik: {ACCESS_LABEL[s.dependsOnElectricity].toLowerCase()}
                  {s.notes && <span className="block">Catatan: {s.notes}</span>}
                </p>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {draft.profile.houseName && (
        <p className="text-xs text-ink-muted">
          Data untuk: {draft.profile.houseName} ({HOUSING_LABEL[draft.profile.housingType]}, {formatNumber(draft.profile.occupants)} penghuni).
        </p>
      )}
    </div>
  );
}
