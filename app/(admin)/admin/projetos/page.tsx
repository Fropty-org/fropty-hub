import type { Metadata } from "next";
import Link from "next/link";
import { Plus, FolderKanban, Calendar, User, BarChart2 } from "lucide-react";
import { getAllProjects } from "@/app/actions/projects";
import { PROJECT_STATUSES, PROJECT_PRIORITY_MAP } from "@/app/lib/constants/projects";
import { CSVExportButton } from "@/app/components/ui/CSVExportButton";
import type { ProjectStatus } from "@/app/lib/types/projects";

export const metadata: Metadata = { title: "Admin — Projetos" };

function formatDate(d?: string) {
  if (!d) return "";
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

  // KPI counts per status
  const kpis = ALL_STATUSES.map((s) => ({
    key: s,
    label: PROJECT_STATUSES[s].label,
    color: PROJECT_STATUSES[s].color,
    count: allProjects.filter((p) => p.status === s).length,
    Icon: PROJECT_STATUSES[s].Icon,
  }));

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>Projetos</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-faint)" }}>
            {allProjects.length} projeto{allProjects.length !== 1 ? "s" : ""} no total
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CSVExportButton
            data={projects as unknown as Record<string, unknown>[]}
            columns={[
              { key: "title",       label: "Projeto" },
              { key: "status",      label: "Status" },
              { key: "priority",    label: "Prioridade" },
              { key: "client_name", label: "Cliente" },
              { key: "start_date",  label: "Início" },
              { key: "end_date",    label: "Prazo" },
              { key: "progress",    label: "Progresso %" },
            ]}
            filename="projetos.csv"
          />
          <Link
            href="/admin/projetos/novo"
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "var(--cta-bg)", color: "var(--cta-text)", borderRadius: 10, fontSize: "13px", fontWeight: 700, textDecoration: "none" }}
          >
            <Plus size={14} /> Novo Projeto
          </Link>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
        {kpis.map((k) => (
          <div key={k.key} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `${k.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <k.Icon size={16} style={{ color: k.color }} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>{k.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: "1.8rem", fontWeight: 900, color: "var(--text)", lineHeight: 1, letterSpacing: "-0.02em" }}>{k.count}</p>
          </div>
        ))}
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
                padding: "6px 14px", borderRadius: 8, fontSize: "12px", fontWeight: 600,
                textDecoration: "none",
                background: active ? `${color}20` : "transparent",
                color: active ? color : "var(--text-muted)",
                border: `1px solid ${active ? color + "40" : "var(--border)"}`,
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Grid de cards */}
      {projects.length === 0 ? (
        <div style={{ padding: "56px", textAlign: "center", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14 }}>
          <FolderKanban size={32} style={{ color: "var(--text-faint)", marginBottom: 12, display: "block", margin: "0 auto 12px" }} />
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>Nenhum projeto encontrado</p>
          <p style={{ margin: "6px 0 0", fontSize: "13px", color: "var(--text-faint)" }}>Crie o primeiro projeto para começar.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {projects.map((project) => {
            const st = PROJECT_STATUSES[project.status] ?? { label: project.status, color: "#94a3b8", Icon: FolderKanban };
            const pr = PROJECT_PRIORITY_MAP[project.priority] ?? { label: project.priority, color: "#94a3b8" };
            const StIcon = st.Icon;

            return (
              <div
                key={project.id}
                style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}
              >
                {/* Card header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {project.title}
                    </p>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "12px", color: "var(--text-faint)" }}>
                      <User size={11} /> {project.client_name ?? ""}
                    </span>
                  </div>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0,
                    fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: 99,
                    background: `${st.color}18`, color: st.color,
                  }}>
                    <StIcon size={11} /> {st.label}
                  </span>
                </div>

                {/* Badges + data */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: `${pr.color}15`, color: pr.color }}>
                    {pr.label}
                  </span>
                  {project.due_date && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "12px", color: "var(--text-faint)" }}>
                      <Calendar size={11} /> {formatDate(project.due_date)}
                    </span>
                  )}
                  {project.description && (
                    <p style={{ margin: "0", fontSize: "12px", color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
                      {project.description}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div style={{ marginTop: "auto", paddingTop: 4, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
                  <Link
                    href={`/admin/projetos/${project.id}`}
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textDecoration: "none" }}
                  >
                    <BarChart2 size={12} /> Detalhes
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

