"use client";

import { useFieldArray } from "react-hook-form";
import { Container, Plus, Trash2 } from "lucide-react";
import { useAssessment } from "@/lib/state/assessment-context";
import { storageSchema, type StorageForm } from "@/lib/validations";
import { STORAGE_TYPE_LABEL, newId } from "@/lib/constants";
import { unitVolumes } from "@/lib/calculations";
import { formatLiters } from "@/lib/formatting";
import type { StorageType, StorageUnit } from "@/types/assessment";
import { Field, NumberInput, Select, TextInput } from "@/components/ui/field";
import { ConfirmButton, EmptyState } from "@/components/ui/misc";
import { StockDonut } from "@/components/charts/charts";
import { InfoBox, OptionsSelectItems, StepFrame } from "./step-frame";
import { useDraftForm } from "./use-draft-form";

const TYPE_PRESET: Record<StorageType, Partial<StorageUnit> & { name: string }> = {
  toren: { name: "Toren utama", capacity: 500, intendedUse: "umum", accessDuringOutage: "belum_diketahui" },
  galon: { name: "Galon air minum", capacity: 19, intendedUse: "minum", accessDuringOutage: "ya" },
  jeriken: { name: "Jeriken", capacity: 20, intendedUse: "umum", accessDuringOutage: "ya" },
  drum: { name: "Drum", capacity: 100, intendedUse: "umum", accessDuringOutage: "ya" },
  lainnya: { name: "Wadah lain", capacity: 20, intendedUse: "umum", accessDuringOutage: "ya" },
};

function blankUnit(type: StorageType = "toren"): StorageUnit {
  const p = TYPE_PRESET[type];
  return {
    id: newId(),
    name: p.name,
    type,
    quantity: 1,
    capacity: p.capacity ?? 100,
    fillPercent: 100,
    unusable: 0,
    intendedUse: p.intendedUse ?? "umum",
    quality: "belum_diverifikasi",
    accessDuringOutage: p.accessDuringOutage ?? "belum_diketahui",
  };
}

export function StepStorage({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { draft, update, results } = useAssessment();
  const form = useDraftForm<StorageForm>(storageSchema, { storage: draft.storage }, (v) => update({ storage: v.storage as StorageUnit[] }));
  const { control, register, formState, watch } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "storage" });
  const live = watch("storage");

  const next = async () => {
    if (await form.trigger()) onNext();
  };

  return (
    <StepFrame step={3} description="Masukkan semua tempat penyimpanan air yang Anda miliki: toren, galon, jeriken, drum, atau wadah lain." onPrev={onPrev} onNext={next}>
      <InfoBox title="Cara menghitung volume yang benar-benar bisa dipakai">
        Volume terisi = kapasitas × persen terisi. Volume efektif = volume terisi dikurangi bagian yang tidak bisa diambil (endapan di dasar, di bawah lubang keran). Contoh: toren 500 L terisi 80% = 400 L; bila 22 L tak terpakai, efektifnya 378 L. Air di wadah serba guna <b>tidak dianggap layak minum</b>.
      </InfoBox>

      {fields.length === 0 && (
        <EmptyState icon={<Container className="h-8 w-8" />} title="Belum ada wadah penyimpanan" description="Tambahkan toren, galon, jeriken, atau wadah lain. Tanpa wadah, hasil perhitungan berstatus data belum lengkap." />
      )}

      <div className="space-y-4">
        {fields.map((f, i) => {
          const err = formState.errors.storage?.[i];
          const row = live?.[i];
          const vols = row
            ? unitVolumes({
                capacity: Number(row.capacity),
                fillPercent: Number(row.fillPercent),
                unusable: Number(row.unusable),
                quantity: Number(row.quantity),
              })
            : null;
          return (
            <fieldset key={f.id} className="rounded-xl border border-line bg-surface/50 p-4">
              <legend className="sr-only">Wadah {i + 1}</legend>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-navy">Wadah {i + 1}</span>
                <ConfirmButton label="Hapus" icon={<Trash2 className="h-3.5 w-3.5" />} ariaLabel={`Hapus wadah ${i + 1}`} onConfirm={() => remove(i)} />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Nama" htmlFor={`u-name-${i}`} error={err?.name?.message} className="sm:col-span-2">
                  <TextInput id={`u-name-${i}`} invalid={!!err?.name} {...register(`storage.${i}.name`)} />
                </Field>
                <Field label="Jenis wadah" htmlFor={`u-type-${i}`}>
                  <Select id={`u-type-${i}`} {...register(`storage.${i}.type`)}>
                    <OptionsSelectItems options={Object.entries(STORAGE_TYPE_LABEL)} />
                  </Select>
                </Field>
                <Field label="Kapasitas per wadah" htmlFor={`u-cap-${i}`} error={err?.capacity?.message}>
                  <NumberInput id={`u-cap-${i}`} unit="liter" min={0} step="any" invalid={!!err?.capacity} {...register(`storage.${i}.capacity`, { valueAsNumber: true })} />
                </Field>
                <Field label="Terisi saat ini" htmlFor={`u-fill-${i}`} error={err?.fillPercent?.message}>
                  <NumberInput id={`u-fill-${i}`} unit="%" min={0} max={100} step={1} invalid={!!err?.fillPercent} {...register(`storage.${i}.fillPercent`, { valueAsNumber: true })} />
                </Field>
                <Field label="Jumlah wadah" htmlFor={`u-qty-${i}`} error={err?.quantity?.message}>
                  <NumberInput id={`u-qty-${i}`} unit="unit" min={1} step={1} invalid={!!err?.quantity} {...register(`storage.${i}.quantity`, { valueAsNumber: true })} />
                </Field>
                <Field label="Volume tak terpakai" htmlFor={`u-un-${i}`} error={err?.unusable?.message} help="Air di dasar yang tidak bisa diambil (per wadah). Isi 0 bila tidak ada.">
                  <NumberInput id={`u-un-${i}`} unit="liter" min={0} step="any" invalid={!!err?.unusable} {...register(`storage.${i}.unusable`, { valueAsNumber: true })} />
                </Field>
                <Field label="Peruntukan" htmlFor={`u-use-${i}`} help="Air minum dan air memasak dihitung terpisah dari air serba guna.">
                  <Select id={`u-use-${i}`} {...register(`storage.${i}.intendedUse`)}>
                    <OptionsSelectItems options={[["minum", "Air minum"], ["memasak", "Memasak"], ["umum", "Keperluan rumah tangga umum"], ["sanitasi", "Sanitasi / kebersihan"]]} />
                  </Select>
                </Field>
                <Field label="Kualitas air" htmlFor={`u-q-${i}`} help="Pilih 'terverifikasi' hanya bila Anda sudah memastikan layak minum (misalnya air kemasan bersegel). Aplikasi tidak menyatakan keamanan air.">
                  <Select id={`u-q-${i}`} {...register(`storage.${i}.quality`)}>
                    <OptionsSelectItems options={[["terverifikasi", "Terverifikasi layak minum (oleh Anda)"], ["belum_diverifikasi", "Belum diverifikasi"], ["bukan_untuk_diminum", "Bukan untuk diminum"]]} />
                  </Select>
                </Field>
                <Field label="Bisa diambil saat listrik padam?" htmlFor={`u-acc-${i}`} help="Contoh: jeriken/galon = ya. Toren di atas yang hanya mengalir lewat pompa listrik = tidak.">
                  <Select id={`u-acc-${i}`} {...register(`storage.${i}.accessDuringOutage`)}>
                    <OptionsSelectItems options={[["ya", "Ya"], ["tidak", "Tidak (perlu listrik/pompa)"], ["belum_diketahui", "Belum diketahui"]]} />
                  </Select>
                </Field>
              </div>
              {vols && (
                <p className="mt-3 text-xs text-ink-muted">
                  Terisi: <b className="text-navy">{formatLiters(vols.physicalTotal)}</b> · Efektif:{" "}
                  <b className="text-navy">{formatLiters(vols.effectiveTotal)}</b>
                </p>
              )}
            </fieldset>
          );
        })}
      </div>

      <button type="button" className="btn-secondary w-full border-dashed text-teal sm:w-auto" onClick={() => append(blankUnit(fields.length === 0 ? "toren" : "jeriken"))}>
        <Plus className="h-4 w-4" aria-hidden />
        Tambah penyimpanan
      </button>

      {results.effectiveTotal > 0 && (
        <div className="rounded-xl border border-line p-4">
          <h3 className="mb-2 text-sm font-bold text-navy">Komposisi stok air (volume efektif)</h3>
          <StockDonut composition={results.composition} total={results.effectiveTotal} />
        </div>
      )}
    </StepFrame>
  );
}
