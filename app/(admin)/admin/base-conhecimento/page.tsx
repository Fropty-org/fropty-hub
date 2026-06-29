import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticlesAdmin } from "@/app/actions/knowledge";
import { BookOpen, Plus, Eye, ThumbsUp, ThumbsDown, Pencil, FileText, CheckCircle2 } from "lucide-react";
import { TogglePublishedButton } from "@/app/components/knowledge/TogglePublishedButton";

export const metadata: Metadata = { title: "Base de Conhecimento — Admin" };

const CATEGORY_LABELS: Record<string, string> = {
  geral: "Geral", suporte: "Suporte", produto: "Produto",
  financeiro: "Financeiro", projetos: "Projetos", seguranca: "Segurança", integracao: "Integração",
};

export default async function AdminBaseConhecimentoPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filterStatus } = await searchParams;
  const allArticles = await getAllArticlesAdmin();

  const articles = filterStatus === "publicado"
    ? allArticles.filter((a) => a.published)
    : filterStatus === "rascunho"
    ? allArticles.filter((a) => !a.published)
    : allArticles;

  const published  = allArticles.filter((a) => a.published).length;
  const drafts     = allArticles.filter((a) => !a.published).length;
  const totalViews = allArticles.reduce((s, a) => s + (a.views ?? 0), 0);

  const kpis = [
    { label: "Total de artigos", value: allArticles.length, color: "var(--primary)",  Icon: BookOpen },
    { label: "Publicados",       value: published,          color: "#22c55e",         Icon: CheckCircle2 },
    { label: "Rascunhos",        value: drafts,             color: "#EF9F27",         Icon: FileText },
    { label: "Visualizações",    value: totalViews,         color: "#3b82f6",         Icon: Eye },
  ];

  return (
    <div style={{ padding: "32px 32px 48px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
            Base de Conhecimento
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-faint)" }}>
            {published} publicados · {drafts} rascunhos
          </p>
        </div>
        <Link
          href="/admin/base-conhecimento/novo"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, background: "var(--cta-bg)", color: "var(--cta-text)", fontSize: "13px", fontWeight: 700, textDecoration: "none", flexShrink: 0 }}
        >
          <Plus size={15} /> Novo Artigo
        </Link>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `${k.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <k.Icon size={16} style={{ color: k.color }} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>{k.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: "1.8rem", fontWeight: 900, color: "var(--text)", lineHeight: 1, letterSpacing: "-0.02em" }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros publicado/rascunho */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { key: "todos",      label: "Todos",      color: "var(--text-muted)" },
          { key: "publicado",  label: "Publicados", color: "#22c55e" },
          { key: "rascunho",   label: "Rascunhos",  color: "#EF9F27" },
        ].map(({ key, label, color }) => {
          const active = (filterStatus ?? "todos") === key;
          return (
            <Link key={key} href={`/admin/base-conhecimento?status=${key}`}
              style={{ padding: "6px 14px", borderRadius: 8, fontSize: "12px", fontWeight: 600, textDecoration: "none", background: active ? `${color}20` : "transparent", color: active ? color : "var(--text-muted)", border: `1px solid ${active ? color + "40" : "var(--border)"}` }}>
              {label}
            </Link>
          );
        })}
      </div>

      {/* Tabela */}
      {articles.length === 0 ? (
        <div style={{ padding: "60px 24px", textAlign: "center", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14 }}>
          <BookOpen size={36} style={{ color: "var(--text-faint)", marginBottom: 12, display: "block", margin: "0 auto 12px" }} />
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>Nenhum artigo encontrado</p>
          <p style={{ margin: "6px 0 0", fontSize: "13px", color: "var(--text-faint)" }}>Crie o primeiro artigo para começar.</p>
        </div>
      ) : (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Título", "Categoria", "Status", "Views", "Votos", "Atualizado", ""].map((h) => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {articles.map((article, i) => (
                <tr key={article.id} style={{ borderBottom: i < articles.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td style={{ padding: "13px 16px" }}>
                    <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>
                      {article.title}
                    </p>
                    {article.excerpt && (
                      <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 280 }}>
                        {article.excerpt}
                      </p>
                    )}
                  </td>
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: "rgba(91,87,232,0.10)", color: "var(--primary)" }}>
                      {CATEGORY_LABELS[article.category] ?? article.category}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                    <TogglePublishedButton id={article.id} published={article.published} />
                  </td>
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                      <Eye size={13} style={{ color: "var(--text-faint)" }} />
                      {article.views}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <ThumbsUp size={12} style={{ color: "#22c55e" }} />{article.helpful_yes}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <ThumbsDown size={12} style={{ color: "#ef4444" }} />{article.helpful_no}
                      </span>
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>
                      {new Date(article.updated_at).toLocaleDateString("pt-BR")}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                    <Link
                      href={`/admin/base-conhecimento/${article.id}/editar`}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textDecoration: "none" }}
                    >
                      <Pencil size={12} /> Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
