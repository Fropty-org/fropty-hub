import type { Metadata } from "next";
import Link from "next/link";
import { getAllFeedbacksAdmin } from "@/app/actions/feedback";
import { MessageSquare, Bug, Star, AlertCircle, HelpCircle, Inbox } from "lucide-react";
import type { FeedbackType, FeedbackStatus } from "@/app/lib/types/feedback";

export const metadata: Metadata = { title: "Feedback — Admin" };

const TYPE_CONFIG: Record<FeedbackType, { label: string; color: string; bg: string; Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }> }> = {
  sugestao: { label: "Sugestão", color: "var(--primary)",  bg: "color-mix(in srgb, var(--primary) 12%, transparent)",  Icon: MessageSquare },
  bug:      { label: "Bug",      color: "var(--c-danger)",         bg: "rgba(239,68,68,0.12)",  Icon: Bug },
  elogio:   { label: "Elogio",   color: "var(--c-success)",         bg: "rgba(34,197,94,0.12)",  Icon: Star },
  critica:  { label: "Crítica",  color: "#EF9F27",         bg: "rgba(239,159,39,0.12)", Icon: AlertCircle },
  outro:    { label: "Outro",    color: "var(--text-faint)",         bg: "rgba(148,163,184,0.12)",Icon: HelpCircle },
};

const STATUS_CONFIG: Record<FeedbackStatus, { label: string; color: string }> = {
  recebido:    { label: "Recebido",    color: "var(--text-faint)" },
  em_analise:  { label: "Em Análise",  color: "#EF9F27" },
  aprovado:    { label: "Aprovado",    color: "var(--primary)" },
  descartado:  { label: "Descartado",  color: "var(--c-danger)" },
  implementado:{ label: "Implementado",color: "var(--c-success)" },
};

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; status?: string }>;
}) {
  const { tipo: filterTipo, status: filterStatus } = await searchParams;
  const allFeedbacks = await getAllFeedbacksAdmin();

  const feedbacks = allFeedbacks.filter((fb) => {
    if (filterTipo && filterTipo !== "todos" && fb.type !== filterTipo) return false;
    if (filterStatus && filterStatus !== "todos" && fb.status !== filterStatus) return false;
    return true;
  });

  // KPI per type
  const kpis = Object.entries(TYPE_CONFIG).map(([key, cfg]) => ({
    key,
    label: cfg.label,
    color: cfg.color,
    Icon: cfg.Icon,
    count: allFeedbacks.filter((fb) => fb.type === key).length,
  }));

  return (
    <div className="hub-page">

      {/* ── Page header ── */}
      <div className="hub-page-header">
        <h1 className="hub-page-title">Feedback</h1>
        <p className="hub-page-sub">{allFeedbacks.length} registros no total</p>
      </div>

      {/* ── KPI strip (por tipo) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
        {kpis.map((k) => (
          <div key={k.key} className="hub-stat-card">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="hub-stat-icon" style={{ width: 32, height: 32, background: `${k.color}18`, color: k.color }}>
                <k.Icon size={14} style={{ color: k.color }} />
              </div>
              <span className="hub-stat-label" style={{ margin: 0 }}>{k.label}</span>
            </div>
            <p className="hub-stat-value">{k.count}</p>
          </div>
        ))}
      </div>

      {/* ── Filtros por tipo ── */}
      <div className="hub-filter-strip" style={{ marginBottom: 8 }}>
        {[{ key: "todos", label: "Todos os tipos" }, ...Object.entries(TYPE_CONFIG).map(([key, cfg]) => ({ key, label: cfg.label }))].map(({ key, label }) => {
          const active = (filterTipo ?? "todos") === key;
          return (
            <Link key={key} href={`/admin/feedback?tipo=${key}${filterStatus ? `&status=${filterStatus}` : ""}`}
              className={`hub-filter-chip${active ? " active" : ""}`}>
              {label}
            </Link>
          );
        })}
      </div>

      {/* ── Filtros por status ── */}
      <div className="hub-filter-strip" style={{ marginBottom: 20 }}>
        {[{ key: "todos", label: "Todos os status" }, ...Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({ key, label: cfg.label }))].map(({ key, label }) => {
          const active = (filterStatus ?? "todos") === key;
          return (
            <Link key={key} href={`/admin/feedback?${filterTipo ? `tipo=${filterTipo}&` : ""}status=${key}`}
              className={`hub-filter-chip${active ? " active" : ""}`} style={{ fontSize: "11px" }}>
              {label}
            </Link>
          );
        })}
      </div>

      {/* ── Tabela ── */}
      <div className="hub-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="hub-table-wrap">
          <table className="hub-table">
            <thead>
              <tr>
                {["Cliente", "Tipo", "Título", "Produto", "Status", "Data"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "56px 16px", textAlign: "center" }}>
                    <div className="hub-empty" style={{ padding: 0 }}>
                      <div className="hub-empty-icon"><Inbox size={22} /></div>
                      <p className="hub-empty-desc">Nenhum feedback encontrado.</p>
                    </div>
                  </td>
                </tr>
              ) : feedbacks.map((fb) => {
                const type   = fb.type   as FeedbackType;
                const status = fb.status as FeedbackStatus;
                const typeCfg   = TYPE_CONFIG[type]   ?? { label: type,   color: "var(--text-faint)", bg: "rgba(148,163,184,0.12)", Icon: HelpCircle };
                const statusCfg = STATUS_CONFIG[status] ?? { label: status, color: "var(--text-faint)" };
                const TypeIcon = typeCfg.Icon;
                return (
                  <tr key={fb.id}>
                    <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{fb.client_name ?? "—"}</td>
                    <td>
                      <span className="hub-badge" style={{ background: typeCfg.bg, color: typeCfg.color, border: `1px solid ${typeCfg.color}30`, display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <TypeIcon size={10} /> {typeCfg.label}
                      </span>
                    </td>
                    <td className="hub-td-primary">
                      <Link href={`/admin/feedback/${fb.id}`} style={{ fontWeight: 600, color: "var(--text)", textDecoration: "none" }}>
                        {fb.title}
                      </Link>
                    </td>
                    <td>{fb.product || "—"}</td>
                    <td>
                      <span className="hub-badge" style={{ background: `${statusCfg.color}18`, color: statusCfg.color, border: `1px solid ${statusCfg.color}30` }}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {new Date(fb.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="hub-table-footer">
          <span className="hub-table-info">{feedbacks.length} de {allFeedbacks.length} registros</span>
        </div>
      </div>
    </div>
  );
}

