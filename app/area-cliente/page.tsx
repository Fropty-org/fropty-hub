"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/app/lib/supabase/browser";
import { Sun, Moon, ArrowLeft, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";

type Mode = "login" | "reset";

const LOGIN_ERRORS: Record<string, string> = {
  credenciais:       "E-mail ou senha incorretos.",
  "acesso-revogado": "Seu acesso foi revogado. Entre em contato com o suporte.",
  interno:           "Erro interno. Tente novamente mais tarde.",
};

/* ── Ícones SVG ── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}


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
  const [oauthLoading, setOauthLoading] = useState<"google" | null>(null);
  const [theme, setTheme]     = useState<"dark" | "light">("dark");
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem("fropty-theme") ?? "dark") as "dark" | "light";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("fropty-theme", next);
  }

  function changeMode(m: Mode) { setMode(m); setError(null); setSuccess(null); }

  async function handleOAuth(provider: "google") {
    setOauthLoading(provider);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/portal/dashboard`,
      },
    });
    if (err) { setError("Erro ao conectar com " + (provider === "google" ? "Google" : "Apple") + ". Tente novamente."); setOauthLoading(null); }
  }

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

  const isLoading = mode === "login" ? loginSubmitting : isPending;
  const dark = theme === "dark";

  const bg       = dark ? "#0f0f0f" : "#f4f4f5";
  const cardBg   = dark ? "#1a1a1a" : "#ffffff";
  const border   = dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.10)";
  const inputBg  = dark ? "#111111" : "#f9f9f9";
  const txtMain  = dark ? "#f0f0f0" : "#111111";
  const txtMuted = dark ? "#9a9a9a" : "#6b7280";
  const txtFaint = dark ? "#555555" : "#9ca3af";
  const btnBg    = dark ? "#ffffff" : "#111111";
  const btnTxt   = dark ? "#111111" : "#ffffff";
  const iconBox  = dark ? "#252525" : "#ebebeb";

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 44px 11px 14px", boxSizing: "border-box",
    borderRadius: 10, border: `1px solid ${border}`,
    background: inputBg, color: txtMain, fontSize: 14,
    fontFamily: "inherit", outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  return (
    <div style={{ minHeight: "100dvh", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", transition: "background 0.2s" }}>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        style={{ position: "fixed", top: 16, right: 16, width: 34, height: 34, borderRadius: 9, border: `1px solid ${border}`, background: cardBg, color: txtMuted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
      >
        {dark ? <Sun size={14} /> : <Moon size={14} />}
      </button>

      <div style={{ width: "100%", maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "#5B57E8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Image src="/hub-logo.png" alt="FroptyHub" width={22} height={22} style={{ borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 19, fontWeight: 800, color: txtMain, letterSpacing: "-0.03em" }}>FroptyHub</span>
        </div>

        {/* Título */}
        {mode === "login" ? (
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h1 style={{ margin: "0 0 8px", fontSize: "1.45rem", fontWeight: 800, color: txtMain, letterSpacing: "-0.03em" }}>
              Entrar na sua conta
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: txtMuted }}>
              Bem-vindo de volta! Insira seus dados.
            </p>
          </div>
        ) : (
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <button onClick={() => changeMode("login")} style={{ background: "none", border: "none", cursor: "pointer", color: txtMuted, padding: "0 0 14px", display: "flex", alignItems: "center", gap: 5, fontSize: 12, margin: "0 auto", fontFamily: "inherit", fontWeight: 600 }}>
              <ArrowLeft size={13} /> Voltar
            </button>
            <h1 style={{ margin: "0 0 8px", fontSize: "1.35rem", fontWeight: 800, color: txtMain, letterSpacing: "-0.03em" }}>
              Recuperar senha
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: txtMuted }}>
              Enviaremos um link para criar uma nova senha.
            </p>
          </div>
        )}

        {/* Card */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: "28px 24px", boxShadow: dark ? "0 8px 40px rgba(0,0,0,0.5)" : "0 4px 24px rgba(0,0,0,0.07)" }}>
          <form
            {...(mode === "login"
              ? { method: "post" as const, action: "/api/login", onSubmit: () => setLoginSubmitting(true) }
              : { onSubmit: handleResetSubmit })}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >

            {/* E-mail */}
            <div>
              <label style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: txtMain, marginBottom: 7 }}>E-mail</label>
              <div style={{ position: "relative" }}>
                <input name="email" type="email" required autoComplete="email" placeholder="voce@email.com" style={inputStyle} />
                <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 26, height: 26, borderRadius: 7, background: iconBox, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={txtFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                </div>
              </div>
            </div>

            {/* Senha */}
            {mode === "login" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <label style={{ fontSize: 13.5, fontWeight: 600, color: txtMain }}>Senha</label>
                  <button type="button" onClick={() => changeMode("reset")} style={{ fontSize: 12.5, fontWeight: 600, color: "#5B57E8", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                    Esqueceu?
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <input name="password" type={showPwd ? "text" : "password"} required autoComplete="current-password" placeholder="••••••••••" style={inputStyle} />
                  <button type="button" onClick={() => setShowPwd(p => !p)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 26, height: 26, borderRadius: 7, background: iconBox, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", padding: 0 }}>
                    {showPwd ? <EyeOff size={13} color={txtFaint} /> : <Eye size={13} color={txtFaint} />}
                  </button>
                </div>
              </div>
            )}

            {/* Erro / Sucesso */}
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 13px", borderRadius: 10, background: dark ? "rgba(220,38,38,0.12)" : "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.22)", color: "#DC2626", fontSize: 13 }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}
            {success && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 13px", borderRadius: 10, background: dark ? "rgba(34,197,94,0.10)" : "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.22)", color: "#16a34a", fontSize: 13 }}>
                <CheckCircle size={14} style={{ flexShrink: 0 }} /> {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={isLoading}
              style={{ marginTop: 2, padding: "13px 0", borderRadius: 10, border: "none", background: isLoading ? (dark ? "#2a2a2a" : "#d1d5db") : btnBg, color: isLoading ? txtMuted : btnTxt, fontWeight: 700, fontSize: 15, cursor: isLoading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.15s" }}
            >
              {isLoading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Aguarde…</> : mode === "login" ? "Entrar" : "Enviar link de recuperação"}
            </button>
          </form>

          {/* Divider OR */}
          {mode === "login" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
                <div style={{ flex: 1, height: 1, background: border, borderStyle: "dashed", borderWidth: "1px 0 0 0", borderColor: border }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: txtFaint, whiteSpace: "nowrap" }}>OU</span>
                <div style={{ flex: 1, height: 1, background: border, borderStyle: "dashed", borderWidth: "1px 0 0 0", borderColor: border }} />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={() => handleOAuth("google")}
                disabled={!!oauthLoading}
                style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: `1px solid ${border}`, background: "transparent", color: txtMain, fontWeight: 600, fontSize: 14, cursor: oauthLoading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10, transition: "background 0.15s", opacity: oauthLoading === "google" ? 0.6 : 1 }}
                onMouseEnter={e => { if (!oauthLoading) e.currentTarget.style.background = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                {oauthLoading === "google" ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <GoogleIcon />}
                Continuar com Google
              </button>

              {/* Apple — habilitado quando credenciais Apple Developer forem configuradas */}
            </>
          )}
        </div>

        {/* Footer */}
        <p style={{ marginTop: 18, fontSize: 12, color: txtFaint, textAlign: "center" }}>
          Ao continuar você concorda com os{" "}
          <Link href="/termos" style={{ color: txtMuted, textDecoration: "underline" }}>Termos</Link>
          {" "}e{" "}
          <Link href="/privacidade" style={{ color: txtMuted, textDecoration: "underline" }}>Privacidade</Link>.
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: ${txtFaint}; }
        input:focus { outline: none; border-color: #5B57E8 !important; box-shadow: 0 0 0 3px rgba(91,87,232,0.15); }
      `}</style>
    </div>
  );
}
