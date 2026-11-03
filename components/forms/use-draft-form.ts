"use client";

import { useEffect } from "react";
import { useForm, type FieldValues, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";
import { sanitizeNumbers } from "@/lib/utils";

/**
 * Form RHF yang menyalin setiap perubahan ke draft (autosave ke LocalStorage lewat provider).
 * Nilai angka kosong (NaN) disimpan sebagai 0 di draft, tetapi input tetap kosong agar pengguna
 * bisa mengetik; validasi menolak nilai kosong saat menekan "Lanjut".
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDraftForm<T extends FieldValues>(schema: ZodType<any>, defaults: T, onChange: (v: T) => void): UseFormReturn<T> {
  const form = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as any,
    defaultValues: defaults as never,
    mode: "onChange",
  });

  useEffect(() => {
    const sub = form.watch((values) => onChange(sanitizeNumbers(values as T)));
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  return form;
}
