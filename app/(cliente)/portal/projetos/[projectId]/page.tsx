import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Calendar, DollarSign, Clock, AlertCircle,
  CheckCircle2, MessageSquarePlus, ChevronRight,
} from "lucide-react";
import { getProject } from "@/app/actions/projects";
import { PROJECT_STATUSES, PROJECT_PRIORITY_MAP } from "@/app/lib/constants/projects";
import { StatusBadge } from "@/app/components/ui/StatusBadge";

export const metadata: Metadata = { title: "Projeto" };

function formatDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatCurrency(v?: number | null) {
  if (v == null) return null;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ProjetoDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { project, updates } = await getProject(projectId);
  if (!project) notFound();

  const st     = PROJECT_STATUSES[project.status]       ?? { label: project.status,   color: "#94a3b8", Icon: () => null };
  const pr     = PROJECT_PRIORITY_MAP[project.priority] ?? { label: project.priority, color: "#94a3b8" };
  const StIcon = st.Icon;
  const isActive  = !["encerrado"].includes(project.status);
  const progress  = (project as unknown as Record<string, unknown>).progress as number | undefined;

  const metaItems = [
    project.start_date     && { icon: <Calendar    size={13} />, label: "Início",      value: formatDate(project.start_date) },
    project.due_date       && { icon: <Calendar    size={13} />, label: "Prazo",       value: formatDate(project.due_date) },
    project.delivered_at   && { icon: <CheckCircle2 size={13} />, label: "Entrega",    value: formatDate(project.delivered_at) },
    project.estimated_hours && { icon: <Clock      size={13} />, label: "Horas est.", value: `${project.estimated_hours}h` },
    project.estimated_cost  && { icon: <DollarSign size={13} />, label: "Custo est.", value: formatCurrency(project.estimated_cost)! },
    { icon: <AlertCircle  size={13} />, label: "Prioridade",  value: pr.label },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[];

  return (
    <div style={{ padding: "36px 32px", maxWidth: 860, margin: "0 auto" }}>

      {/* ── Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        <Link
          href="/portal/projetos"
          style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "13px", color: "var(--text-faint)", textDecoration: "none" }}
        >
          <ArrowLeft size={13} /> Projetos
        </Link>
        <ChevronRight size={12} style={{ color: "var(--border-2)" }} />
        <span style={{ fontSize: "13px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }}>
          {project.title}
        </span>
      </div>

      {/* ── Header card ── */}
      <div className="hub-card" style={{ marginBottom: 20, padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>

          <div style={{
            width: 46, height: 46, borderRadius: "var(--r-md)", flexShrink: 0,
            background: `${st.color}18`, border: `1px solid ${st.color}28`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <StIcon size={22} style={{ color: st.color }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              margin: "0 0 8px", fontSize: "1.2rem", fontWeight: 800,
              color: "var(--text)", letterSpacing: "-0.02em", lineHeight: 1.2,
            }}>
              {project.title}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <StatusBadge kind="project" status={project.status} />
              <StatusBadge kind="project-priority" status={project.priority} />
              {isActive && (
                <span style={{
                  fontSize: "11px", fontWeight: 600, color: "var(--c-success)",
                  background: "var(--c-success-bg)", border: "1px solid var(--c-success-border)",
                  borderRadius: "var(--r-full)", padding: "2px 9px",
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}>
                  <CheckCircle2 size={10} /> Ativo
                </span>
              )}
            </div>
          </div>

          <Link
            href="/portal/suporte/novo"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0,
              fontSize: "12px", fontWeight: 700, color: "var(--primary)",
              background: "rgba(91,87,232,0.08)", border: "1px solid rgba(91,87,232,0.20)",
              borderRadius: "var(--r-md)", padding: "7px 13px", textDecoration: "none",
            }}
          >
            <MessageSquarePlus size={13} /> Abrir chamado
          </Link>
        </div>

        {project.description && (
          <p style={{
            margin: "16px 0 0", fontSize: "13.5px", color: "var(--text-muted)",
            lineHeight: 1.65, borderTop: "1px solid var(--border)", paddingTop: 14,
          }}>
            {project.description}
          </p>
        )}

        {/* Progress bar */}
        {progress != null && (
          <div style={{ marginTop: 18, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--text-faint)" }}>Progresso</span>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--text)" }}>{progress}%</span>
            </div>
            <div style={{ height: 7, background: "var(--surface-2)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 999,
                background: `linear-gradient(90deg, var(--primary), var(--brand-accent))`,
                width: `${Math.min(progress, 100)}%`,
                transition: "width 0.6s ease",
              }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Metadata grid ── */}
      {metaItems.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))",
          gap: 10, marginBottom: 28,
        }}>
          {metaItems.map(({ icon, label, value }) => (
            <div key={label} className="hub-card-sm" style={{ padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5, color: "var(--text-faint)" }}>
                {icon}
                <span style={{ fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  {label}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 700, color: "var(--text)" }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Update timeline ── */}
      <div>
        <p style={{
          fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.08em", color: "var(--text-faint)", margin: "0 0 16px",
        }}>
          Atualizações{updates.length > 0 && ` (${updates.length})`}
        </p>

        {updates.length === 0 ? (
          <div className="hub-card" style={{ padding: "36px 24px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)", lineHeight: 1.6 }}>
              Nenhuma atualização registrada ainda.<br />
              <span style={{ fontSize: "12px" }}>Nossa equipe publicará atualizações conforme o projeto avança.</span>
            </p>
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            {/* Vertical connector */}
            <div style={{
              position: "absolute", left: 14, top: 10, bottom: 10,
              width: 1, background: "var(--border)",
            }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {updates.map((u, i) => {
                const isFirst   = i === 0;
                const fromCfg   = u.status_from ? PROJECT_STATUSES[u.status_from as keyof typeof PROJECT_STATUSES] : null;
                const toCfg     = u.status_to   ? PROJECT_STATUSES[u.status_to   as keyof typeof PROJECT_STATUSES] : null;

                return (
                  <div key={u.id} style={{ display: "flex", gap: 16, paddingBottom: 16 }}>
                    {/* Dot */}
                    <div style={{ width: 28, flexShrink: 0, display: "flex", justifyContent: "center", paddingTop: 3 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: "50%", zIndex: 1,
                        background: isFirst ? "var(--primary)" : "var(--border-2)",
                        border: "2px solid var(--bg)",
                        boxShadow: isFirst ? "0 0 0 3px rgba(91,87,232,0.18)" : "none",
                      }} />
                    </div>

                    {/* Card */}
                    <div className="hub-card" style={{ flex: 1, padding: "14px 18px" }}>
                      {fromCfg && toCfg && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                          <span style={{
                            fontSize: "11px", fontWeight: 700, color: fromCfg.color,
                            background: `${fromCfg.color}18`, borderRadius: "var(--r-full)", padding: "2px 8px",
                          }}>
                            {fromCfg.label}
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>→</span>
                          <span style={{
                            fontSize: "11px", fontWeight: 700, color: toCfg.color,
                            background: `${toCfg.color}18`, borderRadius: "var(--r-full)", padding: "2px 8px",
                          }}>
                            {toCfg.label}
                          </span>
                        </div>
                      )}

                      <p style={{ margin: 0, fontSize: "13.5px", color: "var(--text)", lineHeight: 1.65 }}>
                        {u.content}
                      </p>

                      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-faint)" }}>
                          {u.author_name ?? "Fropty"}
                        </span>
                        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--border-2)", flexShrink: 0 }} />
                        <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>
                          {formatDateTime(u.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
