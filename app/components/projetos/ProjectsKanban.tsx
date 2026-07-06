"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, LayoutGrid, ArrowDownWideNarrow, ListFilter, CalendarDays } from "lucide-react";
import type { Project, ProjectStatus } from "@/app/lib/types/projects";
import { PROJECT_STATUSES, PROJECT_PRIORITY_MAP } from "@/app/lib/constants/projects";
import { updateProjectStatus } from "@/app/actions/projects";
import { ProjectDetailModal } from "./ProjectDetailModal";

interface Props {
  projects: Project[];
  /** Base do link do card. Cliente: "/portal/projetos" (padrão); admin: "/admin/projetos". */
  basePath?: string;
  /** Exibe o nome do cliente no card (visão admin). */
  showClient?: boolean;
  /** Habilita drag-and-drop persistente + composer no modal (admin). */
  editable?: boolean;
}

const COLUMNS: { key: ProjectStatus; label: string; color: string }[] = [
  { key: "lead",      label: "Sem status",   color: "#64748b" },
  { key: "briefing",  label: "A fazer",      color: "var(--c-info)" },
  { key: "escopo",    label: "Em andamento", color: "var(--c-warning)" },
  { key: "proposta",  label: "Revisão",      color: "var(--c-purple)" },
  { key: "execucao",  label: "Concluído",    color: "var(--c-success)" },
  { key: "entrega",   label: "Entregue",     color: "#06b6d4" },
];

function initials(name?: string) {
  if (!name) return "—";
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
}
function progressOf(p: Project): number | null {
  const v = (p as unknown as Record<string, unknown>).progress;
  return typeof v === "number" ? v : null;
}

export function ProjectsKanban({ projects, basePath = "/portal/projetos", showClient = false, editable = false }: Props) {
  const [items, setItems] = useState<Project[]>(projects);
  useEffect(() => { setItems(projects); }, [projects]);

  const [dragId,  setDragId]  = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [active,  setActive]  = useState<Project | null>(null);
  const [, startTransition]   = useTransition();
  const router = useRouter();

  function handleDrop(colKey: ProjectStatus) {
    setOverCol(null);
    const id = dragId;
    setDragId(null);
    if (!id) return;
    const proj = items.find(p => p.id === id);
    if (!proj || proj.status === colKey) return;

    const prevStatus = proj.status;
    setItems(cur => cur.map(p => (p.id === id ? { ...p, status: colKey } : p)));
    startTransition(async () => {
      const res = await updateProjectStatus(id, colKey);
      if (res?.error) setItems(cur => cur.map(p => (p.id === id ? { ...p, status: prevStatus } : p)));
      else router.refresh();
    });
  }

  const byStatus = COLUMNS.reduce<Record<string, Project[]>>((acc, c) => {
    acc[c.key] = items.filter(p => p.status === c.key);
    return acc;
  }, {});
  const knownKeys = new Set(COLUMNS.map(c => c.key));
  items.forEach(p => {
    if (!knownKeys.has(p.status as ProjectStatus)) byStatus["lead"] = [...(byStatus["lead"] ?? []), p];
  });

  const novoHref = `${basePath}/novo`;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)", minHeight: 500 }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 0 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ ...toolBtn, cursor: "default" }}><LayoutGrid size={13} /> Board</span>
          <span style={{ fontSize: "12px", color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 5 }}>
            <ArrowDownWideNarrow size={13} /> Mais recente primeiro
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ ...toolBtn, cursor: "default" }}>
            <ListFilter size={13} /> Filtrar
            <span style={{ fontSize: "10px", background: "var(--primary)", color: "#fff", borderRadius: 999, padding: "1px 6px", fontWeight: 800 }}>
              {COLUMNS.filter(c => (byStatus[c.key]?.length ?? 0) > 0).length}
            </span>
          </span>
          {editable && (
            <Link href={novoHref} className="hub-btn hub-btn-primary hub-btn-sm" style={{ textDecoration: "none" }}>
              <Plus size={13} /> Novo
            </Link>
          )}
        </div>
      </div>

      {/* Columns */}
      <div style={{ display: "flex", gap: 12, overflowX: "auto", flex: 1, alignItems: "flex-start", paddingBottom: 8 }}>
        {COLUMNS.map(col => {
          const cards = byStatus[col.key] ?? [];
          return (
            <div key={col.key} style={{ width: 270, flexShrink: 0, display: "flex", flexDirection: "column", maxHeight: "100%" }}>
              {/* Column header (estilo Preline) */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px 12px" }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: col.color, flexShrink: 0 }} />
                <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text)" }}>{col.label}</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)" }}>{cards.length}</span>
                <span style={{ flex: 1 }} />
                {editable && (
                  <Link href={novoHref} style={{ color: "var(--text-faint)", display: "flex" }} aria-label="Novo projeto"><Plus size={14} /></Link>
                )}
              </div>

              {/* Cards */}
              <div
                onDragOver={editable ? (e) => { e.preventDefault(); if (overCol !== col.key) setOverCol(col.key); } : undefined}
                onDragLeave={editable ? () => setOverCol(o => (o === col.key ? null : o)) : undefined}
                onDrop={editable ? () => handleDrop(col.key) : undefined}
                style={{
                  background: editable && overCol === col.key ? `color-mix(in srgb, ${col.color} 12%, transparent)` : "transparent",
                  border: editable && overCol === col.key ? `1px dashed ${col.color}` : "1px solid transparent",
                  borderRadius: 10, padding: 4,
                  display: "flex", flexDirection: "column", gap: 8,
                  maxHeight: 560, overflowY: "auto", flex: 1,
                  transition: "background 0.12s",
                }}
              >
                {cards.length === 0 && (
                  <div style={{ padding: "16px 0", textAlign: "center", fontSize: "11.5px", color: "var(--text-faint)" }}>Vazio</div>
                )}
                {cards.map(p => {
                  const pr = PROJECT_PRIORITY_MAP[p.priority] ?? { label: p.priority, color: "var(--text-faint)" };
                  const progress = progressOf(p);
                  return (
                    <div
                      key={p.id}
                      onClick={() => setActive(p)}
                      draggable={editable}
                      onDragStart={editable ? (e) => { setDragId(p.id); e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", p.id); } catch {} } : undefined}
                      onDragEnd={editable ? () => { setDragId(null); setOverCol(null); } : undefined}
                      className="hub-card"
                      style={{
                        padding: "12px 14px", cursor: editable ? "grab" : "pointer",
                        opacity: editable && dragId === p.id ? 0.4 : 1,
                        transition: "box-shadow 0.15s, border-color 0.15s",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.borderColor = "var(--card-border)"; }}
                    >
                      {/* Título */}
                      <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: 600, color: "var(--text)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {p.title}
                      </p>

                      {/* Responsável */}
                      {showClient && p.client_name && (
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                          <span className="hub-avatar" style={{ width: 22, height: 22, fontSize: 9.5 }}>{initials(p.client_name)}</span>
                          <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.client_name}</span>
                        </div>
                      )}

                      {/* Prioridade + status */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: progress != null ? 10 : 0 }}>
                        <span className="hub-badge" style={{ fontSize: "10.5px", padding: "2px 8px", background: `color-mix(in srgb, ${pr.color} 14%, transparent)`, color: pr.color, border: `1px solid color-mix(in srgb, ${pr.color} 28%, transparent)` }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: pr.color }} /> {pr.label}
                        </span>
                      </div>

                      {/* Progresso */}
                      {progress != null && (
                        <>
                          <div style={{ height: 5, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden", marginBottom: 6 }}>
                            <div style={{ height: "100%", borderRadius: 99, background: progress >= 100 ? "var(--c-success)" : "var(--primary)", width: `${Math.min(progress, 100)}%` }} />
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "11px", color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 4 }}>
                              {p.due_date && <><CalendarDays size={11} /> {new Date(p.due_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</>}
                            </span>
                            <span style={{ fontSize: "11px", fontWeight: 700, color: progress >= 100 ? "var(--c-success)" : "var(--text-faint)" }}>{progress}%</span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                {editable && (
                  <Link href={novoHref} style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px dashed var(--border)", color: "var(--text-faint)", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
                    <Plus size={13} /> Novo
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {active && (
        <ProjectDetailModal project={active} basePath={basePath} editable={editable} onClose={() => setActive(null)} />
      )}
    </div>
  );
}

const toolBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "6px 12px", borderRadius: 8,
  border: "1px solid var(--border)", background: "var(--surface)",
  color: "var(--text-muted)", fontSize: "12px", fontWeight: 600,
  fontFamily: "inherit",
};
