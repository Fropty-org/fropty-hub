import Link from "next/link";
import { getProfile } from "@/app/lib/auth/session";
import { UpgradeButton } from "./UpgradeButton";
import { Check, Sparkles } from "lucide-react";

type PlanKey = "sem_plano" | "basico" | "pro" | "enterprise";

interface PlanDef {
  id:       string;
  name:     string;
  price:    string;
  period:   string;
  tagline:  string;
  popular:  boolean;
  features: string[];
}

const PLANS: PlanDef[] = [
  {
    id:      "basico",
    name:    "Básico",
    price:   "R$ 297",
    period:  "/mês",
    tagline: "Para começar com o ecossistema Fropty.",
    popular: false,
    features: [
      "500 tokens por mês",
      "Suporte via Hub",
      "Acesso à base de conhecimento",
      "1 projeto ativo",
    ],
  },
  {
    id:      "pro",
    name:    "Pro",
    price:   "R$ 697",
    period:  "/mês",
    tagline: "Para times que precisam de velocidade e prioridade.",
    popular: true,
    features: [
      "2.000 tokens por mês",
      "Suporte prioritário (SLA 4h)",
      "Projetos ilimitados",
      "Acesso ao roadmap",
      "Feedback de produto",
    ],
  },
  {
    id:      "enterprise",
    name:    "Enterprise",
    price:   "Sob consulta",
    period:  "",
    tagline: "Solução dedicada para grandes operações.",
    popular: false,
    features: [
      "Tokens customizados",
      "SLA dedicado",
      "Gerente de sucesso",
      "Integrações customizadas",
      "Treinamento da equipe",
    ],
  },
];

export default async function PlanosPage() {
  const profile = await getProfile();
  const currentPlan = (profile?.plan ?? "sem_plano") as PlanKey;

  return (
    <div style={{ padding: "24px 24px", maxWidth: 1100, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Sparkles size={20} style={{ color: "var(--primary)" }} />
          <h1 style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: 700,
            color: "var(--text)",
            letterSpacing: "-0.02em",
          }}>
            Planos
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: "14px", color: "var(--text-faint)", lineHeight: 1.5 }}>
          Escolha o plano ideal para o seu uso do ecossistema Fropty.
        </p>
      </div>

      {/* Cards grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 20,
        alignItems: "stretch",
      }}>
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isEnterprise = plan.id === "enterprise";

          return (
            <div
              key={plan.id}
              style={{
                background: "var(--card-bg)",
                border: plan.popular
                  ? "1.5px solid var(--primary)"
                  : "1px solid var(--border)",
                borderRadius: "var(--r-lg, 12px)",
                padding: "28px 24px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 0,
                position: "relative",
                boxShadow: plan.popular
                  ? "0 0 0 1px rgba(91,87,232,0.12), 0 4px 24px rgba(91,87,232,0.08)"
                  : "none",
              }}
            >
              {/* "Mais popular" badge */}
              {plan.popular && (
                <div style={{
                  position: "absolute",
                  top: -12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "var(--primary)",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "3px 14px",
                  borderRadius: "var(--r-full, 9999px)",
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                }}>
                  Mais popular
                </div>
              )}

              {/* Plan name + current badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "var(--text)",
                  letterSpacing: "-0.01em",
                }}>
                  {plan.name}
                </span>
                {isCurrent && (
                  <span style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "var(--primary)",
                    background: "rgba(91,87,232,0.10)",
                    border: "1px solid rgba(91,87,232,0.20)",
                    borderRadius: "var(--r-full, 9999px)",
                    padding: "2px 9px",
                  }}>
                    Plano atual
                  </span>
                )}
              </div>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 6 }}>
                <span style={{
                  fontSize: isEnterprise ? "20px" : "28px",
                  fontWeight: 800,
                  color: "var(--text)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span style={{ fontSize: "13px", color: "var(--text-faint)", fontWeight: 500 }}>
                    {plan.period}
                  </span>
                )}
              </div>

              {/* Tagline */}
              <p style={{
                margin: "0 0 20px",
                fontSize: "12.5px",
                color: "var(--text-faint)",
                lineHeight: 1.5,
              }}>
                {plan.tagline}
              </p>

              {/* Divider */}
              <div style={{ height: 1, background: "var(--border)", marginBottom: 18 }} />

              {/* Features */}
              <ul style={{
                margin: "0 0 24px",
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                flex: 1,
              }}>
                {plan.features.map((feat) => (
                  <li key={feat} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 9,
                    fontSize: "13px",
                    color: "var(--text)",
                    lineHeight: 1.45,
                  }}>
                    <Check
                      size={14}
                      style={{
                        color: "var(--primary)",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    />
                    {feat}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrent ? (
                <button
                  disabled
                  style={{
                    width: "100%",
                    padding: "11px 0",
                    borderRadius: "var(--r-md)",
                    background: "var(--surface-2)",
                    color: "var(--text-faint)",
                    border: "1px solid var(--border)",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "not-allowed",
                    opacity: 0.8,
                    fontFamily: "inherit",
                  }}
                >
                  Seu plano atual
                </button>
              ) : isEnterprise ? (
                <Link
                  href="/portal/suporte/novo"
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "11px 0",
                    borderRadius: "var(--r-md)",
                    background: "var(--cta-bg)",
                    color: "var(--cta-text)",
                    border: "1px solid var(--border)",
                    fontSize: "14px",
                    fontWeight: 600,
                    textDecoration: "none",
                    textAlign: "center",
                    fontFamily: "inherit",
                    letterSpacing: "-0.01em",
                    boxSizing: "border-box",
                  }}
                >
                  Falar com equipe
                </Link>
              ) : (
                <UpgradeButton plan={plan.id} />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p style={{
        marginTop: 32,
        fontSize: "12px",
        color: "var(--text-faint)",
        textAlign: "center",
        lineHeight: 1.5,
      }}>
        Dúvidas sobre planos?{" "}
        <Link href="/portal/suporte/novo" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
          Fale com nossa equipe
        </Link>
        .
      </p>
    </div>
  );
}
