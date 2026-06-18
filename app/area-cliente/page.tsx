"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "@/app/actions/auth";
import { createClient } from "@/app/lib/supabase/browser";

type Mode = "login" | "reset";

export default function AreaClientePage() {
  const router = useRouter();
  const [mode, setMode]       = useState<Mode>("login");
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as "dark" | "light") || "dark";
    setTheme(saved);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  function changeMode(m: Mode) { setMode(m); setError(null); setSuccess(null); }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      if (mode === "reset") {
        const email = (formData.get("email") as string)?.trim().toLowerCase();
        if (!email) { setError("Informe seu e-mail."); return; }
        const supabase = createClient();
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/area-cliente/nova-senha`,
        });
        setSuccess("Se esse e-mail estiver cadastrado, você receberá o link em breve.");
        return;
      }
      const result = await signIn(formData);
      if (!result) return;
      if ("error"      in result) { setError(result.error ?? null); return; }
      if ("success"    in result) { setSuccess(result.success as string); return; }
      if ("redirectTo" in result) { router.push(result.redirectTo as string); }
    });
  }

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
        <i className={`ti ${theme === "dark" ? "ti-sun" : "ti-moon"}`} />
      </button>

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
        borderRadius: 20, padding: "32px 28px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
      }}>
        {mode === "login" && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text)", margin: "0 0 6px", fontFamily: "var(--font-plus-jakarta), sans-serif" }}>
              Área do cliente
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
              Acesse seus projetos, chamados e tokens.
            </p>
          </div>
        )}

        {mode === "reset" && (
          <div style={{ marginBottom: 24 }}>
            <button onClick={() => changeMode("login")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 16, fontFamily: "inherit" }}>
              <i className="ti ti-arrow-left" style={{ fontSize: 14 }} /> Voltar ao login
            </button>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text)", margin: "0 0 6px", fontFamily: "var(--font-plus-jakarta), sans-serif" }}>
              Recuperar senha
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
              Informe seu e-mail e enviaremos um link para criar nova senha.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <i className="ti ti-alert-circle" style={{ fontSize: 15, flexShrink: 0 }} />{error}
            </div>
          )}

          {success && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <i className="ti ti-circle-check" style={{ fontSize: 15, flexShrink: 0 }} />{success}
            </div>
          )}

          <button type="submit" disabled={isPending} style={{
            marginTop: 4, padding: "12px 0", borderRadius: 12, border: "none",
            background: isPending ? "var(--border)" : "var(--primary)",
            color: isPending ? "var(--text-muted)" : "#fff",
            fontWeight: 700, fontSize: 15, cursor: isPending ? "not-allowed" : "pointer",
            fontFamily: "inherit", transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {isPending ? (
              <><i className="ti ti-loader-2" style={{ fontSize: 16, animation: "spin 1s linear infinite" }} />Aguarde…</>
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
