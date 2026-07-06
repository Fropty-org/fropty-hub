"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/browser";
import { ShieldCheck, Loader2, ArrowRight } from "lucide-react";

export default function MFAChallengePagee() {
  const router = useRouter();
  const [code,    setCode]    = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    if (code.length !== 6) { setError("Digite o código de 6 dígitos."); return; }
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totp = factors?.totp?.find(f => f.factor_type === "totp" && f.status === "verified");
    if (!totp) { setError("Nenhum fator 2FA encontrado."); setLoading(false); return; }

    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId: totp.id });
    if (cErr || !challenge) { setError("Erro ao criar desafio. Tente novamente."); setLoading(false); return; }

    const { error: vErr } = await supabase.auth.mfa.verify({ factorId: totp.id, challengeId: challenge.id, code });
    if (vErr) { setError("Código incorreto. Tente novamente."); setLoading(false); return; }

    router.replace("/portal/dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 20 }}>
      <div className="hub-card" style={{ width: "100%", maxWidth: 380, padding: "36px 32px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={22} color="#6366f1" />
          </div>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--text)" }}>Verificação em dois fatores</h1>
            <p style={{ margin: "6px 0 0", fontSize: "13px", color: "var(--text-faint)", lineHeight: 1.5 }}>
              Abra o Google Authenticator e insira o código de 6 dígitos.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={e => e.key === "Enter" && handleVerify()}
            placeholder="000 000"
            maxLength={6}
            autoFocus
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 10,
              border: `1px solid ${error ? "#ef4444" : "var(--border)"}`,
              background: "var(--surface)", color: "var(--text)",
              fontSize: 24, letterSpacing: "0.3em", fontFamily: "monospace",
              textAlign: "center", outline: "none", boxSizing: "border-box",
            }}
          />

          {error && <p style={{ margin: 0, fontSize: "12px", color: "#ef4444", textAlign: "center" }}>{error}</p>}

          <button
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            style={{
              width: "100%", padding: "12px", borderRadius: 10, border: "none",
              background: code.length === 6 ? "var(--cta-bg)" : "var(--surface-2)",
              color: code.length === 6 ? "var(--cta-text)" : "var(--text-muted)",
              fontSize: "14px", fontWeight: 700, cursor: code.length !== 6 || loading ? "not-allowed" : "pointer",
              fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: loading ? 0.7 : 1, transition: "all 0.15s",
            }}
          >
            {loading ? <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : <ArrowRight size={15} />}
            {loading ? "Verificando…" : "Confirmar acesso"}
          </button>

          <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)", textAlign: "center", lineHeight: 1.6 }}>
            Sem acesso ao autenticador?{" "}
            <a href="/area-cliente" style={{ color: "var(--text-muted)", textDecoration: "underline" }}>
              Voltar ao login
            </a>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
