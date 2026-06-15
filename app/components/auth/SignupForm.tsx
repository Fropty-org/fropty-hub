"use client";

import { useState } from "react";
import { signUp } from "@/app/actions/auth";

export function SignupForm() {
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const result = await signUp(new FormData(e.currentTarget));

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      setSuccess(result.success);
      setLoading(false);
    }
    // Se redirect → loading permanece true durante a navegação
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--input-bg)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--text-muted)",
    marginBottom: 6,
  };

  if (success) {
    return (
      <div
        style={{
          background: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: 12,
          padding: "20px 16px",
          textAlign: "center",
        }}
      >
        <i className="ti ti-circle-check" style={{ fontSize: 32, color: "#22c55e", display: "block", marginBottom: 8 }} />
        <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>
          Conta criada com sucesso!
        </p>
        <p style={{ margin: "8px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
          {success}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={labelStyle}>Nome completo</label>
        <input
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Seu nome"
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
        />
      </div>

      <div>
        <label style={labelStyle}>E-mail</label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="seu@email.com"
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
        />
      </div>

      <div>
        <label style={labelStyle}>Senha</label>
        <input
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
        />
      </div>

      <div>
        <label style={labelStyle}>Confirmar senha</label>
        <input
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Repita a senha"
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
        />
      </div>

      {error && (
        <p style={{ margin: 0, fontSize: "13px", color: "#ef4444", display: "flex", alignItems: "center", gap: 6 }}>
          <i className="ti ti-alert-circle" /> {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          background: "var(--cta-bg)",
          color: "var(--cta-text)",
          border: "none",
          borderRadius: 10,
          padding: "12px",
          fontSize: "14px",
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontFamily: "inherit",
        }}
      >
        {loading
          ? <><i className="ti ti-loader-2" style={{ animation: "spin 1s linear infinite" }} /> Criando conta...</>
          : <><i className="ti ti-user-plus" /> Criar minha conta</>
        }
      </button>
    </form>
  );
}
