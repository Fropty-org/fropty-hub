import type { Metadata } from "next";
import Link from "next/link";
import { Heart, AlertTriangle, AlertCircle, XCircle, ChevronRight, UserCheck } from "lucide-react";
import { getClientsWithHealth, getCSMetrics, getClientsWithoutHealth } from "@/app/actions/customer-success";
import { HealthScoreBadge } from "@/app/components/admin/HealthScoreBadge";
import { RISK_CONFIG, SCORE_DIMENSIONS } from "@/app/lib/constants/customer-success";
import type { RiskLevel } from "@/app/lib/types/customer-success";

export const metadata: Metadata = { title: "Customer Success — Admin" };

const PLAN_LABELS: Record<string, string> = {
  sem_plano: "Sem plano",
  basico: "Básico",
  pro: "Pro",
};

export default async function CustomerSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ risk?: string; plan?: string }>;
}) {
  const params = await searchParams;
  const filterRisk = params.risk as RiskLevel | undefined;
  const filterPlan = params.plan;

  const [metrics, allClients, withoutHealth] = await Promise.all([
    getCSMetrics(),
    getClientsWithHealth(),
    getClientsWithoutHealth(),
  ]);

  const filtered = allClients.filter((c) => {
    if (filterRisk && c.health?.risk_level !== filterRisk) return false;
    if (filterPlan && c.plan !== filterPlan) return false;
    return true;
  });

  const metricCards = [
    { label: "Saudável",  value: metrics.saudavel, color: "#22c55e", Icon: Heart },
    { label: "Atenção",   value: metrics.atencao,  color: "#f59e0b", Icon: AlertTriangle },
    { label: "Risco",     value: metrics.risco,    color: "#ef4444", Icon: AlertCircle },
    { label: "Crítico",   value: metrics.critico,  color: "#dc2626", Icon: XCircle },
  ];

  const riskFilters: { label: string; value: string }[] = [
    { label: "Todos", value: "" },
    { label: "Saudável", value: "saudavel" },
    { label: "Atenção", value: "atencao" },
    { label: "Risco", value: "risco" },
    { label: "Crítico", value: "critico" },
  ];

  const planFilters = [
    { label: "Todos os planos", value: "" },
    { label: "Básico", value: "basico" },
    { label: "Pro", value: "pro" },
  ];

  return (
    <div style={{ padding: "40px 32px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)" }}>Customer Success</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>
          {metrics.total_clients} clientes · Score médio {metrics.avg_score} · {metrics.sem_avaliacao} sem avaliação
        </p>
      </div>

      {/* Métricas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 36 }}>
        {metricCards.map((m) => (
          <div key={m.label} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16, padding: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${m.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <m.Icon size={20} style={{ color: m.color }} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>{m.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: "2rem", fontWeight: 900, color: "var(--text)", lineHeight: 1 }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Sem avaliação */}
      {withoutHealth.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14, color: "var(--text)" }}>
            Sem avaliação ({withoutHealth.length})
          </h2>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>
            {withoutHealth.map((c, i, arr) => (
              <div
                key={c.id}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 18px",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>
                    {c.full_name || c.email}
                  </p>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>
                    {PLAN_LABELS[c.plan] ?? c.plan} · {c.email}
                  </p>
                </div>
                <Link
                  href={`/admin/customer-success/${c.id}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 14px", borderRadius: 8,
                    background: "rgba(239,159,39,0.12)", border: "1px solid rgba(239,159,39,0.3)",
                    color: "#EF9F27", fontSize: "12px", fontWeight: 700, textDecoration: "none",
                  }}
                >
                  <UserCheck size={13} />
                  Avaliar
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        {riskFilters.map((f) => {
          const active = (filterRisk ?? "") === f.value;
          const cfg = f.value ? RISK_CONFIG[f.value as RiskLevel] : null;
          return (
            <Link
              key={f.value}
              href={`/admin/customer-success?risk=${f.value}${filterPlan ? `&plan=${filterPlan}` : ""}`}
              style={{
                padding: "5px 14px", borderRadius: 999,
                fontSize: "12px", fontWeight: 700,
                background: active ? (cfg ? cfg.bg : "rgba(239,159,39,0.12)") : "var(--surface-2)",
                color: active ? (cfg?.color ?? "#EF9F27") : "var(--text-muted)",
                border: `1px solid ${active ? (cfg?.color ?? "#EF9F27") + "50" : "var(--border)"}`,
                textDecoration: "none",
              }}
            >
              {f.label}
            </Link>
          );
        })}
        <span style={{ color: "var(--border)", margin: "0 4px" }}>|</span>
        {planFilters.map((f) => {
          const active = (filterPlan ?? "") === f.value;
          return (
            <Link
              key={f.value}
              href={`/admin/customer-success?${filterRisk ? `risk=${filterRisk}&` : ""}plan=${f.value}`}
              style={{
                padding: "5px 14px", borderRadius: 999,
                fontSize: "12px", fontWeight: 700,
                background: active ? "rgba(59,130,246,0.1)" : "var(--surface-2)",
                color: active ? "#3b82f6" : "var(--text-muted)",
                border: `1px solid ${active ? "#3b82f650" : "var(--border)"}`,
                textDecoration: "none",
              }}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Tabela de clientes */}
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 90px 140px 180px 120px 80px",
          padding: "10px 18px",
          borderBottom: "1px solid var(--border)",
          gap: 12,
        }}>
          {["Cliente", "Plano", "Score", "Dimensões", "Atualizado", ""].map((h) => (
            <span key={h} style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</span>
          ))}
        </div>

        {filtered.length === 0 && (
          <p style={{ padding: "28px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px", margin: 0 }}>
            Nenhum cliente encontrado com os filtros selecionados.
          </p>
        )}

        {filtered.map((c, i, arr) => {
          const updatedAt = c.health?.updated_at
            ? new Date(c.health.updated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })
            : null;

          return (
            <div
              key={c.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 90px 140px 180px 120px 80px",
                padding: "13px 18px",
                borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.full_name || c.email}
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.email}
                </p>
              </div>

              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>
                {PLAN_LABELS[c.plan] ?? c.plan}
              </span>

              <div>
                <HealthScoreBadge score={c.health?.score_total ?? null} risk={c.health?.risk_level ?? null} />
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {c.health ? SCORE_DIMENSIONS.map(({ key, label }) => (
                  <span key={key} style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-faint)", padding: "2px 6px", background: "var(--surface-2)", borderRadius: 6 }}>
                    {label.slice(0, 3)} {(c.health as NonNullable<typeof c.health>)[key as keyof typeof c.health]}
                  </span>
                )) : <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>—</span>}
              </div>

              <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>
                {updatedAt ?? ""}
              </span>

              <Link
                href={`/admin/customer-success/${c.id}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "5px 12px", borderRadius: 8,
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                  color: "var(--text-muted)", fontSize: "12px", fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Ver
                <ChevronRight size={12} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

