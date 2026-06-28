import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle, getRelatedArticles } from "@/app/actions/knowledge";
import { ArrowLeft, ChevronRight, Eye, ThumbsUp, Clock } from "lucide-react";
import { ArticleRating } from "@/app/components/knowledge/ArticleRating";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  return { title: article?.title ?? "Artigo" };
}

const CAT_LABELS: Record<string, string> = {
  geral: "Geral", suporte: "Suporte", produto: "Produto",
  financeiro: "Financeiro", projetos: "Projetos", seguranca: "Segurança", integracao: "Integração",
};

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article.category, slug);
  const readMinutes = Math.max(1, Math.ceil(article.content.split(/\s+/).length / 200));

  return (
    <div style={{ padding: "36px 32px", maxWidth: 820, margin: "0 auto" }}>

      {/* ── Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: "12px" }}>
        <Link
          href="/portal/base-conhecimento"
          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px 5px 8px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-faint)", textDecoration: "none", fontWeight: 600 }}
        >
          <ArrowLeft size={13} /> Base de Conhecimento
        </Link>
        <ChevronRight size={12} style={{ color: "var(--text-faint)" }} />
        <Link
          href={`/portal/base-conhecimento?categoria=${article.category}`}
          style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}
        >
          {CAT_LABELS[article.category] ?? article.category}
        </Link>
      </div>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "var(--r-full)", color: "var(--primary)", background: "rgba(91,87,232,0.08)", border: "1px solid rgba(91,87,232,0.18)" }}>
            {CAT_LABELS[article.category] ?? article.category}
          </span>
          {article.product && (
            <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "var(--r-full)", color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              {article.product}
            </span>
          )}
        </div>

        <h1 style={{ margin: "0 0 10px", fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", lineHeight: 1.25 }}>
          {article.title}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "12px", color: "var(--text-faint)" }}>
            <Clock size={12} /> {readMinutes} min de leitura
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "12px", color: "var(--text-faint)" }}>
            <Eye size={12} /> {article.views} visualizações
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "12px", color: "var(--c-success)" }}>
            <ThumbsUp size={12} /> {article.helpful_yes} útil
          </span>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="hub-card" style={{ padding: "28px 32px", marginBottom: 24 }}>
        <div
          style={{ fontSize: "14.5px", lineHeight: 1.75, color: "var(--text)" }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>

      {/* ── Avaliação ── */}
      <ArticleRating articleId={article.id} />

      {/* ── Tags ── */}
      {article.tags && article.tags.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 24, marginBottom: 32 }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Tags:</span>
          {article.tags.map((tag) => (
            <span key={tag} style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "var(--r-full)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* ── Artigos relacionados ── */}
      {related.length > 0 && (
        <div>
          <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-faint)", margin: "0 0 14px" }}>
            Artigos relacionados
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/portal/base-conhecimento/${r.slug}`}
                className="hub-card"
                style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, textDecoration: "none", color: "inherit", transition: "background 0.1s" }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-2)"}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "transparent"}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: "0 0 2px", fontSize: "13.5px", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.title}
                  </p>
                  {r.excerpt && (
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.excerpt}
                    </p>
                  )}
                </div>
                <ChevronRight size={14} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
