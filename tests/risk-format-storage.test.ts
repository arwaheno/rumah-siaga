import { beforeEach, describe, expect, it } from "vitest";
import { distributionRisk, sourcesRisk } from "@/lib/calculations";
import { defaultDistribution, newId } from "@/lib/constants";
import { formatDate, formatDays, formatNumber, formatRupiah } from "@/lib/formatting";
import { exportAssessmentJson, localRepository, parseImportedJson } from "@/lib/storage";
import type { DistributionAssessment, WaterSource } from "@/types/assessment";
import { base, unit } from "./fixtures";

const dist = (p: Partial<DistributionAssessment>): DistributionAssessment => ({
  mainPath: "toren_gravitasi",
  pipeCondition: "baik",
  leakage: "tidak_ada",
  usableTaps: 4,
  storageAccessibility: "mudah",
  gravityAccess: "ya",
  distributeWithoutPower: "ya",
  ...p,
});

describe("distribution risk", () => {
  it("all good → rendah", () => {
    expect(distributionRisk(dist({})).level).toBe("rendah");
  });
  it("two minor findings (small leak + partial no-power) → sedang, not tinggi", () => {
    expect(distributionRisk(dist({ leakage: "kecil", distributeWithoutPower: "sebagian" })).level).toBe("sedang");
  });
  it("one severe finding → tinggi", () => {
    expect(distributionRisk(dist({ leakage: "signifikan" })).level).toBe("tinggi");
    expect(distributionRisk(dist({ distributeWithoutPower: "tidak" })).level).toBe("tinggi");
  });
  it("three minor findings accumulate → tinggi", () => {
    expect(distributionRisk(dist({ leakage: "kecil", pipeCondition: "cukup", storageAccessibility: "sulit" })).level).toBe("tinggi");
  });
  it("mostly unchecked → belum_diketahui (never 'rendah')", () => {
    expect(distributionRisk(defaultDistribution()).level).toBe("belum_diketahui");
  });
});

describe("sources risk", () => {
  const src = (p: Partial<WaterSource>): WaterSource => ({
    id: newId(),
    name: "Sumber",
    type: "pdam",
    role: "kontinu",
    availability: "tersedia",
    reliability: "tinggi",
    quality: "belum_diverifikasi",
    dependsOnElectricity: "tidak",
    notes: "",
    ...p,
  });
  it("no sources → belum_diketahui", () => {
    expect(sourcesRisk([]).level).toBe("belum_diketahui");
  });
  it("stored-only or unavailable sources → tinggi", () => {
    expect(sourcesRisk([src({ role: "tersimpan" }), src({ availability: "tidak_tersedia" })]).level).toBe("tinggi");
  });
  it("a reliable source → rendah; all electricity-dependent raises it", () => {
    expect(sourcesRisk([src({})]).level).toBe("rendah");
    expect(sourcesRisk([src({ dependsOnElectricity: "ya" })]).level).toBe("sedang");
  });
});

describe("formatting (id-ID)", () => {
  it("uses dot thousands separators and Rp prefix", () => {
    expect(formatNumber(1000)).toBe("1.000");
    expect(formatNumber(10000)).toBe("10.000");
    expect(formatRupiah(100000)).toBe("Rp100.000");
  });
  it("is safe for NaN/Infinity", () => {
    expect(formatNumber(Number.NaN)).toBe("0");
    expect(formatRupiah(Number.POSITIVE_INFINITY)).toBe("Rp0");
    expect(formatDays(null)).toBe("—");
  });
  it("formats Indonesian dates", () => {
    expect(formatDate("2026-11-03T05:00:00Z")).toBe("3 November 2026");
    expect(formatDate("not-a-date")).toBe("—");
  });
});

/* --------------------------- LocalStorage repository --------------------------- */

class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}

describe("local repository", () => {
  let store: MemoryStorage;
  beforeEach(() => {
    store = new MemoryStorage();
    (globalThis as unknown as { window: unknown }).window = { localStorage: store };
  });

  it("saves, lists, duplicates, removes", () => {
    const a = { ...base(), storage: [unit({})] };
    a.profile.houseName = "Rumah A";
    const saved = localRepository.save(a);
    expect(localRepository.list()).toHaveLength(1);

    const copy = localRepository.duplicate(saved.id)!;
    expect(copy.id).not.toBe(saved.id);
    expect(copy.profile.houseName).toBe("Rumah A (salinan)");
    expect(localRepository.list()).toHaveLength(2);

    localRepository.remove(saved.id);
    expect(localRepository.list().map((x) => x.id)).toEqual([copy.id]);
  });

  it("persists the draft and clears everything", () => {
    const a = base();
    localRepository.saveDraft(a);
    expect(localRepository.getDraft()?.id).toBe(a.id);
    localRepository.save(a);
    localRepository.clearAll();
    expect(localRepository.getDraft()).toBeNull();
    expect(localRepository.list()).toEqual([]);
  });

  it("survives corrupted storage without throwing", () => {
    store.setItem("rumahsiaga:draft:v1", "{not json");
    store.setItem("rumahsiaga:assessments:v1", "[1, 2, 3]");
    expect(localRepository.getDraft()).toBeNull();
    expect(localRepository.list()).toEqual([]);
  });

  it("export → import roundtrip keeps data but issues a new id; rejects junk", () => {
    const a = { ...base(), storage: [unit({ capacity: 250 })] };
    const imported = parseImportedJson(exportAssessmentJson(a))!;
    expect(imported.id).not.toBe(a.id);
    expect(imported.storage[0].capacity).toBe(250);
    expect(parseImportedJson("bukan json")).toBeNull();
    expect(parseImportedJson('{"foo":1}')).toBeNull();
  });
});
