"use client";

import Link from "next/link";
import PlanConfigurator, { type PlanSummary } from "../components/PlanConfigurator";

export default function ConfiguradorPage() {
  async function handleSubmit(summary: PlanSummary) {
    const addonNames =
      summary.addons.map((a) => a.label).join(", ") || "nenhum";
    const maintenanceName = summary.maintenance?.price
      ? summary.maintenance.label
      : "sem plano";
    const ideia = `Pedido via configurador de planos. Extras: ${addonNames}. Manutenção: ${maintenanceName}. Total único: R$${summary.onceTotal}${
      summary.monthTotal > 0 ? ` mais R$${summary.monthTotal}/mês` : ""
    }.`;

    try {
      await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: summary.name, email: summary.email, ideia }),
      });
    } catch {
      // PlanConfigurator mostra sucesso imediatamente
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#040316" }}>

      {/* Glow de fundo */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #5B57E8 0%, transparent 70%)" }}
        />
        <div className="absolute bottom-0 left-0 h-[300px] w-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #5B57E8 0%, transparent 70%)" }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur"
        style={{ background: "rgba(8,14,28,0.85)" }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <i className="ti ti-arrow-left text-base" />
            Voltar
          </Link>
          <span className="text-base font-bold tracking-tight text-white">
            Fropty<span className="text-[#5B57E8]">Apps</span>
          </span>
          <div className="w-16" />
        </div>
      </header>

      {/* Hero */}
      <div className="relative mx-auto max-w-3xl px-6 pb-10 pt-14 text-center">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#5B57E8]/30 bg-[#5B57E8]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#5B57E8]">
          <i className="ti ti-adjustments-horizontal" />
          Configuração personalizada
        </span>
        <h1 className="text-3xl font-bold leading-tight text-white sm:text-5xl">
          Monte seu app{" "}
          <span className="text-[#5B57E8]">do seu jeito</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
          Escolha cada recurso, veja o preço mudar em tempo real e peça seu orçamento. Sem surpresa, sem enrolação.
        </p>

        {/* Métricas rápidas */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <i className="ti ti-check text-[#5B57E8]" />
            Preço em tempo real
          </span>
          <span className="flex items-center gap-1.5">
            <i className="ti ti-check text-[#5B57E8]" />
            Sem compromisso
          </span>
          <span className="flex items-center gap-1.5">
            <i className="ti ti-check text-[#5B57E8]" />
            Resposta em 48h
          </span>
        </div>
      </div>

      {/* Configurador */}
      <div className="relative mx-auto max-w-5xl px-4 pb-24">
        <div
          className="rounded-3xl p-4 sm:p-8"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <PlanConfigurator onSubmit={handleSubmit} />
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-8 text-center text-sm text-slate-500">
        <p>© 2026 Fropty Apps</p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <Link href="/termos" className="transition hover:text-slate-300">Termos de Uso</Link>
          <span className="text-slate-700">·</span>
          <Link href="/privacidade" className="transition hover:text-slate-300">Política de Privacidade</Link>
        </div>
      </footer>

    </div>
  );
}
