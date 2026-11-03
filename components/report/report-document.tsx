import type { Assessment } from "@/types/assessment";
import type { Recommendation, Results } from "@/lib/calculations";
import { AUDIT_STATUS_LABEL, STATUS_LABEL } from "@/lib/calculations";
import {
  APP_NAME,
  AUDIT_ANSWER_LABEL,
  AUDIT_ITEMS,
  DEMAND_SCENARIOS,
  HOUSING_LABEL,
  SOURCE_TYPE_LABEL,
  STORAGE_TYPE_LABEL,
  TAGLINE,
} from "@/lib/constants";
import {
  AVAILABILITY_LABEL,
  COND_LABEL,
  LEAK_LABEL,
  MAIN_PATH_LABEL,
  NO_POWER_DIST_LABEL,
  OPERATION_LABEL,
  PIPE_LABEL,
  POWER_DEP_LABEL,
  PUMP_STATUS_LABEL,
  PUMP_TYPE_LABEL,
  QUALITY_LABEL,
  RELIABILITY_LABEL,
  SOURCE_ROLE_LABEL,
  STORAGE_ACCESS_LABEL,
  USE_LABEL,
  YNU_LABEL,
} from "@/lib/constants/labels";
import { EDGE_RULES, FORMULAS, LIMITATIONS, REFERENCES, REFERENCES_ACCESSED, SCENARIO_NOTE, STATUS_METHOD } from "@/lib/constants/content";
import { formatDate, formatDays, formatLiters, formatNumber, formatRupiah } from "@/lib/formatting";
import { Logo } from "@/components/layout/logo";
import { DimensionBadge, RiskBadge, STATUS_STYLE } from "@/components/ui/badges";
import { DemandBars, EnduranceBars, StockDonut } from "@/components/charts/charts";
import { cn } from "@/lib/utils";

const TOTAL_PAGES = 4;

interface Props {
  draft: Assessment;
  results: Results;
  recommendations: Recommendation[];
  /** Tanggal pembuatan laporan. */
  date: Date;
}

/* --------------------------------- Primitif --------------------------------- */

function Sheet({ page, house, date, children }: { page: number; house: string; date: Date; children: React.ReactNode }) {
  return (
    <section className="report-sheet" aria-label={`Halaman ${page} dari ${TOTAL_PAGES}`}>
      <header className="mb-3 flex items-start justify-between border-b-2 border-navy pb-2">
        <Logo />
        <div className="text-right">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-navy">Laporan Ketahanan Air Rumah Tangga</p>
          <p className="text-[10px] text-ink-muted">
            {house} · {formatDate(date)}
          </p>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="mt-3 flex items-center justify-between gap-4 border-t border-line pt-1.5 text-[9px] text-ink-muted">
        <span>
          {APP_NAME} · {TAGLINE} Estimasi dari data dan asumsi pengguna; bukan jaminan keselamatan atau kelayakan air.
        </span>
        <span className="shrink-0 font-semibold">
          Halaman {page} dari {TOTAL_PAGES}
        </span>
      </footer>
    </section>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-1.5 mt-3.5 border-l-4 border-teal pl-2 text-[11.5px] font-extrabold uppercase tracking-wide text-navy first:mt-0">
      {children}
    </h2>
  );
}

function KV({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-[3px] text-[10px] leading-snug">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-ink-muted">{k}</dt>
          <dd className="font-semibold text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Kpi({ label, value, sub, tone = "default" }: { label: string; value: React.ReactNode; sub?: string; tone?: "default" | "good" | "warn" | "bad" }) {
  const toneCls = { default: "text-navy", good: "text-brand-green", warn: "text-warn-text", bad: "text-danger" }[tone];
  return (
    <div className="report-avoid-break rounded-lg border border-line px-2.5 py-2">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className={cn("mt-0.5 text-[16px] font-extrabold leading-tight tabular-nums", toneCls)}>{value}</p>
      {sub && <p className="mt-0.5 text-[9px] leading-tight text-ink-muted">{sub}</p>}
    </div>
  );
}

const TH = "bg-navy px-1.5 py-1 text-left text-[9px] font-semibold text-white";
const TD = "border-b border-line px-1.5 py-1 align-top text-[9.5px] leading-snug";

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-dashed border-line px-3 py-2 text-[10px] italic text-ink-muted">{children}</p>;
}

/* ---------------------------------- Dokumen ---------------------------------- */

export function ReportDocument({ draft, results: r, recommendations, date }: Props) {
  const p = draft.profile;
  const house = p.houseName.trim() || "Rumah (tanpa nama)";
  const st = STATUS_STYLE[r.status];
  const risk = (id: Results["risks"][number]["id"]) => r.risks.find((x) => x.id === id)!;

  const scenarioLabel = p.scenario === "custom" ? "Kustom" : DEMAND_SCENARIOS[p.scenario].label;
  const occupantsText = [
    `${formatNumber(p.occupants)} orang`,
    p.children > 0 ? `${formatNumber(p.children)} anak` : null,
    p.elderly > 0 ? `${formatNumber(p.elderly)} lansia` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const enduranceTone = r.totalEndurance === null ? "default" : r.totalEndurance >= r.targetDays ? "good" : r.totalEndurance >= r.targetDays / 2 ? "warn" : "bad";
  const drinkTone = r.drinkingEndurance === null ? "default" : r.drinkingEndurance >= r.targetDays ? "good" : r.drinkingEndurance >= r.targetDays / 2 ? "warn" : "bad";

  const storageTotals = r.rows.reduce(
    (acc, row) => ({ cap: acc.cap + row.capacityTotal, phys: acc.phys + row.physicalTotal, eff: acc.eff + row.effectiveTotal }),
    { cap: 0, phys: 0, eff: 0 },
  );

  const answered = Object.keys(draft.audit).length > 0;
  const budgetItems = draft.budget.filter((b) => b.label.trim() && Number.isFinite(b.amountIdr) && b.amountIdr > 0);
  const budgetTotal = budgetItems.reduce((a, b) => a + b.amountIdr, 0);

  return (
    <div className="print-root">
      {/* ============================ HALAMAN 1 ============================ */}
      <Sheet page={1} house={house} date={date}>
        <H2>Ringkasan Eksekutif</H2>
        <div className="grid grid-cols-2 gap-3">
          <div className="report-avoid-break rounded-lg border border-line p-3">
            <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wide text-navy">Profil rumah</p>
            <KV
              rows={[
                ["Nama rumah", house],
                ...(p.location.trim() ? ([["Lokasi", p.location.trim()]] as [string, string][]) : []),
                ["Jenis hunian", HOUSING_LABEL[p.housingType]],
                ["Penghuni", occupantsText],
                ["Skenario kebutuhan", `${scenarioLabel} · ${formatNumber(p.litersPerPersonPerDay, 1)} L/orang/hari`],
                ["Air minum/masak", `${formatNumber(draft.drinking.litersPerPersonPerDay, 1)} L/orang/hari`],
                ["Target ketahanan", `${formatNumber(r.targetDays, 1)} hari`],
              ]}
            />
          </div>
          <div className={cn("report-avoid-break rounded-lg border p-3", st.bg, st.border)}>
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-muted">Status kesiapan</p>
            <p className={cn("mt-0.5 text-[22px] font-extrabold leading-tight", st.text)}>{STATUS_LABEL[r.status]}</p>
            <p className="mt-1 text-[9.5px] leading-snug text-ink">{r.statusSummary}</p>
            <ul className="mt-2 space-y-1">
              {r.dimensions.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2 text-[9.5px]">
                  <span className="font-semibold text-navy">{d.label}</span>
                  <DimensionBadge status={d.status} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <H2>Ketersediaan &amp; ketahanan</H2>
        <div className="grid grid-cols-4 gap-2">
          <Kpi label="Stok air efektif" value={formatLiters(r.effectiveTotal)} sub={`Terisi fisik ${formatLiters(r.physicalTotal)}`} />
          <Kpi
            label="Bisa diakses saat listrik padam"
            value={formatLiters(r.accessibleTotal)}
            sub={r.unknownAccessTotal > 0 ? `${formatLiters(r.unknownAccessTotal)} akses belum diketahui` : undefined}
            tone={r.effectiveTotal > 0 && r.accessibleTotal < r.effectiveTotal ? "warn" : "default"}
          />
          <Kpi label="Air minum terverifikasi" value={formatLiters(r.drinkingVerifiedAccessible)} sub={`Total minum/masak ${formatLiters(r.drinkingStockTotal)}`} tone={r.drinkingVerifiedAccessible > 0 ? "default" : "bad"} />
          <Kpi label="Kebutuhan harian" value={`${formatNumber(r.dailyDemand)} L`} sub={`Air minum/masak ${formatNumber(r.dailyDrinkingDemand, 1)} L/hari`} />
          <Kpi label="Estimasi ketahanan" value={formatDays(r.totalEndurance)} sub={r.totalEnduranceIfAllAccessible !== null && r.totalEnduranceIfAllAccessible !== r.totalEndurance ? `Bila semua air bisa diakses: ${formatDays(r.totalEnduranceIfAllAccessible)}` : "Berdasar air yang bisa diakses"} tone={enduranceTone} />
          <Kpi label="Ketahanan air minum" value={formatDays(r.drinkingEndurance)} sub="Hanya air terverifikasi" tone={drinkTone} />
          <Kpi label="Target ketahanan" value={`${formatNumber(r.targetDays, 1)} hari`} sub={`Kebutuhan ${formatNumber(r.targetDemand)} L`} />
          <Kpi
            label={r.shortage > 0 ? "Kekurangan air" : "Kelebihan air"}
            value={formatLiters(r.shortage > 0 ? r.shortage : r.surplus)}
            sub={r.drinkingShortage > 0 ? `Air minum kurang ${formatLiters(r.drinkingShortage)}` : "Terhadap kebutuhan target"}
            tone={r.shortage > 0 ? "bad" : "good"}
          />
        </div>

        <H2>Estimasi ketahanan</H2>
        <div className="report-avoid-break flex justify-center">
          <EnduranceBars r={r} fixed={{ width: 640, height: 150 }} />
        </div>
        <p className="text-[9px] text-ink-muted">Batang berwarna adalah hasil hitung dari data Anda; batang abu-abu dan garis merah putus-putus adalah target pilihan Anda (asumsi).</p>

        <H2>Peringatan penting</H2>
        {r.warnings.length === 0 && r.missing.length === 0 ? (
          <Empty>Tidak ada peringatan dari data yang dimasukkan.</Empty>
        ) : (
          <ul className="space-y-1">
            {r.warnings.map((w) => (
              <li
                key={w.id}
                className={cn(
                  "report-avoid-break rounded border-l-4 px-2.5 py-1 text-[10px] leading-snug",
                  w.level === "kritis" ? "border-danger bg-danger-soft text-ink" : w.level === "perhatian" ? "border-warn bg-warn-soft text-ink" : "border-teal bg-teal-soft text-ink",
                )}
              >
                {w.text}
              </li>
            ))}
            {r.missing.map((m) => (
              <li key={m} className="report-avoid-break rounded border-l-4 border-slate-300 bg-slate-100 px-2.5 py-1 text-[10px] leading-snug text-ink">
                Data belum lengkap: {m}.
              </li>
            ))}
          </ul>
        )}
      </Sheet>

      {/* ============================ HALAMAN 2 ============================ */}
      <Sheet page={2} house={house} date={date}>
        <H2>Inventaris penyimpanan air</H2>
        {r.rows.length === 0 ? (
          <Empty>Belum ada wadah penyimpanan yang dicatat.</Empty>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={cn(TH, "w-5")}>No</th>
                <th className={TH}>Wadah</th>
                <th className={cn(TH, "text-right")}>Jml</th>
                <th className={cn(TH, "text-right")}>Kapasitas (L)</th>
                <th className={cn(TH, "text-right")}>Terisi</th>
                <th className={cn(TH, "text-right")}>Volume terisi (L)</th>
                <th className={cn(TH, "text-right")}>Volume efektif (L)</th>
                <th className={TH}>Peruntukan</th>
                <th className={TH}>Akses saat listrik padam</th>
              </tr>
            </thead>
            <tbody>
              {r.rows.map((row, i) => {
                const unit = draft.storage[i];
                return (
                  <tr key={row.id} className="report-avoid-break">
                    <td className={TD}>{i + 1}</td>
                    <td className={TD}>
                      <span className="font-semibold">{row.name || "(tanpa nama)"}</span>
                      <span className="block text-[8.5px] text-ink-muted">{STORAGE_TYPE_LABEL[row.type]}</span>
                    </td>
                    <td className={cn(TD, "text-right tabular-nums")}>{formatNumber(row.quantity)}</td>
                    <td className={cn(TD, "text-right tabular-nums")}>{formatNumber(row.capacityTotal, 1)}</td>
                    <td className={cn(TD, "text-right tabular-nums")}>{formatNumber(unit?.fillPercent ?? 0, 0)}%</td>
                    <td className={cn(TD, "text-right tabular-nums")}>{formatNumber(row.physicalTotal, 1)}</td>
                    <td className={cn(TD, "text-right font-bold tabular-nums")}>{formatNumber(row.effectiveTotal, 1)}</td>
                    <td className={TD}>
                      {USE_LABEL[row.intendedUse]}
                      <span className="block text-[8.5px] text-ink-muted">{QUALITY_LABEL[row.quality]}</span>
                    </td>
                    <td className={TD}>{row.accessible ? "Ya" : row.accessUnknown ? "Belum diketahui" : "Tidak (perlu listrik/pompa)"}</td>
                  </tr>
                );
              })}
              <tr className="bg-surface font-bold">
                <td className={TD} colSpan={3}>
                  Total
                </td>
                <td className={cn(TD, "text-right tabular-nums")}>{formatNumber(storageTotals.cap, 1)}</td>
                <td className={TD} />
                <td className={cn(TD, "text-right tabular-nums")}>{formatNumber(storageTotals.phys, 1)}</td>
                <td className={cn(TD, "text-right tabular-nums text-teal-dark")}>{formatNumber(storageTotals.eff, 1)}</td>
                <td className={TD} colSpan={2} />
              </tr>
            </tbody>
          </table>
        )}
        <p className="mt-1 text-[9px] text-ink-muted">
          Volume efektif = volume terisi − volume tak terpakai (tidak pernah negatif). Air yang tidak terkonfirmasi bisa diambil saat listrik padam tetap tampil sebagai stok, tetapi tidak dihitung dalam estimasi ketahanan.
        </p>

        <H2>Komposisi stok air</H2>
        <div className="report-avoid-break flex items-center justify-center rounded-lg border border-line py-3">
          <StockDonut composition={r.composition} total={r.effectiveTotal} fixed={{ width: 150, height: 150 }} />
        </div>

        <H2>Kebutuhan vs ketersediaan</H2>
        <div className="report-avoid-break flex justify-center rounded-lg border border-line py-2">
          <DemandBars r={r} fixed={{ width: 560, height: 200 }} />
        </div>
        <p className="mt-1 text-[9px] text-ink-muted">
          Kebutuhan = penghuni × L/orang/hari × target hari. Tersedia = volume efektif yang terkonfirmasi bisa diakses saat listrik padam.
        </p>

        <H2>Air minum &amp; masak (dipisah dari air umum)</H2>
        <div className="report-avoid-break grid grid-cols-4 gap-2">
          <Kpi label="Total minum/masak" value={formatLiters(r.drinkingStockTotal)} />
          <Kpi label="Terverifikasi & bisa diakses" value={formatLiters(r.drinkingVerifiedAccessible)} tone={r.drinkingVerifiedAccessible > 0 ? "good" : "bad"} />
          <Kpi label="Belum terverifikasi" value={formatLiters(r.drinkingUnverified)} sub="Tidak dihitung sebagai air minum" tone={r.drinkingUnverified > 0 ? "warn" : "default"} />
          <Kpi label="Ketahanan air minum" value={formatDays(r.drinkingEndurance)} sub={`Kebutuhan ${formatNumber(r.dailyDrinkingDemand, 1)} L/hari`} tone={drinkTone} />
        </div>
      </Sheet>

      {/* ============================ HALAMAN 3 ============================ */}
      <Sheet page={3} house={house} date={date}>
        <H2>Sumber air</H2>
        {draft.sources.length === 0 ? (
          <Empty>Belum ada sumber air yang dicatat.</Empty>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={TH}>Sumber</th>
                <th className={TH}>Peran</th>
                <th className={TH}>Ketersediaan</th>
                <th className={TH}>Keandalan</th>
                <th className={TH}>Kualitas</th>
                <th className={TH}>Bergantung listrik</th>
              </tr>
            </thead>
            <tbody>
              {draft.sources.map((s) => (
                <tr key={s.id} className="report-avoid-break">
                  <td className={TD}>
                    <span className="font-semibold">{s.name || SOURCE_TYPE_LABEL[s.type]}</span>
                    <span className="block text-[8.5px] text-ink-muted">{SOURCE_TYPE_LABEL[s.type]}</span>
                  </td>
                  <td className={TD}>{SOURCE_ROLE_LABEL[s.role]}</td>
                  <td className={TD}>{AVAILABILITY_LABEL[s.availability]}</td>
                  <td className={TD}>{RELIABILITY_LABEL[s.reliability]}</td>
                  <td className={TD}>{QUALITY_LABEL[s.quality]}</td>
                  <td className={TD}>{YNU_LABEL[s.dependsOnElectricity]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="mt-1 text-[9px] text-ink-muted">Sumber air tidak menambah liter pada perhitungan; hanya wadah di inventaris yang dihitung sebagai stok. Penilaian: <b>{risk("sumber").explanation}</b></p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <H2>Pompa &amp; listrik</H2>
            <div className="report-avoid-break rounded-lg border border-line p-2.5">
              <KV
                rows={[
                  ["Pompa utama", YNU_LABEL[draft.pump.hasPump]],
                  ["Jenis pompa", PUMP_TYPE_LABEL[draft.pump.pumpType]],
                  ["Ketergantungan listrik", POWER_DEP_LABEL[draft.pump.powerDependency]],
                  ["Listrik cadangan", YNU_LABEL[draft.pump.backupPower]],
                  ["Akses alternatif", YNU_LABEL[draft.pump.alternativeAccess]],
                  ["Distribusi gravitasi", YNU_LABEL[draft.pump.gravityFed]],
                  ["Kondisi pompa", PUMP_STATUS_LABEL[draft.pump.pumpStatus]],
                  ["Paham pengoperasian", OPERATION_LABEL[draft.pump.operationKnowledge]],
                ]}
              />
              <div className="mt-2 flex items-start gap-2 border-t border-line pt-2 text-[9.5px] leading-snug">
                <RiskBadge level={risk("pompa").level} />
                <span>{risk("pompa").explanation}</span>
              </div>
            </div>
          </div>
          <div>
            <H2>Distribusi air</H2>
            <div className="report-avoid-break rounded-lg border border-line p-2.5">
              <KV
                rows={[
                  ["Jalur utama", MAIN_PATH_LABEL[draft.distribution.mainPath]],
                  ["Kondisi pipa", PIPE_LABEL[draft.distribution.pipeCondition]],
                  ["Kebocoran", LEAK_LABEL[draft.distribution.leakage]],
                  ["Keran berfungsi", `${formatNumber(draft.distribution.usableTaps)} keran`],
                  ["Akses ke wadah", STORAGE_ACCESS_LABEL[draft.distribution.storageAccessibility]],
                  ["Gravitasi ke keran", YNU_LABEL[draft.distribution.gravityAccess]],
                  ["Tanpa listrik", NO_POWER_DIST_LABEL[draft.distribution.distributeWithoutPower]],
                ]}
              />
              <div className="mt-2 flex items-start gap-2 border-t border-line pt-2 text-[9.5px] leading-snug">
                <RiskBadge level={risk("distribusi").level} />
                <span>{risk("distribusi").explanation}</span>
              </div>
            </div>
          </div>
        </div>

        <H2>Status kualitas air minum</H2>
        <div className="report-avoid-break rounded-lg border border-line p-2.5">
          <KV
            rows={[
              ["Kebersihan penyimpanan", COND_LABEL[draft.drinking.storageHygiene]],
              ["Kondisi wadah", COND_LABEL[draft.drinking.containerCondition]],
              ["Kebutuhan minum/masak", `${formatNumber(draft.drinking.litersPerPersonPerDay, 1)} L/orang/hari`],
              ["Air minum terverifikasi", `${formatLiters(r.drinkingVerifiedAccessible)} dari ${formatLiters(r.drinkingStockTotal)} (minum/masak)`],
              ...(draft.drinking.verificationNote.trim() ? ([["Cara verifikasi (catatan pengguna)", draft.drinking.verificationNote.trim()]] as [string, string][]) : []),
            ]}
          />
          <div className="mt-2 flex items-start gap-2 border-t border-line pt-2 text-[9.5px] leading-snug">
            <RiskBadge level={risk("air_minum").level} />
            <span>{risk("air_minum").explanation}</span>
          </div>
          <p className="mt-1.5 text-[9px] italic text-ink-muted">Status “terverifikasi” berasal dari pernyataan pengguna. Aplikasi tidak menguji atau menjamin keamanan air.</p>
        </div>

        <H2>Daftar periksa audit</H2>
        {!answered ? (
          <Empty>Audit belum diisi.</Empty>
        ) : (
          <>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={cn(TH, "w-20")}>Bidang</th>
                  <th className={TH}>Butir pemeriksaan</th>
                  <th className={cn(TH, "w-24")}>Jawaban</th>
                </tr>
              </thead>
              <tbody>
                {AUDIT_ITEMS.map((item) => {
                  const a = draft.audit[item.id];
                  return (
                    <tr key={item.id} className="report-avoid-break">
                      <td className={cn(TD, "text-ink-muted")}>{item.group}</td>
                      <td className={TD}>{item.label}</td>
                      <td className={cn(TD, "font-semibold", a === "sudah" ? "text-brand-green" : a === "belum" ? "text-danger" : a === "belum_diperiksa" ? "text-warn-text" : "text-ink-muted")}>
                        {AUDIT_ANSWER_LABEL[a]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-1 text-[9px] text-ink-muted">
              {r.audit.sudah} sudah terpenuhi, {r.audit.belum} belum, {r.audit.belumDiperiksa} belum diperiksa, {r.audit.tidakRelevan} tidak relevan (dari {r.audit.total} butir). Status audit: <b>{AUDIT_STATUS_LABEL[r.audit.status]}</b>.
            </p>
          </>
        )}
      </Sheet>

      {/* ============================ HALAMAN 4 ============================ */}
      <Sheet page={4} house={house} date={date}>
        <H2>Temuan utama</H2>
        <table className="w-full border-collapse">
          <tbody>
            {r.risks.map((x) => (
              <tr key={x.id} className="report-avoid-break">
                <td className={cn(TD, "w-36 font-semibold text-navy")}>{x.label}</td>
                <td className={cn(TD, "w-20")}>
                  <RiskBadge level={x.level} />
                </td>
                <td className={TD}>{x.explanation}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <H2>Tindakan prioritas</H2>
        <ol className="space-y-1">
          {recommendations.map((rec, i) => (
            <li key={rec.id} className="report-avoid-break flex gap-2 text-[9.5px] leading-snug">
              <span className={cn("mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white", rec.priority === 1 ? "bg-danger" : rec.priority === 2 ? "bg-warn text-navy-dark" : "bg-teal")}>{i + 1}</span>
              <span>
                <b className="text-navy">{rec.title}</b> <span className="text-ink-muted">(prioritas {rec.priority})</span>
                <br />
                {rec.detail}
              </span>
            </li>
          ))}
        </ol>

        {budgetItems.length > 0 && (
          <>
            <H2>Perkiraan anggaran (diisi pengguna)</H2>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={TH}>Keterangan</th>
                  <th className={cn(TH, "w-28 text-right")}>Perkiraan biaya</th>
                </tr>
              </thead>
              <tbody>
                {budgetItems.map((b) => (
                  <tr key={b.id} className="report-avoid-break">
                    <td className={TD}>{b.label}</td>
                    <td className={cn(TD, "text-right tabular-nums")}>{formatRupiah(b.amountIdr)}</td>
                  </tr>
                ))}
                <tr className="bg-surface font-bold">
                  <td className={TD}>Total</td>
                  <td className={cn(TD, "text-right tabular-nums")}>{formatRupiah(budgetTotal)}</td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        <H2>Asumsi</H2>
        <ul className="list-disc space-y-0.5 pl-4 text-[9px] leading-snug">
          <li>
            Skenario <b>{scenarioLabel}</b>: {formatNumber(p.litersPerPersonPerDay, 1)} L/orang/hari untuk seluruh kebutuhan; air minum/masak {formatNumber(draft.drinking.litersPerPersonPerDay, 1)} L/orang/hari; target {formatNumber(r.targetDays, 1)} hari; {formatNumber(p.occupants)} penghuni.
          </li>
          <li>{SCENARIO_NOTE}</li>
          <li>Seluruh volume, kondisi, dan status kualitas berasal dari masukan pengguna dan belum diverifikasi oleh aplikasi.</li>
        </ul>

        <div className="mt-1 grid grid-cols-2 gap-4">
          <div>
            <H2>Metodologi perhitungan</H2>
            <ul className="space-y-[3px] text-[8.5px] leading-snug">
              {FORMULAS.map((f) => (
                <li key={f.name}>
                  <b className="text-navy">{f.name}:</b> {f.formula}
                </li>
              ))}
              <li className="pt-0.5 text-ink-muted">
                <b className="text-navy">Status:</b> {STATUS_METHOD[0]} {STATUS_METHOD[4]}
              </li>
              <li className="text-ink-muted">{EDGE_RULES[4]}</li>
            </ul>
          </div>
          <div>
            <H2>Batasan keselamatan</H2>
            <ul className="list-disc space-y-[3px] pl-3.5 text-[8.5px] leading-snug">
              {LIMITATIONS.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <H2>Referensi</H2>
            <ul className="space-y-[3px] text-[8.5px] leading-snug">
              {REFERENCES.map((ref) => (
                <li key={ref.title}>
                  <b className="text-navy">{ref.title}</b> — {ref.org}.
                </li>
              ))}
              <li className="text-ink-muted">Diakses {REFERENCES_ACCESSED}. Periksa versi terbaru sebelum dijadikan dasar keputusan.</li>
            </ul>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
