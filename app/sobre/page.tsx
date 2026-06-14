import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { SITE_URL } from "../lib/config";

export const metadata: Metadata = {
  title: "Sobre",
  description: "Conheça a Fropty Apps — quem somos, nossa missão e como transformamos ideias em aplicativos reais.",
  openGraph: {
    title: "Sobre a Fropty Apps",
    description: "Conheça a Fropty Apps — quem somos, nossa missão e como transformamos ideias em aplicativos reais.",
    url: `${SITE_URL}/sobre`,
    siteName: "Fropty Apps",
    locale: "pt_BR",
    type: "website",
  },
};

const VALUES = [
  { icon: "ti-heart", title: "Foco no cliente", text: "Cada app é construído com atenção às necessidades reais do seu negócio, não a templates prontos." },
  { icon: "ti-shield-check", title: "Transparência total", text: "Você vê o progresso em tempo real. Sem surpresas no prazo, no preço ou no que será entregue." },
  { icon: "ti-bolt", title: "Entrega rápida", text: "Prévia funcional em dias, não meses. Iteramos rápido para que você teste e valide logo de cara." },
  { icon: "ti-headset", title: "Suporte contínuo", text: "Após a entrega, os planos de manutenção garantem que seu app evolua junto com o seu negócio." },
];

export default function SobrePage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: "80px 24px 60px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <span className="section-chip" style={{ marginBottom: 24, display: "inline-flex" }}>
            <i className="ti ti-info-circle" /> Sobre nós
          </span>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              marginBottom: 20,
            }}
          >
            Seu app sob medida,<br />
            <span style={{ color: "var(--primary)" }}>do jeito certo</span>
          </h1>
          <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
            A Fropty Apps nasceu para resolver um problema real: empreendedores com ideias brilhantes
            que não conseguem transformá-las em software por falta de tempo, dinheiro ou conhecimento técnico.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: "0 24px 80px" }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: 20,
            padding: "48px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "center",
          }}
          className="sm:grid-cols-2"
        >
          <div>
            <span className="section-chip" style={{ marginBottom: 20, display: "inline-flex" }}>
              <i className="ti ti-target" /> Nossa missão
            </span>
            <p style={{ fontSize: "1.05rem", color: "var(--text-muted)", lineHeight: 1.8, margin: 0 }}>
              Democratizar o desenvolvimento de software. Qualquer pessoa com uma boa ideia — seja um
              prestador de serviços autônomo, um pequeno comerciante ou uma startup — merece ter um
              app profissional sem precisar contratar uma equipe inteira ou gastar fortunas.
            </p>
            <p style={{ fontSize: "1.05rem", color: "var(--text-muted)", lineHeight: 1.8, marginTop: 16, marginBottom: 0 }}>
              Com a Fropty, você começa com uma prévia gratuita, decide se quer continuar, e só paga
              o app completo quando tiver certeza.
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Image
              src="/logo-icon.png"
              alt="Fropty Apps"
              width={180}
              height={180}
              style={{ borderRadius: 24, opacity: 0.9 }}
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span className="section-chip" style={{ marginBottom: 16, display: "inline-flex" }}>
              <i className="ti ti-star" /> Nossos valores
            </span>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 700, margin: "12px 0 0" }}>
              O que nos guia em cada projeto
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            {VALUES.map(({ icon, title, text }) => (
              <div
                key={title}
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "rgba(91,87,232,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <i className={`ti ${icon}`} style={{ fontSize: 22, color: "var(--primary)" }} />
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: "1rem" }}>{title}</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "0 24px 100px", textAlign: "center" }}>
        <div
          style={{
            maxWidth: 600,
            margin: "0 auto",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: "48px 32px",
          }}
        >
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 16 }}>
            Pronto para começar?
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 28, lineHeight: 1.7 }}>
            A prévia é gratuita e sem compromisso. Configure seu plano agora e receba um orçamento em minutos.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/configurador"
              style={{
                background: "var(--cta-bg)",
                color: "var(--cta-text)",
                padding: "12px 24px",
                borderRadius: 12,
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "0.95rem",
              }}
            >
              Configurar meu plano
            </Link>
            <Link
              href="/#faq"
              style={{
                background: "var(--surface-2)",
                color: "var(--text)",
                padding: "12px 24px",
                borderRadius: 12,
                fontWeight: 600,
                textDecoration: "none",
                fontSize: "0.95rem",
                border: "1px solid var(--border)",
              }}
            >
              Ver perguntas frequentes
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
