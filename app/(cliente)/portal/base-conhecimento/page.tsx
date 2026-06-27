import type { Metadata } from "next";
import Link from "next/link";
import { getArticles } from "@/app/actions/knowledge";
import { BookOpen, HelpCircle, Package, CreditCard, FolderKanban, Shield, Plug2, Search, Eye, ChevronRight } from "lucide-react";
import type { ArticleCategory, KnowledgeArticle } from "@/app/lib/types/knowledge";

export const metadata: Metadata = { title: "Base de Conhecimento" };

const CATEGORIES: { id: ArticleCategory; label: string; Icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "geral",       label: "Geral",        Icon: BookOpen },
  { id: "suporte",     label: "Suporte",       Icon: HelpCircle },
  { id: "produto",     label: "Produto",       Icon: Package },
  { id: "financeiro",  label: "Financeiro",    Icon: CreditCard },
  { id: "projetos",    label: "Projetos",      Icon: FolderKanban },
  { id: "seguranca",   label: "Segurança",     Icon: Shield },
  { id: "integracao",  label: "Integração",    Icon: Plug2 },
];

interface Props {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}

export default async function BaseConhecimentoPage({ searchParams }: Props) {
  const { q, categoria } = await searchParams;

  const allArticles = await getArticles(categoria, q);

  // Agrupa por categoria para a grade de categorias
  const allForCount = await getArticles();
  const countByCategory = allForCount.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] ?? 0) + 1;
    return acc;
  }, {});

  const mostViewed = [...allForCount].sort((a, b) => b.views - a.views).slice(0, 5);

  const isFiltering = !!(q || categoria);

  return (
    <div style={{ padding: "32px 32px 48px", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "var(--text)" }}>
          Base de Conhecimento
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Encontre respostas, tutoriais e documentação sobre os produtos e serviços Fropty.
        </p>
      </div>

      {/* Search */}
      <form method="GET" style={{ marginBottom: 32 }}>
        {categoria && <input type="hidden" name="categoria" value={categoria} />}
        <div style={{ position: "relative" }}>
          <Search size={16} style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            color: "var(--text-faint)", pointerEvents: "none",
          }} />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar artigos..."
            style={{
              width: "100%", padding: "11px 14px 11px 42px",
              borderRadius: 10, border: "1px solid var(--border)",
              background: "var(--surface)", color: "var(--text)",
              fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
      </form>

      {/* Categorias */}
      {!isFiltering && (
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
            Categorias
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
            {CATEGORIES.map(({ id, label, Icon }) => {
              const count = countByCategory[id] ?? 0;
              if (count === 0) return null;
              return (
                <Link
                  key={id}
                  href={`/portal/base-conhecimento?categoria=${id}`}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 8, padding: "18px 12px",
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: 12, textDecoration: "none",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: "rgba(91,87,232,0.1)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: "var(--primary)",
                  }}>
                    <Icon size={18} />
                  </div>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)", textAlign: "center" }}>{label}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>{count} {count === 1 ? "artigo" : "artigos"}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Filtro ativo */}
      {isFiltering && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          {categoria && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 999,
              background: "rgba(91,87,232,0.12)", color: "var(--primary)",
              fontSize: "0.8rem", fontWeight: 600,
            }}>
              {CATEGORIES.find(c => c.id === categoria)?.label ?? categoria}
            </span>
          )}
          {q && (
            <span style={{
              fontSize: "0.85rem", color: "var(--text-muted)",
            }}>
              Resultados para &ldquo;<strong>{q}</strong>&rdquo;
            </span>
          )}
          <Link href="/portal/base-conhecimento" style={{ fontSize: "0.8rem", color: "var(--text-faint)", marginLeft: "auto" }}>
            Limpar filtros
          </Link>
        </div>
      )}

      {/* Artigos filtrados */}
      {isFiltering && (
        <div style={{ marginBottom: 40 }}>
          {allArticles.length === 0 ? (
            <div style={{
              padding: "40px 24px", textAlign: "center",
              background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12,
            }}>
              <BookOpen size={32} style={{ color: "var(--text-faint)", marginBottom: 12 }} />
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Nenhum artigo encontrado para esta busca.
              </p>
            </div>
          ) : (
            <ArticleList articles={allArticles} />
          )}
        </div>
      )}

      {/* Mais vistos */}
      {!isFiltering && mostViewed.length > 0 && (
        <div>
          <h2 style={{ margin: "0 0 16px", fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
            Mais acessados
          </h2>
          <ArticleList articles={mostViewed} />
        </div>
      )}
    </div>
  );
}

function ArticleList({ articles }: { articles: KnowledgeArticle[] }) {
  const CATEGORY_LABELS: Record<string, string> = {
    geral: "Geral", suporte: "Suporte", produto: "Produto",
    financeiro: "Financeiro", projetos: "Projetos", seguranca: "Segurança", integracao: "Integração",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`/portal/base-conhecimento/${article.slug}`}
          style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "16px 18px",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 12, textDecoration: "none",
            transition: "border-color 0.15s",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: 700, color: "var(--text)" }}>
              {article.title}
            </p>
            {article.excerpt && (
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {article.excerpt}
              </p>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
              <span style={{
                fontSize: "0.72rem", fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                background: "rgba(91,87,232,0.1)", color: "var(--primary)",
              }}>
                {CATEGORY_LABELS[article.category] ?? article.category}
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 4 }}>
                <Eye size={12} /> {article.views}
              </span>
            </div>
          </div>
          <ChevronRight size={16} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
        </Link>
      ))}
    </div>
  );
}
