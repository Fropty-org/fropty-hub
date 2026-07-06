"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { X, User, BarChart2, CircleDot, Tags, Send, Loader2, ExternalLink } from "lucide-react";
import type { Project, ProjectUpdate } from "@/app/lib/types/projects";
import { PROJECT_STATUSES, PROJECT_PRIORITY_MAP } from "@/app/lib/constants/projects";
import { getProject, addProjectUpdate } from "@/app/actions/projects";

interface Props {
  project: Project;
  basePath: string;
  editable?: boolean;
  onClose: () => void;
  /** Atualizações pré-carregadas — quando fornecidas, o modal não busca do servidor. */
  initialUpdates?: ProjectUpdate[];
}

function initials(name?: string) {
  if (!name) return "—";
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
}
function progressOf(p: Project): number | null {
  const v = (p as unknown as Record<string, unknown>).progress;
  return typeof v === "number" ? v : null;
}
function fmt(dt: string) {
  return new Date(dt).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function ProjectDetailModal({ project, basePath, editable = false, onClose, initialUpdates }: Props) {
  const [updates, setUpdates] = useState<ProjectUpdate[]>(initialUpdates ?? []);
  const [loading, setLoading] = useState(!initialUpdates);
  const [msg, setMsg]         = useState("");
  const [pending, startTransition] = useTransition();

  const st = PROJECT_STATUSES[project.status] ?? { label: project.status, color: "var(--text-faint)" };
  const pr = PROJECT_PRIORITY_MAP[project.priority] ?? { label: project.priority, color: "var(--text-faint)" };
  const progress = progressOf(project);

  async function refresh() {
    try {
      const { updates } = await getProject(project.id);
      setUpdates(updates);
    } catch { /* sem sessão / RLS — mantém vazio */ }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (!initialUpdates) refresh();
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function send() {
    const content = msg.trim();
    if (!content) return;
    startTransition(async () => {
      const res = await addProjectUpdate(project.id, content);
      if (!res?.error) { setMsg(""); await refresh(); }
    });
  }

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "48px 16px", overflowY: "auto",
    }}>
      <div onClick={e => e.stopPropagation()} className="hub-inter" style={{
        width: "100%", maxWidth: 680, background: "var(--surface)",
        border: "1px solid var(--border)", borderRadius: "var(--r-lg)",
        boxShadow: "var(--shadow-modal)", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>Detalhes do projeto</span>
          <button onClick={onClose} aria-label="Fechar" className="hub-btn-icon"><X size={15} /></button>
        </div>

        <div style={{ padding: "20px", maxHeight: "70vh", overflowY: "auto" }}>
          {/* Título */}
          <h2 style={{ margin: "0 0 18px", fontSize: "1.1rem", fontWeight: 800, color: "var(--text)", lineHeight: 1.35, letterSpacing: "-0.02em" }}>
            {project.title}
          </h2>

          {/* Campos */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
            <Field icon={<User size={14} />} label="Responsável">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span className="hub-avatar hub-avatar-sm">{initials(project.client_name)}</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{project.client_name ?? "—"}</span>
              </span>
            </Field>
            <Field icon={<BarChart2 size={14} />} label="Prioridade">
              <span className="hub-badge" style={{ background: `color-mix(in srgb, ${pr.color} 15%, transparent)`, color: pr.color, border: `1px solid color-mix(in srgb, ${pr.color} 30%, transparent)` }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: pr.color }} /> {pr.label}
              </span>
            </Field>
            <Field icon={<CircleDot size={14} />} label="Status">
              <span className="hub-badge" style={{ background: `color-mix(in srgb, ${st.color} 15%, transparent)`, color: st.color, border: `1px solid color-mix(in srgb, ${st.color} 30%, transparent)` }}>
                {st.label}
              </span>
            </Field>
            {progress != null && (
              <Field icon={<Tags size={14} />} label="Progresso">
                <span style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", maxWidth: 240 }}>
                  <span style={{ flex: 1, height: 6, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: `${Math.min(progress, 100)}%`, background: progress >= 100 ? "var(--c-success)" : "var(--primary)", borderRadius: 99 }} />
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>{progress}%</span>
                </span>
              </Field>
            )}
          </div>

          {project.description && (
            <p style={{ margin: "0 0 18px", fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {project.description}
            </p>
          )}

          <div style={{ height: 1, background: "var(--border)", margin: "0 0 16px" }} />

          {/* Thread */}
          <p style={{ margin: "0 0 12px", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Atualizações
          </p>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-faint)", fontSize: "12.5px", padding: "8px 0" }}>
              <Loader2 size={14} className="hub-spin" /> Carregando…
            </div>
          ) : updates.length === 0 ? (
            <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-faint)" }}>Nenhuma atualização ainda.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {updates.map(u => (
                <div key={u.id} style={{ display: "flex", gap: 10 }}>
                  <span className="hub-avatar hub-avatar-sm" style={{ marginTop: 1 }}>{initials(u.author_name)}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text)" }}>{u.author_name ?? "—"}</span>
                      <span style={{ fontSize: "10.5px", color: "var(--text-faint)" }}>{fmt(u.created_at)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{u.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Composer (admin) + link */}
        <div style={{ borderTop: "1px solid var(--border)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          {editable ? (
            <>
              <input
                className="hub-input"
                placeholder="Escrever atualização…"
                value={msg}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                style={{ flex: 1 }}
              />
              <button onClick={send} disabled={pending || !msg.trim()} className="hub-btn hub-btn-primary" aria-label="Enviar">
                {pending ? <Loader2 size={15} className="hub-spin" /> : <Send size={15} />}
              </button>
            </>
          ) : (
            <span style={{ fontSize: "12px", color: "var(--text-faint)", flex: 1 }}>As atualizações são publicadas pela equipe Fropty.</span>
          )}
          <Link href={`${basePath}/${project.id}`} className="hub-btn hub-btn-secondary hub-btn-sm" style={{ whiteSpace: "nowrap" }}>
            <ExternalLink size={13} /> Abrir
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 7, width: 120, flexShrink: 0, fontSize: "12.5px", color: "var(--text-faint)", fontWeight: 500 }}>
        <span style={{ color: "var(--text-faint)", display: "flex" }}>{icon}</span> {label}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}
