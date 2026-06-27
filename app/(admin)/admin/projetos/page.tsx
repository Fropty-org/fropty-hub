import type { Metadata } from "next";
import Link from "next/link";
import { Plus, FolderKanban, Calendar, User } from "lucide-react";
import { getAllProjects } from "@/app/actions/projects";
import { PROJECT_STATUSES, PROJECT_PRIORITY_MAP } from "@/app/lib/constants/projects";
import type { ProjectStatus } from "@/app/lib/types/projects";

export const metadata: Metadata = { title: "Admin — Projetos" };

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

const ALL_STATUSES = Object.keys(PROJECT_STATUSES) as ProjectStatus[];

export default async function AdminProjetosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filterStatus } = await searchParams;
  const allProjects = await getAllProjects();

  const projects = filterStatus && filterStatus !== "todos"
    ? allProjects.filter((p) => p.status === filterStatus)
    : allProjects;

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "var(--text)" }}>Projetos</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
            {allProjects.length} projeto{allProjects.length !== 1 ? "s" : ""} no total
          </p>
        </div>
        <Link
          href="/admin/projetos/novo"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "9px 16px", background: "#EF9F27", color: "#fff",
            fontWeight: 700, fontSize: "13px", borderRadius: 9, textDecoration: "none",
          }}
        >
          <Plus size={14} /> Novo Projeto
        </Link>
      </div>

      {/* Filtros de status */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {[{ key: "todos", label: "Todos", color: "var(--text-muted)" }, ...ALL_STATUSES.map((s) => ({ key: s, label: PROJECT_STATUSES[s].label, color: PROJECT_STATUSES[s].color }))].map(({ key, label, color }) => {
          const active = (filterStatus ?? "todos") === key;
          return (
            <Link
              key={key}
              href={`/admin/projetos?status=${key}`}
              style={{
                padding: "5px 12px", borderRadius: 99, fontSize: "12px", fontWeight: 600,
                textDecoration: "none",
                background: active ? `${color}20` : "var(--surface)",
                color: active ? color : "var(--text-muted)",
                border: `1px solid ${active ? color + "40" : "var(--border)"}`,
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Tabela / lista */}
      {projects.length === 0 ? (
        <div style={{
          padding: "48px", textAlign: "center",
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14,
        }}>
          <FolderKanban size={32} style={{ color: "var(--text-faint)", marginBottom: 12 }} />
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>
            Nenhum projeto encontrado.
          </p>
        </div>
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          {/* Header da tabela */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 130px 80px 100px 80px",
            padding: "10px 16px", borderBottom: "1px solid var(--border)",
            fontSize: "11px", fontWeight: 700, color: "var(--text-faint)",
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}>
            <span>Projeto / Cliente</span>
            <span>Status</span>
            <span>Prioridade</span>
            <span>Entrega</span>
            <span></span>
          </div>

          {projects.map((project, i) => {
            const st = PROJECT_STATUSES[project.status] ?? { label: project.status, color: "#94a3b8", Icon: FolderKanban };
            const pr = PROJECT_PRIORITY_MAP[project.priority] ?? { label: project.priority, color: "#94a3b8" };
            const StIcon = st.Icon;

            return (
              <div
                key={project.id}
                style={{
                  display: "grid", gridTemplateColumns: "1fr 130px 80px 100px 80px",
                  padding: "12px 16px", alignItems: "center",
                  borderBottom: i < projects.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {project.title}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "11px", color: "var(--text-faint)", marginTop: 2 }}>
                    <User size={10} /> {project.client_name ?? "—"}
                  </span>
                </div>

                <div>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: 99,
                    background: `${st.color}18`, color: st.color,
                  }}>
                    <StIcon size={11} /> {st.label}
                  </span>
                </div>

                <div>
                  <span style={{
                    fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: 99,
                    background: `${pr.color}15`, color: pr.color,
                  }}>{pr.label}</span>
                </div>

                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "12px", color: "var(--text-muted)" }}>
                  <Calendar size={11} /> {formatDate(project.due_date)}
                </span>

                <Link
                  href={`/admin/projetos/${project.id}`}
                  style={{
                    padding: "5px 10px", background: "var(--surface-2)",
                    border: "1px solid var(--border)", borderRadius: 7,
                    fontSize: "11px", fontWeight: 600, color: "var(--text-muted)",
                    textDecoration: "none",
                  }}
                >
                  Ver
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
