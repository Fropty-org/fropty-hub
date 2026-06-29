import type { Metadata } from "next";
import Link from "next/link";
import { getAllRoadmapAdmin } from "@/app/actions/roadmap";
import { Map, Plus, ThumbsUp, Lightbulb, Calendar, Rocket, CheckCircle2, XCircle, Globe, Lock } from "lucide-react";

export const metadata: Metadata = { title: "Roadmap — Admin" };

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }> }> = {
  ideia:              { label: "Ideia",            color: "#94a3b8",        bg: "rgba(148,163,184,0.12)", Icon: Lightbulb },
  planejado:          { label: "Planejado",         color: "#3b82f6",        bg: "rgba(59,130,246,0.12)",  Icon: Calendar },
  em_desenvolvimento: { label: "Em Desenvolvimento",color: "#EF9F27",        bg: "rgba(239,159,39,0.12)",  Icon: Rocket },
  lancado:            { label: "Lançado",           color: "#22c55e",        bg: "rgba(34,197,94,0.12)",   Icon: CheckCircle2 },
  descartado:         { label: "Descartado",        color: "#ef4444",        bg: "rgba(239,68,68,0.12)",   Icon: XCircle },
};

const CATEGORY_LABEL: Record<string, string> = {
  produto:     "Produto",
  suporte:     "Suporte",
  financeiro:  "Financeiro",
  integracao:  "Integração",
  seguranca:   "Segurança",
  ux:          "UX",
  performance: "Performance",
  outro:       "Outro",
};

export default async function AdminRoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filterStatus } = await searchParams;
  const allItems = await getAllRoadmapAdmin();

  const items = filterStatus && filterStatus !== "todos"
    ? allItems.filter((i) => i.status === filterStatus)
    : allItems;

  // KPI per status
  const kpis = Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
    key,
    label: cfg.label,
    color: cfg.color,
    Icon: cfg.Icon,
    count: allItems.filter((i) => i.status === key).length,
  }));

  return (
    <div style={{ padding: "40px 32px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)", letterSpacing: "-0.02em" }}>Roadmap</h1>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>{allItems.length} itens no total</p>
        </div>
        <Link
          href="/admin/roadmap/novo"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--cta-bg)", color: "var(--cta-text)", padding: "9px 18px", borderRadius: 10, fontSize: "13px", fontWeight: 700, textDecoration: "none" }}
        >
          <Plus size={15} /> Novo Item
        </Link>
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

      {/* Filtros */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {[{ key: "todos", label: "Todos", color: "var(--text-muted)" }, ...Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({ key, label: cfg.label, color: cfg.color }))].map(({ key, label, color }) => {
          const active = (filterStatus ?? "todos") === key;
          return (
            <Link
              key={key}
              href={`/admin/roadmap?status=${key}`}
              style={{ padding: "6px 14px", borderRadius: 8, fontSize: "12px", fontWeight: 600, textDecoration: "none", background: active ? `${color}20` : "transparent", color: active ? color : "var(--text-muted)", border: `1px solid ${active ? color + "40" : "var(--border)"}` }}
            >
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
              {["Título", "Status", "Categoria", "Votos", "Visibilidade", "Criado em"].map((h) => (
                <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "56px 16px", textAlign: "center" }}>
                  <Map size={28} style={{ color: "var(--text-faint)", display: "block", margin: "0 auto 10px" }} />
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>Nenhum item no roadmap.</p>
                </td>
              </tr>
            ) : items.map((item, idx) => {
              const cfg = STATUS_CONFIG[item.status] ?? { label: item.status, color: "#94a3b8", bg: "rgba(148,163,184,0.12)", Icon: Map };
              const CfgIcon = cfg.Icon;
              return (
                <tr key={item.id} style={{ borderBottom: idx < items.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td style={{ padding: "13px 16px" }}>
                    <Link href={`/admin/roadmap/${item.id}`} style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", textDecoration: "none" }}>
                      {item.title}
                    </Link>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: cfg.bg, color: cfg.color }}>
                      <CfgIcon size={11} /> {cfg.label}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "rgba(91,87,232,0.10)", color: "var(--primary)" }}>
                      {CATEGORY_LABEL[item.category] ?? item.category}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>
                      <ThumbsUp size={13} style={{ color: "var(--text-faint)" }} /> {item.votes}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    {item.visibility === "publico" ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "11px", fontWeight: 700, color: "#22c55e" }}>
                        <Globe size={12} /> Público
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "11px", fontWeight: 700, color: "var(--text-faint)" }}>
                        <Lock size={12} /> Privado
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: "12px", color: "var(--text-faint)" }}>
                    {new Date(item.created_at).toLocaleDateString("pt-BR")}
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
