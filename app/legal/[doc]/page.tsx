"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/app/lib/i18n/I18nProvider";

const DOCS = ["about", "terms", "privacy", "licenses"] as const;
type Doc = (typeof DOCS)[number];

interface Section { h: string; p: string; }
interface LegalDoc { title: string; intro: string; sections: Section[]; }

export default function LegalPage() {
  const router = useRouter();
  const { locale, dict, t } = useI18n();
  const params = useParams<{ doc: string }>();
  const doc = (DOCS.includes(params.doc as Doc) ? params.doc : "about") as Doc;
  const content = dict.legal[doc] as LegalDoc;

  const updated = new Date().toLocaleDateString(locale === "pt" ? "pt-BR" : locale, {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }} className="hub-bg-diagonal">
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", cursor: "pointer", fontFamily: "inherit", fontSize: "13px", fontWeight: 600, marginBottom: 28 }}
        >
          <ArrowLeft size={14} /> {t("common.backToHub")}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
          <span style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-0.02em" }}>Fropty</span>
          <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.02em" }}>Hub</span>
        </div>

        <h1 style={{ margin: "0 0 10px", fontSize: "1.9rem", fontWeight: 800, letterSpacing: "-0.03em" }}>{content.title}</h1>
        <p style={{ margin: "0 0 4px", fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.6 }}>{content.intro}</p>
        <p style={{ margin: "0 0 32px", fontSize: "12px", color: "var(--text-faint)" }}>{t("common.lastUpdated")}: {updated}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {content.sections.map((s, i) => (
            <section key={i}>
              <h2 style={{ margin: "0 0 6px", fontSize: "1.05rem", fontWeight: 700 }}>{s.h}</h2>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.7 }}>{s.p}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
