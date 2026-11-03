import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-9 w-9", className)} aria-hidden>
      <path d="M20 3 4 17v18a2 2 0 0 0 2 2h28a2 2 0 0 0 2-2V17L20 3Z" fill="#17324D" />
      <path d="M20 12c-4.5 5.2-7 8.4-7 12a7 7 0 0 0 14 0c0-3.6-2.5-6.8-7-12Z" fill="#fff" />
      <path d="M20 17c-2.6 3.1-4 5-4 7.2 0 2.3 1.8 4.1 4 4.1v-11.3Z" fill="#168C8C" />
    </svg>
  );
}

export function Logo({ light = false, subtitle = true }: { light?: boolean; subtitle?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className="leading-tight">
        <span className={cn("block text-[15px] font-extrabold tracking-wide", light ? "text-white" : "text-navy")}>RUMAH SIAGA</span>
        {subtitle && (
          <span className={cn("block text-[11px] font-medium", light ? "text-white/70" : "text-ink-muted")}>Kenali. Hitung. Siapkan.</span>
        )}
      </span>
    </span>
  );
}
