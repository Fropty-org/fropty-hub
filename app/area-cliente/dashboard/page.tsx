import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import { ProjectCard } from "../../components/cliente/ProjectCard";
import { ClientSidebar } from "../../components/cliente/ClientSidebar";
import type { ClientProject, ProjectStatus } from "../../lib/types/cliente";
import type { Database } from "../../lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

export const metadata: Metadata = {
  title: "Meu Painel",
  robots: { index: false, follow: false },
};

const STATUS_MAP: Record<ProjectStatus, { label: string; color: string; icon: string }> = {
  aguardando:         { label: "Aguardando início",   color: "#94a3b8", icon: "ti-clock" },
  em_desenvolvimento: { label: "Em desenvolvimento",  color: "#3b82f6", icon: "ti-code" },
  revisao:            { label: "Em revisão",           color: "#EF9F27", icon: "ti-eye" },
  entregue:           { label: "Entregue",             color: "#22c55e", icon: "ti-circle-check" },
  manutencao:         { label: "Em manutenção",        color: "var(--primary)", icon: "ti-tools" },
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/area-cliente");

  const profileResult  = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const projectsResult = await supabase.from("projects").select("*").eq("client_id", user.id).order("created_at", { ascending: false });

  const profile  = profileResult.data as ProfileRow | null;
  const projects = projectsResult.data as ProjectRow[] | null;

  const clientProjects: ClientProject[] = (projects ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status as ProjectStatus,
    progress: p.progress,
    addons: p.addons,
    maintenancePlan: p.maintenance_plan ?? undefined,
    startedAt: p.started_at,
    deliveredAt: p.delivered_at ?? undefined,
  }));

  const displayName = profile?.name || user.email?.split("@")[0] || "Cliente";
  const tokenBalance = profile?.token_balance ?? 0;
  const activeCount = clientProjects.filter((p) => p.status !== "entregue").length;
  const deliveredCount = clientProjects.filter((p) => p.status === "entregue").length;

  // Sidebar precisa de ClientUser — monta objeto compatível
  const sidebarUser = {
    id: user.id,
    name: displayName,
    email: user.email ?? "",
    avatarInitials: displayName.slice(0, 2).toUpperCase(),
    plan: (profile?.plan ?? undefined) as "basico" | "pro" | undefined,
    planRenewal: profile?.plan_renewal ?? undefined,
    tokenBalance,
    projects: clientProjects,
    tokenHistory: [],
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <ClientSidebar user={sidebarUser} active="dashboard" />

      <main style={{ flex: 1, padding: "40px 32px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 36 }}>
          <p style={{ color: "var(--text-faint)", fontSize: "13px", margin: "0 0 4px" }}>Bem-vindo de volta,</p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>
            {displayName.split(" ")[0]} 👋
          </h1>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 36 }}>
          {[
            { icon: "ti-layout-cards", label: "Projetos ativos",    value: activeCount },
            { icon: "ti-coins",        label: "Tokens disponíveis", value: tokenBalance },
            { icon: "ti-circle-check", label: "Projetos entregues", value: deliveredCount },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "20px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(91,87,232,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Meus projetos</h2>
        {clientProjects.length === 0 ? (
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16, padding: "40px 24px", textAlign: "center" }}>
            <i className="ti ti-layout-cards" style={{ fontSize: 40, color: "var(--text-faint)", display: "block", marginBottom: 12 }} />
            <p style={{ color: "var(--text-muted)", margin: "0 0 20px" }}>Nenhum projeto ainda.</p>
            <Link href="/configurador" style={{ background: "var(--cta-bg)", color: "var(--cta-text)", padding: "10px 20px", borderRadius: 10, fontWeight: 700, textDecoration: "none", fontSize: "13px" }}>
              Iniciar meu primeiro app
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {clientProjects.map((project) => (
              <ProjectCard key={project.id} project={project} statusMap={STATUS_MAP} />
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div style={{ marginTop: 36 }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Ações rápidas</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { href: "/area-cliente/tokens", icon: "ti-coins",           color: "var(--primary)", label: "Ver tokens" },
              { href: "/configurador",        icon: "ti-plus",            color: "var(--primary)", label: "Novo projeto" },
              { href: "https://wa.me/5500000000000", icon: "ti-brand-whatsapp", color: "#22c55e", label: "Suporte", external: true },
            ].map(({ href, icon, color, label, external }) => (
              <Link key={href} href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 18px", fontSize: "13px", fontWeight: 600, color: "var(--text)", textDecoration: "none" }}>
                <i className={`ti ${icon}`} style={{ color }} /> {label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
