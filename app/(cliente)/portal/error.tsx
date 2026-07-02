"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

/**
 * Error boundary do portal do cliente. Renderiza DENTRO do shell do portal
 * (sidebar + header preservados), diferente do error.tsx global. Irmão dos
 * loading.tsx: garante que um throw em qualquer rota /portal/* degrade com
 * contexto, não caindo para a tela de erro global fora do shell.
 */
export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[portal/error]", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "64px 24px",
        minHeight: "60vh",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          background: "var(--c-danger-bg)",
          border: "1px solid rgba(220,38,38,0.25)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <AlertTriangle size={24} style={{ color: "var(--c-danger)" }} />
      </div>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text)", margin: "0 0 8px" }}>
        Não foi possível carregar esta página
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 360, margin: "0 0 28px" }}>
        Ocorreu um erro inesperado ao abrir esta seção. Você pode tentar de novo
        ou voltar ao painel.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={reset} className="hub-btn hub-btn-ghost">
          Tentar novamente
        </button>
        <Link href="/portal/dashboard" className="hub-btn hub-btn-primary">
          Voltar ao painel
        </Link>
      </div>
    </div>
  );
}
