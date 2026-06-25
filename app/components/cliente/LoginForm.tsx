"use client";

import { useState } from "react";
import { signIn } from "@/app/actions/auth";

export function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // signIn redireciona no servidor em caso de sucesso; aqui só tratamos erro.
    const result = await signIn(new FormData(e.currentTarget));

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
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

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
          E-mail
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="seu@email.com"
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
        />
      </div>

      <div>
        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
          Senha
        </label>
        <input
          name="password"
          type="password"
          required
          placeholder="••••••••"
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
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
          ? <><i className="ti ti-loader-2" style={{ animation: "spin 1s linear infinite" }} /> Entrando...</>
          : <><i className="ti ti-login" /> Entrar na minha conta</>
        }
      </button>
    </form>
  );
}
