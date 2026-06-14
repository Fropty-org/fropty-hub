import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a Fropty Apps. Tire dúvidas, solicite orçamento ou envie uma mensagem direta.",
};

const CHANNELS = [
  {
    icon: "ti-brand-whatsapp",
    color: "#22c55e",
    title: "WhatsApp",
    desc: "Resposta mais rápida. Fale diretamente com nossa equipe.",
    label: "Abrir conversa",
    href: "https://wa.me/5500000000000",
    external: true,
  },
  {
    icon: "ti-mail",
    color: "var(--primary)",
    title: "E-mail",
    desc: "Para dúvidas detalhadas ou envio de arquivos e referências.",
    label: "contato@fropty.com",
    href: "mailto:contato@fropty.com",
    external: false,
  },
  {
    icon: "ti-settings",
    color: "var(--accent)",
    title: "Configurador",
    desc: "A forma mais rápida de receber um orçamento personalizado.",
    label: "Montar meu plano",
    href: "/configurador",
    external: false,
  },
];

export default function ContatoPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <Navbar />

      <section style={{ padding: "80px 24px 100px", textAlign: "center" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <span className="section-chip" style={{ marginBottom: 24, display: "inline-flex" }}>
            <i className="ti ti-headset" /> Contato
          </span>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.75rem)", fontWeight: 800, marginBottom: 16, letterSpacing: "-0.02em" }}>
            Fale com a gente
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: 64 }}>
            Escolha o canal que preferir. Respondemos todos os dias, geralmente em menos de algumas horas.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, textAlign: "left" }}>
            {CHANNELS.map(({ icon, color, title, desc, label, href, external }) => (
              <div
                key={title}
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 16,
                  padding: 28,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `${color}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className={`ti ${icon}`} style={{ fontSize: 24, color }} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, marginBottom: 6, fontSize: "1.05rem" }}>{title}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>{desc}</p>
                </div>
                <Link
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  style={{
                    marginTop: "auto",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    textDecoration: "none",
                  }}
                >
                  {label}
                  <i className="ti ti-arrow-right" style={{ fontSize: 14 }} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
