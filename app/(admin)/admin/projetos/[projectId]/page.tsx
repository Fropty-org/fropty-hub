import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, DollarSign, Clock, User } from "lucide-react";
import { getProject, updateProjectStatus, addProjectUpdate } from "@/app/actions/projects";
import { PROJECT_STATUSES, PROJECT_PRIORITY_MAP } from "@/app/lib/constants/projects";
import type { ProjectStatus } from "@/app/lib/types/projects";

export const metadata: Metadata = { title: "Admin — Projeto" };

function formatDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatCurrency(v?: number) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function AdminProjetoDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { project, updates } = await getProject(projectId);

  if (!project) notFound();

  const st = PROJECT_STATUSES[project.status] ?? { label: project.status, color: "#94a3b8", Icon: () => null };
  const pr = PROJECT_PRIORITY_MAP[project.priority] ?? { label: project.priority, color: "#94a3b8" };
  const StIcon = st.Icon;

  async function handleStatusUpdate(formData: FormData) {
    "use server";
    const newStatus = formData.get("status") as ProjectStatus;
    const note = (formData.get("note") as string)?.trim() || undefined;
    await updateProjectStatus(projectId, newStatus, note);
  }

  async function handleAddUpdate(formData: FormData) {
    "use server";
    const content = (formData.get("content") as string)?.trim() || "";
    await addProjectUpdate(projectId, content);
  }

  const inputStyle = {
    width: "100%", padding: "9px 12px",
    background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 9,
    fontSize: "13px", color: "var(--text)", fontFamily: "inherit",
    boxSizing: "border-box" as const,
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 860, margin: "0 auto" }}>
      <Link
        href="/admin/projetos"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "13px", color: "var(--text-muted)", textDecoration: "none", marginBottom: 20 }}
      >
        <ArrowLeft size={14} /> Projetos
      </Link>

      {/* Header */}
      <div style={{
        padding: "20px 24px", background: "var(--surface)",
        border: "1px solid var(--border)", borderRadius: 16, marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
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
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: `${st.color}18`, color: st.color }}>{st.label}</span>
              <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: `${pr.color}15`, color: pr.color }}>{pr.label}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "12px", color: "var(--text-faint)" }}>
                <User size={11} /> {project.client_name ?? "—"}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
          {[
            { Icon: Calendar,   label: "Início",     value: formatDate(project.start_date) },
            { Icon: Calendar,   label: "Entrega",    value: formatDate(project.due_date) },
            { Icon: Clock,      label: "Horas est.", value: project.estimated_hours ? `${project.estimated_hours}h` : "—" },
            { Icon: DollarSign, label: "Custo est.", value: formatCurrency(project.estimated_cost) },
          ].map(({ Icon, label, value }) => (
            <div key={label} style={{ padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                <Icon size={11} style={{ color: "var(--text-faint)" }} />
                <span style={{ fontSize: "10px", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
              </div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
        {/* Timeline de updates */}
        <div>
          <h2 style={{ margin: "0 0 16px", fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
            Atualizações ({updates.length})
          </h2>

          {/* Adicionar update */}
          <form action={handleAddUpdate} style={{ marginBottom: 20 }}>
            <textarea
              name="content"
              rows={3}
              required
              placeholder="Escreva uma atualização para o cliente..."
              style={{ ...inputStyle, resize: "vertical", marginBottom: 8 }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 16px", background: "#EF9F27", color: "#fff",
                fontWeight: 700, fontSize: "12px", borderRadius: 8,
                border: "none", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Adicionar Atualização
            </button>
          </form>

          {updates.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>Nenhuma atualização ainda.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {updates.map((u) => (
                <div key={u.id} style={{ padding: "14px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
                  {u.status_from && u.status_to && (
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: `${(PROJECT_STATUSES[u.status_from as ProjectStatus]?.color ?? "#94a3b8")}18`, color: PROJECT_STATUSES[u.status_from as ProjectStatus]?.color ?? "#94a3b8" }}>
                        {PROJECT_STATUSES[u.status_from as ProjectStatus]?.label ?? u.status_from}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>→</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: `${(PROJECT_STATUSES[u.status_to as ProjectStatus]?.color ?? "#94a3b8")}18`, color: PROJECT_STATUSES[u.status_to as ProjectStatus]?.color ?? "#94a3b8" }}>
                        {PROJECT_STATUSES[u.status_to as ProjectStatus]?.label ?? u.status_to}
                      </span>
                    </div>
                  )}
                  <p style={{ margin: "0 0 6px", fontSize: "13px", color: "var(--text)", lineHeight: 1.6 }}>{u.content}</p>
                  <div style={{ display: "flex", gap: 10, fontSize: "11px", color: "var(--text-faint)" }}>
                    <span>{u.author_name ?? "Admin"}</span>
                    <span>{formatDateTime(u.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Atualizar status */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "0.9rem", fontWeight: 700, color: "var(--text)" }}>
            Atualizar status
          </h3>
          <form action={handleStatusUpdate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
                Novo status
              </label>
              <select name="status" defaultValue={project.status} style={inputStyle}>
                {Object.entries(PROJECT_STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
                Nota (opcional)
              </label>
              <textarea name="note" rows={3} placeholder="Explique a mudança..." style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <button
              type="submit"
              style={{
                padding: "9px 16px", background: "#EF9F27", color: "#fff",
                fontWeight: 700, fontSize: "13px", borderRadius: 9,
                border: "none", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Salvar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
