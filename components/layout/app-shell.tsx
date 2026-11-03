"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardCheck,
  Droplets,
  FileText,
  History,
  Home,
  LayoutDashboard,
  Menu,
  PlayCircle,
  Settings2,
  ShieldCheck,
  X,
} from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import { PRIVACY_NOTICE } from "@/lib/constants";

const NAV = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/calculator", label: "Mulai Perhitungan", icon: PlayCircle },
  { href: "/dashboard", label: "Hasil & Rekomendasi", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventaris Air", icon: Droplets },
  { href: "/pump", label: "Pompa & Distribusi", icon: Settings2 },
  { href: "/audit", label: "Audit Kesiapan", icon: ClipboardCheck },
  { href: "/history", label: "Riwayat Perhitungan", icon: History },
  { href: "/guide", label: "Panduan", icon: BookOpen },
  { href: "/assumptions", label: "Asumsi & Referensi", icon: ShieldCheck },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Menu utama" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-teal text-white" : "text-white/80 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-screen">
      {/* Sidebar desktop */}
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-navy lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <Link href="/" aria-label="Rumah Siaga — Beranda">
            <Logo light />
          </Link>
        </div>
        <NavList />
        <p className="border-t border-white/10 p-4 text-[11px] leading-relaxed text-white/60">{PRIVACY_NOTICE}</p>
      </aside>

      {/* Header */}
      <header className="no-print sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur lg:ml-64 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Buka menu"
            aria-expanded={open}
            className="rounded-lg p-2 text-navy hover:bg-surface lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="lg:hidden">
            <Logo subtitle={false} />
          </span>
          <span className="hidden text-sm font-semibold text-navy lg:block">Kalkulator Ketahanan Air Rumah</span>
        </div>
        <Link href="/report" className="btn-secondary hidden px-3 py-2 text-xs sm:inline-flex">
          <FileText className="h-4 w-4" aria-hidden />
          Cetak Laporan
        </Link>
      </header>

      {/* Drawer mobile */}
      {open && (
        <div className="no-print fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Tutup menu" className="absolute inset-0 bg-navy-dark/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-navy shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <Logo light />
              <button type="button" aria-label="Tutup menu" className="rounded-lg p-2 text-white hover:bg-white/10" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
            <p className="border-t border-white/10 p-4 text-[11px] leading-relaxed text-white/60">{PRIVACY_NOTICE}</p>
          </div>
        </div>
      )}

      <main className="px-4 py-6 lg:ml-64 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
