import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "../components/cliente/LoginForm";

export const metadata: Metadata = {
  title: "Área do Cliente",
  description: "Acesse sua conta Fropty Apps e acompanhe o desenvolvimento do seu projeto.",
  robots: { index: false, follow: false },
};

export default function AreaClientePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 40, textDecoration: "none" }}>
        <Image src="/logo-icon.png" alt="Fropty Apps" width={32} height={32} className="rounded-md" />
        <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text)" }}>
          Fropty<span style={{ color: "var(--primary)" }}>Apps</span>
        </span>
      </Link>

      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          borderRadius: 20,
          padding: "36px 32px",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6, textAlign: "center" }}>
          Área do Cliente
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", marginBottom: 28 }}>
          Acompanhe seu projeto e gerencie seus tokens
        </p>

        <LoginForm />

        <p style={{ marginTop: 24, fontSize: "0.8rem", color: "var(--text-faint)", textAlign: "center" }}>
          Ainda não tem conta?{" "}
          <Link href="/configurador" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
            Configure seu plano
          </Link>
        </p>
      </div>

      {/* Demo notice */}
      <div
        style={{
          marginTop: 20,
          padding: "10px 16px",
          background: "rgba(91,87,232,0.1)",
          border: "1px solid rgba(91,87,232,0.2)",
          borderRadius: 10,
          fontSize: "12px",
          color: "var(--text-muted)",
          maxWidth: 420,
          textAlign: "center",
        }}
      >
        <i className="ti ti-info-circle" style={{ color: "var(--primary)", marginRight: 6 }} />
        Modo demonstração — use qualquer email e senha para entrar
      </div>
    </main>
  );
}
