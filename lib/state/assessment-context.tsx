"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Assessment } from "@/types/assessment";
import { newAssessment } from "@/lib/constants";
import { localRepository } from "@/lib/storage";
import { buildRecommendations, computeResults, type Recommendation, type Results } from "@/lib/calculations";

interface Ctx {
  /** false sampai LocalStorage selesai dibaca (hindari mismatch SSR). */
  ready: boolean;
  draft: Assessment;
  results: Results;
  recommendations: Recommendation[];
  update: (patch: Partial<Assessment>) => void;
  setStep: (n: number) => void;
  /** Simpan draft saat ini ke riwayat. */
  saveToHistory: (completed?: boolean) => Assessment;
  /** Mulai perhitungan baru (draft kosong). */
  startNew: () => void;
  /** Buka assessment dari riwayat ke draft. */
  open: (a: Assessment) => void;
  /** Hapus semua data lokal. */
  clearAll: () => void;
  historyVersion: number;
  bumpHistory: () => void;
}

const AssessmentContext = createContext<Ctx | null>(null);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<Assessment>(() => newAssessment());
  const [ready, setReady] = useState(false);
  const [historyVersion, setHistoryVersion] = useState(0);
  const loaded = useRef(false);

  useEffect(() => {
    const existing = localRepository.getDraft();
    if (existing) setDraft(existing);
    loaded.current = true;
    setReady(true);
  }, []);

  // Simpan otomatis (debounce ringan).
  useEffect(() => {
    if (!loaded.current) return;
    const t = setTimeout(() => localRepository.saveDraft(draft), 250);
    return () => clearTimeout(t);
  }, [draft]);

  const update = useCallback((patch: Partial<Assessment>) => {
    setDraft((d) => ({ ...d, ...patch, updatedAt: new Date().toISOString() }));
  }, []);

  const setStep = useCallback((n: number) => {
    setDraft((d) => (d.step === n ? d : { ...d, step: n }));
  }, []);

  const saveToHistory = useCallback(
    (completed = true) => {
      const saved = localRepository.save({ ...draft, completed: completed || draft.completed });
      setDraft((d) => ({ ...d, completed: completed || d.completed, updatedAt: saved.updatedAt }));
      setHistoryVersion((v) => v + 1);
      return saved;
    },
    [draft],
  );

  const startNew = useCallback(() => {
    const fresh = newAssessment();
    localRepository.saveDraft(fresh);
    setDraft(fresh);
  }, []);

  const open = useCallback((a: Assessment) => {
    localRepository.saveDraft(a);
    setDraft(a);
  }, []);

  const clearAll = useCallback(() => {
    localRepository.clearAll();
    setDraft(newAssessment());
    setHistoryVersion((v) => v + 1);
  }, []);

  const bumpHistory = useCallback(() => setHistoryVersion((v) => v + 1), []);

  const results = useMemo(() => computeResults(draft), [draft]);
  const recommendations = useMemo(() => buildRecommendations(draft, results), [draft, results]);

  const value: Ctx = {
    ready,
    draft,
    results,
    recommendations,
    update,
    setStep,
    saveToHistory,
    startNew,
    open,
    clearAll,
    historyVersion,
    bumpHistory,
  };

  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
}

export function useAssessment(): Ctx {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error("useAssessment harus dipakai di dalam AssessmentProvider");
  return ctx;
}
