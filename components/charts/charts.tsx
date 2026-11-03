"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CompositionSlice, Results } from "@/lib/calculations";
import { formatNumber } from "@/lib/formatting";

export const CHART_COLORS = ["#168C8C", "#17324D", "#5B8DB8", "#9AA8B4"];
const TEXT = "#1F2D3A";
const MUTED = "#5B6B79";

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

function Legend({ composition }: { composition: CompositionSlice[] }) {
  return (
    <ul className="space-y-1.5 text-sm">
      {composition.map((c, i) => (
        <li key={c.label} className="flex items-center gap-2">
          <span aria-hidden className="h-3 w-3 shrink-0 rounded-sm" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
          <span className="text-ink">
            {c.label} <span className="text-ink-muted">({formatNumber(c.liters)} L · {formatNumber(c.percent, 1)}%)</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Donut komposisi stok air. `fixed` = ukuran tetap tanpa animasi (untuk laporan cetak). */
export function StockDonut({
  composition,
  total,
  fixed,
}: {
  composition: CompositionSlice[];
  total: number;
  fixed?: { width: number; height: number };
}) {
  const mounted = useMounted();
  if (composition.length === 0) {
    return <p className="py-8 text-center text-sm text-ink-muted">Belum ada air tersimpan untuk ditampilkan.</p>;
  }

  const data = composition.map((c) => ({ name: c.label, value: c.liters }));
  const pie = (w?: number, h?: number) => (
    <PieChart width={w} height={h}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        innerRadius="62%"
        outerRadius="92%"
        paddingAngle={composition.length > 1 ? 2 : 0}
        stroke="#fff"
        strokeWidth={2}
        isAnimationActive={false}
      >
        {data.map((d, i) => (
          <Cell key={d.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
        ))}
      </Pie>
      {!fixed && <Tooltip formatter={(v) => `${formatNumber(Number(v), 1)} L`} />}
    </PieChart>
  );

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
      <div
        className="relative shrink-0"
        style={fixed ? { width: fixed.width, height: fixed.height } : { width: 190, height: 190 }}
        role="img"
        aria-label={`Komposisi stok air, total ${formatNumber(total)} liter`}
      >
        {fixed ? (
          pie(fixed.width, fixed.height)
        ) : mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            {pie()}
          </ResponsiveContainer>
        ) : null}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold tabular-nums text-navy">{formatNumber(total)} L</span>
          <span className="text-[11px] text-ink-muted">Total stok</span>
        </div>
      </div>
      <Legend composition={composition} />
    </div>
  );
}

export function DemandBars({ r, fixed }: { r: Results; fixed?: { width: number; height: number } }) {
  const mounted = useMounted();
  const short = r.shortage > 0;
  const data = [
    { name: "Tersedia (bisa diakses)", value: Math.round(r.accessibleTotal), color: "#168C8C" },
    { name: `Kebutuhan ${formatNumber(r.targetDays, 1)} hari`, value: Math.round(r.targetDemand), color: "#17324D" },
    { name: short ? "Kekurangan" : "Kelebihan", value: Math.round(short ? r.shortage : r.surplus), color: short ? "#C94C4C" : "#27845A" },
  ];

  const chart = (w?: number, h?: number) => (
    <BarChart width={w} height={h} data={data} margin={{ top: 22, right: 8, left: 0, bottom: 4 }}>
      <CartesianGrid vertical={false} stroke="#E4EAEE" />
      <XAxis dataKey="name" tick={{ fontSize: 11, fill: MUTED }} interval={0} tickLine={false} axisLine={{ stroke: "#DFE6EA" }} />
      <YAxis tick={{ fontSize: 11, fill: MUTED }} tickLine={false} axisLine={false} width={44} tickFormatter={(v) => formatNumber(Number(v))} />
      {!fixed && <Tooltip formatter={(v) => `${formatNumber(Number(v))} L`} cursor={{ fill: "rgba(23,50,77,0.05)" }} />}
      <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56} isAnimationActive={false}>
        {data.map((d) => (
          <Cell key={d.name} fill={d.color} />
        ))}
        <LabelList dataKey="value" position="top" formatter={(v) => `${formatNumber(Number(v))} L`} style={{ fontSize: 11, fontWeight: 700, fill: TEXT }} />
      </Bar>
    </BarChart>
  );

  return (
    <div role="img" aria-label="Diagram batang kebutuhan dibandingkan ketersediaan air" style={fixed ? { width: fixed.width, height: fixed.height } : { width: "100%", height: 230 }}>
      {fixed ? chart(fixed.width, fixed.height) : mounted ? <ResponsiveContainer width="100%" height="100%">{chart()}</ResponsiveContainer> : null}
    </div>
  );
}

export function EnduranceBars({ r, fixed }: { r: Results; fixed?: { width: number; height: number } }) {
  const mounted = useMounted();
  const data = [
    { name: "Air umum (semua kebutuhan)", value: r.totalEndurance ?? 0, color: "#168C8C", na: r.totalEndurance === null },
    { name: "Air minum & masak (terverifikasi)", value: r.drinkingEndurance ?? 0, color: "#5B8DB8", na: r.drinkingEndurance === null },
    { name: "Target (pilihan Anda)", value: r.targetDays, color: "#9AA8B4", na: false },
  ];
  const max = Math.max(1, ...data.map((d) => d.value)) * 1.2;

  const chart = (w?: number, h?: number) => (
    <BarChart width={w} height={h} data={data} layout="vertical" margin={{ top: 4, right: 56, left: 8, bottom: 4 }}>
      <CartesianGrid horizontal={false} stroke="#E4EAEE" />
      <XAxis type="number" domain={[0, max]} tick={{ fontSize: 11, fill: MUTED }} tickLine={false} axisLine={{ stroke: "#DFE6EA" }} tickFormatter={(v) => formatNumber(Number(v), 0)} />
      <YAxis type="category" dataKey="name" width={148} tick={{ fontSize: 11, fill: TEXT }} tickLine={false} axisLine={false} />
      {!fixed && <Tooltip formatter={(v) => `${formatNumber(Number(v), 1)} hari`} cursor={{ fill: "rgba(23,50,77,0.05)" }} />}
      <ReferenceLine x={r.targetDays} stroke="#C94C4C" strokeDasharray="4 3" />
      <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22} isAnimationActive={false}>
        {data.map((d) => (
          <Cell key={d.name} fill={d.color} />
        ))}
        <LabelList
          dataKey="value"
          position="right"
          formatter={(v) => `${formatNumber(Number(v), 1)} hr`}
          style={{ fontSize: 11, fontWeight: 700, fill: TEXT }}
        />
      </Bar>
    </BarChart>
  );

  return (
    <div role="img" aria-label="Diagram batang estimasi ketahanan air dalam hari" style={fixed ? { width: fixed.width, height: fixed.height } : { width: "100%", height: 190 }}>
      {fixed ? chart(fixed.width, fixed.height) : mounted ? <ResponsiveContainer width="100%" height="100%">{chart()}</ResponsiveContainer> : null}
    </div>
  );
}
