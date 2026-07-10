import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import {
  Users, MessageCircle, DollarSign, ChevronRight,
  AlertTriangle, TrendingUp, CheckCircle,
  FolderKanban, FileText, Heart, ArrowUpRight,
  BarChart2, Settings, BookOpen, Star, Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ACTIVE_PROJECT_STATUSES } from "@/app/lib/constants/projects";
import { RefreshStatus } from "@/app/components/ui/RefreshStatus";

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
    supabase.from("projects").select("*", { count: "exact", head: true }).in("status", ACTIVE_PROJECT_STATUSES),
    supabase.from("contracts").select("*", { count: "exact", head: true }).eq("status", "assinado"),
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

  const kpis: {
    label: string; value: string | number; sub: string;
    Icon: LucideIcon; accent: string; bg: string; href: string;
    trend?: string; trendDir?: "up" | "down" | "neutral";
  }[] = [
    {
      label: "Clientes ativos",
      value: totalClients ?? 0,
      sub: atRisk > 0 ? `${atRisk} em risco` : "todos saudáveis",
      Icon: Users,
      accent: "var(--c-info)",
      bg: "var(--c-info-bg)",
      href: "/admin/usuarios",
      trendDir: atRisk > 0 ? "down" : "up",
      trend: atRisk > 0 ? `${atRisk} risco` : "Saudável",
    },
    {
      label: "Tickets abertos",
      value: openTickets ?? 0,
      sub: `${closedTickets ?? 0} resolvidos`,
      Icon: MessageCircle,
      accent: "var(--brand-accent)",
      bg: "rgba(239,159,39,0.10)",
      href: "/portal/suporte",
      trendDir: (openTickets ?? 0) > 5 ? "down" : "neutral",
      trend: `${totalTickets} total`,
    },
    {
      label: "MRR",
      value: `R$${mrr.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`,
      sub: `${totalClients ?? 0} clientes ativos`,
      Icon: DollarSign,
      accent: "var(--c-success)",
      bg: "var(--c-success-bg)",
      href: "/admin/financeiro",
      trendDir: "up",
      trend: "Ativo",
    },
    {
      label: "Taxa de resolução",
      value: `${resolvedRate}%`,
      sub: `${closedTickets ?? 0} tickets resolvidos`,
      Icon: CheckCircle,
      accent: resolvedRate >= 80 ? "var(--c-success)" : resolvedRate >= 50 ? "var(--brand-accent)" : "var(--c-danger)",
      bg: resolvedRate >= 80 ? "var(--c-success-bg)" : resolvedRate >= 50 ? "rgba(239,159,39,0.10)" : "var(--c-danger-bg)",
      href: "/admin/analytics",
      trendDir: resolvedRate >= 80 ? "up" : resolvedRate >= 50 ? "neutral" : "down",
      trend: `${resolvedRate}% SLA`,
    },
  ];

  const STATUS_LABEL: Record<string, string> = {
    aberto: "Aberto", em_andamento: "Em andamento", reaberto: "Reaberto",
    resolvido: "Resolvido", fechado: "Fechado",
  };
  const STATUS_BADGE: Record<string, string> = {
    aberto: "hub-badge hub-badge-danger",
    em_andamento: "hub-badge hub-badge-warning",
    reaberto: "hub-badge hub-badge-warning",
    resolvido: "hub-badge hub-badge-success",
    fechado: "hub-badge hub-badge-neutral",
  };

  const now = new Date();
  function timeAgo(dateStr: string) {
    const diff = Math.floor((now.getTime() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return "agora";
    if (diff < 60) return `${diff}m atrás`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h atrás`;
    return `${Math.floor(diff / 1440)}d atrás`;
  }

  const quickLinks: { href: string; label: string; Icon: LucideIcon }[] = [
    { href: "/admin/usuarios",         label: "Usuários",          Icon: Users },
    { href: "/admin/customer-success", label: "Customer Success",  Icon: Heart },
    { href: "/admin/projetos",         label: "Projetos",          Icon: FolderKanban },
    { href: "/admin/contratos",        label: "Contratos",         Icon: FileText },
    { href: "/admin/financeiro",       label: "Financeiro",        Icon: DollarSign },
    { href: "/admin/roadmap",          label: "Roadmap",           Icon: TrendingUp },
    { href: "/admin/feedback",         label: "Feedback",          Icon: Star },
    { href: "/admin/analytics",        label: "Analytics",         Icon: BarChart2 },
    { href: "/admin/base-conhecimento",label: "Base de Conhecimento", Icon: BookOpen },
  ];

  return (
    <div className="hub-page" style={{ maxWidth: "none" }}>

      {/* ── Page header ── */}
      <div className="hub-page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="hub-page-title">Visão Geral</h1>
          <p className="hub-page-sub">Resumo operacional do ecossistema Fropty</p>
        </div>
        <RefreshStatus />
      </div>

      {/* ── KPI cards (4 cols) ── */}
      <div className="hub-grid-4" style={{ marginBottom: 20 }}>
        {kpis.map(({ label, value, sub, Icon, accent, bg, href, trend, trendDir }) => (
          <Link key={label} href={href} style={{ textDecoration: "none" }}>
            <div className="hub-stat-card hub-card-hover">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="hub-stat-icon" style={{ background: bg, color: accent }}>
                  <Icon size={17} />
                </div>
                <ArrowUpRight size={13} style={{ color: "var(--text-faint)" }} />
              </div>
              <p className="hub-stat-value" style={{ fontSize: "2rem" }}>{value}</p>
              <p className="hub-stat-label">{label}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>{sub}</span>
                {trend && (
                  <span className={`hub-stat-trend ${trendDir ?? "neutral"}`}>{trend}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Secondary metrics strip ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginBottom: 28 }}>
        {[
          { href: "/admin/projetos",         label: "Projetos ativos",    value: openProjects ?? 0,    Icon: FolderKanban,  color: "var(--primary)" },
          { href: "/admin/contratos",        label: "Contratos ativos",   value: activeContracts ?? 0, Icon: FileText,      color: "var(--c-success)" },
          { href: "/admin/customer-success", label: "CS — atenção",       value: healthCounts.atencao, Icon: Heart,         color: "var(--brand-accent)" },
          { href: "/admin/customer-success", label: "CS — risco/crítico", value: atRisk,               Icon: AlertTriangle, color: "var(--c-danger)" },
        ].map(({ href, label, value, Icon, color }) => (
          <Link key={label} href={href} className="hub-card hub-card-sm hub-card-hover" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `color-mix(in srgb, ${color} 12%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
              <Icon size={15} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "var(--text)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{value}</p>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-faint)", fontWeight: 500 }}>{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Two-column: tickets urgentes + atividade recente ── */}
      <div className="hub-split" style={{ marginBottom: 28 }}>

        {/* Tickets urgentes */}
        <div>
          <div className="hub-section-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={14} style={{ color: "var(--c-danger)" }} />
              <span className="hub-section-title">Alta prioridade</span>
              {(urgentTickets?.length ?? 0) > 0 && (
                <span className="hub-badge hub-badge-danger" style={{ fontSize: "10px", padding: "1px 7px" }}>
                  {urgentTickets!.length}
                </span>
              )}
            </div>
            <Link href="/portal/suporte" className="hub-link-arrow" style={{ fontSize: "12px" }}>
              Ver todos <ChevronRight size={12} />
            </Link>
          </div>

          <div className="hub-card" style={{ padding: 0, overflow: "hidden" }}>
            {(urgentTickets ?? []).length === 0 ? (
              <div className="hub-empty" style={{ padding: "28px 16px" }}>
                <div className="hub-empty-icon">
                  <CheckCircle size={20} style={{ color: "var(--c-success)" }} />
                </div>
                <p className="hub-empty-title" style={{ color: "var(--c-success)" }}>Tudo em dia</p>
                <p className="hub-empty-desc">Nenhum ticket urgente em aberto.</p>
              </div>
            ) : (
              (urgentTickets ?? []).map((t, i, arr) => {
                const ref = t.ticket_number ? `#${String(t.ticket_number).padStart(4, "0")}` : null;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const clientName = (t.profiles as any)?.name;
                return (
                  <Link key={t.id} href={`/portal/suporte/${t.id}`}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "11px 16px", textDecoration: "none", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}
                    className="hub-row-link"
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 1 }}>
                        {ref && <code className="hub-code" style={{ padding: "1px 5px" }}>{ref}</code>}
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.subject}</p>
                      </div>
                      <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>{clientName ?? "—"}</p>
                    </div>
                    <span className="hub-badge hub-badge-danger" style={{ fontSize: "10px" }}>urgente</span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Atividade recente */}
        <div>
          <div className="hub-section-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={14} style={{ color: "var(--text-muted)" }} />
              <span className="hub-section-title">Tickets recentes</span>
            </div>
            <Link href="/portal/suporte" className="hub-link-arrow" style={{ fontSize: "12px" }}>
              Ver todos <ChevronRight size={12} />
            </Link>
          </div>

          <div className="hub-card" style={{ padding: 0, overflow: "hidden" }}>
            {(recentTickets ?? []).length === 0 ? (
              <div className="hub-empty" style={{ padding: "28px 16px" }}>
                <p className="hub-empty-desc">Nenhum ticket ainda.</p>
              </div>
            ) : (
              (recentTickets ?? []).map((t, i, arr) => {
                const status = t.status as string;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const clientName = (t.profiles as any)?.name;
                return (
                  <Link key={t.id} href={`/portal/suporte/${t.id}`}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "11px 16px", textDecoration: "none", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}
                    className="hub-row-link"
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ margin: "0 0 1px", fontSize: "13px", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.subject}</p>
                      <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>
                        {clientName ?? "—"} · {timeAgo(t.created_at)}
                      </p>
                    </div>
                    <span className={STATUS_BADGE[status] ?? "hub-badge hub-badge-neutral"} style={{ fontSize: "10px" }}>
                      {STATUS_LABEL[status] ?? status}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Quick links ── */}
      <div>
        <div className="hub-section-divider">
          <span className="hub-section-divider-label">Acesso rápido</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
          {quickLinks.map(({ href, label, Icon }) => (
            <Link key={href} href={href}
              className="hub-card-sm hub-card-hover"
              style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
            >
              <Icon size={14} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
              <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text)" }}>{label}</span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
