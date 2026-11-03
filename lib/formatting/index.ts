const nf0 = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });

/** 1.000 / 10.000 */
export function formatNumber(n: number, digits: 0 | 1 | 2 = 0): string {
  const v = Number.isFinite(n) ? n : 0;
  return (digits === 0 ? nf0 : digits === 1 ? nf1 : nf2).format(v);
}

export function formatLiters(n: number): string {
  return `${formatNumber(Math.round(n * 10) / 10, n % 1 === 0 ? 0 : 1)} L`;
}

export function formatDays(n: number | null): string {
  if (n === null) return "—";
  return `${formatNumber(n, 1)} hari`;
}

export function formatPercent(n: number): string {
  return `${formatNumber(n, 1)}%`;
}

/** Rp100.000 */
export function formatRupiah(n: number): string {
  const v = Number.isFinite(n) ? n : 0;
  return `Rp${nf0.format(Math.round(v))}`;
}

/** 3 November 2026 */
export function formatDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

export function formatDateTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
