import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, DollarSign, Clock, User } from "lucide-react";
import { getProject } from "@/app/actions/projects";
import { PROJECT_STATUSES, PROJECT_PRIORITY_MAP } from "@/app/lib/constants/projects";

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

function formatCurrency(v?: number) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ProjetoDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { project, updates } = await getProject(projectId);

  if (!project) notFound();

  const st = PROJECT_STATUSES[project.status] ?? { label: project.status, color: "#94a3b8", Icon: () => null };
  const pr = PROJECT_PRIORITY_MAP[project.priority] ?? { label: project.priority, color: "#94a3b8" };
  const StIcon = st.Icon;

  return (
    <div style={{ padding: "32px 24px", maxWidth: 800, margin: "0 auto" }}>
      {/* Back */}
      <Link
        href="/portal/projetos"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "13px", color: "var(--text-muted)", textDecoration: "none", marginBottom: 20 }}
      >
        <ArrowLeft size={14} /> Projetos
      </Link>

      {/* Header */}
      <div style={{
        padding: "20px 24px", background: "var(--surface)",
        border: "1px solid var(--border)", borderRadius: 16, marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: `${st.color}18`, border: `1px solid ${st.color}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <StIcon size={20} style={{ color: st.color }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: "0 0 8px", fontSize: "1.2rem", fontWeight: 800, color: "var(--text)" }}>
              {project.title}
            </h1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{
                fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                background: `${st.color}18`, color: st.color,
              }}>{st.label}</span>
              <span style={{
                fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: 99,
                background: `${pr.color}15`, color: pr.color,
              }}>{pr.label}</span>
            </div>
          </div>
        </div>

        {project.description && (
          <p style={{ margin: "16px 0 0", fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.65 }}>
            {project.description}
          </p>
        )}

        {/* Info grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginTop: 20 }}>
          {[
            { Icon: Calendar, label: "Início",   value: formatDate(project.start_date) },
            { Icon: Calendar, label: "Entrega",  value: formatDate(project.due_date) },
            { Icon: Clock,    label: "Horas est.", value: project.estimated_hours ? `${project.estimated_hours}h` : "—" },
            { Icon: DollarSign, label: "Custo est.", value: formatCurrency(project.estimated_cost) },
          ].map(({ Icon, label, value }) => (
            <div key={label} style={{
              padding: "12px 14px", background: "var(--bg)",
              border: "1px solid var(--border)", borderRadius: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                <Icon size={12} style={{ color: "var(--text-faint)" }} />
                <span style={{ fontSize: "11px", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
              </div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h2 style={{ margin: "0 0 16px", fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
          Atualizações ({updates.length})
        </h2>

        {updates.length === 0 ? (
          <div style={{
            padding: "32px", textAlign: "center",
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14,
          }}>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>
              Nenhuma atualização registrada ainda.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {updates.map((u, i) => (
              <div key={u.id} style={{
                padding: "14px 18px",
                background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12,
                position: "relative",
              }}>
                {u.status_from && u.status_to && (
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                      background: `${(PROJECT_STATUSES[u.status_from as keyof typeof PROJECT_STATUSES]?.color ?? "#94a3b8")}18`,
                      color: PROJECT_STATUSES[u.status_from as keyof typeof PROJECT_STATUSES]?.color ?? "#94a3b8",
                    }}>
                      {PROJECT_STATUSES[u.status_from as keyof typeof PROJECT_STATUSES]?.label ?? u.status_from}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>→</span>
                    <span style={{
                      fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                      background: `${(PROJECT_STATUSES[u.status_to as keyof typeof PROJECT_STATUSES]?.color ?? "#94a3b8")}18`,
                      color: PROJECT_STATUSES[u.status_to as keyof typeof PROJECT_STATUSES]?.color ?? "#94a3b8",
                    }}>
                      {PROJECT_STATUSES[u.status_to as keyof typeof PROJECT_STATUSES]?.label ?? u.status_to}
                    </span>
                  </div>
                )}
                <p style={{ margin: "0 0 8px", fontSize: "13px", color: "var(--text)", lineHeight: 1.6 }}>
                  {u.content}
                </p>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "11px", color: "var(--text-faint)" }}>
                    <User size={10} /> {u.author_name ?? "Fropty"}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>
                    {formatDateTime(u.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
