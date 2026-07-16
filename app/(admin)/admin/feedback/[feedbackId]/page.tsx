"use client";

import { useTransition, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAllFeedbacksAdmin, respondToFeedback, convertFeedbackToRoadmap } from "@/app/actions/feedback";
import Link from "next/link";
import { ArrowLeft, Rocket, Check } from "lucide-react";
import type { Feedback, FeedbackStatus } from "@/app/lib/types/feedback";
import { useT } from "@/app/lib/i18n/I18nProvider";

const STATUS_KEYS: FeedbackStatus[] = ["recebido", "em_analise", "aprovado", "descartado", "implementado"];

export default function AdminFeedbackDetailPage() {
  const t = useT();
  const { feedbackId } = useParams<{ feedbackId: string }>();
  const router = useRouter();
  const [feedback, setFeedback]     = useState<Feedback | null>(null);
  const [pending, start]            = useTransition();
  const [error, setError]           = useState<string | null>(null);
  const [response, setResponse]     = useState("");
  const [status, setStatus]         = useState("em_analise");
  const [impact, setImpact]         = useState("");
  const [converting, setConverting] = useState(false);
  const [converted, setConverted]   = useState(false);

  function handleConvert() {
    setError(null);
    setConverting(true);
    start(async () => {
      const res = await convertFeedbackToRoadmap(feedbackId);
      setConverting(false);
      if (res.error) { setError(res.error); return; }
      setConverted(true);
      setStatus("aprovado");
    });
  }

  useEffect(() => {
    getAllFeedbacksAdmin().then((items) => {
      const found = items.find((f) => f.id === feedbackId) ?? null;
      setFeedback(found);
      if (found) {
        setStatus(found.status);
        setImpact(found.impact ?? "");
        setResponse(found.admin_response ?? "");
      }
    });
  }, [feedbackId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const result = await respondToFeedback(feedbackId, response, status, impact);
      if (result.error) { setError(result.error); return; }
      router.push("/admin/feedback");
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

  if (!feedback) {
    return (
      <div style={{ padding: "40px 32px", color: "var(--text-faint)", fontSize: "14px" }}>
        {t("admin.feedback.detail.loading")}
      </div>
    );
  }

  return (
    <div className="hub-page" style={{ maxWidth: 700, margin: "0 auto" }}>
      <Link href="/admin/feedback" style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: "13px", color: "var(--text-faint)", textDecoration: "none", marginBottom: 24,
      }}>
        <ArrowLeft size={14} /> {t("admin.feedback.detail.back")}
      </Link>

      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 6px", color: "var(--text)" }}>
        {feedback.title}
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: "13px", color: "var(--text-faint)" }}>
        {t(`admin.feedback.type.${feedback.type}`)}
        {feedback.product ? ` · ${feedback.product}` : ""}
        {" · "}{feedback.client_name ?? "—"}
        {" · "}{new Date(feedback.created_at).toLocaleDateString("pt-BR")}
      </p>

      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "20px 22px", marginBottom: 24,
      }}>
        <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6 }}>
          {feedback.description}
        </p>
      </div>

      {/* Converter em roadmap */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 24, padding: "14px 18px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12 }}>
        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          {t("admin.feedback.detail.convertPrompt")}
        </span>
        {converted ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "13px", fontWeight: 700, color: "var(--c-success)" }}>
            <Check size={14} /> {t("admin.feedback.detail.addedToRoadmap")}
          </span>
        ) : (
          <button
            type="button"
            onClick={handleConvert}
            disabled={converting || pending}
            className="hub-btn hub-btn-ghost"
            style={{ whiteSpace: "nowrap", opacity: converting ? 0.7 : 1 }}
          >
            <Rocket size={14} /> {converting ? t("admin.feedback.detail.converting") : t("admin.feedback.detail.convert")}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "24px 22px",
        display: "flex", flexDirection: "column", gap: 18,
      }}>
        <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
          {t("admin.feedback.detail.respond")}
        </h2>

        <div>
          <label style={labelStyle}>{t("admin.feedback.detail.response")}</label>
          <textarea
            value={response} onChange={(e) => setResponse(e.target.value)}
            rows={4} maxLength={5000} placeholder={t("admin.feedback.detail.phResponse")}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>{t("admin.feedback.detail.status")}</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
              {STATUS_KEYS.map((s) => (
                <option key={s} value={s}>{t(`admin.feedback.status.${s}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>{t("admin.feedback.detail.impact")}</label>
            <select value={impact} onChange={(e) => setImpact(e.target.value)} style={inputStyle}>
              <option value="">{t("admin.feedback.detail.impactUndefined")}</option>
              <option value="alto">{t("admin.feedback.detail.impactHigh")}</option>
              <option value="medio">{t("admin.feedback.detail.impactMedium")}</option>
              <option value="baixo">{t("admin.feedback.detail.impactLow")}</option>
            </select>
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
            fontSize: "14px", fontWeight: 700,
            cursor: pending ? "not-allowed" : "pointer",
            opacity: pending ? 0.7 : 1, fontFamily: "inherit",
          }}
        >
          {pending ? t("admin.feedback.detail.saving") : t("admin.feedback.detail.saveResponse")}
        </button>
      </form>
    </div>
  );
}
