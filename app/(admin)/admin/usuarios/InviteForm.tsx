"use client";

import { useRef, useState, useTransition } from "react";
import { adminInviteClient } from "@/app/actions/admin";
import { SERVICES } from "@/app/lib/constants/services";
import { MailForward, Send, CheckCircle, XCircle } from "lucide-react";

export default function InviteForm() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await adminInviteClient(formData);
      if (result.success) {
        setMessage({ type: "success", text: result.success });
        formRef.current?.reset();
      } else {
        setMessage({ type: "error", text: result.error ?? "Erro desconhecido." });
      }
    });
  }

  return (
    <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "24px 24px 20px", marginBottom: 28 }}>
      <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 16px", color: "var(--text)" }}>
        <MailForward size={15} style={{ marginRight: 7 }} />
        Convidar novo cliente
      </h2>
      <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 220, flex: "2 1 220px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>E-mail *</label>
          <input
            type="email"
            name="email"
            required
            placeholder="cliente@email.com"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", padding: "8px 12px", fontSize: "13px", fontFamily: "inherit", outline: "none" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 160, flex: "1 1 160px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Nome</label>
          <input
            type="text"
            name="name"
            placeholder="Nome do cliente"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", padding: "8px 12px", fontSize: "13px", fontFamily: "inherit", outline: "none" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 110, flex: "0 1 110px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tokens</label>
          <input
            type="number"
            name="token_balance"
            defaultValue={0}
            min={0}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", padding: "8px 12px", fontSize: "13px", fontFamily: "inherit", outline: "none" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 130, flex: "0 1 130px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Plano</label>
          <select
            name="plan"
            defaultValue="sem_plano"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", padding: "8px 12px", fontSize: "13px", fontFamily: "inherit", outline: "none", cursor: "pointer" }}
          >
            <option value="sem_plano">Sem plano</option>
            <option value="basico">Básico</option>
            <option value="pro">Pro</option>
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 150, flex: "0 1 150px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Início do contrato</label>
          <input
            type="date"
            name="contract_start"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", padding: "8px 12px", fontSize: "13px", fontFamily: "inherit", outline: "none" }}
          />
        </div>

        {/* Serviços contratados — multi-seleção */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: "1 1 100%" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Serviços contratados</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SERVICES.map((s) => (
              <label
                key={s.id}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 999, padding: "6px 12px", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", cursor: "pointer", userSelect: "none" }}
              >
                <input type="checkbox" name="services" value={s.id} style={{ accentColor: s.color, cursor: "pointer" }} />
                <s.Icon size={14} style={{ color: s.color }} />
                {s.label}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#185FA5", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: isPending ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: isPending ? 0.7 : 1, alignSelf: "flex-end", height: 38 }}
        >
          <Send size={14} style={{ marginRight: 6 }} />
          {isPending ? "Enviando…" : "Convidar"}
        </button>
      </form>
      {message && (
        <p style={{ margin: "12px 0 0", fontSize: "13px", color: message.type === "success" ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
          {message.type === "success" ? <CheckCircle size={14} style={{ marginRight: 6 }} /> : <XCircle size={14} style={{ marginRight: 6 }} />}
          {message.text}
        </p>
      )}
    </div>
  );
}
