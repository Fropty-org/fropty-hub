"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ShieldCheck, X } from "lucide-react";

/**
 * Toast leve do FroptySentinel a cada 5 min, passando a sensação de segurança
 * ("nenhum problema encontrado"). Hoje é apenas visual — a varredura real será
 * plugada depois (o texto/estado virá de uma checagem de verdade).
 */
const INTERVAL_MS = 5 * 60 * 1000; // 5 min
const VISIBLE_MS  = 6000;
const FIRST_MS    = 20 * 1000;     // primeira aparição ~20s após entrar

const MESSAGES = [
  "Nenhum problema encontrado na sua conta.",
  "Sessão e acesso verificados — tudo certo.",
  "Varredura concluída: nenhuma ameaça detectada.",
];

export function SentinelHeartbeat() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState(MESSAGES[0]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;
    function ping() {
      setMsg(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
      setShow(true);
      hideTimer = setTimeout(() => setShow(false), VISIBLE_MS);
    }
    const first = setTimeout(ping, FIRST_MS);
    const interval = setInterval(ping, INTERVAL_MS);
    return () => { clearTimeout(first); clearTimeout(hideTimer); clearInterval(interval); };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      style={{
        position: "fixed", bottom: 20, right: 20, zIndex: 2500,
        display: "flex", alignItems: "center", gap: 11,
        maxWidth: 320, padding: "12px 14px",
        background: "var(--surface-elevated, var(--card-bg))",
        border: "1px solid color-mix(in srgb, #ef4444 22%, var(--border))",
        borderRadius: 12, boxShadow: "var(--shadow-dropdown, 0 12px 32px rgba(0,0,0,0.22))",
        transform: show ? "translateY(0)" : "translateY(140%)",
        opacity: show ? 1 : 0,
        transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s",
        pointerEvents: show ? "auto" : "none",
      }}
    >
      <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "color-mix(in srgb, #ef4444 10%, transparent)" }}>
        <Image src="/sentinel-logo.png" alt="" width={18} height={18} style={{ objectFit: "contain" }} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ margin: 0, fontSize: "12px", fontWeight: 800, color: "var(--text)", display: "flex", alignItems: "center", gap: 5 }}>
          FroptySentinel <ShieldCheck size={12} style={{ color: "var(--c-success)" }} />
        </p>
        <p style={{ margin: "1px 0 0", fontSize: "11.5px", color: "var(--text-muted)", lineHeight: 1.35 }}>{msg}</p>
      </div>
      <button type="button" onClick={() => setShow(false)} aria-label="Fechar" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", display: "flex", flexShrink: 0 }}>
        <X size={14} />
      </button>
    </div>,
    document.body,
  );
}
