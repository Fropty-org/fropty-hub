import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticlesAdmin, togglePublished } from "@/app/actions/knowledge";
import { BookOpen, Plus, Eye, ThumbsUp, ThumbsDown, Pencil } from "lucide-react";
import { TogglePublishedButton } from "@/app/components/knowledge/TogglePublishedButton";

export const metadata: Metadata = { title: "Base de Conhecimento — Admin" };

const CATEGORY_LABELS: Record<string, string> = {
  geral: "Geral", suporte: "Suporte", produto: "Produto",
  financeiro: "Financeiro", projetos: "Projetos", seguranca: "Segurança", integracao: "Integração",
};

export default async function AdminBaseConhecimentoPage() {
  const articles = await getAllArticlesAdmin();

  const published = articles.filter(a => a.published).length;
  const drafts    = articles.filter(a => !a.published).length;

  return (
    <div style={{ padding: "32px 32px 48px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--text)" }}>
            Base de Conhecimento
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {published} publicados · {drafts} rascunhos
          </p>
        </div>
        <Link
          href="/admin/base-conhecimento/novo"
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "9px 18px", borderRadius: 9,
            background: "var(--primary)", color: "#fff",
            fontSize: "0.85rem", fontWeight: 700, textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <Plus size={15} />
          Novo Artigo
        </Link>
      </div>

      {/* Tabela */}
      {articles.length === 0 ? (
        <div style={{
          padding: "60px 24px", textAlign: "center",
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12,
        }}>
          <BookOpen size={36} style={{ color: "var(--text-faint)", marginBottom: 12 }} />
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Nenhum artigo cadastrado.
          </p>
        </div>
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Título", "Categoria", "Status", "Views", "Votos", "Atualizado", ""].map((h) => (
                  <th key={h} style={{
                    padding: "11px 16px", textAlign: "left",
                    fontSize: "0.75rem", fontWeight: 700,
                    color: "var(--text-faint)", letterSpacing: "0.04em",
                    whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {articles.map((article, i) => (
                <tr
                  key={article.id}
                  style={{
                    borderBottom: i < articles.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text)" }}>
                      {article.title}
                    </span>
                    {article.excerpt && (
                      <p style={{
                        margin: "2px 0 0", fontSize: "0.78rem", color: "var(--text-faint)",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 280,
                      }}>
                        {article.excerpt}
                      </p>
                    )}
                  </td>
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                    <span style={{
                      fontSize: "0.75rem", fontWeight: 600, padding: "3px 8px", borderRadius: 999,
                      background: "rgba(91,87,232,0.1)", color: "var(--primary)",
                    }}>
                      {CATEGORY_LABELS[article.category] ?? article.category}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                    <TogglePublishedButton id={article.id} published={article.published} />
                  </td>
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                      <Eye size={13} style={{ color: "var(--text-faint)" }} />
                      {article.views}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <ThumbsUp size={12} style={{ color: "var(--text-faint)" }} />
                        {article.helpful_yes}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <ThumbsDown size={12} style={{ color: "var(--text-faint)" }} />
                        {article.helpful_no}
                      </span>
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-faint)" }}>
                      {new Date(article.updated_at).toLocaleDateString("pt-BR")}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                    <Link
                      href={`/admin/base-conhecimento/${article.id}/editar`}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "6px 12px", borderRadius: 7,
                        border: "1px solid var(--border)", background: "transparent",
                        fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)",
                        textDecoration: "none",
                      }}
                    >
                      <Pencil size={12} />
                      Editar
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
