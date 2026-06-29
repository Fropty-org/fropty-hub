import type { Metadata } from "next";
import Link from "next/link";
import { getArticles } from "@/app/actions/knowledge";
import {
  BookOpen, HelpCircle, Package, CreditCard,
  FolderKanban, Shield, Plug2, Search, Eye, ChevronRight, X,
} from "lucide-react";
import type { ArticleCategory, KnowledgeArticle } from "@/app/lib/types/knowledge";
import { HubEmptyState } from "@/app/components/ui/HubEmptyState";

export const metadata: Metadata = { title: "Base de Conhecimento" };

const CATEGORIES: { id: ArticleCategory; label: string; Icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "geral",      label: "Geral",       Icon: BookOpen },
  { id: "suporte",    label: "Suporte",     Icon: HelpCircle },
  { id: "produto",    label: "Produto",     Icon: Package },
  { id: "financeiro", label: "Financeiro",  Icon: CreditCard },
  { id: "projetos",   label: "Projetos",    Icon: FolderKanban },
  { id: "seguranca",  label: "Segurança",   Icon: Shield },
  { id: "integracao", label: "Integração",  Icon: Plug2 },
];

interface Props { searchParams: Promise<{ q?: string; categoria?: string }> }

export default async function BaseConhecimentoPage({ searchParams }: Props) {
  const { q, categoria } = await searchParams;

  const allArticles  = await getArticles(categoria, q);
  const allForCount  = await getArticles();
  const countByCat   = allForCount.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] ?? 0) + 1; return acc;
  }, {});
  const mostViewed   = [...allForCount].sort((a, b) => b.views - a.views).slice(0, 8);
  const isFiltering  = !!(q || categoria);
  const activeCat    = CATEGORIES.find(c => c.id === categoria);

  return (
    <div style={{ padding: "24px 24px", maxWidth: 1020, margin: "0 auto" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>
          Base de Conhecimento
        </h1>
        <p style={{ margin: "5px 0 0", fontSize: "13px", color: "var(--text-faint)" }}>
          Encontre respostas, tutoriais e documentação sobre os produtos Fropty
        </p>
      </div>

      {/* ── Search bar ── */}
      <form method="GET" style={{ marginBottom: 28 }}>
        {categoria && <input type="hidden" name="categoria" value={categoria} />}
        <div style={{ position: "relative" }}>
          <Search size={15} style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            color: "var(--text-faint)", pointerEvents: "none",
          }} />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar artigos, tutoriais e guias…"
            style={{
              width: "100%", padding: "11px 14px 11px 42px",
              borderRadius: "var(--r-md)", border: "1px solid var(--border)",
              background: "var(--surface)", color: "var(--text)",
              fontSize: "14px", outline: "none", boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>
      </form>

      {/* ── Filtro ativo ── */}
      {isFiltering && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {activeCat && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: "var(--r-full)",
              background: "rgba(91,87,232,0.10)", color: "var(--primary)",
              border: "1px solid rgba(91,87,232,0.20)",
              fontSize: "12px", fontWeight: 700,
            }}>
              <activeCat.Icon size={12} /> {activeCat.label}
            </span>
          )}
          {q && (
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Resultados para <strong>&ldquo;{q}&rdquo;</strong>
            </span>
          )}
          <Link
            href="/portal/base-conhecimento"
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: "12px", color: "var(--text-faint)",
              textDecoration: "none", marginLeft: "auto",
            }}
          >
            <X size={12} /> Limpar filtros
          </Link>
        </div>
      )}

      {/* ── Categorias (quando não filtra) ── */}
      {!isFiltering && (
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-faint)", margin: "0 0 12px" }}>
            Categorias
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
            {CATEGORIES.map(({ id, label, Icon }) => {
              const count = countByCat[id] ?? 0;
              if (!count) return null;
              return (
                <Link
                  key={id}
                  href={`/portal/base-conhecimento?categoria=${id}`}
                  className="hub-card"
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 8, padding: "18px 12px", textDecoration: "none",
                    transition: "border-color 0.15s",
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: "var(--r-md)",
                    background: "rgba(91,87,232,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--primary)",
                  }}>
                    <Icon size={17} />
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)", textAlign: "center" }}>{label}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>{count} {count === 1 ? "artigo" : "artigos"}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Lista de artigos filtrados ── */}
      {isFiltering && (
        <div style={{ marginBottom: 40 }}>
          {allArticles.length === 0 ? (
            <div className="hub-card">
              <HubEmptyState
                variant="knowledge"
                title="Nenhum artigo encontrado"
                description={`Não encontramos resultados para "${q ?? categoria}". Tente outros termos.`}
              />
            </div>
          ) : (
            <ArticleTable articles={allArticles} />
          )}
        </div>
      )}

      {/* ── Mais visitados ── */}
      {!isFiltering && mostViewed.length > 0 && (
        <div>
          <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-faint)", margin: "0 0 12px" }}>
            Mais acessados
          </p>
          <ArticleTable articles={mostViewed} />
        </div>
      )}
    </div>
  );
}

function ArticleTable({ articles }: { articles: KnowledgeArticle[] }) {
  const CAT_LABELS: Record<string, string> = {
    geral: "Geral", suporte: "Suporte", produto: "Produto",
    financeiro: "Financeiro", projetos: "Projetos", seguranca: "Segurança", integracao: "Integração",
  };

  return (
    <div className="hub-card" style={{ overflow: "hidden" }}>
      {/* Column headers */}
      <div style={{
        display: "grid", gridTemplateColumns: "3fr 110px 60px 32px",
        padding: "9px 20px", background: "var(--surface-2)",
        borderBottom: "1px solid var(--border)",
        fontSize: "11px", fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-faint)",
      }}>
        <span>Artigo</span>
        <span>Categoria</span>
        <span style={{ textAlign: "right" }}>Visualizações</span>
        <span />
      </div>

      {articles.map((article, i) => (
        <Link
          key={article.id}
          href={`/portal/base-conhecimento/${article.slug}`}
          style={{
            display: "grid", gridTemplateColumns: "3fr 110px 60px 32px",
            padding: "13px 20px", alignItems: "center",
            borderBottom: i < articles.length - 1 ? "1px solid var(--border)" : "none",
            textDecoration: "none", color: "inherit",
            transition: "background 0.1s",
          }}
          className="hub-row-link"
        >
          {/* Título */}
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {article.title}
            </p>
            {article.excerpt && (
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {article.excerpt}
              </p>
            )}
          </div>

          {/* Categoria */}
          <span style={{
            fontSize: "11px", fontWeight: 700,
            color: "var(--primary)", background: "rgba(91,87,232,0.08)",
            border: "1px solid rgba(91,87,232,0.18)",
            borderRadius: "var(--r-full)", padding: "3px 9px",
            whiteSpace: "nowrap", display: "inline-block",
          }}>
            {CAT_LABELS[article.category] ?? article.category}
          </span>

          {/* Views */}
          <span style={{ fontSize: "12px", color: "var(--text-faint)", textAlign: "right", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
            <Eye size={11} /> {article.views}
          </span>

          <ChevronRight size={14} style={{ color: "var(--text-faint)" }} />
        </Link>
      ))}
    </div>
  );
}
