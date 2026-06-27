"use client";

import { useActionState } from "react";
import { signIn } from "@/app/actions/auth";
import { AlertCircle, Loader2, LogIn } from "lucide-react";

export function LoginForm() {
  // Envio nativo do form: signIn redireciona no servidor em caso de sucesso.
  const [state, formAction, loading] = useActionState(signIn, null);
  const error = state?.error ?? "";

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
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
          <AlertCircle size={14} /> {error}
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
          ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Entrando...</>
          : <><LogIn size={16} /> Entrar na minha conta</>
        }
      </button>
    </form>
  );
}
