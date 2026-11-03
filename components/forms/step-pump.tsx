"use client";

import { useAssessment } from "@/lib/state/assessment-context";
import { pumpSchema } from "@/lib/validations";
import { pumpRisk } from "@/lib/calculations";
import type { PumpAssessment } from "@/types/assessment";
import { Field, Select } from "@/components/ui/field";
import { RiskBadge } from "@/components/ui/badges";
import { InfoBox, OptionsSelectItems, StepFrame } from "./step-frame";
import { useDraftForm } from "./use-draft-form";

const YNU: [string, string][] = [["ya", "Ya"], ["tidak", "Tidak"], ["belum_diketahui", "Belum diketahui"]];

export function StepPump({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { draft, update } = useAssessment();
  const form = useDraftForm<PumpAssessment>(pumpSchema, draft.pump, (pump) => update({ pump }));
  const { register, watch } = form;
  const live = watch() as PumpAssessment;
  const risk = pumpRisk(live);

  const next = async () => {
    if (await form.trigger()) onNext();
  };

  return (
    <StepFrame step={4} description="Seberapa bergantung air rumah Anda pada pompa dan listrik, dan apa cadangannya." onPrev={onPrev} onNext={next}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Apakah ada pompa air utama?" htmlFor="hasPump">
          <Select id="hasPump" {...register("hasPump")}>
            <OptionsSelectItems options={YNU} />
          </Select>
        </Field>
        <Field label="Jenis pompa" htmlFor="pumpType">
          <Select id="pumpType" {...register("pumpType")}>
            <OptionsSelectItems options={[["listrik", "Pompa listrik"], ["manual", "Pompa manual / tangan"], ["lainnya", "Lainnya"], ["tidak_ada", "Tidak ada pompa"]]} />
          </Select>
        </Field>
        <Field label="Ketergantungan pada listrik" htmlFor="powerDependency" help="Bila listrik padam, apakah keran di rumah masih mengalir? Coba matikan pompa sebentar untuk mengetahuinya.">
          <Select id="powerDependency" {...register("powerDependency")}>
            <OptionsSelectItems options={[["bergantung", "Bergantung penuh"], ["sebagian", "Sebagian bergantung"], ["tidak_bergantung", "Tidak bergantung"], ["belum_diketahui", "Belum diketahui"]]} />
          </Select>
        </Field>
        <Field label="Listrik cadangan tersedia?" htmlFor="backupPower" help="Misalnya genset atau sumber daya cadangan yang aman dipakai untuk pompa. Pemasangan dikerjakan teknisi berkompeten.">
          <Select id="backupPower" {...register("backupPower")}>
            <OptionsSelectItems options={YNU} />
          </Select>
        </Field>
        <Field label="Akses air alternatif tanpa listrik?" htmlFor="alternativeAccess" help="Misalnya sumur timba, pompa tangan, atau sumber air terdekat yang bisa dijangkau.">
          <Select id="alternativeAccess" {...register("alternativeAccess")}>
            <OptionsSelectItems options={YNU} />
          </Select>
        </Field>
        <Field label="Distribusi memakai gravitasi?" htmlFor="gravityFed" help="Toren di tempat tinggi yang mengalirkan air ke keran tanpa pompa.">
          <Select id="gravityFed" {...register("gravityFed")}>
            <OptionsSelectItems options={YNU} />
          </Select>
        </Field>
        <Field label="Kondisi pompa" htmlFor="pumpStatus">
          <Select id="pumpStatus" {...register("pumpStatus")}>
            <OptionsSelectItems options={[["baik", "Berfungsi baik"], ["bermasalah", "Bermasalah / kadang gagal"], ["tidak_berfungsi", "Tidak berfungsi"], ["belum_diperiksa", "Belum diperiksa"]]} />
          </Select>
        </Field>
        <Field label="Anggota keluarga paham cara pompa bekerja?" htmlFor="operationKnowledge">
          <Select id="operationKnowledge" {...register("operationKnowledge")}>
            <OptionsSelectItems options={[["semua", "Ya, semua dewasa"], ["sebagian", "Sebagian saja"], ["tidak", "Belum ada yang paham"], ["belum_diketahui", "Belum diketahui"]]} />
          </Select>
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface/60 p-4">
        <span className="text-sm font-bold text-navy">Risiko pompa/listrik:</span>
        <RiskBadge level={risk.level} />
        <p className="w-full text-sm text-ink-muted">{risk.explanation}</p>
      </div>

      <InfoBox title="Catatan keselamatan">
        Aplikasi ini tidak memberi petunjuk memodifikasi instalasi listrik atau pompa. Pekerjaan kelistrikan sebaiknya dilakukan teknisi berkompeten.
      </InfoBox>
    </StepFrame>
  );
}
