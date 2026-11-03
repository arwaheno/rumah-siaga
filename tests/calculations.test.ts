import { describe, expect, it } from "vitest";
import {
  buildRecommendations,
  computeResults,
  dailyDemand,
  effectiveVolume,
  enduranceDays,
  physicalVolume,
  pumpRisk,
  shortage,
  summarizeAudit,
  unitVolumes,
} from "@/lib/calculations";
import { emptyAudit } from "@/lib/constants";
import { base, pump, unit } from "./fixtures";

describe("volume", () => {
  it("physical = capacity * fill / 100", () => {
    expect(physicalVolume(500, 80)).toBe(400);
  });
  it("effective = max(0, physical - unusable)", () => {
    expect(effectiveVolume(400, 22)).toBe(378);
    expect(effectiveVolume(10, 50)).toBe(0); // unusable > physical
  });
  it("empty container and partial storage", () => {
    expect(unitVolumes({ capacity: 100, fillPercent: 0, unusable: 5, quantity: 1 }).effectiveTotal).toBe(0);
    expect(unitVolumes({ capacity: 100, fillPercent: 50, unusable: 0, quantity: 2 }).effectiveTotal).toBe(100);
  });
  it("clamps invalid inputs", () => {
    expect(physicalVolume(-5, 50)).toBe(0);
    expect(physicalVolume(100, 150)).toBe(100);
    expect(physicalVolume(NaN, 50)).toBe(0);
  });
});

describe("demand & endurance", () => {
  it("zero occupants → zero demand → endurance null (not Infinity)", () => {
    expect(dailyDemand(0, 15)).toBe(0);
    expect(enduranceDays(100, 0)).toBeNull();
  });
  it("no stored water → 0 days", () => {
    expect(enduranceDays(0, 60)).toBe(0);
  });
  it("shortage never negative", () => {
    expect(shortage(100, 500)).toBe(0);
    expect(shortage(180, 80)).toBe(100);
  });
});

describe("Scenario A — 4 orang, toren 500 L @80% (22 L tak terpakai) + 38 L air minum", () => {
  const a = base({
    storage: [
      unit({ name: "Toren", type: "toren", capacity: 500, fillPercent: 80, unusable: 22, intendedUse: "umum" }),
      unit({ name: "Galon", type: "galon", capacity: 38, fillPercent: 100, unusable: 0, intendedUse: "minum", quality: "terverifikasi" }),
    ],
    pump: pump({ powerDependency: "tidak_bergantung" }),
  });
  const r = computeResults(a);

  it("matches the expected values", () => {
    expect(r.rows[0].effectiveTotal).toBe(378);
    expect(r.drinkingStockTotal).toBe(38);
    expect(r.effectiveTotal).toBe(416);
    expect(r.dailyDemand).toBe(60);
    expect(r.dailyDrinkingDemand).toBe(12);
    expect(r.totalEndurance).toBeCloseTo(6.93, 2);
    expect(r.drinkingEndurance).toBeCloseTo(3.17, 2);
    expect(r.targetDemand).toBe(180);
    expect(r.shortage).toBe(0);
    expect(r.surplus).toBe(236);
  });
});

describe("Scenario B — 3 orang, galon 19 L + 2 jeriken 20 L, tanpa toren", () => {
  const a = base({
    storage: [
      unit({ name: "Galon", type: "galon", capacity: 19, intendedUse: "minum", quality: "terverifikasi" }),
      unit({ name: "Jeriken", type: "jeriken", quantity: 2, capacity: 20, intendedUse: "umum" }),
    ],
  });
  a.profile.occupants = 3;
  const r = computeResults(a);

  it("totals 59 L, 45 L/day demand", () => {
    expect(r.effectiveTotal).toBe(59);
    expect(r.dailyDemand).toBe(45);
    expect(r.targetDemand).toBe(135);
    expect(r.shortage).toBe(76);
    expect(r.totalEndurance).toBeCloseTo(59 / 45, 5);
  });
  it("reports a shortage warning and a capacity recommendation", () => {
    expect(r.warnings.some((w) => w.id === "shortage")).toBe(true);
    const recs = buildRecommendations(a, r);
    expect(recs.length).toBeGreaterThanOrEqual(3);
    expect(recs.some((x) => x.id === "add-storage")).toBe(true);
  });
});

describe("Scenario C — toren 1.000 L penuh, pompa listrik tanpa cadangan/gravitasi", () => {
  const a = base({
    storage: [unit({ name: "Toren", capacity: 1000, accessDuringOutage: "tidak" })],
    pump: pump({ powerDependency: "bergantung", backupPower: "tidak", gravityFed: "tidak", alternativeAccess: "tidak" }),
  });
  const r = computeResults(a);

  it("stock exists, but none counted as accessible during outage", () => {
    expect(r.effectiveTotal).toBe(1000);
    expect(r.accessibleTotal).toBe(0);
    expect(r.totalEndurance).toBe(0);
    expect(r.totalEnduranceIfAllAccessible).toBeCloseTo(1000 / 60, 5);
  });
  it("pump risk is high and readiness is not 'siap'", () => {
    expect(r.risks.find((x) => x.id === "pompa")?.level).toBe("tinggi");
    expect(r.status).toBe("belum_siap");
    expect(r.warnings.some((w) => w.id === "pump")).toBe(true);
  });
  it("sufficient volume does not make it ready", () => {
    expect(r.dimensions.find((d) => d.id === "akses")?.status).toBe("kurang");
  });
});

describe("Scenario D — banyak air umum, tanpa air minum terverifikasi", () => {
  const a = base({
    storage: [unit({ name: "Toren", capacity: 2000, intendedUse: "umum", quality: "belum_diverifikasi" })],
    pump: pump({ powerDependency: "tidak_bergantung" }),
  });
  const r = computeResults(a);

  it("drinking endurance is 0 and never borrows general water", () => {
    expect(r.drinkingStockTotal).toBe(0);
    expect(r.drinkingVerifiedAccessible).toBe(0);
    expect(r.drinkingEndurance).toBe(0);
    expect(r.drinkingShortage).toBe(r.targetDrinkingDemand);
  });
  it("flags drinking risk as high, status not 'siap'", () => {
    expect(r.risks.find((x) => x.id === "air_minum")?.level).toBe("tinggi");
    expect(r.status).toBe("belum_siap");
    expect(r.warnings.some((w) => w.id === "drink")).toBe(true);
  });
  it("recommends a separate drinking reserve first", () => {
    const recs = buildRecommendations(a, r);
    expect(recs[0].priority).toBe(1);
    expect(recs.some((x) => x.id === "drinking-reserve")).toBe(true);
  });
});

describe("Unknown quality / unknown access", () => {
  it("unverified drinking water is not counted as safe", () => {
    const a = base({
      storage: [unit({ capacity: 100, intendedUse: "minum", quality: "belum_diverifikasi" })],
      pump: pump({ powerDependency: "tidak_bergantung" }),
    });
    const r = computeResults(a);
    expect(r.drinkingStockTotal).toBe(100);
    expect(r.drinkingVerifiedAccessible).toBe(0);
    expect(r.drinkingUnverified).toBe(100);
  });
  it("unknown access is not counted and yields 'data belum lengkap'", () => {
    const a = base({
      storage: [unit({ capacity: 500, accessDuringOutage: "belum_diketahui" })],
      pump: pump({ powerDependency: "tidak_bergantung" }),
    });
    const r = computeResults(a);
    expect(r.accessibleTotal).toBe(0);
    expect(r.unknownAccessTotal).toBe(500);
  });
});

describe("Edge cases", () => {
  it("empty assessment → data_belum_lengkap, no NaN", () => {
    const a = base();
    a.profile.occupants = 0;
    const r = computeResults(a);
    expect(r.status).toBe("data_belum_lengkap");
    expect(r.totalEndurance).toBeNull();
    expect(Number.isNaN(r.effectiveTotal)).toBe(false);
    expect(buildRecommendations(a, r).length).toBeGreaterThanOrEqual(3);
  });
  it("unusable volume greater than physical never gives negative stock", () => {
    const r = computeResults(base({ storage: [unit({ capacity: 10, fillPercent: 50, unusable: 100 })] }));
    expect(r.effectiveTotal).toBe(0);
  });
  it("recommends filling existing containers instead of buying", () => {
    const a = base({
      storage: [unit({ capacity: 500, fillPercent: 20, unusable: 0 })],
      pump: pump({ powerDependency: "tidak_bergantung" }),
    });
    const recs = buildRecommendations(a, computeResults(a));
    expect(recs.some((x) => x.id === "fill-existing")).toBe(true);
    expect(recs.some((x) => x.id === "add-storage")).toBe(false);
  });
});

describe("pump risk rules", () => {
  it("dependent with one backup → sedang; two → rendah", () => {
    expect(pumpRisk(pump({ powerDependency: "bergantung", backupPower: "ya" })).level).toBe("sedang");
    expect(pumpRisk(pump({ powerDependency: "bergantung", backupPower: "ya", gravityFed: "ya" })).level).toBe("rendah");
  });
  it("unknown dependency → belum_diketahui", () => {
    expect(pumpRisk(pump({})).level).toBe("belum_diketahui");
  });
  it("broken pump raises risk", () => {
    expect(pumpRisk(pump({ powerDependency: "bergantung", backupPower: "ya", gravityFed: "ya", pumpStatus: "tidak_berfungsi" })).level).toBe("tinggi");
  });
});

describe("audit summary", () => {
  it("empty audit is belum_lengkap", () => {
    expect(summarizeAudit(emptyAudit()).status).toBe("belum_lengkap");
  });
  it("excludes 'tidak relevan' and classifies", () => {
    const a = emptyAudit();
    for (const k of Object.keys(a) as (keyof typeof a)[]) a[k] = "sudah";
    a.storage_clean = "tidak_relevan";
    a.storage_covered = "belum";
    const s = summarizeAudit(a);
    expect(s.relevant).toBe(11);
    expect(s.sudah).toBe(10);
    expect(s.status).toBe("baik");
  });
});
