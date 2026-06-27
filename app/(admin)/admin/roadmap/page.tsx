import type { Metadata } from "next";
import Link from "next/link";
import { getAllRoadmapAdmin } from "@/app/actions/roadmap";
import { Map, Plus, ThumbsUp } from "lucide-react";

export const metadata: Metadata = { title: "Roadmap — Admin" };

const STATUS_LABEL: Record<string, string> = {
  ideia:             "Ideia",
  planejado:         "Planejado",
  em_desenvolvimento:"Em Desenvolvimento",
  lancado:           "Lançado",
  descartado:        "Descartado",
};

const STATUS_COLOR: Record<string, string> = {
  ideia:             "var(--text-faint)",
  planejado:         "#EF9F27",
  em_desenvolvimento:"var(--primary)",
  lancado:           "#22c55e",
  descartado:        "#ef4444",
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

export default async function AdminRoadmapPage() {
  const items = await getAllRoadmapAdmin();

  return (
    <div style={{ padding: "40px 32px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, gap: 16 }}>
        <div>
          <p style={{ color: "var(--text-faint)", fontSize: "13px", margin: "0 0 4px" }}>Admin</p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, color: "var(--text)" }}>
            Roadmap
          </h1>
        </div>
        <Link
          href="/admin/roadmap/novo"
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "var(--primary)", color: "#fff",
            padding: "9px 18px", borderRadius: 10,
            fontSize: "13px", fontWeight: 700, textDecoration: "none",
          }}
        >
          <Plus size={15} /> Novo Item
        </Link>
      </div>

      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Título", "Status", "Categoria", "Votos", "Visibilidade", "Criado em"].map((h) => (
                <th key={h} style={{
                  padding: "12px 16px", textAlign: "left",
                  fontSize: "11px", fontWeight: 700,
                  color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px" }}>
                  Nenhum item no roadmap.
                </td>
              </tr>
            ) : items.map((item, idx) => (
              <tr
                key={item.id}
                style={{
                  borderBottom: idx < items.length - 1 ? "1px solid var(--border)" : "none",
                  background: "transparent",
                }}
              >
                <td style={{ padding: "13px 16px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{item.title}</span>
                </td>
                <td style={{ padding: "13px 16px" }}>
                  <span style={{
                    fontSize: "11px", fontWeight: 700,
                    padding: "3px 8px", borderRadius: 6,
                    background: `color-mix(in srgb, ${STATUS_COLOR[item.status] ?? "var(--text-faint)"} 15%, transparent)`,
                    color: STATUS_COLOR[item.status] ?? "var(--text-faint)",
                  }}>
                    {STATUS_LABEL[item.status] ?? item.status}
                  </span>
                </td>
                <td style={{ padding: "13px 16px", fontSize: "13px", color: "var(--text-muted)" }}>
                  {CATEGORY_LABEL[item.category] ?? item.category}
                </td>
                <td style={{ padding: "13px 16px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "13px", color: "var(--text-muted)" }}>
                    <ThumbsUp size={13} /> {item.votes}
                  </span>
                </td>
                <td style={{ padding: "13px 16px", fontSize: "13px", color: item.visibility === "publico" ? "#22c55e" : "var(--text-faint)" }}>
                  {item.visibility === "publico" ? "Público" : "Privado"}
                </td>
                <td style={{ padding: "13px 16px", fontSize: "12px", color: "var(--text-faint)" }}>
                  {new Date(item.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
