import type { Metadata } from "next";
import Link from "next/link";
import { MOCK_USER } from "../../lib/data/mockCliente";
import { ClientSidebar } from "../../components/cliente/ClientSidebar";

export const metadata: Metadata = {
  title: "Meus Tokens",
  robots: { index: false, follow: false },
};

export default function TokensPage() {
  const user = MOCK_USER; // TODO: substituir por getServerSideUser() com Supabase

  const planLabel = user.plan === "pro" ? "Pro (8 tokens/mês)" : "Básico (4 tokens/mês)";
  const planPrice = user.plan === "pro" ? "R$ 89,90" : "R$ 49,90";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <ClientSidebar user={user} active="tokens" />

      <main style={{ flex: 1, padding: "40px 32px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 6px" }}>Tokens</h1>
          <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.95rem" }}>
            Cada token equivale a uma hora de trabalho de desenvolvimento ou suporte.
          </p>
        </div>

        {/* Balance card */}
        <div
          style={{
            background: "linear-gradient(135deg, var(--brand-800) 0%, var(--brand-600) 100%)",
            borderRadius: 18,
            padding: "28px 28px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div>
            <p style={{ margin: "0 0 8px", fontSize: "13px", color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Saldo disponível
            </p>
            <p style={{ margin: 0, fontSize: "3rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
              {user.tokenBalance}
              <span style={{ fontSize: "1rem", fontWeight: 500, marginLeft: 8, opacity: 0.7 }}>tokens</span>
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: "0 0 4px", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>Plano atual</p>
            <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: "#fff" }}>{planLabel}</p>
            <p style={{ margin: "0 0 12px", fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>{planPrice}/mês</p>
            <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
              Renovação: {user.planRenewal ? new Date(user.planRenewal).toLocaleDateString("pt-BR") : "—"}
            </p>
          </div>
        </div>

        {/* Info boxes */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "18px 20px" }}>
            <p style={{ margin: "0 0 4px", fontSize: "12px", color: "var(--text-faint)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              1 token equivale a
            </p>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6 }}>
              1 hora de dev, correção de bug, nova feature pequena ou ajuste de layout
            </p>
          </div>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "18px 20px" }}>
            <p style={{ margin: "0 0 4px", fontSize: "12px", color: "var(--text-faint)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Token avulso
            </p>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6 }}>
              R$ 300,00 por token fora do plano.<br />
              <span style={{ color: "var(--primary)", fontWeight: 600 }}>Assinante economiza 50%.</span>
            </p>
          </div>
        </div>

        {/* CTA comprar token avulso */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "20px 24px",
            marginBottom: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "0.95rem" }}>Precisa de mais tokens?</p>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
              Compre tokens avulsos por R$ 150,00 cada (preço de assinante).
            </p>
          </div>
          <a
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--cta-bg)",
              color: "var(--cta-text)",
              padding: "10px 20px",
              borderRadius: 10,
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            <i className="ti ti-brand-whatsapp" />
            Comprar via WhatsApp
          </a>
        </div>

        {/* History */}
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Histórico</h2>
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16, overflow: "hidden" }}>
          {user.tokenHistory.map((tx, i) => (
            <div
              key={tx.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: i < user.tokenHistory.length - 1 ? "1px solid var(--border)" : "none",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: tx.type === "credit" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <i
                    className={`ti ${tx.type === "credit" ? "ti-arrow-down" : "ti-arrow-up"}`}
                    style={{ fontSize: 16, color: tx.type === "credit" ? "#22c55e" : "#ef4444" }}
                  />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 600 }}>{tx.description}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--text-faint)" }}>
                    {new Date(tx.date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "14px", color: tx.type === "credit" ? "#22c55e" : "#ef4444" }}>
                  {tx.type === "credit" ? "+" : "-"}{tx.amount} token{tx.amount !== 1 ? "s" : ""}
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>
                  Saldo: {tx.balance}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
