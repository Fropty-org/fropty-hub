import type { Metadata } from "next";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { PortfolioGrid } from "../components/PortfolioGrid";

export const metadata: Metadata = {
  title: "Portfólio",
  description: "Veja exemplos de apps desenvolvidos pela Fropty Apps — saúde, comércio, serviços, educação e gestão.",
};

export default function PortfolioPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <Navbar />

      <section style={{ padding: "80px 24px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <span className="section-chip" style={{ marginBottom: 24, display: "inline-flex" }}>
            <i className="ti ti-layout-grid" /> Portfólio
          </span>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.75rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              marginBottom: 16,
            }}
          >
            Apps que já entregamos
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", lineHeight: 1.7 }}>
            Exemplos reais de soluções construídas sob medida. Cada projeto começa com uma
            conversa — e termina com um app que funciona de verdade.
          </p>
        </div>
      </section>

      <PortfolioGrid />

      {/* CTA */}
      <section style={{ padding: "40px 24px 100px", textAlign: "center" }}>
        <div
          style={{
            maxWidth: 560,
            margin: "0 auto",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: "48px 32px",
          }}
        >
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 12 }}>
            Sua ideia pode ser a próxima
          </h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 28 }}>
            Comece com uma prévia gratuita. Configure seu plano e receba um orçamento em minutos.
          </p>
          <a
            href="/configurador"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--cta-bg)",
              color: "var(--cta-text)",
              padding: "12px 24px",
              borderRadius: 12,
              fontWeight: 700,
              textDecoration: "none",
              fontSize: "0.95rem",
            }}
          >
            <i className="ti ti-rocket" />
            Configurar meu app
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
