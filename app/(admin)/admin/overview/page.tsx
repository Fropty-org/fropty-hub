import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import {
  Users, MessageCircle, DollarSign, ChevronRight,
  AlertTriangle, TrendingUp, CheckCircle, Activity,
  FolderKanban, FileText, Heart, ArrowUpRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = { title: "Visão Geral — Admin" };

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [
    { count: totalClients },
    { count: openTickets },
    { count: closedTickets },
    { data: mrrData },
    { data: urgentTickets },
    { count: openProjects },
    { count: activeContracts },
    { data: recentTickets },
    { data: csMetrics },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "cliente"),
    supabase.from("tickets").select("*", { count: "exact", head: true }).in("status", ["aberto", "em_andamento", "reaberto"]),
    supabase.from("tickets").select("*", { count: "exact", head: true }).in("status", ["resolvido", "fechado"]),
    supabase.rpc("admin_mrr"),
    supabase
      .from("tickets")
      .select("id, subject, status, priority, ticket_number, created_at, profiles:client_id(name)")
      .eq("priority", "alta")
      .in("status", ["aberto", "em_andamento", "reaberto"])
      .order("created_at", { ascending: true })
      .limit(6),
    supabase.from("projects").select("*", { count: "exact", head: true }).in("status", ["em_andamento", "revisao"]),
    supabase.from("contracts").select("*", { count: "exact", head: true }).eq("status", "ativo"),
    supabase
      .from("tickets")
      .select("id, subject, status, priority, ticket_number, created_at, profiles:client_id(name)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("health_scores").select("risk_level"),
  ]);

  const mrr = (mrrData as unknown as number) ?? 0;
  const totalTickets = (openTickets ?? 0) + (closedTickets ?? 0);
  const resolvedRate = totalTickets > 0 ? Math.round(((closedTickets ?? 0) / totalTickets) * 100) : 0;

  const healthCounts = { saudavel: 0, atencao: 0, risco: 0, critico: 0 };
  (csMetrics ?? []).forEach((r: { risk_level: string }) => {
    const k = r.risk_level as keyof typeof healthCounts;
    if (k in healthCounts) healthCounts[k]++;
  });
  const atRisk = healthCounts.risco + healthCounts.critico;

  const kpis: { label: string; value: string | number; sub: string; Icon: LucideIcon; accent: string; bg: string; href: string }[] = [
    {
      label: "Clientes ativos",
      value: totalClients ?? 0,
      sub: `${atRisk > 0 ? `${atRisk} em risco` : "todos saudáveis"}`,
      Icon: Users,
      accent: "var(--c-info)",
      bg: "var(--c-info-bg)",
      href: "/admin/usuarios",
    },
    {
      label: "Tickets abertos",
      value: openTickets ?? 0,
      sub: `${closedTickets ?? 0} resolvidos no total`,
      Icon: MessageCircle,
      accent: "var(--brand-accent)",
      bg: "rgba(239,159,39,0.10)",
      href: "/portal/suporte",
    },
    {
      label: "MRR",
      value: `R$${mrr.toFixed(2).replace(".", ",")}`,
      sub: `${(totalClients ?? 0)} clientes ativos`,
      Icon: DollarSign,
      accent: "var(--c-success)",
      bg: "var(--c-success-bg)",
      href: "/admin/financeiro",
    },
    {
      label: "Taxa de resolução",
      value: `${resolvedRate}%`,
      sub: `${closedTickets ?? 0} tickets resolvidos`,
      Icon: CheckCircle,
      accent: resolvedRate >= 80 ? "var(--c-success)" : resolvedRate >= 50 ? "var(--brand-accent)" : "var(--c-danger)",
      bg: resolvedRate >= 80 ? "var(--c-success-bg)" : resolvedRate >= 50 ? "rgba(239,159,39,0.10)" : "var(--c-danger-bg)",
      href: "/admin/analytics",
    },
  ];

  const STATUS_LABEL: Record<string, string> = {
    aberto: "Aberto", em_andamento: "Em andamento", reaberto: "Reaberto",
    resolvido: "Resolvido", fechado: "Fechado",
  };
  const STATUS_COLOR: Record<string, string> = {
    aberto: "var(--c-danger)", em_andamento: "var(--brand-accent)", reaberto: "var(--c-warning)",
    resolvido: "var(--c-success)", fechado: "var(--text-faint)",
  };

  const now = new Date();
  function timeAgo(dateStr: string) {
    const diff = Math.floor((now.getTime() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return "agora";
    if (diff < 60) return `${diff}m atrás`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h atrás`;
    return `${Math.floor(diff / 1440)}d atrás`;
  }

  return (
    <div style={{ padding: "36px 32px", maxWidth: 1100, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>Visão Geral</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-faint)" }}>Resumo operacional do ecossistema Fropty</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <Activity size={12} style={{ color: "var(--c-success)" }} />
          <span style={{ fontSize: "12px", color: "var(--text-faint)", fontWeight: 500 }}>Atualizado agora</span>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 28 }}>
        {kpis.map(({ label, value, sub, Icon, accent, bg, href }) => (
          <Link key={label} href={href} style={{ textDecoration: "none" }}>
            <div style={{
              background: "var(--card-bg)", border: "1px solid var(--card-border)",
              borderRadius: 14, padding: "20px", cursor: "pointer",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
              className="hub-card-hover"
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
                  <Icon size={17} />
                </div>
                <ArrowUpRight size={13} style={{ color: "var(--text-faint)" }} />
              </div>
              <p style={{ margin: "0 0 4px", fontSize: "1.75rem", fontWeight: 900, color: "var(--text)", lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</p>
              <p style={{ margin: "0 0 2px", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>{label}</p>
              <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Secondary metrics strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 28 }}>
        {[
          { href: "/admin/projetos",         label: "Projetos ativos",    value: openProjects ?? 0,    Icon: FolderKanban, color: "var(--primary)" },
          { href: "/admin/contratos",         label: "Contratos ativos",   value: activeContracts ?? 0, Icon: FileText,     color: "var(--c-success)" },
          { href: "/admin/customer-success",  label: "CS em atenção",      value: healthCounts.atencao, Icon: Heart,        color: "var(--brand-accent)" },
          { href: "/admin/customer-success",  label: "CS em risco/crítico", value: atRisk,              Icon: AlertTriangle, color: "var(--c-danger)" },
        ].map(({ href, label, value, Icon, color }) => (
          <Link key={label} href={href}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, textDecoration: "none", transition: "border-color 0.15s" }}
            className="hub-card-hover"
          >
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `color-mix(in srgb, ${color} 12%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
              <Icon size={15} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{value}</p>
              <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "var(--text-faint)", fontWeight: 500 }}>{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Two-column bottom */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Tickets urgentes */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={14} style={{ color: "var(--c-danger)" }} />
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>Alta prioridade</span>
              {(urgentTickets?.length ?? 0) > 0 && (
                <span style={{ fontSize: "10px", fontWeight: 800, background: "var(--c-danger-bg)", color: "var(--c-danger)", padding: "2px 7px", borderRadius: 99, border: "1px solid rgba(220,38,38,0.18)" }}>
                  {urgentTickets!.length}
                </span>
              )}
            </div>
            <Link href="/portal/suporte" style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              Ver todos <ChevronRight size={12} />
            </Link>
          </div>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, overflow: "hidden" }}>
            {(urgentTickets ?? []).length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <CheckCircle size={20} style={{ color: "var(--c-success)", marginBottom: 8 }} />
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--c-success)" }}>Tudo em dia</p>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text-faint)" }}>Nenhum ticket urgente em aberto.</p>
              </div>
            ) : (
              (urgentTickets ?? []).map((t, i, arr) => {
                const ref = t.ticket_number ? `#${String(t.ticket_number).padStart(4, "0")}` : null;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const clientName = (t.profiles as any)?.name;
                return (
                  <Link key={t.id} href={`/portal/suporte/${t.id}`}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "12px 16px", textDecoration: "none", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}
                    className="hub-row-link"
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 1 }}>
                        {ref && <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-faint)", fontFamily: "monospace", flexShrink: 0 }}>{ref}</span>}
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.subject}</p>
                      </div>
                      <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>{clientName ?? "—"}</p>
                    </div>
                    <span style={{ fontSize: "10px", fontWeight: 700, background: "var(--c-danger-bg)", color: "var(--c-danger)", padding: "2px 8px", borderRadius: 99, whiteSpace: "nowrap", flexShrink: 0 }}>urgente</span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Atividade recente */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={14} style={{ color: "var(--text-muted)" }} />
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>Tickets recentes</span>
            </div>
            <Link href="/portal/suporte" style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              Ver todos <ChevronRight size={12} />
            </Link>
          </div>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, overflow: "hidden" }}>
            {(recentTickets ?? []).length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>Nenhum ticket ainda.</p>
              </div>
            ) : (
              (recentTickets ?? []).map((t, i, arr) => {
                const status = t.status as string;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const clientName = (t.profiles as any)?.name;
                return (
                  <Link key={t.id} href={`/portal/suporte/${t.id}`}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "12px 16px", textDecoration: "none", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}
                    className="hub-row-link"
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ margin: "0 0 1px", fontSize: "13px", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.subject}</p>
                      <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>
                        {clientName ?? "—"} · {timeAgo(t.created_at)}
                      </p>
                    </div>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: STATUS_COLOR[status] ?? "var(--text-faint)", background: `color-mix(in srgb, ${STATUS_COLOR[status] ?? "transparent"} 10%, transparent)`, padding: "2px 8px", borderRadius: 99, whiteSpace: "nowrap", flexShrink: 0, border: `1px solid color-mix(in srgb, ${STATUS_COLOR[status] ?? "transparent"} 20%, transparent)` }}>
                      {STATUS_LABEL[status] ?? status}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ marginTop: 20 }}>
        <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Acesso rápido</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
          {[
            { href: "/admin/usuarios",        label: "Usuários" },
            { href: "/admin/customer-success", label: "Customer Success" },
            { href: "/admin/projetos",         label: "Projetos" },
            { href: "/admin/contratos",        label: "Contratos" },
            { href: "/admin/financeiro",       label: "Financeiro" },
            { href: "/admin/roadmap",          label: "Roadmap" },
            { href: "/admin/feedback",         label: "Feedback" },
            { href: "/admin/analytics",        label: "Analytics" },
          ].map(({ href, label }) => (
            <Link key={href} href={href}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10, textDecoration: "none" }}
              className="hub-card-hover"
            >
              <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text)" }}>{label}</span>
              <ChevronRight size={12} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
