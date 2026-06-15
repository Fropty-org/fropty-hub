"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100dvh",
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      textAlign: "center",
    }}>
      <div style={{
        width: 56, height: 56,
        background: "rgba(239,68,68,0.12)",
        border: "1px solid rgba(239,68,68,0.25)",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
      }}>
        <i className="ti ti-alert-triangle" style={{ fontSize: 24, color: "#ef4444" }} />
      </div>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text)", margin: "0 0 8px" }}>
        Algo deu errado
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 340, margin: "0 0 28px" }}>
        Ocorreu um erro inesperado. Tente novamente ou volte à página inicial.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={reset}
          style={{
            padding: "10px 22px",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text)",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          style={{
            padding: "10px 22px",
            borderRadius: 10,
            background: "var(--primary)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            textDecoration: "none",
          }}
        >
          Início
        </Link>
      </div>
    </div>
  );
}
