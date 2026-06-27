"use client";

import { useState } from "react";
import { Palette, Zap, Coins, Puzzle, Hand, Headphones, Gift, Clock, MessageSquare, ShieldCheck, Send, CheckCircle, AlertCircle, Loader2, ArrowRight, type LucideIcon } from "lucide-react";

const PRIORITIES = [
  { label: "Visual bonito",               Icon: Palette },
  { label: "Rapidez na entrega",          Icon: Zap },
  { label: "Preço baixo",                 Icon: Coins },
  { label: "Funcionalidades completas",   Icon: Puzzle },
  { label: "Facilidade de uso",           Icon: Hand },
  { label: "Suporte contínuo",            Icon: Headphones },
];

const BENEFITS = [
  { Icon: Gift,        text: "Prévia 100% gratuita — sem compromisso" },
  { Icon: Clock,       text: "Resposta em até 48 horas úteis" },
  { Icon: MessageSquare, text: "Atendimento direto com nossa equipe" },
  { Icon: ShieldCheck, text: "Sem spam, sem surpresas" },
];

export function QuoteSection() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const togglePriority = (label: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(label)) { next.delete(label); } else { next.add(label); }
      return next;
    });
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      nome:        data.get("nome"),
      telefone:    data.get("telefone"),
      email:       data.get("email"),
      ideia:       data.get("ideia"),
      temLogo:     data.get("temLogo"),
      cores:       data.get("cores"),
      prioridades: data.getAll("prioridades"),
    };
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      form.reset();
      setChecked(new Set());
    } catch {
      setStatus("error");
    }
  }

  return (
    <section
      id="orcamento"
      className="scroll-mt-20 border-t"
      style={{ background: "var(--bg-alt)", borderColor: "var(--border)" }}
    >
      <div className="mx-auto max-w-6xl px-6 py-20">
        {/* Header */}
        <div className="mb-12 flex justify-center">
          <span className="section-chip">
            <Send size={12} /> Orçamento
          </span>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">

          {/* ── Coluna esquerda: copy ──────────────────────────────── */}
          <div>
            <h2
              className="font-bold tracking-tight"
              style={{
                color: "var(--text)",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: "clamp(2rem, 4.5vw, 3rem)",
                lineHeight: 1.1,
              }}
            >
              Peça seu{" "}
              <span style={{ color: "var(--primary)" }}>orçamento grátis</span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Conte sua ideia e a gente responde com uma prévia real. Sem custo, sem burocracia.
            </p>

            <ul className="mt-8 space-y-4">
              {BENEFITS.map(({ Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: "rgba(91,87,232,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Icon size={18} style={{ color: "var(--primary)" }} />
                  </div>
                  <span className="pt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>{text}</span>
                </li>
              ))}
            </ul>

            {/* Mini depoimento */}
            <div
              className="mt-10 rounded-2xl p-6"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
                {[1,2,3,4,5].map(s => <span key={s} style={{ color: "#f59e0b", fontSize: 14 }}>★</span>)}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                &ldquo;Em menos de 3 dias já tínhamos a prévia do app. O processo foi muito simples e o resultado superou tudo que esperávamos.&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>M</div>
                <div>
                  <div className="text-sm font-bold" style={{ color: "var(--text)" }}>Marcos T.</div>
                  <div className="text-xs" style={{ color: "var(--text-faint)" }}>Empreendedor · Imobiliário</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Coluna direita: formulário ─────────────────────────── */}
          <div
            className="rounded-3xl p-8"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
            }}
          >
            {status === "success" ? (
              <div className="flex flex-col items-center py-12 text-center gap-4">
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(91,87,232,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle size={36} style={{ color: "var(--primary)" }} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: "var(--text)" }}>Pedido enviado!</h3>
                <p style={{ color: "var(--text-muted)", maxWidth: 320 }}>
                  Recebemos sua ideia e vamos responder em breve com sua prévia gratuita.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-2 rounded-full px-6 py-2 text-sm font-semibold transition hover:opacity-80"
                  style={{ background: "rgba(91,87,232,0.1)", color: "var(--primary)", border: "1px solid rgba(91,87,232,0.2)" }}
                >
                  Enviar outro pedido
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nome */}
                <div>
                  <label htmlFor="q-nome" className="mb-1.5 block text-sm font-semibold" style={{ color: "var(--text)" }}>
                    Seu nome
                  </label>
                  <input
                    id="q-nome" name="nome" type="text" required
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#5B57E8]/30"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                    placeholder="João Silva"
                  />
                </div>

                {/* Telefone + Email — lado a lado */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="q-tel" className="mb-1.5 block text-sm font-semibold" style={{ color: "var(--text)" }}>
                      Telefone / WhatsApp
                    </label>
                    <input
                      id="q-tel" name="telefone" type="tel" required
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#5B57E8]/30"
                      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <label htmlFor="q-email" className="mb-1.5 block text-sm font-semibold" style={{ color: "var(--text)" }}>
                      Seu e-mail
                    </label>
                    <input
                      id="q-email" name="email" type="email" required
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#5B57E8]/30"
                      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                      placeholder="joao@empresa.com"
                    />
                  </div>
                </div>

                {/* Ideia */}
                <div>
                  <label htmlFor="q-ideia" className="mb-1.5 block text-sm font-semibold" style={{ color: "var(--text)" }}>
                    Qual é a ideia do seu app ou site?
                  </label>
                  <textarea
                    id="q-ideia" name="ideia" required rows={3}
                    className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#5B57E8]/30"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                    placeholder="Ex: quero um app de agendamento para minha clínica..."
                  />
                </div>

                {/* Tem logo + Cores — lado a lado */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="q-logo" className="mb-1.5 block text-sm font-semibold" style={{ color: "var(--text)" }}>
                      Você já tem um logo?
                    </label>
                    <select
                      id="q-logo" name="temLogo" required defaultValue=""
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#5B57E8]/30"
                      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                    >
                      <option value="" disabled>Selecione...</option>
                      <option value="sim">Sim, já tenho</option>
                      <option value="nao">Não, preciso de um</option>
                      <option value="em-andamento">Estou criando</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="q-cores" className="mb-1.5 block text-sm font-semibold" style={{ color: "var(--text)" }}>
                      Cores ou tema preferido
                    </label>
                    <input
                      id="q-cores" name="cores" type="text"
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#5B57E8]/30"
                      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                      placeholder="Ex: azul e branco..."
                    />
                  </div>
                </div>

                {/* Prioridades */}
                <div>
                  <p className="mb-3 text-sm font-semibold" style={{ color: "var(--text)" }}>
                    O que importa mais para você?
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {PRIORITIES.map(({ label, Icon }) => {
                      const isChecked = checked.has(label);
                      return (
                        <label
                          key={label}
                          className="clickable-card flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition"
                          style={{
                            border: `1.5px solid ${isChecked ? "var(--primary)" : "var(--border)"}`,
                            background: isChecked ? "rgba(91,87,232,0.08)" : "var(--bg)",
                            color: isChecked ? "var(--primary)" : "var(--text-muted)",
                          }}
                        >
                          <input
                            type="checkbox"
                            name="prioridades"
                            value={label}
                            checked={isChecked}
                            onChange={() => togglePriority(label)}
                            className="sr-only"
                          />
                          <Icon size={14} style={{ flexShrink: 0 }} />
                          {label}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {status === "error" && (
                  <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(91,87,232,0.08)", border: "1px solid rgba(91,87,232,0.2)", color: "var(--text-muted)" }}>
                    <AlertCircle size={16} style={{ color: "var(--primary)" }} />
                    Ops, algo deu errado. Tente novamente em instantes.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full rounded-full py-4 text-base font-bold text-white transition hover:brightness-110 disabled:opacity-60"
                  style={{
                    background: "var(--primary)",
                    boxShadow: "0 8px 32px rgba(91,87,232,0.35)",
                  }}
                >
                  {status === "sending" ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                      Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Enviar pedido de orçamento
                      <ArrowRight size={16} />
                    </span>
                  )}
                </button>

                <p className="text-center text-xs" style={{ color: "var(--text-faint)" }}>
                  Sem compromisso. Prévia gratuita em até 3 dias úteis.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
