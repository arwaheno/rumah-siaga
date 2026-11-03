import type { Metadata } from "next";
import { PageHeader, SectionCard } from "@/components/ui/misc";
import { DEMAND_SCENARIOS } from "@/lib/constants";
import {
  EDGE_RULES,
  FORMULAS,
  LIMITATIONS,
  REFERENCES,
  REFERENCES_ACCESSED,
  REFERENCES_NOTE,
  SCENARIO_NOTE,
  STATUS_METHOD,
} from "@/lib/constants/content";

export const metadata: Metadata = { title: "Asumsi & Referensi" };

export default function AssumptionsPage() {
  return (
    <>
      <PageHeader title="Asumsi & Referensi" description="Rumus, aturan perhitungan, metodologi status kesiapan, batasan, dan bacaan lanjutan." />
      <div className="space-y-5">
        <SectionCard title="Skenario kebutuhan air">
          <ul className="mb-3 grid gap-2 sm:grid-cols-3">
            {Object.values(DEMAND_SCENARIOS).map((s) => (
              <li key={s.label} className="rounded-lg border border-line bg-surface/60 p-3 text-sm">
                <b className="text-navy">{s.label}</b>: {s.liters} L/orang/hari
                <span className="block text-xs text-ink-muted">{s.hint}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-ink-muted">{SCENARIO_NOTE}</p>
        </SectionCard>

        <SectionCard title="Rumus perhitungan">
          <dl className="divide-y divide-line">
            {FORMULAS.map((f) => (
              <div key={f.name} className="grid gap-1 py-2.5 text-sm sm:grid-cols-[260px_1fr]">
                <dt className="font-semibold text-navy">{f.name}</dt>
                <dd>
                  <code className="rounded bg-surface px-1.5 py-0.5 text-[13px] text-ink">{f.formula}</code>
                  {f.note && <span className="mt-1 block text-xs text-ink-muted">{f.note}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        <SectionCard title="Aturan kasus khusus">
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink">
            {EDGE_RULES.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Metodologi status kesiapan">
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink">
            {STATUS_METHOD.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Batasan keselamatan">
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink">
            {LIMITATIONS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Referensi">
          <ul className="space-y-3 text-sm">
            {REFERENCES.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-teal underline">
                  {r.title}
                </a>
                <span className="text-ink-muted"> — {r.org}. {r.note}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-muted">Tautan diperiksa pada {REFERENCES_ACCESSED}. {REFERENCES_NOTE}</p>
        </SectionCard>
      </div>
    </>
  );
}
