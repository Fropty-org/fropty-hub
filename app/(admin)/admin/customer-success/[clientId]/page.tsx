import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, FolderKanban, FileSignature } from "lucide-react";
import { getClientHealth } from "@/app/actions/customer-success";
import { HealthScoreBadge } from "@/app/components/admin/HealthScoreBadge";
import { HealthScoreForm } from "@/app/components/admin/HealthScoreForm";
import { RISK_CONFIG, SCORE_DIMENSIONS } from "@/app/lib/constants/customer-success";

export const metadata: Metadata = { title: "Perfil CS — Admin" };

const PLAN_LABELS: Record<string, string> = {
  sem_plano: "Sem plano",
  basico: "Básico",
  pro: "Pro",
};

export default async function ClientCSPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const client = await getClientHealth(clientId);
  if (!client) notFound();

  const health = client.health;
  const cfg = health ? RISK_CONFIG[health.risk_level] : null;
  const updatedAt = health?.updated_at
    ? new Date(health.updated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

  const quickLinks = [
    { href: `/portal/suporte?client=${clientId}`, label: "Ver tickets", Icon: MessageCircle },
    { href: `/admin/projetos?client=${clientId}`, label: "Ver projetos", Icon: FolderKanban },
    { href: `/admin/contratos?client=${clientId}`, label: "Ver contratos", Icon: FileSignature },
  ];

  return (
    <div style={{ padding: "40px 32px", maxWidth: 900, margin: "0 auto" }}>
      <Link
        href="/admin/customer-success"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "13px", color: "var(--text-muted)", textDecoration: "none", marginBottom: 24 }}
      >
        <ArrowLeft size={14} />
        Customer Success
      </Link>

      {/* Header */}
      <div style={{
        background: "var(--card-bg)", border: "1px solid var(--card-border)",
        borderRadius: 16, padding: 24, marginBottom: 24,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)" }}>
            {client.full_name || client.email}
          </h1>
          <p style={{ margin: "0 0 8px", fontSize: "13px", color: "var(--text-faint)" }}>{client.email}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              padding: "3px 10px", borderRadius: 999,
              background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)",
              fontSize: "11px", fontWeight: 700, color: "var(--c-info)",
            }}>
              {PLAN_LABELS[client.plan] ?? client.plan}
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>{client.token_balance} tokens</span>
          </div>
        </div>
        <HealthScoreBadge score={health?.score_total ?? null} risk={health?.risk_level ?? null} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Score detalhado */}
          {health && cfg && (
            <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 20px", color: "var(--text)" }}>Score por dimensão</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {SCORE_DIMENSIONS.map(({ key, label, weight }) => {
                  const val = health[key as keyof typeof health] as number;
                  const pct = val;
                  const color = val >= 75 ? '#22c55e' : val >= 50 ? '#f59e0b' : val >= 25 ? '#ef4444' : '#dc2626';
                  return (
                    <div key={key}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{label}</span>
                          <span style={{ fontSize: "11px", color: "var(--text-faint)", padding: "1px 6px", background: "var(--surface-2)", borderRadius: 999 }}>{weight}</span>
                        </div>
                        <span style={{ fontSize: "14px", fontWeight: 800, color }}>{val}</span>
                      </div>
                      <div style={{ height: 7, background: "var(--surface-2)", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width 0.4s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notas e histórico */}
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 16px", color: "var(--text)" }}>Notas CS</h2>
            {health?.cs_notes ? (
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {health.cs_notes}
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>Nenhuma nota registrada.</p>
            )}
            {updatedAt && (
              <p style={{ margin: "12px 0 0", fontSize: "11px", color: "var(--text-faint)" }}>
                Última atualização: {updatedAt}
              </p>
            )}
          </div>

          {/* Formulário de edição */}
          <HealthScoreForm clientId={clientId} initial={health ?? undefined} clientName={client.full_name ?? client.email} />
        </div>

        {/* Sidebar direita */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16, padding: 20 }}>
            <p style={{ margin: "0 0 14px", fontSize: "12px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Links rápidos
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {quickLinks.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px", borderRadius: 9,
                    background: "var(--surface-2)", border: "1px solid var(--border)",
                    color: "var(--text-muted)", fontSize: "13px", fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
