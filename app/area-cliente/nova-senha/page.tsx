"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { updatePassword } from "@/app/actions/auth";

export default function NovaSenhaPage() {
  const [error, setError]     = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updatePassword(formData);
      if (result && "error" in result) setError(result.error ?? null);
    });
  }

  return (
    <div style={{
      minHeight: "100dvh",
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 36, textDecoration: "none" }}>
        <Image src="/logo-icon.png" alt="Fropty Apps" width={32} height={32} style={{ borderRadius: 8 }} />
        <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-plus-jakarta), sans-serif" }}>
          Fropty<span style={{ color: "var(--primary)" }}>Apps</span>
        </span>
      </Link>

      <div style={{
        width: "100%", maxWidth: 400,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        padding: "32px 28px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
      }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text)", margin: "0 0 6px", fontFamily: "var(--font-plus-jakarta), sans-serif" }}>
            Criar nova senha
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
            Escolha uma senha com pelo menos 8 caracteres.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Nova senha</label>
            <input name="password" type="password" required autoComplete="new-password"
              placeholder="Mínimo 8 caracteres" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Confirmar nova senha</label>
            <input name="confirm" type="password" required autoComplete="new-password"
              placeholder="Repita a senha" style={inputStyle} />
          </div>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <i className="ti ti-alert-circle" style={{ fontSize: 15 }} />{error}
            </div>
          )}

          <button type="submit" disabled={isPending} style={{
            marginTop: 4, padding: "12px 0", borderRadius: 12, border: "none",
            background: isPending ? "var(--border)" : "var(--primary)",
            color: isPending ? "var(--text-muted)" : "#fff",
            fontWeight: 700, fontSize: 15, cursor: isPending ? "not-allowed" : "pointer",
            fontFamily: "inherit", transition: "all 0.2s",
          }}>
            {isPending ? "Salvando…" : "Salvar nova senha"}
          </button>
        </form>
      </div>

      <style>{`
        input::placeholder { color: var(--text-faint); }
        input:focus { outline: none; border-color: var(--primary) !important; box-shadow: 0 0 0 3px rgba(91,87,232,0.15); }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600,
  color: "var(--text-muted)", marginBottom: 6,
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 10,
  border: "1px solid var(--border)", background: "var(--bg)",
  color: "var(--text)", fontSize: 14, fontFamily: "inherit",
  boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s",
};
