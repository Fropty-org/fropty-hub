"use client";

import { useTransition, useState } from "react";
import { submitFeedback } from "@/app/actions/feedback";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NovoFeedbackPage() {
  const [pending, start] = useTransition();
  const [error, setError]  = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const result = await submitFeedback(fd);
      if (result?.error) setError(result.error);
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
    <div style={{ padding: "40px 32px", maxWidth: 600, margin: "0 auto" }}>
      <Link href="/portal/feedback" style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: "13px", color: "var(--text-faint)", textDecoration: "none", marginBottom: 24,
      }}>
        <ArrowLeft size={14} /> Voltar
      </Link>

      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 28px", color: "var(--text)" }}>
        Enviar Feedback
      </h1>

      <form onSubmit={handleSubmit} style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "28px 24px",
        display: "flex", flexDirection: "column", gap: 20,
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Tipo *</label>
            <select name="type" defaultValue="sugestao" required style={inputStyle}>
              <option value="sugestao">Sugestão</option>
              <option value="bug">Bug</option>
              <option value="elogio">Elogio</option>
              <option value="critica">Crítica</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Produto</label>
            <select name="product" style={inputStyle}>
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

        <div>
          <label style={labelStyle}>Título *</label>
          <input name="title" required maxLength={200} placeholder="Resumo do seu feedback" style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Descrição *</label>
          <textarea
            name="description" required maxLength={5000} rows={5}
            placeholder="Descreva com detalhes o que você quer compartilhar..."
            style={{ ...inputStyle, resize: "vertical" }}
          />
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
          {pending ? "Enviando..." : "Enviar Feedback"}
        </button>
      </form>
    </div>
  );
}
