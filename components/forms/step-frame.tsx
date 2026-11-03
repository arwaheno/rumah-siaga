"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { WIZARD_STEPS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ProgressSteps({ current, onJump }: { current: number; onJump: (n: number) => void }) {
  const pct = Math.round(((current - 1) / (WIZARD_STEPS.length - 1)) * 100);
  return (
    <div className="mb-6">
      {/* Mobile */}
      <div className="sm:hidden">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-ink-muted">
          <span>
            Langkah {current} dari {WIZARD_STEPS.length}
          </span>
          <span className="text-navy">{WIZARD_STEPS[current - 1].title}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={1} aria-valuemax={WIZARD_STEPS.length} aria-valuenow={current}>
          <div className="h-full rounded-full bg-teal transition-all" style={{ width: `${Math.max(pct, 6)}%` }} />
        </div>
      </div>

      {/* Desktop */}
      <ol className="hidden items-start sm:flex" aria-label="Progres langkah">
        {WIZARD_STEPS.map((s, i) => {
          const done = s.n < current;
          const active = s.n === current;
          return (
            <li key={s.n} className="relative flex flex-1 flex-col items-center">
              {i > 0 && (
                <span aria-hidden className={cn("absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2", s.n <= current ? "bg-teal" : "bg-line")} />
              )}
              <button
                type="button"
                onClick={() => onJump(s.n)}
                aria-current={active ? "step" : undefined}
                aria-label={`Langkah ${s.n}: ${s.title}`}
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                  done && "border-teal bg-teal text-white",
                  active && "border-navy bg-navy text-white",
                  !done && !active && "border-line bg-white text-ink-muted hover:border-teal",
                )}
              >
                {done ? <Check className="h-4 w-4" aria-hidden /> : s.n}
              </button>
              <span className={cn("mt-1.5 text-center text-[11px] font-semibold leading-tight", active ? "text-navy" : "text-ink-muted")}>
                {s.short}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function StepFrame({
  step,
  description,
  children,
  onPrev,
  onNext,
  nextLabel,
  busy,
}: {
  step: number;
  description: string;
  children: React.ReactNode;
  onPrev?: () => void;
  onNext: () => void | Promise<void>;
  nextLabel?: string;
  busy?: boolean;
}) {
  const meta = WIZARD_STEPS[step - 1];
  const next = WIZARD_STEPS[step]; // langkah berikutnya
  return (
    <section className="card p-5 sm:p-6" aria-labelledby="step-title">
      <header className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wide text-teal">
          Langkah {step} dari {WIZARD_STEPS.length}
        </p>
        <h2 id="step-title" className="mt-0.5 text-xl font-bold text-navy">
          {step}. {meta.title}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">{description}</p>
      </header>

      <div className="space-y-5">{children}</div>

      <footer className="mt-7 flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        {onPrev ? (
          <button type="button" className="btn-secondary" onClick={onPrev}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Kembali
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="btn-primary" onClick={onNext} disabled={busy}>
          {nextLabel ?? `Lanjut: ${next?.title ?? ""}`}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </footer>
    </section>
  );
}

export function OptionsSelectItems({ options }: { options: [string, string][] }) {
  return (
    <>
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </>
  );
}

export function InfoBox({ tone = "info", title, children }: { tone?: "info" | "warn"; title?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-lg border p-3.5 text-sm", tone === "warn" ? "border-warn/50 bg-warn-soft text-warn-text" : "border-teal/20 bg-teal-soft text-navy")}>
      {title && <p className="mb-0.5 font-bold">{title}</p>}
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
