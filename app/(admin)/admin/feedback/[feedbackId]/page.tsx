"use client";

import { useTransition, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAllFeedbacksAdmin, respondToFeedback } from "@/app/actions/feedback";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Feedback, FeedbackType, FeedbackStatus } from "@/app/lib/types/feedback";

const TYPE_LABEL: Record<FeedbackType, string> = {
  sugestao: "Sugestão", bug: "Bug", elogio: "Elogio", critica: "Crítica", outro: "Outro",
};

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  recebido: "Recebido", em_analise: "Em Análise", aprovado: "Aprovado", descartado: "Descartado", implementado: "Implementado",
};

export default function AdminFeedbackDetailPage() {
  const { feedbackId } = useParams<{ feedbackId: string }>();
  const router = useRouter();
  const [feedback, setFeedback]     = useState<Feedback | null>(null);
  const [pending, start]            = useTransition();
  const [error, setError]           = useState<string | null>(null);
  const [response, setResponse]     = useState("");
  const [status, setStatus]         = useState("em_analise");
  const [impact, setImpact]         = useState("");

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
        Carregando...
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 32px", maxWidth: 700, margin: "0 auto" }}>
      <Link href="/admin/feedback" style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: "13px", color: "var(--text-faint)", textDecoration: "none", marginBottom: 24,
      }}>
        <ArrowLeft size={14} /> Voltar
      </Link>

      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 6px", color: "var(--text)" }}>
        {feedback.title}
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: "13px", color: "var(--text-faint)" }}>
        {TYPE_LABEL[feedback.type as FeedbackType] ?? feedback.type}
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

      <form onSubmit={handleSubmit} style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "24px 22px",
        display: "flex", flexDirection: "column", gap: 18,
      }}>
        <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
          Responder
        </h2>

        <div>
          <label style={labelStyle}>Resposta</label>
          <textarea
            value={response} onChange={(e) => setResponse(e.target.value)}
            rows={4} maxLength={5000} placeholder="Escreva uma resposta para o cliente..."
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
              {(Object.keys(STATUS_LABEL) as FeedbackStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Impacto</label>
            <select value={impact} onChange={(e) => setImpact(e.target.value)} style={inputStyle}>
              <option value="">— Não definido —</option>
              <option value="alto">Alto</option>
              <option value="medio">Médio</option>
              <option value="baixo">Baixo</option>
            </select>
          </div>
        </div>

        {error && (
          <p style={{ margin: 0, fontSize: "13px", color: "#ef4444", fontWeight: 600 }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          style={{
            background: "var(--primary)", color: "#fff",
            border: "none", borderRadius: 10, padding: "11px 20px",
            fontSize: "14px", fontWeight: 700,
            cursor: pending ? "not-allowed" : "pointer",
            opacity: pending ? 0.7 : 1, fontFamily: "inherit",
          }}
        >
          {pending ? "Salvando..." : "Salvar Resposta"}
        </button>
      </form>
    </div>
  );
}
