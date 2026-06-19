import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/app/lib/auth/session";
import { createClient } from "@/app/lib/supabase/server";
import { ProjectCard } from "@/app/components/cliente/ProjectCard";
import { STATUS_MAP } from "@/app/lib/constants/status";
import type { ClientProject, ProjectStatus } from "@/app/lib/types/cliente";
import type { Database } from "@/app/lib/supabase/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

export const metadata: Metadata = { title: "Meus Projetos" };

const STATUS_FILTERS: Array<{ value: ProjectStatus | "todos"; label: string }> = [
  { value: "todos",             label: "Todos" },
  { value: "aguardando",        label: "Aguardando" },
  { value: "em_desenvolvimento",label: "Em desenvolvimento" },
  { value: "revisao",           label: "Em revisão" },
  { value: "entregue",          label: "Entregues" },
  { value: "manutencao",        label: "Em manutenção" },
];

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function ProjetosPage({ searchParams }: Props) {
  const profile = await getProfile();
  if (profile?.role === "admin") redirect("/admin/projetos");

  const { status: statusParam } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from("projects")
    .select("*")
    .eq("client_id", user!.id)
    .order("created_at", { ascending: false });

  const validStatuses = ["aguardando", "em_desenvolvimento", "revisao", "entregue", "manutencao"];
  if (statusParam && validStatuses.includes(statusParam)) {
    query = query.eq("status", statusParam as ProjectStatus);
  }

  const { data: rows, error } = await query;

  if (error) console.error("[portal/projetos] fetch error:", error.message);

  const projects: ClientProject[] = ((rows ?? []) as ProjectRow[]).map((p) => ({
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

  const activeFilter = (statusParam && validStatuses.includes(statusParam))
    ? statusParam as ProjectStatus
    : "todos";

  return (
    <div style={{ padding: "40px 32px", maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)" }}>
            Meus projetos
          </h1>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>
            {projects.length} {projects.length === 1 ? "projeto encontrado" : "projetos encontrados"}
          </p>
        </div>
        <Link
          href="/configurador"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--cta-bg)",
            color: "var(--cta-text)",
            padding: "10px 18px",
            borderRadius: 10,
            fontWeight: 700,
            textDecoration: "none",
            fontSize: "13px",
          }}
        >
          <i className="ti ti-plus" /> Novo projeto
        </Link>
      </div>

      {/* Filtros por status */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
        {STATUS_FILTERS.map(({ value, label }) => {
          const isActive = value === activeFilter;
          const statusInfo = value !== "todos" ? STATUS_MAP[value as ProjectStatus] : null;
          return (
            <Link
              key={value}
              href={value === "todos" ? "/portal/projetos" : `/portal/projetos?status=${value}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: "12px",
                fontWeight: 600,
                textDecoration: "none",
                border: `1px solid ${isActive ? (statusInfo?.color ?? "var(--primary)") : "var(--border)"}`,
                background: isActive ? `${statusInfo?.color ?? "var(--primary)"}18` : "transparent",
                color: isActive ? (statusInfo?.color ?? "var(--primary)") : "var(--text-muted)",
                transition: "all 0.15s",
              }}
            >
              {statusInfo && <i className={`ti ${statusInfo.icon}`} style={{ fontSize: 11 }} />}
              {label}
            </Link>
          );
        })}
      </div>

      {/* Lista */}
      {projects.length === 0 ? (
        <div
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: 16,
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <i className="ti ti-folder-off" style={{ fontSize: 40, color: "var(--text-faint)", display: "block", marginBottom: 12 }} />
          <p style={{ color: "var(--text-muted)", margin: "0 0 20px", fontSize: "15px" }}>
            {activeFilter === "todos" ? "Nenhum projeto ainda." : "Nenhum projeto com esse status."}
          </p>
          {activeFilter === "todos" && (
            <Link
              href="/configurador"
              style={{
                background: "var(--cta-bg)",
                color: "var(--cta-text)",
                padding: "10px 22px",
                borderRadius: 10,
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "13px",
              }}
            >
              Iniciar meu primeiro projeto
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} statusMap={STATUS_MAP} />
          ))}
        </div>
      )}
    </div>
  );
}
