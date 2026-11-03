"use client";

import { useAssessment } from "@/lib/state/assessment-context";
import { AuditChecklist, BudgetEditor } from "@/components/forms/audit-checklist";
import { SectionCard } from "@/components/ui/misc";

export function AuditPageView() {
  const { ready } = useAssessment();
  if (!ready) return <div className="card h-48 animate-pulse bg-white" aria-busy="true" />;
  return (
    <div className="space-y-5">
      <SectionCard>
        <AuditChecklist />
      </SectionCard>
      <SectionCard>
        <BudgetEditor />
      </SectionCard>
    </div>
  );
}
