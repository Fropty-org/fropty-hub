import type { Metadata } from "next";
import Link from "next/link";
import { getProfile } from "@/app/lib/auth/session";
import { createClient } from "@/app/lib/supabase/server";
import { ProjectCard } from "@/app/components/cliente/ProjectCard";
import { OnboardingBanner } from "@/app/components/cliente/OnboardingBanner";
import { WHATSAPP_URL } from "@/app/lib/config";
import type { ClientProject, ProjectStatus } from "@/app/lib/types/cliente";
import type { Database } from "@/app/lib/supabase/types";
import { STATUS_MAP } from "@/app/lib/constants/status";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

export const metadata: Metadata = {
  title: "Meu Painel",
};

export default async function PortalDashboardPage() {
  // getProfile() é deduplicado pelo React cache — já foi chamado no layout pai
  const profile  = await getProfile();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) console.error("[portal/dashboard] user is null after requireRole");

  const { data: projectRows, error: projError } = user
    ? await supabase
        .from("projects")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [], error: null };

  if (projError) {
    console.error("[portal/dashboard] projects fetch error:", projError.message);
  }

  const projects: ClientProject[] = ((projectRows ?? []) as ProjectRow[]).map((p) => ({
    id:              p.id,
    name:            p.name,
    description:     p.description,
    status:          p.status as ProjectStatus,
    progress:        p.progress,
    addons:          p.addons,
    maintenancePlan: p.maintenance_plan ?? undefined,
    startedAt:       p.started_at,
    deliveredAt:     p.delivered_at ?? undefined,
  }));

  const displayName    = profile?.name || user?.email?.split("@")[0] || "Cliente";
  const tokenBalance   = profile?.token_balance ?? 0;
  const activeCount    = projects.filter((p) => p.status !== "entregue").length;
  const deliveredCount = projects.filter((p) => p.status === "entregue").length;

  return (
    <div style={{ padding: "40px 32px", maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ color: "var(--text-faint)", fontSize: "13px", margin: "0 0 4px" }}>
          Bem-vindo de volta,
        </p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, color: "var(--text)" }}>
          {displayName.split(" ")[0]}
        </h1>
      </div>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 36,
        }}
      >
        {[
          { icon: "ti-layout-cards", label: "Projetos ativos",    value: activeCount,    color: "var(--primary)" },
          { icon: "ti-coins",        label: "Tokens disponíveis", value: tokenBalance,   color: "#EF9F27" },
          { icon: "ti-circle-check", label: "Projetos entregues", value: deliveredCount, color: "#22c55e" },
        ].map(({ icon, label, value, color }) => (
          <div
            key={label}
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
              borderRadius: 14,
              padding: "20px",
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
                background: "rgba(91,87,232,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <i className={`ti ${icon}`} style={{ fontSize: 20, color }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "var(--text)" }}>{value}</p>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--text-faint)" }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Onboarding — só aparece quando não há projetos */}
      {projects.length === 0 && (
        <OnboardingBanner name={displayName} tokenBalance={tokenBalance} />
      )}

      {/* Projetos */}
      {projects.length > 0 && (
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16, color: "var(--text)" }}>
          Meus projetos
        </h2>
      )}

      {projects.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} statusMap={STATUS_MAP} />
          ))}
        </div>
      )}

      {/* Ações rápidas */}
      <div style={{ marginTop: 36 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16, color: "var(--text)" }}>
          Ações rápidas
        </h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { href: "/configurador",         icon: "ti-plus",            color: "var(--primary)", label: "Novo projeto" },
            { href: WHATSAPP_URL,            icon: "ti-brand-whatsapp",  color: "#22c55e",        label: "Suporte", external: true },
          ].map(({ href, icon, color, label, external }) => (
            <Link
              key={href}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
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
                transition: "border-color 0.15s",
              }}
            >
              <i className={`ti ${icon}`} style={{ color }} /> {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
