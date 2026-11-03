"use client";

import { useAssessment } from "@/lib/state/assessment-context";
import { distributionSchema } from "@/lib/validations";
import { distributionRisk } from "@/lib/calculations";
import type { DistributionAssessment } from "@/types/assessment";
import { Field, NumberInput, Select } from "@/components/ui/field";
import { RiskBadge } from "@/components/ui/badges";
import { OptionsSelectItems, StepFrame } from "./step-frame";
import { useDraftForm } from "./use-draft-form";

export function StepDistribution({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { draft, update } = useAssessment();
  const form = useDraftForm<DistributionAssessment>(distributionSchema, draft.distribution, (distribution) => update({ distribution }));
  const { register, watch, formState } = form;
  const live = watch() as DistributionAssessment;
  const risk = distributionRisk({ ...live, usableTaps: Number.isFinite(Number(live.usableTaps)) ? Number(live.usableTaps) : 0 });

  const next = async () => {
    if (await form.trigger()) onNext();
  };

  return (
    <StepFrame step={5} description="Bagaimana air mengalir dari penyimpanan ke titik pemakaian di rumah." onPrev={onPrev} onNext={next}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Jalur distribusi utama" htmlFor="mainPath">
          <Select id="mainPath" {...register("mainPath")}>
            <OptionsSelectItems options={[["toren_gravitasi", "Toren di atas → keran (gravitasi)"], ["pompa_langsung", "Pompa → keran"], ["pdam_langsung", "PDAM langsung ke keran"], ["manual", "Diangkut manual (ember/jeriken)"], ["lainnya", "Lainnya"]]} />
          </Select>
        </Field>
        <Field label="Kondisi pipa" htmlFor="pipeCondition">
          <Select id="pipeCondition" {...register("pipeCondition")}>
            <OptionsSelectItems options={[["baik", "Baik"], ["cukup", "Cukup"], ["buruk", "Buruk (karat, retak, sering macet)"], ["belum_diperiksa", "Belum diperiksa"]]} />
          </Select>
        </Field>
        <Field label="Kebocoran" htmlFor="leakage">
          <Select id="leakage" {...register("leakage")}>
            <OptionsSelectItems options={[["tidak_ada", "Tidak ada"], ["kecil", "Ada, kecil"], ["signifikan", "Ada, signifikan"], ["belum_diperiksa", "Belum diperiksa"]]} />
          </Select>
        </Field>
        <Field label="Jumlah keran yang dapat dipakai" htmlFor="usableTaps" error={formState.errors.usableTaps?.message}>
          <NumberInput id="usableTaps" unit="keran" min={0} step={1} invalid={!!formState.errors.usableTaps} {...register("usableTaps", { valueAsNumber: true })} />
        </Field>
        <Field label="Akses ke wadah penyimpanan" htmlFor="storageAccessibility" help="Apakah toren/wadah mudah dijangkau untuk mengambil air.">
          <Select id="storageAccessibility" {...register("storageAccessibility")}>
            <OptionsSelectItems options={[["mudah", "Mudah dijangkau"], ["sulit", "Sulit dijangkau"], ["tidak_bisa", "Tidak bisa dijangkau"], ["belum_diketahui", "Belum diketahui"]]} />
          </Select>
        </Field>
        <Field label="Air mengalir ke keran dengan gravitasi?" htmlFor="gravityAccess">
          <Select id="gravityAccess" {...register("gravityAccess")}>
            <OptionsSelectItems options={[["ya", "Ya"], ["tidak", "Tidak"], ["belum_diketahui", "Belum diketahui"]]} />
          </Select>
        </Field>
        <Field label="Air bisa disalurkan tanpa listrik?" htmlFor="distributeWithoutPower" className="sm:col-span-2">
          <Select id="distributeWithoutPower" {...register("distributeWithoutPower")}>
            <OptionsSelectItems options={[["ya", "Ya, ke semua titik"], ["sebagian", "Sebagian titik saja"], ["tidak", "Tidak bisa"], ["belum_diketahui", "Belum diketahui"]]} />
          </Select>
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface/60 p-4">
        <span className="text-sm font-bold text-navy">Status infrastruktur distribusi:</span>
        <RiskBadge level={risk.level} />
        <p className="w-full text-sm text-ink-muted">{risk.explanation}</p>
      </div>
    </StepFrame>
  );
}
