import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MOCK_USER } from "../../lib/data/mockCliente";
import { ProjectCard } from "../../components/cliente/ProjectCard";
import { ClientSidebar } from "../../components/cliente/ClientSidebar";

export const metadata: Metadata = {
  title: "Meu Painel",
  robots: { index: false, follow: false },
};

const STATUS_MAP = {
  aguardando:        { label: "Aguardando início",    color: "#94a3b8", icon: "ti-clock" },
  em_desenvolvimento:{ label: "Em desenvolvimento",   color: "#3b82f6", icon: "ti-code" },
  revisao:           { label: "Em revisão",            color: "#EF9F27", icon: "ti-eye" },
  entregue:          { label: "Entregue",              color: "#22c55e", icon: "ti-circle-check" },
  manutencao:        { label: "Em manutenção",         color: "var(--primary)", icon: "ti-tools" },
};

export default function DashboardPage() {
  const user = MOCK_USER; // TODO: substituir por getServerSideUser() com Supabase

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <ClientSidebar user={user} active="dashboard" />

      <main style={{ flex: 1, padding: "40px 32px", maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ color: "var(--text-faint)", fontSize: "13px", margin: "0 0 4px" }}>
            Bem-vindo de volta,
          </p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>
            {user.name.split(" ")[0]} 👋
          </h1>
        </div>

        {/* Stats strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 16,
            marginBottom: 36,
          }}
        >
          {[
            { icon: "ti-layout-cards", label: "Projetos ativos", value: user.projects.filter(p => p.status !== "entregue").length },
            { icon: "ti-coins", label: "Tokens disponíveis", value: user.tokenBalance },
            { icon: "ti-circle-check", label: "Projetos entregues", value: user.projects.filter(p => p.status === "entregue").length },
          ].map(({ icon, label, value }) => (
            <div
              key={label}
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                borderRadius: 14,
                padding: "20px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(91,87,232,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i className={`ti ${icon}`} style={{ fontSize: 20, color: "var(--primary)" }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "22px", fontWeight: 800 }}>{value}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-faint)" }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Projects */}
        <div style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Meus projetos</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {user.projects.map((project) => (
              <ProjectCard key={project.id} project={project} statusMap={STATUS_MAP} />
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ marginTop: 36 }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Ações rápidas</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="/area-cliente/tokens"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "10px 18px",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              <i className="ti ti-coins" style={{ color: "var(--primary)" }} />
              Ver tokens
            </Link>
            <Link
              href="/configurador"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "10px 18px",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              <i className="ti ti-plus" style={{ color: "var(--primary)" }} />
              Novo projeto
            </Link>
            <a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "10px 18px",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              <i className="ti ti-brand-whatsapp" style={{ color: "#22c55e" }} />
              Falar com suporte
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
