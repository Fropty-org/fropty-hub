"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { signOut } from "@/app/actions/auth";
import { ShieldAlert, Loader2, Clock } from "lucide-react";

/**
 * Guardião de sessão por inatividade (idle timeout).
 *
 * - Sessão expira após IDLE_MS de inatividade (sem mouse/teclado/scroll/toque).
 * - Qualquer atividade reinicia a contagem (compartilhada entre abas via localStorage).
 * - Nos últimos WARNING_MS segundos aparece um modal perguntando se a pessoa
 *   segue por ali, com botão para estender. Durante o aviso a atividade passiva
 *   NÃO estende — só o botão — para que "sem resposta" resulte em logout.
 * - Um anel no topbar mostra o tempo restante de sessão.
 */
const IDLE_MS    = 30 * 60 * 1000; // 30 minutos
const WARNING_MS = 30 * 1000;      // aviso nos últimos 30s
const TICK_MS    = 250;
const ACTIVITY_KEY = "hub-session-activity";

function fmt(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export function SessionGuard() {
  const [remaining, setRemaining] = useState(IDLE_MS);
  const [warning, setWarning]     = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const expiredRef = useRef(false);
  const warningRef = useRef(false);
  warningRef.current = warning;

  const bump = useCallback(() => {
    const now = Date.now();
    try { localStorage.setItem(ACTIVITY_KEY, String(now)); } catch {}
  }, []);

  const expire = useCallback(async () => {
    if (expiredRef.current) return;
    expiredRef.current = true;
    setSigningOut(true);
    try { localStorage.removeItem(ACTIVITY_KEY); } catch {}
    try {
      const result = await signOut();
      window.location.href = result?.redirectTo ?? "/area-cliente?expirado=1";
    } catch {
      window.location.href = "/area-cliente?expirado=1";
    }
  }, []);

  const extend = useCallback(() => {
    bump();
    setWarning(false);
    setRemaining(IDLE_MS);
  }, [bump]);

  useEffect(() => {
    // Marco inicial de atividade
    let start = Number(localStorage.getItem(ACTIVITY_KEY));
    if (!start || Number.isNaN(start)) { start = Date.now(); bump(); }

    // Atividade só estende quando o aviso não está na tela
    const onActivity = () => { if (!warningRef.current) bump(); };
    const events: (keyof WindowEventMap)[] = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "wheel"];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    const id = setInterval(() => {
      const la = Number(localStorage.getItem(ACTIVITY_KEY)) || Date.now();
      const rem = IDLE_MS - (Date.now() - la);
      if (rem <= 0) { expire(); return; }
      setRemaining(rem);
      setWarning(rem <= WARNING_MS);
    }, TICK_MS);

    return () => {
      clearInterval(id);
      events.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [bump, expire]);

  const frac    = Math.max(0, Math.min(1, remaining / IDLE_MS));
  const isLow    = remaining <= Math.min(5 * 60 * 1000, IDLE_MS * 0.5);
  const ringColor = warning ? "var(--c-danger)" : isLow ? "var(--c-warning)" : "var(--primary)";

  return (
    <>
      {/* Barra de sessão no topbar (estilo Preline: pill soft + barra fina) */}
      <span
        title={`Sessão expira em ${fmt(remaining)} de inatividade`}
        aria-label={`Tempo de sessão restante: ${fmt(remaining)}`}
        style={{
          display: "inline-flex", alignItems: "center", gap: 7, flexShrink: 0,
          padding: "5px 9px", borderRadius: 999,
          background: `color-mix(in srgb, ${ringColor} 10%, transparent)`,
          border: `1px solid color-mix(in srgb, ${ringColor} 22%, transparent)`,
          transition: "background 0.3s, border-color 0.3s",
        }}
      >
        <Clock size={12} style={{ color: ringColor, flexShrink: 0, transition: "color 0.3s" }} />
        <span style={{ width: 40, height: 5, borderRadius: 999, background: "color-mix(in srgb, var(--text-faint) 22%, transparent)", overflow: "hidden", flexShrink: 0 }}>
          <span style={{ display: "block", height: "100%", width: `${frac * 100}%`, borderRadius: 999, background: ringColor, transition: "width 0.25s linear, background 0.3s" }} />
        </span>
        <span style={{ fontSize: "11px", fontWeight: 700, color: ringColor, fontVariantNumeric: "tabular-nums", lineHeight: 1, minWidth: 34, textAlign: "right", transition: "color 0.3s" }}>
          {fmt(remaining)}
        </span>
      </span>

      {/* Modal de aviso nos últimos 30s */}
      {warning && typeof document !== "undefined" && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="hub-card" style={{ width: "100%", maxWidth: 380, padding: "26px 24px", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "color-mix(in srgb, var(--c-danger) 14%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <ShieldAlert size={26} style={{ color: "var(--c-danger)" }} />
            </div>
            <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 800, color: "var(--text)" }}>Você ainda está aí?</h3>
            <p style={{ margin: "0 0 4px", fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Sua sessão será encerrada por inatividade em
            </p>
            <p style={{ margin: "0 0 18px", fontSize: "30px", fontWeight: 800, color: "var(--c-danger)", fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
              {Math.max(0, Math.ceil(remaining / 1000))}s
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={expire}
                disabled={signingOut}
                style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              >
                Sair agora
              </button>
              <button
                type="button"
                onClick={extend}
                disabled={signingOut}
                style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 9, border: "none", background: "var(--primary)", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
              >
                {signingOut ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : null}
                Continuar conectado
              </button>
            </div>
          </div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>,
        document.body,
      )}
    </>
  );
}
