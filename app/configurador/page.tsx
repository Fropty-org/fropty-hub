import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PlanConfigurator from "../components/PlanConfigurator";
import { ThemeToggle } from "../components/ThemeToggle";
import { WhatsAppFloat } from "../components/WhatsAppFloat";
import { Footer } from "../components/Footer";
import { SITE_URL } from "../lib/config";
import { ArrowLeft, SlidersHorizontal, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Configurador de Orçamento",
  description: "Monte seu projeto digital sob medida — app, site, SaaS, dashboard ou e-commerce. Escolha os recursos e veja o preço em tempo real.",
  openGraph: {
    title: "Configurador de Orçamento — Fropty Apps",
    description: "Monte seu projeto digital sob medida e peça seu orçamento em minutos.",
    url: `${SITE_URL}/configurador`,
    siteName: "Fropty Apps",
    locale: "pt_BR",
    type: "website",
  },
};

export default function ConfiguradorPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* Glow de fundo */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 h-[300px] w-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur" style={{ background: "var(--nav-bg)", borderBottom: "1px solid var(--border)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm transition" style={{ color: "var(--text-muted)" }}>
            <ArrowLeft size={16} />
            Voltar
          </Link>
          <div className="flex items-center gap-2">
            <Image src="/logo-icon.png" alt="Fropty Apps" width={24} height={24} className="rounded-md" />
            <span className="text-base font-bold tracking-tight" style={{ color: "var(--text)" }}>
              Fropty<span style={{ color: "var(--primary)" }}>Apps</span>
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <div className="relative mx-auto max-w-3xl px-6 pb-10 pt-14 text-center">
        <span className="section-chip mb-5 inline-flex items-center gap-2">
          <SlidersHorizontal size={14} />
          Orçamento personalizado
        </span>
        <h1 className="text-3xl font-bold leading-tight sm:text-5xl" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans), sans-serif" }}>
          Monte seu projeto <span style={{ color: "var(--primary)" }}>do seu jeito</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg" style={{ color: "var(--text-muted)" }}>
          App, site, SaaS, dashboard ou e-commerce — escolha o tipo de projeto, adicione os recursos e veja o preço em tempo real.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: "var(--text-faint)" }}>
          {["Preço em tempo real", "Sem compromisso", "Resposta em 48h"].map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <Check size={14} style={{ color: "var(--primary)" }} />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Configurador */}
      <div className="dot-bg">
        <div className="relative mx-auto max-w-5xl px-4 pb-24">
          <div className="rounded-3xl p-4 sm:p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <PlanConfigurator />
          </div>
        </div>

        <Footer />
      </div>

      <WhatsAppFloat />
    </div>
  );
}
