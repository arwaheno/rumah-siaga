import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Ganti NaN/Infinity menjadi 0 secara rekursif (nilai kosong dari input angka). */
export function sanitizeNumbers<T>(value: T): T {
  if (typeof value === "number") return (Number.isFinite(value) ? value : 0) as T;
  if (Array.isArray(value)) return value.map(sanitizeNumbers) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, sanitizeNumbers(v)])) as T;
  }
  return value;
}
