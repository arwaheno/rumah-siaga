import type { Assessment } from "@/types/assessment";
import type { Results } from "./results";

export interface Recommendation {
  id: string;
  /** 1 = paling mendesak. */
  priority: 1 | 2 | 3;
  title: string;
  detail: string;
}

const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(Math.ceil(n));

/**
 * Rekomendasi dibangun dari data aktual. Tidak ada rekomendasi pembelian bila
 * kekurangan dapat ditutup dengan mengisi wadah yang sudah ada.
 * Selalu mengembalikan 3–5 butir (dilengkapi butir perawatan bila temuan sedikit).
 */
export function buildRecommendations(a: Assessment, r: Results): Recommendation[] {
  const out: Recommendation[] = [];

  if (r.status === "data_belum_lengkap" && r.missing.length > 0) {
    out.push({
      id: "complete-data",
      priority: 1,
      title: "Lengkapi data yang masih kosong",
      detail: `${r.missing.slice(0, 3).join("; ")}. Hasil lebih akurat bila data lengkap.`,
    });
  }

  if (r.status !== "data_belum_lengkap" || r.effectiveTotal > 0) {
    if (r.targetDemand > 0 && r.shortage > 0) {
      const fillable = Math.min(r.headroom, r.shortage);
      const remaining = Math.max(0, r.shortage - r.headroom);
      if (r.headroom > 0 && remaining <= 0) {
        out.push({
          id: "fill-existing",
          priority: r.accessibleTotal / r.targetDemand < 0.5 ? 1 : 2,
          title: "Isi penuh wadah yang sudah ada",
          detail: `Kekurangan sekitar ${fmt(r.shortage)} liter dapat ditutup dengan mengisi wadah yang belum penuh (ruang kosong ±${fmt(r.headroom)} liter). Tidak perlu membeli wadah baru.`,
        });
      } else {
        out.push({
          id: "add-storage",
          priority: r.accessibleTotal / r.targetDemand < 0.5 ? 1 : 2,
          title: `Tambah cadangan air sekitar ${fmt(remaining)} liter`,
          detail:
            r.headroom > 0
              ? `Isi dulu wadah yang belum penuh (±${fmt(fillable)} liter), lalu tambah kapasitas sebesar sisa kekurangan agar mencapai target ${r.targetDays} hari.`
              : `Cadangan yang dapat diakses belum mencapai target ${r.targetDays} hari. Pertimbangkan wadah tambahan sesuai ruang dan anggaran Anda.`,
        });
      }
    }
  }

  const pumpRisk = r.risks.find((x) => x.id === "pompa");
  if (pumpRisk && (pumpRisk.level === "tinggi" || pumpRisk.level === "sedang")) {
    out.push({
      id: "pump-backup",
      priority: pumpRisk.level === "tinggi" ? 1 : 2,
      title: "Siapkan akses air saat listrik padam",
      detail:
        "Pastikan ada cara mengambil air tanpa pompa listrik, misalnya wadah cadangan yang terisi dan mudah dijangkau, atau keran yang tidak memerlukan pompa. Perubahan instalasi listrik/pompa dikerjakan oleh teknisi berkompeten.",
    });
  } else if (pumpRisk?.level === "belum_diketahui") {
    out.push({
      id: "pump-check",
      priority: 2,
      title: "Cari tahu ketergantungan air pada listrik",
      detail: "Uji apakah keran masih mengalir saat pompa dimatikan sebentar, lalu perbarui data Pompa & Listrik.",
    });
  }

  const drinkRisk = r.risks.find((x) => x.id === "air_minum");
  if (drinkRisk && drinkRisk.level !== "rendah") {
    if (r.drinkingStockTotal <= 0) {
      out.push({
        id: "drinking-reserve",
        priority: 1,
        title: "Sediakan cadangan air minum terpisah",
        detail: `Kebutuhan air minum/masak selama target ±${fmt(r.targetDrinkingDemand)} liter. Pisahkan dari air keperluan umum dan verifikasi kualitasnya dengan cara yang Anda percayai (misalnya air kemasan bersegel).`,
      });
    } else if (r.drinkingVerifiedAccessible <= 0) {
      out.push({
        id: "drinking-verify",
        priority: 1,
        title: "Verifikasi kualitas air minum Anda",
        detail: "Cadangan air minum belum ditandai terverifikasi sehingga belum dihitung. Gunakan sumber yang jelas kualitasnya dan ikuti panduan otoritas kesehatan setempat.",
      });
    } else if (r.drinkingShortage > 0) {
      out.push({
        id: "drinking-top-up",
        priority: 2,
        title: "Tambah cadangan air minum terverifikasi",
        detail: `Masih kurang sekitar ${fmt(r.drinkingShortage)} liter air minum terverifikasi untuk target ${r.targetDays} hari.`,
      });
    }
  }

  const distRisk = r.risks.find((x) => x.id === "distribusi");
  if (a.distribution.leakage === "signifikan" || a.distribution.leakage === "kecil") {
    out.push({
      id: "leaks",
      priority: a.distribution.leakage === "signifikan" ? 2 : 3,
      title: "Periksa dan perbaiki kebocoran",
      detail: "Kebocoran menghabiskan cadangan air dan melemahkan distribusi. Periksa sambungan pipa, keran, dan dasar toren.",
    });
  } else if (distRisk && (distRisk.level === "sedang" || distRisk.level === "tinggi")) {
    out.push({
      id: "distribution",
      priority: 2,
      title: "Perbaiki jalur distribusi air",
      detail: distRisk.explanation,
    });
  }

  if (a.drinking.storageHygiene === "buruk" || a.drinking.containerCondition === "buruk" || a.audit.storage_clean === "belum" || a.audit.storage_covered === "belum") {
    out.push({
      id: "hygiene",
      priority: 2,
      title: "Bersihkan dan tutup wadah penyimpanan",
      detail: "Wadah yang bersih dan tertutup rapat menjaga air tetap layak simpan. Jadwalkan pembersihan berkala.",
    });
  }

  const srcRisk = r.risks.find((x) => x.id === "sumber");
  if (srcRisk && (srcRisk.level === "tinggi" || srcRisk.level === "belum_diketahui")) {
    out.push({
      id: "sources",
      priority: 3,
      title: srcRisk.level === "tinggi" ? "Cari sumber air alternatif" : "Catat sumber air Anda",
      detail: srcRisk.action,
    });
  }

  if (r.audit.belumDiperiksa > 0) {
    out.push({
      id: "audit",
      priority: 3,
      title: `Selesaikan ${r.audit.belumDiperiksa} butir audit yang belum diperiksa`,
      detail: "Pemeriksaan sederhana (bersih? tertutup? keran jalan?) sering mengungkap masalah tanpa biaya.",
    });
  }

  // Butir perawatan agar selalu ada 3–5 rekomendasi.
  const maintenance: Recommendation[] = [
    { id: "routine", priority: 3, title: "Lakukan pengecekan rutin", detail: "Periksa toren, pompa, keran, dan kebersihan wadah secara berkala, serta rotasi air minum cadangan." },
    { id: "update", priority: 3, title: "Perbarui data setelah ada perubahan", detail: "Hitung ulang bila jumlah penghuni, wadah, atau pompa berubah, agar hasil tetap sesuai kondisi rumah." },
    { id: "drill", priority: 3, title: "Latih keluarga mengambil air tanpa listrik", detail: "Simulasikan singkat bagaimana semua anggota keluarga mengambil dan menggunakan air cadangan." },
  ];
  for (const m of maintenance) {
    if (out.length >= 3) break;
    out.push(m);
  }

  return out.sort((x, y) => x.priority - y.priority).slice(0, 5);
}
