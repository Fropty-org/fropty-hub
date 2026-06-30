"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/app/lib/supabase/browser";
import { ShineBorder } from "@/app/components/ShineBorder";
import { RainbowButton } from "@/app/components/RainbowButton";
import { ArrowLeft, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";

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
  const [isDark, setIsDark]   = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const themeRef              = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const saved = (localStorage.getItem("fropty-theme") ?? "dark") as "dark" | "light";
    setIsDark(saved === "dark");
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  function toggleTheme() {
    const next = !isDark;

    const apply = () => {
      setIsDark(next);
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("fropty-theme", next ? "dark" : "light");
    };

    if (
      !themeRef.current ||
      !("startViewTransition" in document) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      apply();
      return;
    }

    const { top, left, width, height } = themeRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vt = (document as any).startViewTransition(apply);
    vt.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`] },
        { duration: 500, easing: "ease-in", pseudoElement: "::view-transition-new(root)" }
      );
    });
  }

  function changeMode(m: Mode) { setMode(m); setError(null); setSuccess(null); }

  async function handleOAuth(provider: "google") {
    setOauthLoading(provider);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/oauth-callback?next=/portal/dashboard`,
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
  const dark = isDark;

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

      {/* Theme toggle — mesmo efeito circular do painel */}
      <button
        ref={themeRef}
        onClick={toggleTheme}
        aria-label="Alternar tema"
        style={{ position: "fixed", top: 16, right: 16, width: 34, height: 34, borderRadius: 9, border: `1px solid ${border}`, background: cardBg, color: txtMuted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, overflow: "hidden" }}
      >
        {/* Sun */}
        <span aria-hidden="true" style={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center", willChange: "transform, opacity", transform: dark ? "rotate(90deg) scale(0.4)" : "rotate(0deg) scale(1)", opacity: dark ? 0 : 1, transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        </span>
        {/* Moon */}
        <span aria-hidden="true" style={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center", willChange: "transform, opacity", transform: dark ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.4)", opacity: dark ? 1 : 0, transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </span>
      </button>

      <div style={{ width: "100%", maxWidth: 380 }}>

        {/* Card */}
        <ShineBorder
          borderRadius={16}
          borderWidth={1.5}
          duration={8}
          shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
        >
        <div style={{ background: cardBg, borderRadius: 16, padding: "28px 24px", boxShadow: dark ? "0 8px 40px rgba(0,0,0,0.5)" : "0 4px 24px rgba(0,0,0,0.07)" }}>

          {/* Logo dentro do card */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 24 }}>
            <Image src="/favicon.svg" alt="Fropty Hub" width={36} height={36} unoptimized />
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em" }}>
              <span style={{ color: txtMain }}>Fropty </span>
              <span style={{ background: "linear-gradient(90deg,#e040fb,#7c3aed,#2563eb,#16a34a,#ea580c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Hub</span>
            </span>
          </div>

          {/* Título */}
          {mode === "login" ? (
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <h1 style={{ margin: "0 0 6px", fontSize: "1.3rem", fontWeight: 800, color: txtMain, letterSpacing: "-0.03em" }}>
                Entrar na sua conta
              </h1>
              <p style={{ margin: 0, fontSize: 13.5, color: txtMuted }}>
                Bem-vindo de volta! Insira seus dados.
              </p>
            </div>
          ) : (
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <button onClick={() => changeMode("login")} style={{ background: "none", border: "none", cursor: "pointer", color: txtMuted, padding: "0 0 12px", display: "flex", alignItems: "center", gap: 5, fontSize: 12, margin: "0 auto", fontFamily: "inherit", fontWeight: 600 }}>
                <ArrowLeft size={13} /> Voltar
              </button>
              <h1 style={{ margin: "0 0 6px", fontSize: "1.2rem", fontWeight: 800, color: txtMain, letterSpacing: "-0.03em" }}>
                Recuperar senha
              </h1>
              <p style={{ margin: 0, fontSize: 13.5, color: txtMuted }}>
                Enviaremos um link para criar uma nova senha.
              </p>
            </div>
          )}
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
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={txtFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
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
              type="submit"
              disabled={isLoading}
              style={{ width: "100%", marginTop: 2, padding: "12px 0", borderRadius: 10, border: "none", background: dark ? "#ffffff" : "#111111", color: dark ? "#111111" : "#ffffff", fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "opacity 0.15s" }}
            >
              {isLoading
                ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Aguarde…</>
                : mode === "login" ? "Entrar" : "Enviar link de recuperação"}
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
                style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: `1px solid ${border}`, background: "transparent", color: txtMain, fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: oauthLoading ? "not-allowed" : "pointer", opacity: oauthLoading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "opacity 0.15s, background 0.15s" }}
                onMouseEnter={e => { if (!oauthLoading) (e.currentTarget as HTMLButtonElement).style.background = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"; }}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
              >
                {oauthLoading === "google"
                  ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  : <GoogleIcon />}
                Continuar com Google
              </button>

              {/* Apple — habilitado quando credenciais Apple Developer forem configuradas */}
            </>
          )}
        </div>
        </ShineBorder>

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
