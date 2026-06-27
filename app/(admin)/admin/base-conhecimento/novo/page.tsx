import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ArticleForm } from "@/app/components/knowledge/ArticleForm";
import { createArticle } from "@/app/actions/knowledge";

export const metadata: Metadata = { title: "Novo Artigo — Admin" };

export default function NovoArtigoPage() {
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
        Novo Artigo
      </h1>

      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "28px 28px",
      }}>
        <ArticleForm action={createArticle} />
      </div>
    </div>
  );
}
