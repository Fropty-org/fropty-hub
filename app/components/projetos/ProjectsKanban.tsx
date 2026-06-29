"use client";

import Link from "next/link";
import { Plus, MessageSquare, Paperclip } from "lucide-react";
import type { Project, ProjectStatus } from "@/app/lib/types/projects";
import { PROJECT_STATUSES, PROJECT_PRIORITY_MAP } from "@/app/lib/constants/projects";

interface Props { projects: Project[] }

const COLUMNS: { key: ProjectStatus; label: string; color: string }[] = [
  { key: "lead",      label: "Sem status",   color: "#64748b" },
  { key: "briefing",  label: "A fazer",      color: "#3b82f6" },
  { key: "escopo",    label: "Em andamento", color: "#f59e0b" },
  { key: "proposta",  label: "Revisão",      color: "#8b5cf6" },
  { key: "execucao",  label: "Concluído",    color: "#22c55e" },
  { key: "entrega",   label: "Entregue",     color: "#06b6d4" },
];

export function ProjectsKanban({ projects }: Props) {
  const byStatus = COLUMNS.reduce<Record<string, Project[]>>((acc, c) => {
    acc[c.key] = projects.filter(p => p.status === c.key);
    return acc;
  }, {});

  // Also bucket any status not in COLUMNS into first column
  const knownKeys = new Set(COLUMNS.map(c => c.key));
  projects.forEach(p => {
    if (!knownKeys.has(p.status as ProjectStatus)) {
      byStatus["lead"] = [...(byStatus["lead"] ?? []), p];
    }
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", minHeight: 500 }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 0 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={toolBtn}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Board
          </button>
          <span style={{ fontSize: "12px", color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 12h13M13 18h8"/></svg>
            Mais recente primeiro
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={toolBtn}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filtrar
            <span style={{ fontSize: "10px", background: "var(--primary)", color: "#fff", borderRadius: 999, padding: "1px 6px", fontWeight: 800 }}>
              {COLUMNS.filter(c => (byStatus[c.key]?.length ?? 0) > 0).length}
            </span>
          </button>
          <Link href="/portal/suporte/novo" style={{ ...toolBtn as React.CSSProperties, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", textDecoration: "none", display: "inline-flex" }}>
            <Plus size={13} /> Novo
          </Link>
        </div>
      </div>

      {/* Columns */}
      <div style={{ display: "flex", gap: 12, overflowX: "auto", flex: 1, alignItems: "flex-start", paddingBottom: 8 }}>
        {COLUMNS.map(col => {
          const cards = byStatus[col.key] ?? [];
          return (
            <div key={col.key} style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", maxHeight: "100%" }}>
              {/* Column header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                background: "var(--card-bg)", border: "1px solid var(--card-border)",
                borderBottom: `2px solid ${col.color}`,
                borderRadius: "10px 10px 0 0",
              }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: col.color, flexShrink: 0, display: "inline-block" }} />
                <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text)", flex: 1 }}>{col.label}</span>
                <span style={{
                  fontSize: "10px", fontWeight: 800, background: `${col.color}20`,
                  color: col.color, borderRadius: 999, padding: "2px 7px",
                }}>
                  {cards.length}
                </span>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", display: "flex", padding: 0 }}>
                  <Plus size={13} />
                </button>
              </div>

              {/* Cards */}
              <div style={{
                background: `${col.color}08`,
                border: "1px solid var(--card-border)", borderTop: "none",
                borderRadius: "0 0 10px 10px", padding: 8,
                display: "flex", flexDirection: "column", gap: 8,
                maxHeight: 520, overflowY: "auto", flex: 1,
              }}>
                {cards.length === 0 && (
                  <div style={{ padding: "20px 0", textAlign: "center", fontSize: "11.5px", color: "var(--text-faint)" }}>
                    Vazio
                  </div>
                )}
                {cards.map(p => {
                  const pr = PROJECT_PRIORITY_MAP[p.priority] ?? { label: p.priority, color: "#94a3b8" };
                  const progress = (p as unknown as Record<string,unknown>).progress as number | null ?? null;
                  return (
                    <Link
                      key={p.id}
                      href={`/portal/projetos/${p.id}`}
                      style={{
                        display: "block", background: "var(--card-bg)",
                        border: "1px solid var(--card-border)", borderRadius: 10,
                        padding: "12px 14px", textDecoration: "none", color: "inherit",
                        transition: "box-shadow 0.15s",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}
                    >
                      {/* Title */}
                      <p style={{
                        margin: "0 0 10px", fontSize: "12.5px", fontWeight: 600,
                        color: "var(--text)", lineHeight: 1.4,
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {p.title}
                      </p>

                      {/* Tags row */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                        <span style={{
                          fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                          background: `${pr.color}18`, border: `1px solid ${pr.color}30`, color: pr.color,
                        }}>
                          {pr.label}
                        </span>
                        {p.description && (
                          <span style={{
                            fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                            background: "rgba(99,102,241,0.10)", border: "1px solid rgba(99,102,241,0.20)", color: "var(--primary)",
                          }}>
                            Projeto
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      {progress != null && (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ height: 4, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{
                              height: "100%", borderRadius: 99,
                              background: progress >= 100 ? "#22c55e" : "linear-gradient(90deg,#6366f1,#8b5cf6)",
                              width: `${Math.min(progress, 100)}%`,
                            }} />
                          </div>
                        </div>
                      )}

                      {/* Footer: stats */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: 10 }}>
                          <span style={{ fontSize: "11px", color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 3 }}>
                            <MessageSquare size={11} /> {Math.floor(Math.random() * 10)}
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 3 }}>
                            <Paperclip size={11} /> {Math.floor(Math.random() * 5)}
                          </span>
                        </div>
                        {progress != null && (
                          <span style={{ fontSize: "10px", color: "var(--text-faint)" }}>{progress}%</span>
                        )}
                      </div>
                    </Link>
                  );
                })}

                {/* + New card */}
                <button style={{
                  display: "flex", alignItems: "center", gap: 6, width: "100%",
                  padding: "8px 10px", borderRadius: 8, border: "1px dashed var(--border)",
                  background: "none", cursor: "pointer", color: "var(--text-faint)",
                  fontSize: "12px", fontWeight: 600, fontFamily: "inherit",
                  transition: "background 0.15s",
                }}>
                  <Plus size={13} /> Novo
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const toolBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "6px 12px", borderRadius: 8,
  border: "1px solid var(--border)", background: "var(--surface)",
  color: "var(--text-muted)", fontSize: "12px", fontWeight: 600,
  cursor: "pointer", fontFamily: "inherit",
};
