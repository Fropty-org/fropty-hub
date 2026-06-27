"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Lock } from "lucide-react";

/**
 * Overlay "scanner" do FroptySentinel exibido enquanto a senha é validada
 * (força + checagem de vazamento). Puramente visual — a validação real roda
 * no servidor; aqui damos a sensação de uma varredura de segurança.
 */
export function SentinelScan({ active }: { active: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted || !active) return null;

  return createPortal(
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 3000,
        background: "rgba(4,3,22,0.6)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        animation: "fadeIn 0.15s ease",
      }}
    >
      <div style={{
        width: "100%", maxWidth: 360, textAlign: "center",
        background: "var(--card-bg)", border: "1px solid var(--card-border)",
        borderRadius: 20, padding: "34px 28px", boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
      }}>
        <div style={{
          width: 64, height: 64, margin: "0 auto 18px",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "sentinelPulse 1.2s ease-in-out infinite",
        }}>
          <Image src="/sentinel-logo.png" alt="FroptySentinel" width={64} height={64} style={{ objectFit: "contain" }} />
        </div>
        <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 800, color: "var(--text)" }}>
          FroptySentinel
        </p>
        <p style={{ margin: "0 0 20px", fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Verificando a segurança da sua senha…
        </p>
        <div style={{ height: 8, background: "var(--surface-2)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg, #ef4444, #b91c1c)", borderRadius: 99, animation: "sentinelScan 2.4s ease-in-out forwards" }} />
        </div>
        <p style={{ margin: "12px 0 0", fontSize: "11px", color: "var(--text-faint)" }}>
          <Lock size={14} style={{ marginRight: 5 }} />
          Analisando força e exposição em vazamentos conhecidos
        </p>
      </div>
    </div>,
    document.body,
  );
}
