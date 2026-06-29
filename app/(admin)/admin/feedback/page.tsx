import type { Metadata } from "next";
import Link from "next/link";
import { getAllFeedbacksAdmin } from "@/app/actions/feedback";
import { MessageSquare, Bug, Star, AlertCircle, HelpCircle, Inbox } from "lucide-react";
import type { FeedbackType, FeedbackStatus } from "@/app/lib/types/feedback";

export const metadata: Metadata = { title: "Feedback — Admin" };

const TYPE_CONFIG: Record<FeedbackType, { label: string; color: string; bg: string; Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }> }> = {
  sugestao: { label: "Sugestão", color: "var(--primary)",  bg: "rgba(91,87,232,0.12)",  Icon: MessageSquare },
  bug:      { label: "Bug",      color: "#ef4444",         bg: "rgba(239,68,68,0.12)",  Icon: Bug },
  elogio:   { label: "Elogio",   color: "#22c55e",         bg: "rgba(34,197,94,0.12)",  Icon: Star },
  critica:  { label: "Crítica",  color: "#EF9F27",         bg: "rgba(239,159,39,0.12)", Icon: AlertCircle },
  outro:    { label: "Outro",    color: "#94a3b8",         bg: "rgba(148,163,184,0.12)",Icon: HelpCircle },
};

const STATUS_CONFIG: Record<FeedbackStatus, { label: string; color: string }> = {
  recebido:    { label: "Recebido",    color: "#94a3b8" },
  em_analise:  { label: "Em Análise",  color: "#EF9F27" },
  aprovado:    { label: "Aprovado",    color: "var(--primary)" },
  descartado:  { label: "Descartado",  color: "#ef4444" },
  implementado:{ label: "Implementado",color: "#22c55e" },
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
    <div style={{ padding: "40px 32px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)", letterSpacing: "-0.02em" }}>Feedback</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>{allFeedbacks.length} registros no total</p>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 28 }}>
        {kpis.map((k) => (
          <div key={k.key} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: `${k.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <k.Icon size={15} style={{ color: k.color }} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>{k.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: "1.7rem", fontWeight: 900, color: "var(--text)", lineHeight: 1, letterSpacing: "-0.02em" }}>{k.count}</p>
          </div>
        ))}
      </div>

      {/* Filtros por tipo */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {[{ key: "todos", label: "Todos os tipos", color: "var(--text-muted)" }, ...Object.entries(TYPE_CONFIG).map(([key, cfg]) => ({ key, label: cfg.label, color: cfg.color }))].map(({ key, label, color }) => {
          const active = (filterTipo ?? "todos") === key;
          return (
            <Link key={key} href={`/admin/feedback?tipo=${key}${filterStatus ? `&status=${filterStatus}` : ""}`}
              style={{ padding: "6px 14px", borderRadius: 8, fontSize: "12px", fontWeight: 600, textDecoration: "none", background: active ? `${color}20` : "transparent", color: active ? color : "var(--text-muted)", border: `1px solid ${active ? color + "40" : "var(--border)"}` }}>
              {label}
            </Link>
          );
        })}
      </div>

      {/* Filtros por status */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {[{ key: "todos", label: "Todos os status", color: "var(--text-muted)" }, ...Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({ key, label: cfg.label, color: cfg.color }))].map(({ key, label, color }) => {
          const active = (filterStatus ?? "todos") === key;
          return (
            <Link key={key} href={`/admin/feedback?${filterTipo ? `tipo=${filterTipo}&` : ""}status=${key}`}
              style={{ padding: "5px 12px", borderRadius: 8, fontSize: "11px", fontWeight: 600, textDecoration: "none", background: active ? `${color}20` : "transparent", color: active ? color : "var(--text-muted)", border: `1px solid ${active ? color + "40" : "var(--border)"}` }}>
              {label}
            </Link>
          );
        })}
      </div>

      {/* Tabela */}
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Cliente", "Tipo", "Título", "Produto", "Status", "Data"].map((h) => (
                <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {feedbacks.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "56px 16px", textAlign: "center" }}>
                  <Inbox size={28} style={{ color: "var(--text-faint)", display: "block", margin: "0 auto 10px" }} />
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>Nenhum feedback encontrado.</p>
                </td>
              </tr>
            ) : feedbacks.map((fb, idx) => {
              const type   = fb.type   as FeedbackType;
              const status = fb.status as FeedbackStatus;
              const typeCfg   = TYPE_CONFIG[type]   ?? { label: type,   color: "#94a3b8", bg: "rgba(148,163,184,0.12)", Icon: HelpCircle };
              const statusCfg = STATUS_CONFIG[status] ?? { label: status, color: "#94a3b8" };
              const TypeIcon = typeCfg.Icon;
              return (
                <tr key={fb.id} style={{ borderBottom: idx < feedbacks.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td style={{ padding: "13px 16px", fontSize: "13px", color: "var(--text-muted)", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {fb.client_name ?? "—"}
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: typeCfg.bg, color: typeCfg.color }}>
                      <TypeIcon size={11} /> {typeCfg.label}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <Link href={`/admin/feedback/${fb.id}`} style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", textDecoration: "none" }}>
                      {fb.title}
                    </Link>
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: "12px", color: "var(--text-faint)" }}>
                    {fb.product || "—"}
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: `${statusCfg.color}18`, color: statusCfg.color }}>
                      {statusCfg.label}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: "12px", color: "var(--text-faint)", whiteSpace: "nowrap" }}>
                    {new Date(fb.created_at).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
