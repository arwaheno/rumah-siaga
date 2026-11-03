import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types/assessment";
import { RISK_LABEL, STATUS_LABEL, type ReadinessStatus, type DimensionStatus } from "@/lib/calculations";
import { AlertTriangle, CheckCircle2, HelpCircle, XCircle } from "lucide-react";

const RISK_STYLE: Record<RiskLevel, string> = {
  rendah: "bg-brand-greensoft text-brand-green",
  sedang: "bg-warn-soft text-warn-text",
  tinggi: "bg-danger-soft text-danger",
  belum_diketahui: "bg-slate-100 text-ink-muted",
};

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", RISK_STYLE[level], className)}>
      {RISK_LABEL[level]}
    </span>
  );
}

export const STATUS_STYLE: Record<ReadinessStatus, { bg: string; text: string; border: string; solid: string }> = {
  siap: { bg: "bg-brand-greensoft", text: "text-brand-green", border: "border-brand-green/30", solid: "#27845A" },
  perlu_perhatian: { bg: "bg-warn-soft", text: "text-warn-text", border: "border-warn/50", solid: "#F4B942" },
  belum_siap: { bg: "bg-danger-soft", text: "text-danger", border: "border-danger/30", solid: "#C94C4C" },
  data_belum_lengkap: { bg: "bg-slate-100", text: "text-ink-muted", border: "border-slate-300", solid: "#5B6B79" },
};

export function StatusIcon({ status, className }: { status: ReadinessStatus; className?: string }) {
  const cls = cn("h-7 w-7", className);
  if (status === "siap") return <CheckCircle2 className={cls} aria-hidden />;
  if (status === "perlu_perhatian") return <AlertTriangle className={cls} aria-hidden />;
  if (status === "belum_siap") return <XCircle className={cls} aria-hidden />;
  return <HelpCircle className={cls} aria-hidden />;
}

export function StatusPill({ status }: { status: ReadinessStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-sm font-bold", s.bg, s.text)}>
      {STATUS_LABEL[status]}
    </span>
  );
}

const DIM_STYLE: Record<DimensionStatus, string> = {
  baik: "bg-brand-greensoft text-brand-green",
  perhatian: "bg-warn-soft text-warn-text",
  kurang: "bg-danger-soft text-danger",
  belum_lengkap: "bg-slate-100 text-ink-muted",
};
export const DIM_LABEL: Record<DimensionStatus, string> = {
  baik: "Baik",
  perhatian: "Perlu perhatian",
  kurang: "Kurang",
  belum_lengkap: "Belum lengkap",
};
export function DimensionBadge({ status }: { status: DimensionStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", DIM_STYLE[status])}>
      {DIM_LABEL[status]}
    </span>
  );
}
