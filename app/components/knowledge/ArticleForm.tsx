"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { KnowledgeArticle, ArticleCategory } from "@/app/lib/types/knowledge";
import { useT } from "@/app/lib/i18n/I18nProvider";

const CATEGORY_IDS: ArticleCategory[] = [
  "geral", "suporte", "produto", "financeiro", "projetos", "seguranca", "integracao",
];

const PRODUCTS = [
  "Fropty Boost", "Fropty Cash", "Fropty Invest",
  "Fropty Apps", "Fropty Sentinel", "Geral",
];

interface Props {
  article?: KnowledgeArticle;
  action: (formData: FormData) => Promise<{ error?: string; id?: string } | void>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function ArticleForm({ article, action }: Props) {
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError]   = useState("");
  const [slug, setSlug]     = useState(article?.slug ?? "");
  const [published, setPublished] = useState(article?.published ?? false);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!article) setSlug(slugify(e.target.value));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("published", String(published));
    startTransition(async () => {
      const result = await action(fd);
      if (result && "error" in result && result.error) {
        setError(result.error);
        return;
      }
      router.push("/admin/base-conhecimento");
    });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px",
    borderRadius: 9, border: "1px solid var(--border)",
    background: "var(--surface)", color: "var(--text)",
    fontSize: "0.88rem", outline: "none", boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", marginBottom: 6,
    fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {error && (
        <div style={{
          padding: "10px 14px", borderRadius: 9,
          background: "rgba(239,68,68,0.1)", color: "#ef4444",
          fontSize: "0.85rem", fontWeight: 600,
        }}>
          {error}
        </div>
      )}

      <div>
        <label style={labelStyle}>{t("admin.kb.form.title")}</label>
        <input
          name="title"
          defaultValue={article?.title}
          onChange={handleTitleChange}
          required
          maxLength={300}
          style={inputStyle}
          placeholder={t("admin.kb.form.phTitle")}
        />
      </div>

      <div>
        <label style={labelStyle}>{t("admin.kb.form.slug")}</label>
        <input
          name="slug"
          value={slug}
          onChange={e => setSlug(e.target.value)}
          style={inputStyle}
          placeholder={t("admin.kb.form.phSlug")}
        />
        <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "var(--text-faint)" }}>
          {t("admin.kb.form.slugHint")}
        </p>
      </div>

      <div>
        <label style={labelStyle}>{t("admin.kb.form.excerpt")}</label>
        <input
          name="excerpt"
          defaultValue={article?.excerpt}
          maxLength={500}
          style={inputStyle}
          placeholder={t("admin.kb.form.phExcerpt")}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={labelStyle}>{t("admin.kb.form.category")}</label>
          <select name="category" defaultValue={article?.category ?? "geral"} required style={inputStyle}>
            {CATEGORY_IDS.map(id => (
              <option key={id} value={id}>{t(`admin.kb.category.${id}`)}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>{t("admin.kb.form.product")}</label>
          <select name="product" defaultValue={article?.product ?? ""} style={inputStyle}>
            <option value="">{t("admin.kb.form.productNone")}</option>
            {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>{t("admin.kb.form.content")}</label>
        <textarea
          name="content"
          defaultValue={article?.content}
          required
          rows={20}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
          placeholder={t("admin.kb.form.phContent")}
        />
      </div>

      {/* Toggle publicado */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          type="button"
          onClick={() => setPublished(p => !p)}
          style={{
            position: "relative",
            width: 44, height: 24, borderRadius: 999,
            border: "none", cursor: "pointer", padding: 0,
            background: published ? "var(--primary)" : "var(--border)",
            transition: "background 0.2s",
            flexShrink: 0,
          }}
        >
          <span style={{
            position: "absolute", top: 3,
            left: published ? 22 : 3,
            width: 18, height: 18, borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s",
            display: "block",
          }} />
        </button>
        <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text)" }}>
          {published ? t("admin.kb.form.published") : t("admin.kb.form.draft")}
        </span>
      </div>

      <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
        <button
          type="submit"
          disabled={pending}
          style={{
            padding: "10px 24px", borderRadius: 9,
            background: "var(--cta-bg)", color: "var(--cta-text)", border: "none",
            fontSize: "0.88rem", fontWeight: 700, cursor: pending ? "not-allowed" : "pointer",
            opacity: pending ? 0.7 : 1, fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          {pending && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
          {article ? t("admin.kb.form.saveChanges") : t("admin.kb.form.createArticle")}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/base-conhecimento")}
          style={{
            padding: "10px 20px", borderRadius: 9,
            background: "transparent", color: "var(--text-muted)",
            border: "1px solid var(--border)", fontSize: "0.88rem", fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {t("admin.kb.form.cancel")}
        </button>
      </div>
    </form>
  );
}
