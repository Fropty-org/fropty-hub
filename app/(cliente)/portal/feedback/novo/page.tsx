"use client";

import { useTransition, useState } from "react";
import { submitFeedback } from "@/app/actions/feedback";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Send, Loader2, AlertCircle, CheckCircle } from "lucide-react";

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  background: "var(--surface-2)", border: "1px solid var(--border)",
  borderRadius: "var(--r-md)", padding: "10px 14px",
  fontSize: "13.5px", color: "var(--text)",
  fontFamily: "inherit", outline: "none",
  transition: "border-color 0.15s",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "11px", fontWeight: 700,
  color: "var(--text-faint)", marginBottom: 7,
  textTransform: "uppercase", letterSpacing: "0.06em",
};

export default function NovoFeedbackPage() {
  const [pending, start] = useTransition();
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const result = await submitFeedback(fd);
      if (result?.error) setError(result.error);
      else setSuccess(true);
    });
  }

  return (
    <div className="hub-page" style={{ maxWidth: 640, margin: "0 auto" }}>

      {/* ── Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: "12px" }}>
        <Link
          href="/portal/feedback"
          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px 5px 8px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-faint)", textDecoration: "none", fontWeight: 600 }}
        >
          <ArrowLeft size={13} /> Feedback
        </Link>
        <ChevronRight size={12} style={{ color: "var(--text-faint)" }} />
        <span style={{ color: "var(--text-muted)" }}>Novo feedback</span>
      </div>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>
          Enviar Feedback
        </h1>
        <p style={{ margin: "5px 0 0", fontSize: "13px", color: "var(--text-faint)" }}>
          Sugestões, elogios e críticas ajudam a melhorar os produtos Fropty.
        </p>
      </div>

      {success ? (
        <div className="hub-card" style={{ padding: "56px 24px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckCircle size={26} style={{ color: "var(--c-success)" }} />
          </div>
          <p style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text)", margin: "0 0 6px" }}>Feedback enviado!</p>
          <p style={{ color: "var(--text-faint)", fontSize: "13px", margin: "0 0 24px" }}>Obrigado. Nossa equipe vai analisar em breve.</p>
          <Link
            href="/portal/feedback"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 20px", background: "var(--cta-bg)", color: "var(--cta-text)", borderRadius: "var(--r-md)", fontWeight: 700, fontSize: "13px", textDecoration: "none" }}
          >
            Ver feedbacks
          </Link>
        </div>
      ) : (
        <div className="hub-card" style={{ overflow: "hidden" }}>
          {/* Card header */}
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-faint)" }}>
              Preencha o formulário
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: "24px 24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Tipo + Produto */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Tipo *</label>
                <select
                  name="type"
                  defaultValue="sugestao"
                  required
                  style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
                  onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                  onBlur={e  => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <option value="sugestao">Sugestão</option>
                  <option value="bug">Bug</option>
                  <option value="elogio">Elogio</option>
                  <option value="critica">Crítica</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Produto</label>
                <select
                  name="product"
                  style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
                  onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                  onBlur={e  => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <option value="">— Selecione —</option>
                  <option value="Fropty Hub">Fropty Hub</option>
                  <option value="Fropty Boost">Fropty Boost</option>
                  <option value="Fropty Cash">Fropty Cash</option>
                  <option value="Fropty Invest">Fropty Invest</option>
                  <option value="Fropty Apps">Fropty Apps</option>
                  <option value="Fropty Sentinel">Fropty Sentinel</option>
                </select>
              </div>
            </div>

            {/* Título */}
            <div>
              <label style={labelStyle}>Título *</label>
              <input
                name="title"
                required
                maxLength={200}
                placeholder="Resumo do seu feedback"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                onBlur={e  => e.currentTarget.style.borderColor = "var(--border)"}
              />
            </div>

            {/* Descrição */}
            <div>
              <label style={labelStyle}>Descrição *</label>
              <textarea
                name="description"
                required
                maxLength={5000}
                rows={5}
                placeholder="Descreva com detalhes o que você quer compartilhar…"
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }}
                onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                onBlur={e  => e.currentTarget.style.borderColor = "var(--border)"}
              />
            </div>

            {/* Erro */}
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: "var(--r-md)", background: "var(--c-danger-bg)", border: "1px solid rgba(220,38,38,0.2)" }}>
                <AlertCircle size={14} style={{ color: "var(--c-danger)", flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: "12px", color: "var(--c-danger)" }}>{error}</p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
              <Link
                href="/portal/feedback"
                style={{ display: "inline-flex", alignItems: "center", padding: "9px 18px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", background: "none", color: "var(--text-muted)", fontWeight: 600, fontSize: "13px", textDecoration: "none" }}
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={pending}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--cta-bg)", color: "var(--cta-text)", border: "none", borderRadius: "var(--r-md)", padding: "9px 22px", fontSize: "13px", fontWeight: 700, cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.7 : 1, fontFamily: "inherit", boxShadow: "var(--shadow-brand)" }}
              >
                {pending
                  ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Enviando…</>
                  : <><Send size={14} /> Enviar feedback</>
                }
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
