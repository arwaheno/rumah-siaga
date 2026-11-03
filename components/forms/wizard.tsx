"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Pencil, RotateCcw } from "lucide-react";
import { useAssessment } from "@/lib/state/assessment-context";
import { ProgressSteps } from "./step-frame";
import { StepProfile } from "./step-profile";
import { StepSources } from "./step-sources";
import { StepStorage } from "./step-storage";
import { StepPump } from "./step-pump";
import { StepDistribution } from "./step-distribution";
import { StepDrinking } from "./step-drinking";
import { StepAudit } from "./step-audit";
import { ResultsDashboard } from "@/components/dashboard/results-dashboard";
import { ConfirmButton } from "@/components/ui/misc";
import { PRIVACY_NOTICE } from "@/lib/constants";

export function Wizard() {
  const { ready, draft, setStep, startNew } = useAssessment();
  const [urlApplied, setUrlApplied] = useState(false);

  // Dukungan tautan langsung ?step=N
  useEffect(() => {
    if (!ready || urlApplied) return;
    const n = Number(new URLSearchParams(window.location.search).get("step"));
    if (Number.isInteger(n) && n >= 1 && n <= 8) setStep(n);
    setUrlApplied(true);
  }, [ready, urlApplied, setStep]);

  if (!ready || !urlApplied) {
    return <div className="card h-72 animate-pulse bg-white" aria-busy="true" aria-label="Memuat kalkulator" />;
  }

  const step = Math.min(8, Math.max(1, draft.step));
  const go = (n: number) => {
    setStep(Math.min(8, Math.max(1, n)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const next = () => go(step + 1);
  const prev = () => go(step - 1);

  return (
    <div>
      <ProgressSteps current={step} onJump={go} />

      {step === 1 && <StepProfile onNext={next} />}
      {step === 2 && <StepSources onNext={next} onPrev={prev} />}
      {step === 3 && <StepStorage onNext={next} onPrev={prev} />}
      {step === 4 && <StepPump onNext={next} onPrev={prev} />}
      {step === 5 && <StepDistribution onNext={next} onPrev={prev} />}
      {step === 6 && <StepDrinking onNext={next} onPrev={prev} />}
      {step === 7 && <StepAudit onNext={next} onPrev={prev} />}
      {step === 8 && (
        <div className="space-y-5">
          <div className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-teal">Langkah 8 dari 8</p>
              <h2 className="text-xl font-bold text-navy">8. Hasil Perhitungan</h2>
              <p className="text-sm text-ink-muted">Perhitungan tersimpan di Riwayat. {PRIVACY_NOTICE}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-secondary" onClick={() => go(1)}>
                <Pencil className="h-4 w-4" aria-hidden />
                Ubah Data
              </button>
              <Link href="/report" className="btn-primary">
                <FileText className="h-4 w-4" aria-hidden />
                Cetak Laporan
              </Link>
            </div>
          </div>
          <ResultsDashboard />
          <div className="flex justify-end">
            <ConfirmButton
              label="Mulai perhitungan baru"
              confirmLabel="Ya, kosongkan formulir"
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              onConfirm={() => {
                startNew();
                go(1);
              }}
              className="text-ink-muted hover:bg-surface"
            />
          </div>
        </div>
      )}
    </div>
  );
}
