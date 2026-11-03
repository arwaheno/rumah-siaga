"use client";

import { useFieldArray } from "react-hook-form";
import { Plus, Trash2, Waves } from "lucide-react";
import { useAssessment } from "@/lib/state/assessment-context";
import { sourcesSchema, type SourcesForm } from "@/lib/validations";
import { SOURCE_DEFAULT_ROLE, SOURCE_TYPE_LABEL, newId } from "@/lib/constants";
import type { SourceType, WaterSource } from "@/types/assessment";
import { Field, Select, TextInput, Textarea } from "@/components/ui/field";
import { ConfirmButton, EmptyState } from "@/components/ui/misc";
import { InfoBox, OptionsSelectItems, StepFrame } from "./step-frame";
import { useDraftForm } from "./use-draft-form";

const ROLE_LABEL: [string, string][] = [
  ["kontinu", "Pasokan berkelanjutan (mengalir terus)"],
  ["alternatif", "Sumber alternatif (potensial)"],
  ["tersimpan", "Air yang sudah tersimpan"],
];

function blankSource(type: SourceType = "pdam"): WaterSource {
  return {
    id: newId(),
    name: SOURCE_TYPE_LABEL[type],
    type,
    role: SOURCE_DEFAULT_ROLE[type],
    availability: "tersedia",
    reliability: "belum_diketahui",
    quality: "belum_diverifikasi",
    dependsOnElectricity: "belum_diketahui",
    notes: "",
  };
}

export function StepSources({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { draft, update } = useAssessment();
  const form = useDraftForm<SourcesForm>(sourcesSchema, { sources: draft.sources }, (v) => update({ sources: v.sources as WaterSource[] }));
  const { control, register, formState, watch, setValue } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "sources" });

  const next = async () => {
    if (await form.trigger()) onNext();
  };

  return (
    <StepFrame step={2} description="Catat dari mana air rumah Anda berasal. Sumber tidak menambah jumlah liter — volume air hanya dihitung dari wadah di langkah berikutnya." onPrev={onPrev} onNext={next}>
      <InfoBox title="Bedakan tiga hal">
        <b>Air yang sudah tersimpan</b> (di toren/galon) dihitung di Langkah 3. <b>Pasokan berkelanjutan</b> (misalnya PDAM) bisa terhenti kapan saja dan tidak dihitung sebagai cadangan. <b>Sumber alternatif</b> adalah peluang, bukan stok.
      </InfoBox>

      {fields.length === 0 && (
        <EmptyState icon={<Waves className="h-8 w-8" />} title="Belum ada sumber air" description="Tambahkan sumber air yang Anda miliki, misalnya PDAM atau sumur. Anda boleh melewati langkah ini, tetapi penilaian risiko sumber akan berstatus belum diketahui." />
      )}

      <div className="space-y-4">
        {fields.map((f, i) => {
          const err = formState.errors.sources?.[i];
          const role = watch(`sources.${i}.role`);
          return (
            <fieldset key={f.id} className="rounded-xl border border-line bg-surface/50 p-4">
              <legend className="sr-only">Sumber air {i + 1}</legend>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-navy">Sumber {i + 1}</span>
                <ConfirmButton label="Hapus" icon={<Trash2 className="h-3.5 w-3.5" />} ariaLabel={`Hapus sumber ${i + 1}`} onConfirm={() => remove(i)} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nama sumber" htmlFor={`s-name-${i}`} error={err?.name?.message}>
                  <TextInput id={`s-name-${i}`} invalid={!!err?.name} {...register(`sources.${i}.name`)} />
                </Field>
                <Field label="Jenis sumber" htmlFor={`s-type-${i}`}>
                  <Select
                    id={`s-type-${i}`}
                    {...register(`sources.${i}.type`, {
                      onChange: (ev) => setValue(`sources.${i}.role`, SOURCE_DEFAULT_ROLE[ev.target.value as SourceType]),
                    })}
                  >
                    <OptionsSelectItems options={Object.entries(SOURCE_TYPE_LABEL)} />
                  </Select>
                </Field>
                <Field label="Peran sumber" htmlFor={`s-role-${i}`} help="Menentukan apakah sumber ini pasokan berjalan, cadangan potensial, atau air yang sudah ditampung.">
                  <Select id={`s-role-${i}`} {...register(`sources.${i}.role`)}>
                    <OptionsSelectItems options={ROLE_LABEL} />
                  </Select>
                </Field>
                <Field label="Ketersediaan" htmlFor={`s-av-${i}`}>
                  <Select id={`s-av-${i}`} {...register(`sources.${i}.availability`)}>
                    <OptionsSelectItems options={[["tersedia", "Tersedia"], ["terbatas", "Terbatas / tidak selalu"], ["tidak_tersedia", "Tidak tersedia"]]} />
                  </Select>
                </Field>
                <Field label="Keandalan" htmlFor={`s-rel-${i}`} help="Seberapa sering sumber ini benar-benar bisa diandalkan.">
                  <Select id={`s-rel-${i}`} {...register(`sources.${i}.reliability`)}>
                    <OptionsSelectItems options={[["tinggi", "Tinggi"], ["sedang", "Sedang"], ["rendah", "Rendah"], ["belum_diketahui", "Belum diketahui"]]} />
                  </Select>
                </Field>
                <Field label="Status kualitas" htmlFor={`s-q-${i}`} help="Aplikasi ini tidak menyatakan air aman diminum. Pilih 'terverifikasi' hanya bila Anda sudah memastikannya dengan cara yang dapat dipercaya.">
                  <Select id={`s-q-${i}`} {...register(`sources.${i}.quality`)}>
                    <OptionsSelectItems options={[["terverifikasi", "Terverifikasi layak minum (oleh Anda)"], ["belum_diverifikasi", "Belum diverifikasi"], ["bukan_untuk_diminum", "Bukan untuk diminum"]]} />
                  </Select>
                </Field>
                <Field label="Bergantung pada listrik?" htmlFor={`s-el-${i}`} help="Misalnya sumur yang disedot pompa listrik.">
                  <Select id={`s-el-${i}`} {...register(`sources.${i}.dependsOnElectricity`)}>
                    <OptionsSelectItems options={[["ya", "Ya"], ["tidak", "Tidak"], ["belum_diketahui", "Belum diketahui"]]} />
                  </Select>
                </Field>
                <Field label="Catatan (opsional)" htmlFor={`s-n-${i}`} error={err?.notes?.message} className="sm:col-span-2">
                  <Textarea id={`s-n-${i}`} maxLength={300} {...register(`sources.${i}.notes`)} />
                </Field>
              </div>
              {role === "tersimpan" && (
                <p className="mt-3 rounded-lg bg-warn-soft px-3 py-2 text-xs text-warn-text">
                  Air yang sudah tersimpan harus dicatat sebagai wadah di Langkah 3 agar volumenya dihitung. Di sini hanya dicatat sebagai sumber, tanpa liter, supaya tidak terhitung dua kali.
                </p>
              )}
            </fieldset>
          );
        })}
      </div>

      <button type="button" className="btn-secondary w-full border-dashed text-teal sm:w-auto" onClick={() => append(blankSource())}>
        <Plus className="h-4 w-4" aria-hidden />
        Tambah sumber air
      </button>
    </StepFrame>
  );
}
