import type { Assessment } from "@/types/assessment";
import {
  STORAGE_PREFIX,
  defaultDistribution,
  defaultDrinking,
  defaultProfile,
  defaultPump,
  emptyAudit,
  newAssessment,
  newId,
} from "@/lib/constants";
import { isValidAssessmentShape } from "@/lib/validations";

const DRAFT_KEY = `${STORAGE_PREFIX}:draft:v1`;
const HISTORY_KEY = `${STORAGE_PREFIX}:assessments:v1`;

/**
 * Antarmuka repositori. Implementasi MVP memakai LocalStorage; untuk migrasi ke
 * Supabase/database lain cukup menyediakan implementasi lain dari antarmuka ini.
 */
export interface AssessmentRepository {
  getDraft(): Assessment | null;
  saveDraft(a: Assessment): void;
  clearDraft(): void;
  list(): Assessment[];
  get(id: string): Assessment | null;
  save(a: Assessment): Assessment;
  remove(id: string): void;
  duplicate(id: string): Assessment | null;
  clearAll(): void;
}

function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function read<T>(key: string): T | null {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): boolean {
  if (!hasStorage()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Lengkapi field yang hilang (mis. data versi lama/impor) dengan nilai bawaan. */
export function normalizeAssessment(raw: Assessment): Assessment {
  const fresh = newAssessment();
  return {
    ...fresh,
    ...raw,
    profile: { ...defaultProfile(), ...raw.profile },
    sources: Array.isArray(raw.sources) ? raw.sources : [],
    storage: Array.isArray(raw.storage) ? raw.storage : [],
    pump: { ...defaultPump(), ...raw.pump },
    distribution: { ...defaultDistribution(), ...raw.distribution },
    drinking: { ...defaultDrinking(), ...raw.drinking },
    audit: { ...emptyAudit(), ...raw.audit },
    budget: Array.isArray(raw.budget) ? raw.budget : [],
  };
}

export const localRepository: AssessmentRepository = {
  getDraft() {
    const d = read<Assessment>(DRAFT_KEY);
    return d && isValidAssessmentShape(d) ? normalizeAssessment(d) : null;
  },
  saveDraft(a) {
    write(DRAFT_KEY, a);
  },
  clearDraft() {
    if (hasStorage()) window.localStorage.removeItem(DRAFT_KEY);
  },
  list() {
    const items = read<Assessment[]>(HISTORY_KEY);
    if (!Array.isArray(items)) return [];
    return items
      .filter(isValidAssessmentShape)
      .map(normalizeAssessment)
      .sort((x, y) => y.updatedAt.localeCompare(x.updatedAt));
  },
  get(id) {
    return this.list().find((a) => a.id === id) ?? null;
  },
  save(a) {
    const saved: Assessment = { ...a, updatedAt: new Date().toISOString() };
    const items = this.list().filter((x) => x.id !== saved.id);
    write(HISTORY_KEY, [saved, ...items]);
    return saved;
  },
  remove(id) {
    write(HISTORY_KEY, this.list().filter((x) => x.id !== id));
  },
  duplicate(id) {
    const src = this.get(id);
    if (!src) return null;
    const now = new Date().toISOString();
    const copy: Assessment = {
      ...structuredClone(src),
      id: newId(),
      createdAt: now,
      updatedAt: now,
      completed: false,
      step: 1,
      profile: { ...src.profile, houseName: `${src.profile.houseName} (salinan)` },
    };
    write(HISTORY_KEY, [copy, ...this.list()]);
    return copy;
  },
  clearAll() {
    if (!hasStorage()) return;
    window.localStorage.removeItem(DRAFT_KEY);
    window.localStorage.removeItem(HISTORY_KEY);
  },
};

export function exportAssessmentJson(a: Assessment): string {
  return JSON.stringify({ app: "rumah-siaga", version: 1, exportedAt: new Date().toISOString(), assessment: a }, null, 2);
}

export function parseImportedJson(text: string): Assessment | null {
  try {
    const parsed = JSON.parse(text);
    const candidate = parsed?.assessment ?? parsed;
    if (!isValidAssessmentShape(candidate)) return null;
    const normalized = normalizeAssessment(candidate as Assessment);
    return { ...normalized, id: newId(), completed: false };
  } catch {
    return null;
  }
}
