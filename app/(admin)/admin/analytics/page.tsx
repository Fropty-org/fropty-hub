import type { Metadata } from "next";
import { createClient } from "@/app/lib/supabase/server";
import { TrendingUp, Users, MessageCircle, CheckCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = { title: "Analytics — Admin" };

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const [
    { data: mrrData },
    { count: totalClients },
    { count: openTickets },
    { count: resolvedTickets },
    { data: planBreakdown },
    { data: monthlyTokens },
  ] = await Promise.all([
    supabase.rpc("admin_mrr"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "cliente"),
    supabase.from("tickets").select("*", { count: "exact", head: true }).in("status", ["aberto", "em_andamento", "reaberto"]),
    supabase.from("tickets").select("*", { count: "exact", head: true }).in("status", ["resolvido", "fechado"]),
    supabase.from("profiles").select("plan").eq("role", "cliente"),
    supabase.from("token_transactions").select("amount, type, created_at").gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const mrr = (mrrData as unknown as number) ?? 0;

  // Calcular distribuição de planos
  const planCounts = { sem_plano: 0, basico: 0, pro: 0 };
  (planBreakdown ?? []).forEach((p) => {
    const pl = (p.plan ?? "sem_plano") as keyof typeof planCounts;
    if (pl in planCounts) planCounts[pl]++;
  });

  // Tokens emitidos vs gastos nos últimos 30 dias
  const tokensIn  = (monthlyTokens ?? []).filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const tokensOut = (monthlyTokens ?? []).filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);

  const totalTickets = (openTickets ?? 0) + (resolvedTickets ?? 0);
  const resolvedRate = totalTickets > 0
    ? Math.round(((resolvedTickets ?? 0) / totalTickets) * 100)
    : 0;

  const kpis: { label: string; value: string | number; Icon: LucideIcon; color: string; sub: string }[] = [
    { label: "MRR",                value: `R$${mrr.toFixed(2).replace(".", ",")}`, Icon: TrendingUp,    color: "#22c55e", sub: `${planCounts.basico} básico · ${planCounts.pro} pro` },
    { label: "Clientes ativos",    value: totalClients ?? 0,   Icon: Users,          color: "#3b82f6",        sub: `${planCounts.sem_plano} sem plano` },
    { label: "Tickets abertos",    value: openTickets ?? 0,    Icon: MessageCircle,  color: "var(--primary)", sub: `${resolvedTickets ?? 0} resolvidos/fechados` },
    { label: "Taxa de resolução",  value: `${resolvedRate}%`,  Icon: CheckCircle,    color: "#EF9F27",        sub: `${openTickets ?? 0} abertos · ${resolvedTickets ?? 0} resolvidos` },
  ];

  return (
    <div style={{ padding: "40px 32px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)" }}>Analytics</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>Métricas operacionais e de crescimento</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16, marginBottom: 36 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16, padding: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${k.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <k.Icon size={20} style={{ color: k.color }} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>{k.label}</span>
            </div>
            <p style={{ margin: "0 0 4px", fontSize: "2rem", fontWeight: 900, color: "var(--text)", lineHeight: 1 }}>{k.value}</p>
            <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Distribuição de planos */}
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "22px" }}>
          <h2 style={{ margin: "0 0 18px", fontSize: "0.95rem", fontWeight: 700, color: "var(--text)" }}>Distribuição de planos</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {([["Sem plano", planCounts.sem_plano, "#94a3b8"], ["Básico", planCounts.basico, "#3b82f6"], ["Pro", planCounts.pro, "var(--primary)"]] as [string, number, string][]).map(([label, count, color]) => {
              const total = (totalClients ?? 1);
              const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: 5 }}>
                    <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
                    <span style={{ color: "var(--text-faint)" }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, background: "var(--surface)", borderRadius: 99 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tokens 30 dias */}
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "22px" }}>
          <h2 style={{ margin: "0 0 18px", fontSize: "0.95rem", fontWeight: 700, color: "var(--text)" }}>Tokens (últimos 30 dias)</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {([["Emitidos", tokensIn, "#22c55e"], ["Consumidos", tokensOut, "#ef4444"]] as [string, number, string][]).map(([label, val, color]) => (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: 5 }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
                  <span style={{ color, fontWeight: 700 }}>{val}</span>
                </div>
                <div style={{ height: 6, background: "var(--surface)", borderRadius: 99 }}>
                  <div style={{ height: "100%", width: `${Math.min(100, tokensIn > 0 ? (val / Math.max(tokensIn, tokensOut)) * 100 : 0)}%`, background: color, borderRadius: 99 }} />
                </div>
              </div>
            ))}
            <div style={{ padding: "12px", background: "var(--surface)", borderRadius: 10, display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: 4 }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Saldo líquido</span>
              <span style={{ fontWeight: 800, color: tokensIn - tokensOut >= 0 ? "#22c55e" : "#ef4444" }}>
                {tokensIn - tokensOut >= 0 ? "+" : ""}{tokensIn - tokensOut}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
