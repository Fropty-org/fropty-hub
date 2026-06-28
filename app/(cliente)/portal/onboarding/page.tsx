"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/actions/profile";
import { completeOnboarding } from "@/app/actions/onboarding";
import { Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function OnboardingPage() {
  const [name, setName]       = useState("");
  const [error, setError]     = useState<string | null>(null);
  const [isPending, start]    = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const profileResult = await updateProfile(fd);
      if (profileResult.error) { setError(profileResult.error); return; }
      await completeOnboarding();
      window.location.href = "/portal/dashboard";
    });
  }

  return (
    <div style={{
      minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px", background: "var(--bg)",
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <Image src="/logo-icon.png" alt="Fropty Hub" width={48} height={48} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)" }}>
            Fropty <span style={{ background: "linear-gradient(90deg,#9333ea,#3b82f6,#22c55e,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Hub</span>
          </span>
        </div>

        {/* Header */}
        <h1 style={{ margin: "0 0 8px", fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>
          Bem-vindo ao FroptyHub!
        </h1>
        <p style={{ margin: "0 0 32px", fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6 }}>
          Antes de começar, como posso te chamar? Isso aparecerá no seu perfil e nas comunicações da Fropty.
        </p>

        {/* Card */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 16, padding: "28px 24px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{
                display: "block", fontSize: "11px", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.06em",
                color: "var(--text-faint)", marginBottom: 8,
              }}>
                Seu nome
              </label>
              <input
                name="name"
                type="text"
                required
                maxLength={100}
                autoFocus
                placeholder="Ex: João Silva"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "11px 14px", borderRadius: 10,
                  border: "1px solid var(--border)", background: "var(--surface-2)",
                  color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none",
                }}
                onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                onBlur={e  => e.currentTarget.style.borderColor = "var(--border)"}
              />
            </div>

            {error && (
              <p style={{ margin: 0, fontSize: "13px", color: "var(--c-danger)", padding: "8px 12px", background: "var(--c-danger-bg)", borderRadius: 8, border: "1px solid rgba(220,38,38,0.2)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending || !name.trim()}
              style={{
                marginTop: 4, padding: "13px 0", borderRadius: 10, border: "none",
                background: isPending || !name.trim() ? "var(--border)" : "#ffffff",
                color: isPending || !name.trim() ? "var(--text-faint)" : "#111111",
                fontWeight: 700, fontSize: 15, cursor: isPending || !name.trim() ? "not-allowed" : "pointer",
                fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 0.15s",
              }}
            >
              {isPending
                ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Salvando…</>
                : <>Entrar no Hub <ArrowRight size={16} /></>
              }
            </button>
          </form>
        </div>

        <p style={{ marginTop: 16, fontSize: "12px", color: "var(--text-faint)", textAlign: "center" }}>
          Você pode alterar seu nome a qualquer momento em{" "}
          <a href="/portal/perfil" style={{ color: "var(--text-muted)", textDecoration: "underline" }}>Meu Perfil</a>.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
