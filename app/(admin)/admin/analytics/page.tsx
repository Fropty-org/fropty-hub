import type { Metadata } from "next";
import { createClient } from "@/app/lib/supabase/server";
import { TrendingUp, Users, MessageCircle, CheckCircle, Zap, Clock, ShieldCheck, Activity, Smile } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SLA_TARGETS } from "@/app/lib/constants/sla";
import { TrendBars } from "@/app/components/admin/TrendBars";
import { getNpsSummary } from "@/app/actions/nps";
import { getServerI18n } from "@/app/lib/i18n/server";

export const metadata: Metadata = { title: "Analytics — Admin" };

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const { t } = await getServerI18n();

  const [
    { data: mrrData },
    { count: totalClients },
    { count: openTickets },
    { count: resolvedTickets },
    { data: planBreakdown },
    { data: monthlyTokens },
    { data: ticketsByStatus },
    { data: ticketsByPriority },
    { data: recentClients },
    { data: resolvedWithDates },
    { data: ticketsCreated30d },
  ] = await Promise.all([
    supabase.rpc("admin_mrr"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "cliente"),
    supabase.from("tickets").select("*", { count: "exact", head: true }).in("status", ["aberto", "em_andamento", "reaberto"]),
    supabase.from("tickets").select("*", { count: "exact", head: true }).in("status", ["resolvido", "fechado"]),
    supabase.from("profiles").select("plan").eq("role", "cliente"),
    supabase.from("token_transactions").select("amount, type, created_at").gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from("tickets").select("status"),
    supabase.from("tickets").select("priority"),
    supabase.from("profiles").select("name, email, plan, created_at").eq("role", "cliente").order("created_at", { ascending: false }).limit(5),
    supabase.from("tickets").select("created_at, resolved_at, first_response_at, priority").in("status", ["resolvido", "fechado"]).not("resolved_at", "is", null).limit(200),
    supabase.from("tickets").select("created_at").gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  // Séries diárias dos últimos 30 dias (para os gráficos de tendência).
  const DAYS = 30;
  const startMs = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime() - (DAYS - 1) * 86_400_000; })();
  function dailySeries(items: { created_at: string; amount?: number }[], useAmount = false) {
    const buckets = Array<number>(DAYS).fill(0);
    for (const it of items) {
      const idx = Math.floor((new Date(it.created_at).getTime() - startMs) / 86_400_000);
      if (idx >= 0 && idx < DAYS) buckets[idx] += useAmount ? (it.amount ?? 0) : 1;
    }
    return buckets.map((v, i) => ({
      label: new Date(startMs + i * 86_400_000).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      value: v,
    }));
  }
  const newTicketsSeries     = dailySeries((ticketsCreated30d ?? []) as { created_at: string }[]);
  const tokensConsumedSeries = dailySeries((monthlyTokens ?? []).filter((t) => t.type === "debit") as { created_at: string; amount: number }[], true);

  const nps = await getNpsSummary(90);

  const mrr = (mrrData as unknown as number) ?? 0;

  const resolvedList = (resolvedWithDates ?? []) as { created_at: string; resolved_at: string; first_response_at: string | null; priority: string }[];
  const avgResolutionHours = resolvedList.length > 0
    ? Math.round(resolvedList.reduce((sum, t) => {
        const h = (new Date(t.resolved_at).getTime() - new Date(t.created_at).getTime()) / 3600000;
        return sum + h;
      }, 0) / resolvedList.length)
    : null;
  const slaComplianceCount = resolvedList.filter((t) => {
    if (!t.first_response_at) return false;
    const target = SLA_TARGETS[t.priority as keyof typeof SLA_TARGETS] ?? SLA_TARGETS.media;
    const responseH = (new Date(t.first_response_at).getTime() - new Date(t.created_at).getTime()) / 3600000;
    return responseH <= target.response;
  }).length;
  const slaCompliance = resolvedList.length > 0 ? Math.round((slaComplianceCount / resolvedList.length) * 100) : null;

  const avgResolutionLabel = avgResolutionHours == null
    ? "—"
    : avgResolutionHours < 24
      ? `${avgResolutionHours}h`
      : `${Math.round(avgResolutionHours / 24)}d`;

  const planCounts = { sem_plano: 0, basico: 0, pro: 0 };
  (planBreakdown ?? []).forEach((p) => {
    const pl = (p.plan ?? "sem_plano") as keyof typeof planCounts;
    if (pl in planCounts) planCounts[pl]++;
  });

  const tokensIn  = (monthlyTokens ?? []).filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const tokensOut = (monthlyTokens ?? []).filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);

  const totalTickets = (openTickets ?? 0) + (resolvedTickets ?? 0);
  const resolvedRate = totalTickets > 0 ? Math.round(((resolvedTickets ?? 0) / totalTickets) * 100) : 0;

  const statusCount: Record<string, number> = {};
  (ticketsByStatus ?? []).forEach((t: { status: string }) => {
    statusCount[t.status] = (statusCount[t.status] ?? 0) + 1;
  });

  const priorityCount: Record<string, number> = {};
  (ticketsByPriority ?? []).forEach((t: { priority: string }) => {
    priorityCount[t.priority] = (priorityCount[t.priority] ?? 0) + 1;
  });

  const kpis: { label: string; value: string | number; Icon: LucideIcon; color: string; sub: string }[] = [
    { label: t("admin.analytics.kpi.mrr"), value: `R$${mrr.toFixed(2).replace(".", ",")}`, Icon: TrendingUp, color: "var(--c-success)", sub: t("admin.analytics.sub.mrr", { basico: planCounts.basico, pro: planCounts.pro }) },
    { label: t("admin.analytics.kpi.activeClients"), value: totalClients ?? 0, Icon: Users, color: "var(--c-info)", sub: t("admin.analytics.sub.activeClients", { n: planCounts.sem_plano }) },
    { label: t("admin.analytics.kpi.openTickets"), value: openTickets ?? 0, Icon: MessageCircle, color: "var(--brand-accent)", sub: t("admin.analytics.sub.openTickets", { n: resolvedTickets ?? 0 }) },
    { label: t("admin.analytics.kpi.resolutionRate"), value: `${resolvedRate}%`, Icon: CheckCircle, color: resolvedRate >= 80 ? "var(--c-success)" : resolvedRate >= 50 ? "var(--c-warning)" : "var(--c-danger)", sub: t("admin.analytics.sub.resolutionRate", { open: openTickets ?? 0, resolved: resolvedTickets ?? 0 }) },
    { label: t("admin.analytics.kpi.avgResolution"), value: avgResolutionLabel, Icon: Clock, color: avgResolutionHours != null && avgResolutionHours <= 24 ? "var(--c-success)" : avgResolutionHours != null && avgResolutionHours <= 72 ? "var(--c-warning)" : "var(--text-faint)", sub: t("admin.analytics.sub.avgResolution", { n: resolvedList.length }) },
    { label: t("admin.analytics.kpi.slaCompliance"), value: slaCompliance != null ? `${slaCompliance}%` : "—", Icon: ShieldCheck, color: slaCompliance != null && slaCompliance >= 80 ? "var(--c-success)" : slaCompliance != null && slaCompliance >= 50 ? "var(--c-warning)" : "var(--c-danger)", sub: t("admin.analytics.sub.slaCompliance", { ok: slaComplianceCount, total: resolvedList.length }) },
    { label: t("admin.analytics.kpi.tokensConsumed"), value: tokensOut, Icon: Zap, color: "var(--brand-accent)", sub: t("admin.analytics.sub.tokensConsumed", { n: tokensIn }) },
    { label: t("admin.analytics.kpi.nps"), value: nps.nps != null ? String(nps.nps) : "—", Icon: Smile, color: nps.nps == null ? "var(--text-faint)" : nps.nps >= 50 ? "var(--c-success)" : nps.nps >= 0 ? "var(--c-warning)" : "var(--c-danger)", sub: nps.count > 0 ? t("admin.analytics.sub.npsCounts", { promoters: nps.promoters, detractors: nps.detractors, count: nps.count }) : t("admin.analytics.sub.npsEmpty") },
  ];

  const statusLabels: Record<string, string> = {
    aberto: t("admin.overview.status.aberto"), em_andamento: t("admin.overview.status.em_andamento"), reaberto: t("admin.overview.status.reaberto"),
    resolvido: t("admin.overview.status.resolvido"), fechado: t("admin.overview.status.fechado"),
  };
  const statusColors: Record<string, string> = {
    aberto: "var(--c-danger)", em_andamento: "var(--c-warning)", reaberto: "var(--c-purple)",
    resolvido: "var(--c-success)", fechado: "var(--text-faint)",
  };
  const priorityLabels: Record<string, string> = { baixa: t("admin.analytics.priority.baixa"), media: t("admin.analytics.priority.media"), alta: t("admin.analytics.priority.alta"), critica: t("admin.analytics.priority.critica") };
  const priorityColors: Record<string, string> = { baixa: "var(--c-success)", media: "var(--c-info)", alta: "var(--c-warning)", critica: "var(--c-danger)" };
  const PLAN_LABEL: Record<string, string> = { sem_plano: t("admin.plans.sem_plano"), basico: t("admin.plans.basico"), pro: t("admin.plans.pro") };

  return (
    <div className="hub-page" style={{ maxWidth: "none" }}>
      <div className="hub-page-header">
        <h1 className="hub-page-title">{t("admin.analytics.title")}</h1>
        <p className="hub-page-sub">{t("admin.analytics.subtitle")}</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
        {kpis.map((k) => (
          <div key={k.label} className="hub-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `color-mix(in srgb, ${k.color} 12%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <k.Icon size={17} style={{ color: k.color }} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>{k.label}</span>
            </div>
            <p style={{ margin: "0 0 4px", fontSize: "2rem", fontWeight: 900, color: "var(--text)", lineHeight: 1, letterSpacing: "-0.02em" }}>{k.value}</p>
            <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Tendências (30 dias) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div className="hub-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Activity size={14} style={{ color: "var(--text-muted)" }} />
            <h2 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "var(--text)" }}>{t("admin.analytics.newTickets30d")}</h2>
          </div>
          <TrendBars data={newTicketsSeries} color="var(--brand-accent)" unit={t("admin.analytics.unitTickets")} periodLabel={t("admin.analytics.inPeriod")} />
        </div>
        <div className="hub-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Zap size={14} style={{ color: "var(--text-muted)" }} />
            <h2 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "var(--text)" }}>{t("admin.analytics.tokensConsumed30d")}</h2>
          </div>
          <TrendBars data={tokensConsumedSeries} color="var(--primary)" unit={t("admin.analytics.unitTokens")} periodLabel={t("admin.analytics.inPeriod")} />
        </div>
      </div>

      {/* Three columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>

        {/* Distribuição de planos */}
        <div className="hub-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Users size={14} style={{ color: "var(--text-muted)" }} />
            <h2 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "var(--text)" }}>{t("admin.analytics.plans")}</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(Object.entries(planCounts) as [string, number][]).map(([key, count]) => {
              const total = totalClients ?? 1;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const color = key === "pro" ? "var(--primary)" : key === "basico" ? "var(--c-info)" : "var(--text-faint)";
              return (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: 6 }}>
                    <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{PLAN_LABEL[key]}</span>
                    <span style={{ color: "var(--text-faint)" }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: 5, background: "var(--surface-2)", borderRadius: 99 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tickets por status */}
        <div className="hub-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <MessageCircle size={14} style={{ color: "var(--text-muted)" }} />
            <h2 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "var(--text)" }}>{t("admin.analytics.ticketsByStatus")}</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(statusLabels).map(([key, label]) => {
              const count = statusCount[key] ?? 0;
              const total = Math.max(1, Object.values(statusCount).reduce((a, b) => a + b, 0));
              const pct = Math.round((count / total) * 100);
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: statusColors[key], flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: "12px", fontWeight: 500, color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)" }}>{count}</span>
                  <span style={{ fontSize: "10.5px", color: "var(--text-faint)", width: 32, textAlign: "right" }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tickets por prioridade */}
        <div className="hub-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Zap size={14} style={{ color: "var(--text-muted)" }} />
            <h2 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "var(--text)" }}>{t("admin.analytics.ticketsByPriority")}</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(priorityLabels).map(([key, label]) => {
              const count = priorityCount[key] ?? 0;
              const total = Math.max(1, Object.values(priorityCount).reduce((a, b) => a + b, 0));
              const pct = Math.round((count / total) * 100);
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: priorityColors[key], flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: "12px", fontWeight: 500, color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)" }}>{count}</span>
                  <span style={{ fontSize: "10.5px", color: "var(--text-faint)", width: 32, textAlign: "right" }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two columns bottom */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Tokens 30 dias */}
        <div className="hub-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Clock size={14} style={{ color: "var(--text-muted)" }} />
            <h2 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "var(--text)" }}>{t("admin.analytics.tokens30d")}</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {([[t("admin.analytics.issued"), tokensIn, "var(--c-success)"], [t("admin.analytics.consumed"), tokensOut, "var(--c-danger)"]] as [string, number, string][]).map(([label, val, color]) => (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: 6 }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
                  <span style={{ color, fontWeight: 700 }}>{val.toLocaleString("pt-BR")}</span>
                </div>
                <div style={{ height: 5, background: "var(--surface-2)", borderRadius: 99 }}>
                  <div style={{ height: "100%", width: `${Math.min(100, tokensIn > 0 ? (val / Math.max(tokensIn, tokensOut)) * 100 : 0)}%`, background: color, borderRadius: 99 }} />
                </div>
              </div>
            ))}
            <div style={{ padding: "12px 14px", background: "var(--surface-2)", borderRadius: 10, display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: 2 }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{t("admin.analytics.netBalance")}</span>
              <span style={{ fontWeight: 800, color: tokensIn - tokensOut >= 0 ? "var(--c-success)" : "var(--c-danger)" }}>
                {tokensIn - tokensOut >= 0 ? "+" : ""}{(tokensIn - tokensOut).toLocaleString("pt-BR")}
              </span>
            </div>
          </div>
        </div>

        {/* Clientes recentes */}
        <div className="hub-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Users size={14} style={{ color: "var(--text-muted)" }} />
            <h2 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "var(--text)" }}>{t("admin.analytics.recentClients")}</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {(recentClients ?? []).length === 0 ? (
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>{t("admin.analytics.noClients")}</p>
            ) : (recentClients ?? []).map((c, i, arr) => {
              const initials = (c.name ?? c.email ?? "?").slice(0, 2).toUpperCase();
              const planLabel = PLAN_LABEL[c.plan ?? "sem_plano"] ?? "";
              const planColor = c.plan === "pro" ? "var(--primary)" : c.plan === "basico" ? "var(--c-info)" : "var(--text-faint)";
              return (
                <div key={c.email} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "12.5px", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name ?? ""}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</p>
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: planColor, background: `color-mix(in srgb, ${planColor} 10%, transparent)`, padding: "2px 8px", borderRadius: 99, whiteSpace: "nowrap", flexShrink: 0 }}>{planLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

