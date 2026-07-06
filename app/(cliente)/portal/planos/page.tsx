"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Zap, Sparkles, Building2, Gift } from "lucide-react";

type PlanKey = "sem_plano" | "basico" | "pro" | "enterprise";

interface PlanDef {
  id:           PlanKey;
  name:         string;
  monthlyPrice: string;
  annualPrice:  string;
  annualNote:   string;
  tagline:      string;
  popular:      boolean;
  color:        string;
  Icon:         React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  features:     string[];
  cta:          string;
}

const PLANS: PlanDef[] = [
  {
    id: "sem_plano",
    name: "Gratuito",
    monthlyPrice: "R$ 0",
    annualPrice:  "R$ 0",
    annualNote:   "para sempre",
    tagline: "Para explorar o ecossistema Fropty.",
    popular: false,
    color: "#64748b",
    Icon: Gift,
    features: [
      "100 tokens por mês",
      "1 chamado ativo",
      "Base de conhecimento",
      "Onboarding guiado",
    ],
    cta: "Começar grátis",
  },
  {
    id: "basico",
    name: "Básico",
    monthlyPrice: "R$ 297",
    annualPrice:  "R$ 267",
    annualNote:   "cobrado anualmente",
    tagline: "Para começar com o ecossistema Fropty.",
    popular: false,
    color: "var(--c-info)",
    Icon: Zap,
    features: [
      "500 tokens por mês",
      "Suporte via Hub",
      "Acesso à base de conhecimento",
      "1 projeto ativo",
      "Contratos e propostas",
    ],
    cta: "Fazer upgrade",
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: "R$ 697",
    annualPrice:  "R$ 627",
    annualNote:   "cobrado anualmente",
    tagline: "Para times que precisam de velocidade e prioridade.",
    popular: true,
    color: "#6366f1",
    Icon: Sparkles,
    features: [
      "2.000 tokens por mês",
      "Suporte prioritário (SLA 4h)",
      "Projetos ilimitados",
      "Acesso ao roadmap",
      "Feedback de produto",
      "Relatórios avançados",
    ],
    cta: "Fazer upgrade",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: "Sob consulta",
    annualPrice:  "Sob consulta",
    annualNote:   "personalizado",
    tagline: "Solução dedicada para grandes operações.",
    popular: false,
    color: "var(--c-purple)",
    Icon: Building2,
    features: [
      "Tokens customizados",
      "SLA dedicado",
      "Gerente de sucesso",
      "Integrações customizadas",
      "Treinamento da equipe",
      "Contrato personalizado",
    ],
    cta: "Falar com equipe",
  },
];

export default function PlanosPage() {
  const [annual,      setAnnual]      = useState(false);
  const [currentPlan] = useState<PlanKey>("pro"); // TODO: fetch from server via props/action

  return (
    <div style={{ padding: "24px 24px", maxWidth: 1160, margin: "0 auto" }}>

      {/* Header centrado */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <h1 style={{ margin: "0 0 16px", fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>
          Planos Fropty Hub
        </h1>

        {/* Toggle mensal/anual */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, position: "relative" }}>
          <button
            onClick={() => setAnnual(false)}
            style={{
              cursor: "pointer", fontFamily: "inherit",
              fontSize: "13.5px", fontWeight: annual ? 500 : 700,
              color: annual ? "var(--text-faint)" : "var(--text)",
              padding: "6px 14px", borderRadius: 999,
              background: annual ? "transparent" : "var(--card-bg)",
              border: annual ? "1px solid transparent" : "1px solid var(--border)",
              transition: "all 0.2s",
            }}
          >
            Mensal
          </button>
          <button
            onClick={() => setAnnual(true)}
            style={{
              cursor: "pointer", fontFamily: "inherit",
              fontSize: "13.5px", fontWeight: annual ? 700 : 500,
              color: annual ? "var(--text)" : "var(--text-faint)",
              padding: "6px 14px", borderRadius: 999,
              background: annual ? "var(--card-bg)" : "transparent",
              border: annual ? "1px solid var(--border)" : "1px solid transparent",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            Anual
            <span style={{
              fontSize: "10px", fontWeight: 800, color: "#fff",
              background: "var(--grad-brand)",
              padding: "2px 8px", borderRadius: 999, letterSpacing: "0.03em",
            }}>
              -10%
            </span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
        alignItems: "stretch",
      }}>
        {PLANS.map((plan) => {
          const isCurrent   = currentPlan === plan.id;
          const isEnterprise = plan.id === "enterprise";
          const price       = annual ? plan.annualPrice : plan.monthlyPrice;
          const note        = annual ? plan.annualNote  : "cobrado mensalmente";
          const isCustom    = price === "Sob consulta";

          return (
            <div
              key={plan.id}
              style={{
                background:    "var(--card-bg)",
                border:        plan.popular ? "1.5px solid var(--primary)" : "1px solid var(--card-border)",
                borderRadius:  14,
                padding:       "24px 22px 22px",
                display:       "flex",
                flexDirection: "column",
                position:      "relative",
                boxShadow:     plan.popular ? "0 0 0 4px rgba(99,102,241,0.07)" : "none",
                transition:    "box-shadow 0.2s",
              }}
            >
              {/* Mais popular */}
              {plan.popular && (
                <span style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: "var(--grad-brand)",
                  color: "#fff", fontSize: "10.5px", fontWeight: 800,
                  padding: "3px 14px", borderRadius: 999, letterSpacing: "0.06em",
                  whiteSpace: "nowrap", textTransform: "uppercase",
                }}>
                  Mais popular
                </span>
              )}

              {/* Ícone gradient */}
              <div style={{
                width: 40, height: 40, borderRadius: 10, marginBottom: 16, flexShrink: 0,
                background: `linear-gradient(135deg, ${plan.color}33, ${plan.color}18)`,
                border: `1px solid ${plan.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <plan.Icon size={18} style={{ color: plan.color }} />
              </div>

              {/* Nome + plano atual */}
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)" }}>
                  {plan.name}
                </span>
                {isCurrent && (
                  <span style={{
                    fontSize: "10px", fontWeight: 700, color: "var(--primary)",
                    background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.22)",
                    borderRadius: 999, padding: "2px 9px",
                  }}>
                    Plano atual
                  </span>
                )}
              </div>

              {/* Preço */}
              <div style={{ marginBottom: 4 }}>
                <span style={{
                  fontSize: isCustom ? "18px" : "28px", fontWeight: 800,
                  color: "var(--text)", letterSpacing: "-0.03em", lineHeight: 1,
                }}>
                  {price}
                </span>
                {!isCustom && (
                  <span style={{ fontSize: "12px", color: "var(--text-faint)", marginLeft: 3 }}>/mês</span>
                )}
              </div>
              <p style={{ margin: "0 0 14px", fontSize: "11px", color: "var(--text-faint)" }}>
                {note}
              </p>

              {/* Divider */}
              <div style={{ height: 1, background: "var(--border)", marginBottom: 16 }} />

              {/* Features */}
              <ul style={{
                margin: "0 0 22px", padding: 0, listStyle: "none",
                display: "flex", flexDirection: "column", gap: 9, flex: 1,
              }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "12.5px", color: "var(--text)", lineHeight: 1.45 }}>
                    <Check size={13} style={{ color: plan.popular ? "var(--primary)" : plan.color, flexShrink: 0, marginTop: 2 }} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrent ? (
                <button disabled style={{
                  width: "100%", padding: "10px 0", borderRadius: 9,
                  background: "var(--surface-2)", color: "var(--text-faint)",
                  border: "1px solid var(--border)", fontSize: "13px", fontWeight: 600,
                  cursor: "not-allowed", fontFamily: "inherit",
                }}>
                  Plano atual
                </button>
              ) : isEnterprise ? (
                <Link href="/portal/suporte/novo" style={{
                  display: "block", textAlign: "center", width: "100%", padding: "10px 0", borderRadius: 9,
                  background: `linear-gradient(135deg, ${plan.color}22, ${plan.color}11)`,
                  border: `1.5px solid ${plan.color}44`, color: plan.color,
                  fontSize: "13px", fontWeight: 700, textDecoration: "none",
                  boxSizing: "border-box", fontFamily: "inherit",
                }}>
                  {plan.cta}
                </Link>
              ) : (
                <button
                  onClick={() => alert(`Upgrade para ${plan.name} — integração com billing em breve.`)}
                  style={{
                    width: "100%", padding: "10px 0", borderRadius: 9, border: "none",
                    background: plan.popular
                      ? "var(--grad-brand)"
                      : "var(--surface-2)",
                    color: plan.popular ? "#fff" : "var(--text-muted)",
                    fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    transition: "opacity 0.15s",
                  }}
                >
                  {plan.cta}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Rodapé */}
      <p style={{ marginTop: 28, fontSize: "12px", color: "var(--text-faint)", textAlign: "center" }}>
        Dúvidas sobre planos?{" "}
        <Link href="/portal/suporte/novo" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
          Fale com nossa equipe
        </Link>
        .
      </p>
    </div>
  );
}
