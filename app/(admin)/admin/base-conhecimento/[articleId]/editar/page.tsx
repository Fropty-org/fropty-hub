import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ArticleForm } from "@/app/components/knowledge/ArticleForm";
import { getArticleById, updateArticle } from "@/app/actions/knowledge";

interface Props {
  params: Promise<{ articleId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { articleId } = await params;
  const article = await getArticleById(articleId);
  return { title: article ? `Editar: ${article.title}` : "Artigo não encontrado" };
}

export default async function EditarArtigoPage({ params }: Props) {
  const { articleId } = await params;
  const article = await getArticleById(articleId);
  if (!article) notFound();

  async function update(formData: FormData) {
    "use server";
    return updateArticle(articleId, formData);
  }

  return (
    <div style={{ padding: "32px 32px 48px", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/admin/base-conhecimento"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "var(--text-muted)", textDecoration: "none" }}
        >
          <ArrowLeft size={14} />
          Base de Conhecimento
        </Link>
      </div>

      <h1 style={{ margin: "0 0 28px", fontSize: "1.4rem", fontWeight: 800, color: "var(--text)" }}>
        Editar Artigo
      </h1>

      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "28px 28px",
      }}>
        <ArticleForm article={article} action={update} />
      </div>
    </div>
  );
}
