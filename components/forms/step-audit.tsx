"use client";

import { useAssessment } from "@/lib/state/assessment-context";
import { budgetItemSchema } from "@/lib/validations";
import { InfoBox, StepFrame } from "./step-frame";
import { AuditChecklist, BudgetEditor } from "./audit-checklist";

export function StepAudit({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { draft, saveToHistory } = useAssessment();

  const finish = () => {
    // Buang butir biaya kosong; tolak yang tidak valid agar laporan hanya berisi data lengkap.
    const valid = draft.budget.every((b) => budgetItemSchema.safeParse(b).success);
    if (!valid) {
      document.getElementById("step-title")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    saveToHistory(true);
    onNext();
  };

  return (
    <StepFrame step={7} description="Periksa kondisi rumah Anda satu per satu. Jawaban jujur menghasilkan rekomendasi yang tepat." onPrev={onPrev} onNext={finish} nextLabel="Selesai & Lihat Hasil">
      <InfoBox>
        Pilih <b>Belum diperiksa</b> bila Anda belum yakin — itu tidak dihitung sebagai "sudah". Pilih <b>Tidak relevan</b> bila butir tidak berlaku di rumah Anda.
      </InfoBox>
      <AuditChecklist />
      <hr className="border-line" />
      <BudgetEditor />
      {draft.budget.some((b) => !budgetItemSchema.safeParse(b).success) && (
        <p role="alert" className="text-sm font-medium text-danger">
          Lengkapi keterangan dan biaya, atau hapus butir yang kosong sebelum melanjutkan.
        </p>
      )}
    </StepFrame>
  );
}
