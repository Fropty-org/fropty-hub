"use client";

import { useRef, useState, useTransition } from "react";
import { adminInviteClient } from "@/app/actions/admin";
import { SERVICES } from "@/app/lib/constants/services";
import { Forward, Send, CheckCircle, XCircle } from "lucide-react";

const inputStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text)",
  padding: "8px 12px",
  fontSize: "13px",
  fontFamily: "inherit",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  color: "var(--text-faint)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 5,
  display: "block",
};

export default function InviteForm() {
  const [message,    setMessage]    = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selected,   setSelected]   = useState<Set<string>>(new Set());
  const [isPending,  startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function toggleService(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    selected.forEach((id) => formData.append("services", id));
    startTransition(async () => {
      const result = await adminInviteClient(formData);
      if (result.success) {
        setMessage({ type: "success", text: result.success });
        formRef.current?.reset();
        setSelected(new Set());
      } else {
        setMessage({ type: "error", text: result.error ?? "Erro desconhecido." });
      }
    });
  }

  return (
    <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "22px 24px 20px", marginBottom: 28 }}>
      <h2 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 18px", color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
        <Forward size={15} style={{ color: "var(--primary)" }} />
        Convidar novo cliente
      </h2>

      <form ref={formRef} onSubmit={handleSubmit}>
        {/* Row 1: inputs + button */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end", marginBottom: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 200, flex: "2 1 200px" }}>
            <label style={labelStyle}>E-mail *</label>
            <input type="email" name="email" required placeholder="cliente@email.com" style={inputStyle} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", minWidth: 140, flex: "1 1 140px" }}>
            <label style={labelStyle}>Nome</label>
            <input type="text" name="name" placeholder="Nome do cliente" style={inputStyle} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", minWidth: 90, flex: "0 0 90px" }}>
            <label style={labelStyle}>Tokens</label>
            <input type="number" name="token_balance" defaultValue={0} min={0} style={inputStyle} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", minWidth: 120, flex: "0 0 120px" }}>
            <label style={labelStyle}>Plano</label>
            <select name="plan" defaultValue="sem_plano" style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="sem_plano">Sem plano</option>
              <option value="basico">Básico</option>
              <option value="pro">Pro</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", minWidth: 140, flex: "0 0 140px" }}>
            <label style={labelStyle}>Início do contrato</label>
            <input type="date" name="contract_start" style={inputStyle} />
          </div>

          {/* Button in the same row */}
          <button
            type="submit"
            disabled={isPending}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 20px", borderRadius: 8, border: "none",
              background: "var(--cta-bg)", color: "var(--cta-text)",
              fontSize: "13px", fontWeight: 700,
              cursor: isPending ? "not-allowed" : "pointer",
              fontFamily: "inherit", opacity: isPending ? 0.7 : 1,
              height: 36, whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            <Send size={13} />
            {isPending ? "Enviando…" : "Convidar"}
          </button>
        </div>

        {/* Row 2: service toggles */}
        <div>
          <label style={labelStyle}>Serviços contratados</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {SERVICES.map((s) => {
              const isOn = selected.has(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleService(s.id)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 14px",
                    borderRadius: 99,
                    border: `1.5px solid ${isOn ? s.color : "var(--border)"}`,
                    background: isOn ? `${s.color}18` : "var(--surface)",
                    color: isOn ? s.color : "var(--text-muted)",
                    fontSize: "12px", fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.15s",
                    userSelect: "none",
                  }}
                >
                  <s.Icon size={13} />
                  {s.label}
                  {isOn && (
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, display: "inline-block" }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </form>

      {message && (
        <p style={{ margin: "12px 0 0", fontSize: "13px", color: message.type === "success" ? "#22c55e" : "#ef4444", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          {message.type === "success" ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {message.text}
        </p>
      )}
    </div>
  );
}
