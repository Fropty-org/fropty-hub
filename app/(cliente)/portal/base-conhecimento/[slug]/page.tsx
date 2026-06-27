import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticle, getRelatedArticles } from "@/app/actions/knowledge";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft, Eye, ThumbsUp, ThumbsDown, ChevronRight, BookOpen } from "lucide-react";
import { ArticleRating } from "@/app/components/knowledge/ArticleRating";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Artigo não encontrado" };
  return { title: article.title, description: article.excerpt };
}

const CATEGORY_LABELS: Record<string, string> = {
  geral: "Geral", suporte: "Suporte", produto: "Produto",
  financeiro: "Financeiro", projetos: "Projetos", seguranca: "Segurança", integracao: "Integração",
};

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article.category, slug);

  const totalVotes = article.helpful_yes + article.helpful_no;

  return (
    <div style={{ padding: "32px 32px 48px", maxWidth: 900, margin: "0 auto" }}>
      {/* Voltar */}
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/portal/base-conhecimento"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "var(--text-muted)", textDecoration: "none" }}
        >
          <ArrowLeft size={14} />
          Base de Conhecimento
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 32, alignItems: "start" }}>
        {/* Artigo principal */}
        <div>
          {/* Meta */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{
              fontSize: "0.75rem", fontWeight: 600, padding: "3px 10px", borderRadius: 999,
              background: "rgba(91,87,232,0.1)", color: "var(--primary)",
            }}>
              {CATEGORY_LABELS[article.category] ?? article.category}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 4 }}>
              <Eye size={12} /> {article.views} {article.views === 1 ? "visualização" : "visualizações"}
            </span>
          </div>

          <h1 style={{ margin: "0 0 8px", fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", lineHeight: 1.3 }}>
            {article.title}
          </h1>

          {article.excerpt && (
            <p style={{ margin: "0 0 28px", fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              {article.excerpt}
            </p>
          )}

          {/* Conteúdo */}
          <div style={{
            padding: "28px 0",
            borderTop: "1px solid var(--border)",
            color: "var(--text)",
            fontSize: "0.9rem",
            lineHeight: 1.8,
          }} className="kb-article-content">
            <MDXRemote source={article.content} />
          </div>

          {/* Avaliação */}
          <div style={{
            marginTop: 32,
            padding: "20px 24px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
          }}>
            <p style={{ margin: "0 0 14px", fontSize: "0.9rem", fontWeight: 700, color: "var(--text)" }}>
              Este artigo foi útil?
            </p>
            <ArticleRating articleId={article.id} />
            {totalVotes > 0 && (
              <p style={{ margin: "12px 0 0", fontSize: "0.78rem", color: "var(--text-faint)" }}>
                {article.helpful_yes} de {totalVotes} {totalVotes === 1 ? "pessoa acharam" : "pessoas acharam"} este artigo útil.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar — artigos relacionados */}
        <div>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "18px 16px",
          }}>
            <p style={{ margin: "0 0 14px", fontSize: "0.85rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
              <BookOpen size={14} style={{ color: "var(--primary)" }} />
              Artigos relacionados
            </p>
            {related.length === 0 ? (
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-faint)" }}>
                Sem artigos relacionados.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/portal/base-conhecimento/${r.slug}`}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "9px 10px", borderRadius: 8,
                      textDecoration: "none",
                      color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 500,
                      transition: "background 0.12s, color 0.12s",
                    }}
                  >
                    <span style={{ flex: 1, lineHeight: 1.4 }}>{r.title}</span>
                    <ChevronRight size={13} style={{ flexShrink: 0, color: "var(--text-faint)" }} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
