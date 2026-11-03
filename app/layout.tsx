import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AssessmentProvider } from "@/lib/state/assessment-context";

export const metadata: Metadata = {
  title: {
    default: "Rumah Siaga — Kalkulator Ketahanan Air Rumah",
    template: "%s · Rumah Siaga",
  },
  description:
    "Hitung kebutuhan air keluarga, evaluasi kapasitas cadangan, dan temukan apa yang perlu diperbaiki sebelum terjadi gangguan pasokan air. Kenali. Hitung. Siapkan.",
  applicationName: "Rumah Siaga",
  keywords: ["ketahanan air", "cadangan air rumah", "kalkulator air", "toren", "PDAM", "kesiapan rumah"],
  openGraph: {
    title: "Rumah Siaga — Kalkulator Ketahanan Air Rumah",
    description: "Kenali. Hitung. Siapkan. Ketahui seberapa siap rumah Anda menghadapi gangguan air.",
    locale: "id_ID",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#17324D",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <a
          href="#konten"
          className="no-print sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-navy"
        >
          Lewati ke konten
        </a>
        <AssessmentProvider>
          <div id="konten">{children}</div>
        </AssessmentProvider>
      </body>
    </html>
  );
}
