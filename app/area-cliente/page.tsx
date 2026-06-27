"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/app/lib/supabase/browser";
import { Sun, Moon, ArrowLeft, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

type Mode = "login" | "reset";

// Mensagens de erro vindas do redirect do /api/login (?error=...)
const LOGIN_ERRORS: Record<string, string> = {
  credenciais: "Email ou senha incorretos.",
  "acesso-revogado": "Seu acesso foi revogado. Entre em contato com o suporte.",
  interno: "Erro interno. Tente novamente mais tarde.",
};

export default function AreaClientePage() {
  const searchParams = useSearchParams();
  const [mode, setMode]       = useState<Mode>("login");
  const [error, setError]     = useState<string | null>(() => {
    const code = searchParams.get("error");
    return code ? LOGIN_ERRORS[code] ?? null : null;
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = (localStorage.getItem("fropty-theme") ?? localStorage.getItem("theme") ?? "dark") as "dark" | "light";
    setTheme(saved);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("fropty-theme", next);
  }

  function changeMode(m: Mode) { setMode(m); setError(null); setSuccess(null); }

  function handleResetSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const email = (formData.get("email") as string)?.trim().toLowerCase();
      if (!email) { setError("Informe seu e-mail."); return; }
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/area-cliente/nova-senha`,
      });
      setSuccess("Se esse e-mail estiver cadastrado, você receberá o link em breve.");
    });
  }

  const shownError = error;

  return (
    <div style={{
      minHeight: "100dvh", background: "var(--bg)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
    }}>
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        title={theme === "dark" ? "Modo claro" : "Modo escuro"}
        style={{
          position: "fixed", top: 16, right: 16,
          width: 38, height: 38, borderRadius: 10,
          border: "1px solid var(--border)",
          background: "var(--surface)",
          color: "var(--text)",
          cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 18, zIndex: 50,
        }}
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 36, textDecoration: "none" }}>
        <Image src="/hub-logo.png" alt="FroptyHub" width={32} height={32} style={{ borderRadius: 8 }} />
        <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-dm-sans), sans-serif" }}>
          Fropty<span style={{ color: "var(--primary)" }}>Hub</span>
        </span>
      </Link>

      <div style={{
        width: "100%", maxWidth: 400,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 20, padding: "32px 28px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
      }}>
        {mode === "login" && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text)", margin: "0 0 6px", fontFamily: "var(--font-dm-sans), sans-serif" }}>
              Área do cliente
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
              Acesse seus serviços, chamados e tokens.
            </p>
          </div>
        )}

        {mode === "reset" && (
          <div style={{ marginBottom: 24 }}>
            <button onClick={() => changeMode("login")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 16, fontFamily: "inherit" }}>
              <ArrowLeft size={14} /> Voltar ao login
            </button>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text)", margin: "0 0 6px", fontFamily: "var(--font-dm-sans), sans-serif" }}>
              Recuperar senha
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
              Informe seu e-mail e enviaremos um link para criar nova senha.
            </p>
          </div>
        )}

        <form
          {...(mode === "login"
            ? {
                // POST NATIVO para o route handler. action é uma string (não
                // uma função), então o React não intercepta — o browser envia
                // o form e segue o 303 no nível HTTP. Funciona até sem JS.
                method: "post" as const,
                action: "/api/login",
                onSubmit: () => setLoginSubmitting(true),
              }
            : { onSubmit: handleResetSubmit })}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div>
            <label style={labelStyle}>E-mail</label>
            <input name="email" type="email" required autoComplete="email" placeholder="seu@email.com" style={inputStyle} />
          </div>

          {mode === "login" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Senha</label>
                <button type="button" onClick={() => changeMode("reset")} style={{ fontSize: 12, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                  Esqueci a senha
                </button>
              </div>
              <input
                name="password" type="password" required
                autoComplete="current-password"
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>
          )}

          {shownError && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />{shownError}
            </div>
          )}

          {success && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle size={15} style={{ flexShrink: 0 }} />{success}
            </div>
          )}

          <button type="submit" disabled={mode === "login" ? loginSubmitting : isPending} style={{
            marginTop: 4, padding: "12px 0", borderRadius: 12, border: "none",
            background: (mode === "login" ? loginSubmitting : isPending) ? "var(--border)" : "var(--primary)",
            color: (mode === "login" ? loginSubmitting : isPending) ? "var(--text-muted)" : "#fff",
            fontWeight: 700, fontSize: 15, cursor: (mode === "login" ? loginSubmitting : isPending) ? "not-allowed" : "pointer",
            fontFamily: "inherit", transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {(mode === "login" ? loginSubmitting : isPending) ? (
              <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />Aguarde…</>
            ) : mode === "login" ? "Entrar na conta" : "Enviar link de recuperação"}
          </button>
        </form>
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: "var(--text-faint)", textAlign: "center" }}>
        Ao continuar você concorda com os{" "}
        <Link href="/termos" style={{ color: "var(--text-muted)", textDecoration: "underline" }}>Termos de Uso</Link>
        {" "}e{" "}
        <Link href="/privacidade" style={{ color: "var(--text-muted)", textDecoration: "underline" }}>Privacidade</Link>.
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
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
