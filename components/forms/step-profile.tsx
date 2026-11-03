"use client";

import { Controller } from "react-hook-form";
import { useAssessment } from "@/lib/state/assessment-context";
import { profileSchema } from "@/lib/validations";
import { DEMAND_SCENARIOS, HOUSING_LABEL, TARGET_PRESETS } from "@/lib/constants";
import type { DemandScenario, Profile } from "@/types/assessment";
import { Field, NumberInput, Select, TextInput } from "@/components/ui/field";
import { ChoiceCards } from "@/components/ui/misc";
import { InfoBox, OptionsSelectItems, StepFrame } from "./step-frame";
import { useDraftForm } from "./use-draft-form";

export function StepProfile({ onNext }: { onNext: () => void }) {
  const { draft, update } = useAssessment();
  const form = useDraftForm<Profile>(profileSchema, draft.profile, (profile) => update({ profile }));
  const { register, control, setValue, watch, formState } = form;
  const e = formState.errors;
  const preset = watch("targetPreset");

  const next = async () => {
    if (await form.trigger()) onNext();
  };

  return (
    <StepFrame step={1} description="Data dasar rumah tangga untuk menghitung kebutuhan air." onNext={next}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama rumah" htmlFor="houseName" error={e.houseName?.message} hint="Contoh: Rumah Keluarga Santoso">
          <TextInput id="houseName" invalid={!!e.houseName} maxLength={80} {...register("houseName")} />
        </Field>
        <Field label="Lokasi (opsional)" htmlFor="location" error={e.location?.message} hint="Contoh: Bekasi, Jawa Barat">
          <TextInput id="location" maxLength={120} {...register("location")} />
        </Field>
        <Field label="Jenis hunian" htmlFor="housingType">
          <Select id="housingType" {...register("housingType")}>
            <OptionsSelectItems options={Object.entries(HOUSING_LABEL)} />
          </Select>
        </Field>
        <Field
          label="Jumlah penghuni"
          htmlFor="occupants"
          error={e.occupants?.message}
          help="Semua orang yang biasanya tinggal dan memakai air di rumah ini."
        >
          <NumberInput id="occupants" unit="orang" min={1} step={1} invalid={!!e.occupants} {...register("occupants", { valueAsNumber: true })} />
        </Field>
        <Field label="Di antaranya anak-anak" htmlFor="children" error={e.children?.message} hint="Opsional. Hanya sebagai catatan profil.">
          <NumberInput id="children" unit="orang" min={0} step={1} invalid={!!e.children} {...register("children", { valueAsNumber: true })} />
        </Field>
        <Field label="Di antaranya lansia" htmlFor="elderly" error={e.elderly?.message} hint="Opsional. Hanya sebagai catatan profil.">
          <NumberInput id="elderly" unit="orang" min={0} step={1} invalid={!!e.elderly} {...register("elderly", { valueAsNumber: true })} />
        </Field>
      </div>

      <Field label="Target ketahanan air" error={e.targetDays?.message} help="Berapa hari Anda ingin cadangan air mencukupi saat pasokan terganggu.">
        <Controller
          control={control}
          name="targetPreset"
          render={({ field }) => (
            <ChoiceCards
              name="targetPreset"
              columns={4}
              value={field.value}
              onChange={(v) => {
                field.onChange(v);
                if (v !== "custom") setValue("targetDays", v as number, { shouldValidate: true });
              }}
              options={[
                ...TARGET_PRESETS.map((d) => ({ value: d as 1 | 3 | 7 | 14 | "custom", title: `${d} hari` })),
                { value: "custom" as const, title: "Kustom" },
              ]}
            />
          )}
        />
        {preset === "custom" && (
          <div className="mt-2 max-w-xs">
            <NumberInput aria-label="Target kustom dalam hari" unit="hari" min={0.5} step={0.5} invalid={!!e.targetDays} {...register("targetDays", { valueAsNumber: true })} />
          </div>
        )}
      </Field>

      <Field label="Skenario kebutuhan air" help="Skenario ini hanya parameter simulasi, bukan standar keselamatan.">
        <Controller
          control={control}
          name="scenario"
          render={({ field }) => (
            <ChoiceCards<DemandScenario>
              name="scenario"
              columns={4}
              value={field.value}
              onChange={(v) => {
                field.onChange(v);
                if (v !== "custom") setValue("litersPerPersonPerDay", DEMAND_SCENARIOS[v].liters, { shouldValidate: true });
              }}
              options={[
                ...(Object.entries(DEMAND_SCENARIOS) as [Exclude<DemandScenario, "custom">, (typeof DEMAND_SCENARIOS)["darurat"]][]).map(([k, s]) => ({
                  value: k as DemandScenario,
                  title: s.label,
                  subtitle: `${s.liters} L/orang/hari · ${s.hint}`,
                })),
                { value: "custom" as DemandScenario, title: "Kustom", subtitle: "Isi sendiri" },
              ]}
            />
          )}
        />
        <div className="mt-2 max-w-xs">
          <label htmlFor="lpp" className="mb-1 block text-xs font-semibold text-ink-muted">
            Kebutuhan air (dapat diubah)
          </label>
          <NumberInput
            id="lpp"
            unit="L/orang/hari"
            min={1}
            step={1}
            invalid={!!e.litersPerPersonPerDay}
            {...register("litersPerPersonPerDay", {
              valueAsNumber: true,
              onChange: (ev) => {
                const v = Number(ev.target.value);
                const match = (Object.entries(DEMAND_SCENARIOS) as [Exclude<DemandScenario, "custom">, { liters: number }][]).find(([, s]) => s.liters === v);
                setValue("scenario", match ? match[0] : "custom");
              },
            })}
          />
          {e.litersPerPersonPerDay && <p role="alert" className="mt-1 text-xs font-medium text-danger">{e.litersPerPersonPerDay.message}</p>}
        </div>
      </Field>

      <InfoBox title="Kebutuhan air berbeda untuk tiap rumah">
        Angka di atas hanyalah titik awal simulasi. Kebutuhan sebenarnya bergantung pada iklim, aktivitas, komposisi keluarga (anak, lansia, kondisi kesehatan), kebiasaan kebersihan, dan panduan kesehatan masyarakat yang berlaku. Sesuaikan dengan kondisi Anda.
      </InfoBox>
    </StepFrame>
  );
}
