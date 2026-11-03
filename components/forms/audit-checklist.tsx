"use client";

import { Plus, Trash2 } from "lucide-react";
import { useAssessment } from "@/lib/state/assessment-context";
import { AUDIT_ANSWER_LABEL, AUDIT_ITEMS, newId } from "@/lib/constants";
import { AUDIT_STATUS_LABEL } from "@/lib/calculations";
import { formatNumber, formatRupiah } from "@/lib/formatting";
import type { AuditAnswer, BudgetItem } from "@/types/assessment";
import { budgetItemSchema } from "@/lib/validations";
import { NumberInput, TextInput } from "@/components/ui/field";
import { ConfirmButton } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

const ANSWERS: AuditAnswer[] = ["sudah", "belum", "belum_diperiksa", "tidak_relevan"];
const ANSWER_ACTIVE: Record<AuditAnswer, string> = {
  sudah: "border-brand-green bg-brand-greensoft text-brand-green",
  belum: "border-danger bg-danger-soft text-danger",
  belum_diperiksa: "border-warn bg-warn-soft text-warn-text",
  tidak_relevan: "border-slate-400 bg-slate-100 text-ink-muted",
};

export function AuditChecklist() {
  const { draft, update, results } = useAssessment();
  const groups = [...new Set(AUDIT_ITEMS.map((i) => i.group))];
  const s = results.audit;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-line bg-surface/60 p-3.5 text-sm">
        <span className="font-bold text-navy">Status audit: {AUDIT_STATUS_LABEL[s.status]}</span>
        <span className="text-ink-muted">
          {s.sudah} sudah · {s.belum} belum · {s.belumDiperiksa} belum diperiksa · {s.tidakRelevan} tidak relevan
        </span>
      </div>

      {groups.map((g) => (
        <fieldset key={g} className="space-y-2">
          <legend className="mb-1 text-xs font-bold uppercase tracking-wide text-teal">{g}</legend>
          {AUDIT_ITEMS.filter((i) => i.group === g).map((item) => {
            const val = draft.audit[item.id];
            return (
              <div key={item.id} className="rounded-lg border border-line bg-white p-3">
                <p className="text-sm font-semibold text-navy">{item.label}</p>
                <p className="mb-2 text-xs text-ink-muted">{item.help}</p>
                <div role="radiogroup" aria-label={item.label} className="flex flex-wrap gap-1.5">
                  {ANSWERS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      role="radio"
                      aria-checked={val === a}
                      onClick={() => update({ audit: { ...draft.audit, [item.id]: a } })}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                        val === a ? ANSWER_ACTIVE[a] : "border-line bg-white text-ink-muted hover:bg-surface",
                      )}
                    >
                      {AUDIT_ANSWER_LABEL[a]}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </fieldset>
      ))}
    </div>
  );
}

/** Daftar biaya perbaikan yang diisi pengguna (opsional). Tidak ada harga bawaan. */
export function BudgetEditor() {
  const { draft, update, results } = useAssessment();

  const setItem = (id: string, patch: Partial<BudgetItem>) =>
    update({ budget: draft.budget.map((b) => (b.id === id ? { ...b, ...patch } : b)) });

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-bold text-navy">Perkiraan anggaran perbaikan (opsional)</h3>
        <p className="text-xs text-ink-muted">
          Isi bila Anda sudah punya perkiraan biaya (misalnya dari toko/teknisi). Aplikasi tidak menebak harga.
        </p>
      </div>

      {draft.budget.map((b, i) => {
        const parsed = budgetItemSchema.safeParse(b);
        const errs = parsed.success ? {} : Object.fromEntries(parsed.error.issues.map((x) => [String(x.path[0]), x.message]));
        return (
          <div key={b.id} className="grid gap-2 sm:grid-cols-[1fr_200px_auto] sm:items-start">
            <div>
              <TextInput aria-label={`Keterangan biaya ${i + 1}`} placeholder="Contoh: Jeriken 20 L × 2" value={b.label} invalid={!!errs.label && b.label !== ""} maxLength={80} onChange={(e) => setItem(b.id, { label: e.target.value })} />
              {errs.label && b.label !== "" && <p className="mt-1 text-xs text-danger">{errs.label}</p>}
            </div>
            <div>
              <NumberInput aria-label={`Biaya ${i + 1}`} unit="Rp" min={0} step={1000} value={b.amountIdr === 0 ? "" : b.amountIdr} invalid={!!errs.amountIdr} onChange={(e) => setItem(b.id, { amountIdr: e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)) })} />
              {errs.amountIdr && <p className="mt-1 text-xs text-danger">{errs.amountIdr}</p>}
            </div>
            <ConfirmButton label="Hapus" icon={<Trash2 className="h-3.5 w-3.5" />} ariaLabel={`Hapus biaya ${i + 1}`} onConfirm={() => update({ budget: draft.budget.filter((x) => x.id !== b.id) })} />
          </div>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" className="btn-secondary border-dashed text-teal" onClick={() => update({ budget: [...draft.budget, { id: newId(), label: "", amountIdr: 0 }] })}>
          <Plus className="h-4 w-4" aria-hidden />
          Tambah biaya
        </button>
        {draft.budget.length > 0 && (
          <p className="text-sm font-semibold text-navy">
            Total: {formatRupiah(results.budgetTotal)} <span className="text-xs font-normal text-ink-muted">({formatNumber(draft.budget.length)} butir)</span>
          </p>
        )}
      </div>
    </div>
  );
}
