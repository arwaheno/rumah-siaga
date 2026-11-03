"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useAssessment } from "@/lib/state/assessment-context";
import { drinkingSchema } from "@/lib/validations";
import { formatDays, formatLiters } from "@/lib/formatting";
import { dailyDemand, enduranceDays } from "@/lib/calculations";
import type { DrinkingAssessment } from "@/types/assessment";
import { Field, NumberInput, Select, Textarea } from "@/components/ui/field";
import { InfoBox, OptionsSelectItems, StepFrame } from "./step-frame";
import { useDraftForm } from "./use-draft-form";

const COND: [string, string][] = [["baik", "Baik"], ["cukup", "Cukup"], ["buruk", "Buruk"], ["belum_diperiksa", "Belum diperiksa"]];

export function StepDrinking({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { draft, update, results } = useAssessment();
  const form = useDraftForm<DrinkingAssessment>(drinkingSchema, draft.drinking, (drinking) => update({ drinking }));
  const { register, watch, formState } = form;
  const liters = Number(watch("litersPerPersonPerDay"));
  const daily = dailyDemand(draft.profile.occupants, Number.isFinite(liters) ? liters : 0);
  const endurance = enduranceDays(results.drinkingVerifiedAccessible, daily);

  const next = async () => {
    if (await form.trigger()) onNext();
  };

  return (
    <StepFrame step={6} description="Air minum dan memasak dihitung terpisah dari air keperluan umum." onPrev={onPrev} onNext={next}>
      <InfoBox tone="warn" title="Air jernih belum tentu aman diminum">
        Aplikasi ini tidak dapat menyatakan sebuah air aman diminum. Hanya wadah yang Anda tandai <b>peruntukan minum/memasak</b> dan <b>kualitas terverifikasi</b> yang dihitung sebagai air minum. Jika kualitas belum diketahui, air dihitung sebagai belum terverifikasi.
      </InfoBox>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface/60 p-4">
          <p className="text-xs font-semibold text-ink-muted">Stok air minum/masak (dari Langkah 3)</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-navy">{formatLiters(results.drinkingStockTotal)}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface/60 p-4">
          <p className="text-xs font-semibold text-ink-muted">Di antaranya terverifikasi & bisa diakses</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-brand-green">{formatLiters(results.drinkingVerifiedAccessible)}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface/60 p-4">
          <p className="text-xs font-semibold text-ink-muted">Ketahanan air minum</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-navy">{formatDays(endurance)}</p>
        </div>
      </div>
      <p className="-mt-2 text-xs text-ink-muted">
        Jumlah ini diambil dari wadah di Langkah 3 agar tidak dihitung dua kali. Untuk menambah atau mengubah, kembali ke{" "}
        <Link href="/calculator?step=3" className="font-semibold text-teal underline">Penyimpanan Air</Link>.
        {results.drinkingStockTotal === 0 && (
          <span className="mt-1 flex items-center gap-1 font-semibold text-danger">
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden /> Belum ada wadah berperuntukan minum/memasak.
          </span>
        )}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Kebutuhan air minum & memasak" htmlFor="dl" error={formState.errors.litersPerPersonPerDay?.message} help="Parameter simulasi yang dapat Anda ubah sesuai kondisi keluarga.">
          <NumberInput id="dl" unit="L/orang/hari" min={0.5} step={0.5} invalid={!!formState.errors.litersPerPersonPerDay} {...register("litersPerPersonPerDay", { valueAsNumber: true })} />
        </Field>
        <Field label="Kebersihan penyimpanan air minum" htmlFor="hyg">
          <Select id="hyg" {...register("storageHygiene")}>
            <OptionsSelectItems options={COND} />
          </Select>
        </Field>
        <Field label="Kondisi wadah" htmlFor="cc" help="Retak, berlumut, atau tutup rusak termasuk kondisi buruk.">
          <Select id="cc" {...register("containerCondition")}>
            <OptionsSelectItems options={COND} />
          </Select>
        </Field>
        <Field label="Catatan verifikasi kualitas (opsional)" htmlFor="vn" error={formState.errors.verificationNote?.message} hint="Misalnya: air kemasan bersegel, dimasak sebelum diminum.">
          <Textarea id="vn" maxLength={300} {...register("verificationNote")} />
        </Field>
      </div>
    </StepFrame>
  );
}
