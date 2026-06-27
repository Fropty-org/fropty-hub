import type { Metadata } from "next";
import Link from "next/link";
import { FolderOpen, FolderKanban, ChevronRight, Calendar, DollarSign } from "lucide-react";
import { getClientProjects } from "@/app/actions/projects";
import { PROJECT_STATUSES, PROJECT_PRIORITY_MAP } from "@/app/lib/constants/projects";

export const metadata: Metadata = { title: "Projetos" };

function formatDate(d?: string) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(v?: number) {
  if (v == null) return null;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ProjetosPage() {
  const projects = await getClientProjects();

  if (projects.length === 0) {
    return (
      <div style={{ padding: "32px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "var(--text)" }}>Projetos</h1>
          <p style={{ margin: "6px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
            Acompanhe o andamento dos seus projetos
          </p>
        </div>

        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "64px 24px", textAlign: "center",
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: "rgba(91,87,232,0.08)", border: "1px solid rgba(91,87,232,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
          }}>
            <FolderOpen size={26} style={{ color: "var(--primary)" }} />
          </div>
          <h3 style={{ margin: "0 0 8px", fontSize: "1.05rem", fontWeight: 700, color: "var(--text)" }}>
            Nenhum projeto ainda
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", maxWidth: 320 }}>
            Seus projetos com a Fropty aparecerão aqui com status em tempo real.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "var(--text)" }}>Projetos</h1>
        <p style={{ margin: "6px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
          {projects.length} projeto{projects.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {projects.map((project) => {
          const st = PROJECT_STATUSES[project.status] ?? { label: project.status, color: "#94a3b8" };
          const pr = PROJECT_PRIORITY_MAP[project.priority] ?? { label: project.priority, color: "#94a3b8" };
          const StIcon = st.Icon;

          return (
            <Link
              key={project.id}
              href={`/portal/projetos/${project.id}`}
              style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "16px 20px",
                background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14,
                textDecoration: "none", transition: "border-color 0.15s",
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: `${st.color}18`, border: `1px solid ${st.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <StIcon size={18} style={{ color: st.color }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {project.title}
                  </span>
                  <span style={{
                    fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                    background: `${st.color}18`, color: st.color, flexShrink: 0,
                  }}>
                    {st.label}
                  </span>
                  <span style={{
                    fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: 99,
                    background: `${pr.color}15`, color: pr.color, flexShrink: 0,
                  }}>
                    {pr.label}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {project.due_date && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "12px", color: "var(--text-faint)" }}>
                      <Calendar size={11} /> Entrega: {formatDate(project.due_date)}
                    </span>
                  )}
                  {project.estimated_cost != null && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "12px", color: "var(--text-faint)" }}>
                      <DollarSign size={11} /> {formatCurrency(project.estimated_cost)}
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight size={16} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
