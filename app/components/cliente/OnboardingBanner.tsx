import Link from "next/link";

interface Props {
  name: string;
  tokenBalance: number;
}

export function OnboardingBanner({ name, tokenBalance }: Props) {
  const steps = [
    {
      num: "1",
      title: "Configure seu app",
      desc: "Use o configurador para montar seu projeto com os recursos que precisa.",
      href: "/configurador",
      cta: "Abrir configurador",
      done: false,
      color: "var(--primary)",
    },
    {
      num: "2",
      title: "Aguarde a prévia gratuita",
      desc: "Em até 48h nossa equipe entra em contato com uma demonstração do seu app.",
      href: null,
      cta: null,
      done: false,
      color: "#EF9F27",
    },
    {
      num: "3",
      title: "Acompanhe seu projeto",
      desc: "Aqui você verá o progresso, atualizações e poderá abrir chamados de suporte.",
      href: "/portal/suporte",
      cta: "Ver suporte",
      done: false,
      color: "#22c55e",
    },
  ];

  return (
    <div style={{
      background: "var(--card-bg)",
      border: "1px solid var(--card-border)",
      borderRadius: 20,
      padding: "32px 28px",
      marginBottom: 32,
    }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: "0 0 4px", fontSize: 13, color: "var(--text-faint)" }}>Primeiros passos</p>
        <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-plus-jakarta), sans-serif" }}>
          Bem-vindo, {name.split(" ")[0]}! Vamos começar?
        </h2>
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {steps.map((step) => (
          <div key={step.num} style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "14px 16px",
            borderRadius: 12,
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: `${step.color}22`,
              border: `1.5px solid ${step.color}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              fontSize: 13, fontWeight: 800, color: step.color,
            }}>
              {step.num}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{step.title}</p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{step.desc}</p>
            </div>
            {step.href && step.cta && (
              <Link href={step.href} style={{
                padding: "7px 14px", borderRadius: 8,
                background: step.color, color: "#fff",
                fontSize: 12, fontWeight: 700, textDecoration: "none",
                whiteSpace: "nowrap", flexShrink: 0,
              }}>
                {step.cta}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Token hint */}
      {tokenBalance === 0 && (
        <div style={{
          marginTop: 16,
          padding: "10px 14px",
          borderRadius: 10,
          background: "rgba(239,159,39,0.08)",
          border: "1px solid rgba(239,159,39,0.2)",
          display: "flex", alignItems: "center", gap: 10,
          fontSize: 12, color: "#EF9F27",
        }}>
          <i className="ti ti-coins" style={{ fontSize: 15, flexShrink: 0 }} />
          <span>
            Você ainda não tem tokens. Tokens são usados para abrir chamados de suporte após a entrega.{" "}
            <Link href="/portal/financeiro" style={{ color: "#EF9F27", fontWeight: 700 }}>Ver planos →</Link>
          </span>
        </div>
      )}
    </div>
  );
}
