"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRoadmapItem } from "@/app/actions/roadmap";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useT } from "@/app/lib/i18n/I18nProvider";

export default function NovoRoadmapItemPage() {
  const t = useT();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      title:          (fd.get("title") as string).trim(),
      description:    (fd.get("description") as string).trim(),
      status:         fd.get("status") as string,
      category:       fd.get("category") as string,
      visibility:     fd.get("visibility") as string,
      target_version: (fd.get("target_version") as string).trim() || undefined,
    };
    if (!data.title) { setError(t("admin.roadmap.form.titleRequired")); return; }
    setError(null);
    start(async () => {
      const result = await createRoadmapItem(data);
      if (result.error) { setError(result.error); return; }
      router.push("/admin/roadmap");
    });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    background: "var(--surface-2)", border: "1px solid var(--border)",
    borderRadius: 10, padding: "10px 14px",
    fontSize: "14px", color: "var(--text)",
    fontFamily: "inherit", outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "12px", fontWeight: 700,
    color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em",
  };

  return (
    <div className="hub-page" style={{ maxWidth: 600, margin: "0 auto" }}>
      <Link href="/admin/roadmap" style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: "13px", color: "var(--text-faint)", textDecoration: "none", marginBottom: 24,
      }}>
        <ArrowLeft size={14} /> {t("admin.roadmap.form.back")}
      </Link>

      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 28px", color: "var(--text)" }}>
        {t("admin.roadmap.form.newTitle")}
      </h1>

      <form onSubmit={handleSubmit} style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "28px 24px",
        display: "flex", flexDirection: "column", gap: 20,
      }}>
        <div>
          <label style={labelStyle}>{t("admin.roadmap.form.title")}</label>
          <input name="title" required maxLength={200} placeholder={t("admin.roadmap.form.phTitle")} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>{t("admin.roadmap.form.description")}</label>
          <textarea name="description" maxLength={1000} rows={3} placeholder={t("admin.roadmap.form.phDescription")} style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>{t("admin.roadmap.form.status")}</label>
            <select name="status" defaultValue="planejado" style={inputStyle}>
              {["ideia", "planejado", "em_desenvolvimento", "lancado", "descartado"].map((k) => (
                <option key={k} value={k}>{t(`admin.roadmap.status.${k}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>{t("admin.roadmap.form.category")}</label>
            <select name="category" defaultValue="produto" style={inputStyle}>
              {["produto", "suporte", "financeiro", "integracao", "seguranca", "ux", "performance", "outro"].map((k) => (
                <option key={k} value={k}>{t(`admin.roadmap.category.${k}`)}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>{t("admin.roadmap.form.visibility")}</label>
            <select name="visibility" defaultValue="publico" style={inputStyle}>
              <option value="publico">{t("admin.roadmap.form.public")}</option>
              <option value="privado">{t("admin.roadmap.form.private")}</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>{t("admin.roadmap.form.targetVersion")}</label>
            <input name="target_version" maxLength={50} placeholder={t("admin.roadmap.form.phVersion")} style={inputStyle} />
          </div>
        </div>

        {error && (
          <p style={{ margin: 0, fontSize: "13px", color: "var(--c-danger)", fontWeight: 600 }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          style={{
            background: "var(--cta-bg)", color: "var(--cta-text)",
            border: "none", borderRadius: 10, padding: "11px 20px",
            fontSize: "14px", fontWeight: 700, cursor: pending ? "not-allowed" : "pointer",
            opacity: pending ? 0.7 : 1, fontFamily: "inherit",
          }}
        >
          {pending ? t("admin.roadmap.form.saving") : t("admin.roadmap.form.create")}
        </button>
      </form>
    </div>
  );
}
