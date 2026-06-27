"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[area-cliente] error:", error.message);
  }, [error]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", color: "var(--text)", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: 440, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <AlertTriangle size={30} style={{ color: "#ef4444" }} />
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 12 }}>Algo deu errado</h1>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 28 }}>
          Ocorreu um erro ao carregar esta página. Tente novamente ou volte para a página inicial.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{ background: "var(--cta-bg)", color: "var(--cta-text)", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}
          >
            <RefreshCw size={14} style={{ marginRight: 6 }} />
            Tentar novamente
          </button>
          <Link
            href="/"
            style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 20px", fontWeight: 600, fontSize: "14px", textDecoration: "none" }}
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
