"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionCard({
  title,
  icon,
  children,
  className,
  action,
}: {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className={cn("card p-5", className)}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-base font-bold text-navy">
            {icon}
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({
  title,
  description,
  href,
  cta,
  icon,
}: {
  title: string;
  description: string;
  href?: string;
  cta?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl2 border border-dashed border-line bg-white px-6 py-10 text-center">
      {icon && <div className="mb-3 text-teal">{icon}</div>}
      <h3 className="text-base font-bold text-navy">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-ink-muted">{description}</p>
      {href && cta && (
        <Link href={href} className="btn-primary mt-4">
          {cta}
        </Link>
      )}
    </div>
  );
}

/** Konfirmasi dua langkah inline (tanpa modal) untuk tindakan destruktif. */
export function ConfirmButton({
  label,
  confirmLabel = "Ya, hapus",
  onConfirm,
  className,
  icon,
  ariaLabel,
}: {
  label: string;
  confirmLabel?: string;
  onConfirm: () => void;
  className?: string;
  icon?: React.ReactNode;
  ariaLabel?: string;
}) {
  const [armed, setArmed] = useState(false);
  if (armed) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <button type="button" className="btn-danger px-3 py-1.5 text-xs" onClick={() => { setArmed(false); onConfirm(); }}>
          {confirmLabel}
        </button>
        <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={() => setArmed(false)}>
          Batal
        </button>
      </span>
    );
  }
  return (
    <button type="button" aria-label={ariaLabel ?? label} className={cn("btn-ghost px-2.5 py-1.5 text-xs text-danger hover:bg-danger-soft", className)} onClick={() => setArmed(true)}>
      {icon}
      {label}
    </button>
  );
}

export function ChoiceCards<T extends string | number>({
  value,
  onChange,
  options,
  name,
  columns = 3,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; title: string; subtitle?: string }[];
  name: string;
  columns?: 2 | 3 | 4;
}) {
  const grid = columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3";
  return (
    <div role="radiogroup" className={cn("grid gap-2", grid)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <label
            key={String(o.value)}
            className={cn(
              "cursor-pointer rounded-lg border p-3 transition-colors",
              active ? "border-teal bg-teal-soft" : "border-line bg-white hover:bg-surface",
            )}
          >
            <input
              type="radio"
              name={name}
              className="sr-only"
              checked={active}
              onChange={() => onChange(o.value)}
            />
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className={cn("flex h-4 w-4 items-center justify-center rounded-full border", active ? "border-teal" : "border-slate-300")}
              >
                {active && <span className="h-2 w-2 rounded-full bg-teal" />}
              </span>
              <span className="text-sm font-semibold text-navy">{o.title}</span>
            </span>
            {o.subtitle && <span className="mt-1 block pl-6 text-xs text-ink-muted">{o.subtitle}</span>}
          </label>
        );
      })}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  icon,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon?: React.ReactNode;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  const toneCls = { default: "text-navy", good: "text-brand-green", warn: "text-warn-text", bad: "text-danger" }[tone];
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
        {icon}
        {label}
      </div>
      <div className={cn("mt-1.5 text-2xl font-bold tabular-nums", toneCls)}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-ink-muted">{sub}</div>}
    </div>
  );
}
