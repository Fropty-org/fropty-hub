import type { Metadata } from "next";
import Link from "next/link";
import { FolderOpen, Calendar, ChevronRight, MessageSquarePlus, List, LayoutGrid, CalendarDays } from "lucide-react";
import { getClientProjects } from "@/app/actions/projects";
import { PROJECT_STATUSES, PROJECT_PRIORITY_MAP } from "@/app/lib/constants/projects";
import { HubEmptyState } from "@/app/components/ui/HubEmptyState";
import { ProjectsKanban } from "@/app/components/projetos/ProjectsKanban";
import { ProjectsCalendar } from "@/app/components/projetos/ProjectsCalendar";

export const metadata: Metadata = { title: "Projetos" };

type ViewMode = "lista" | "kanban" | "calendario";

function fDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

const VIEW_BUTTONS: { view: ViewMode; Icon: typeof List; label: string }[] = [
  { view: "lista",     Icon: List,        label: "Lista" },
  { view: "kanban",    Icon: LayoutGrid,  label: "Kanban" },
  { view: "calendario", Icon: CalendarDays, label: "Calendário" },
];

export default async function ProjetosPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  const view: ViewMode =
    params.view === "kanban" || params.view === "calendario"
      ? params.view
      : "lista";

  const projects = await getClientProjects();

  return (
    <div style={{ padding: "24px 24px", maxWidth: view === "kanban" ? "none" : 1020, margin: "0 auto" }}>

      {/* ── Page header ── */}
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        gap: 16, marginBottom: 28, flexWrap: "wrap",
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>
            Projetos
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: "13px", color: "var(--text-faint)" }}>
            Acompanhe o andamento e entregas dos seus projetos
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* View toggle */}
          <div style={{
            display: "flex",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            padding: 3,
            gap: 2,
          }}>
            {VIEW_BUTTONS.map(({ view: v, Icon, label }) => (
              <Link
                key={v}
                href={`/portal/projetos?view=${v}`}
                title={label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "6px 12px",
                  borderRadius: "calc(var(--r-md) - 3px)",
                  fontSize: "12px",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "background 0.15s, color 0.15s",
                  background: view === v ? "var(--card-bg)" : "transparent",
                  color: view === v ? "var(--text)" : "var(--text-faint)",
                  boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                <Icon size={13} />
                <span style={{ display: "none" }}>{label}</span>
                <Icon size={0} style={{ display: "none" }} />
                {label}
              </Link>
            ))}
          </div>

          <Link
            href="/portal/suporte/novo"
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "var(--cta-bg)", color: "var(--cta-text)",
              borderRadius: "var(--r-md)", padding: "9px 18px",
              fontSize: "13px", fontWeight: 700, textDecoration: "none",
              boxShadow: "var(--shadow-brand)",
            }}
          >
            <MessageSquarePlus size={14} /> Solicitar projeto
          </Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="hub-card">
          <HubEmptyState variant="projetos" />
        </div>
      ) : view === "kanban" ? (
        <ProjectsKanban projects={projects} />
      ) : view === "calendario" ? (
        <ProjectsCalendar projects={projects} />
      ) : (
        <div className="hub-card" style={{ overflow: "hidden" }}>
          {/* Table toolbar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 20px", borderBottom: "1px solid var(--border)",
          }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>
              {projects.length} projeto{projects.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 130px 110px 120px 140px 32px",
            padding: "9px 20px",
            background: "var(--surface-2)",
            borderBottom: "1px solid var(--border)",
            fontSize: "11px", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.07em",
            color: "var(--text-faint)",
          }}>
            <span>Projeto</span>
            <span>Status</span>
            <span>Prioridade</span>
            <span>Prazo</span>
            <span>Progresso</span>
            <span />
          </div>

          {/* Rows */}
          {projects.map((project, i) => {
            const st       = PROJECT_STATUSES[project.status]       ?? { label: project.status,   color: "#94a3b8", Icon: FolderOpen };
            const pr       = PROJECT_PRIORITY_MAP[project.priority] ?? { label: project.priority, color: "#94a3b8" };
            const StIcon   = st.Icon;
            const progress = (project as unknown as Record<string, unknown>).progress as number | null ?? null;

            return (
              <Link
                key={project.id}
                href={`/portal/projetos/${project.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 130px 110px 120px 140px 32px",
                  padding: "13px 20px",
                  alignItems: "center",
                  borderBottom: i < projects.length - 1 ? "1px solid var(--border)" : "none",
                  textDecoration: "none", color: "inherit",
                  transition: "background 0.1s",
                }}
                className="hub-row-link"
              >
                {/* Title */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "var(--r-sm)", flexShrink: 0,
                    background: `${st.color}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <StIcon size={15} style={{ color: st.color }} />
                  </div>
                  <span style={{
                    fontSize: "13.5px", fontWeight: 600, color: "var(--text)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {project.title}
                  </span>
                </div>

                {/* Status */}
                <span style={{
                  fontSize: "11px", fontWeight: 700, color: st.color,
                  background: `${st.color}15`, border: `1px solid ${st.color}28`,
                  borderRadius: "var(--r-full)", padding: "3px 10px",
                  whiteSpace: "nowrap", display: "inline-block",
                }}>
                  {st.label}
                </span>

                {/* Prioridade */}
                <span style={{
                  fontSize: "11px", fontWeight: 700, color: pr.color,
                  background: `${pr.color}15`, border: `1px solid ${pr.color}28`,
                  borderRadius: "var(--r-full)", padding: "3px 10px",
                  whiteSpace: "nowrap", display: "inline-block",
                }}>
                  {pr.label}
                </span>

                {/* Prazo */}
                <span style={{ fontSize: "12px", color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 5 }}>
                  <Calendar size={11} style={{ flexShrink: 0 }} />
                  {fDate(project.due_date)}
                </span>

                {/* Progresso */}
                <div style={{ paddingRight: 8 }}>
                  {progress != null ? (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: "10px", color: "var(--text-faint)" }}>{progress}%</span>
                      </div>
                      <div style={{ height: 5, background: "var(--surface-2)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 99,
                          background: progress >= 100 ? "#22c55e" : `linear-gradient(90deg, var(--primary), var(--brand-accent))`,
                          width: `${Math.min(progress, 100)}%`,
                        }} />
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>—</span>
                  )}
                </div>

                <ChevronRight size={14} style={{ color: "var(--text-faint)" }} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
