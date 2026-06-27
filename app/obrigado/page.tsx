import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Pedido enviado!",
  description: "Recebemos seu pedido de orçamento. Entraremos em contato em breve.",
  robots: { index: false, follow: false },
};

export default function ObrigadoPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 48, textDecoration: "none" }}>
          <Image src="/logo-icon.png" alt="Fropty Apps" width={32} height={32} className="rounded-md" />
          <span style={{ fontWeight: 700, color: "var(--text)" }}>
            Fropty<span style={{ color: "var(--primary)" }}>Apps</span>
          </span>
        </Link>

        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(34,197,94,0.15)",
            border: "1px solid rgba(34,197,94,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <CheckCircle size={32} style={{ color: "#22c55e" }} />
        </div>

        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 12 }}>
          Pedido recebido!
        </h1>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32, fontSize: "1.05rem" }}>
          Obrigado pelo seu interesse na Fropty Apps. Analisaremos seu pedido e entraremos em
          contato em até <strong style={{ color: "var(--text)" }}>1 dia útil</strong> com o orçamento personalizado.
        </p>

        <div
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: 16,
            padding: "20px 24px",
            marginBottom: 32,
            textAlign: "left",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
            <Mail size={16} style={{ color: "var(--primary)", marginRight: 8 }} />
            Você receberá uma cópia do pedido no email informado.
            Verifique também a caixa de spam, caso não chegue em alguns minutos.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              background: "var(--cta-bg)",
              color: "var(--cta-text)",
              padding: "11px 22px",
              borderRadius: 10,
              fontWeight: 700,
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            Voltar ao início
          </Link>
          <Link
            href="/configurador"
            style={{
              background: "var(--surface)",
              color: "var(--text)",
              padding: "11px 22px",
              borderRadius: 10,
              fontWeight: 600,
              textDecoration: "none",
              fontSize: "0.9rem",
              border: "1px solid var(--border)",
            }}
          >
            Ajustar meu plano
          </Link>
        </div>
      </div>
    </main>
  );
}
