"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Trash2, Loader2, GripVertical, Pencil } from "lucide-react";
import { useToast } from "@/app/components/ui/Toast";
import { createKanbanTask, updateKanbanTask, moveKanbanTask, deleteKanbanTask, type KanbanTask } from "@/app/actions/kanban";

const COLS: { key: string; label: string; color: string }[] = [
  { key: "todo",  label: "A fazer",      color: "var(--text-faint)" },
  { key: "doing", label: "Em andamento", color: "var(--c-warning)" },
  { key: "done",  label: "Concluído",    color: "var(--c-success)" },
];

export function PersonalKanban({ initialTasks }: { initialTasks: KanbanTask[] }) {
  const router = useRouter();
  const { show, ToastComponent } = useToast();
  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [composerCol, setComposerCol] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<KanbanTask | null>(null);
  const [, startTransition] = useTransition();

  function byCol(key: string) {
    return tasks.filter((t) => t.column_key === key).sort((a, b) => a.position - b.position);
  }

  function addCard(col: string) {
    const title = draft.trim();
    if (!title) { setComposerCol(null); return; }
    const tempId = `temp-${Date.now()}`;
    const optimistic: KanbanTask = {
      id: tempId, scope: "", owner_id: null, column_key: col, title,
      description: null, position: 9999, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    setTasks((cur) => [...cur, optimistic]);
    setDraft("");
    setComposerCol(null);
    startTransition(async () => {
      const res = await createKanbanTask(col, title);
      if (res.error || !res.id) {
        setTasks((cur) => cur.filter((t) => t.id !== tempId));
        show(res.error ?? "Não foi possível criar a tarefa.", "error");
      } else {
        setTasks((cur) => cur.map((t) => (t.id === tempId ? { ...t, id: res.id! } : t)));
      }
    });
  }

  function drop(col: string) {
    setOverCol(null);
    const id = dragId;
    setDragId(null);
    if (!id) return;
    const task = tasks.find((t) => t.id === id);
    if (!task || task.column_key === col) return;
    const prev = task.column_key;
    setTasks((cur) => cur.map((t) => (t.id === id ? { ...t, column_key: col } : t)));
    startTransition(async () => {
      const res = await moveKanbanTask(id, col);
      if (res.error) {
        setTasks((cur) => cur.map((t) => (t.id === id ? { ...t, column_key: prev } : t)));
        show(res.error, "error");
      }
    });
  }

  function remove(id: string) {
    const snapshot = tasks;
    setTasks((cur) => cur.filter((t) => t.id !== id));
    setEditing(null);
    startTransition(async () => {
      const res = await deleteKanbanTask(id);
      if (res.error) { setTasks(snapshot); show(res.error, "error"); }
    });
  }

  function saveEdit(id: string, title: string, description: string) {
    const t = title.trim();
    if (!t) { show("Informe um título.", "error"); return; }
    setTasks((cur) => cur.map((x) => (x.id === id ? { ...x, title: t, description: description.trim() || null } : x)));
    setEditing(null);
    startTransition(async () => {
      const res = await updateKanbanTask(id, { title: t, description: description });
      if (res.error) { show(res.error, "error"); router.refresh(); }
    });
  }

  return (
    <div style={{ display: "flex", gap: 14, overflowX: "auto", alignItems: "flex-start", paddingBottom: 8 }}>
      {COLS.map((col) => {
        const cards = byCol(col.key);
        const isOver = overCol === col.key;
        return (
          <div key={col.key} style={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 6px 12px" }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: col.color, flexShrink: 0 }} />
              <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text)" }}>{col.label}</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)" }}>{cards.length}</span>
              <span style={{ flex: 1 }} />
              <button type="button" onClick={() => { setComposerCol(col.key); setDraft(""); }} title="Adicionar tarefa" style={{ display: "flex", background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)" }}>
                <Plus size={15} />
              </button>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); if (overCol !== col.key) setOverCol(col.key); }}
              onDragLeave={() => setOverCol((o) => (o === col.key ? null : o))}
              onDrop={() => drop(col.key)}
              style={{
                display: "flex", flexDirection: "column", gap: 8, padding: 6, borderRadius: 10, minHeight: 80,
                background: isOver ? `color-mix(in srgb, ${col.color} 12%, transparent)` : "var(--surface-2)",
                border: isOver ? `1px dashed ${col.color}` : "1px solid var(--border)",
                transition: "background 0.12s",
              }}
            >
              {cards.length === 0 && composerCol !== col.key && (
                <p style={{ margin: 0, padding: "14px 0", textAlign: "center", fontSize: "11.5px", color: "var(--text-faint)" }}>Sem tarefas</p>
              )}

              {cards.map((t) => (
                <div
                  key={t.id}
                  draggable={!t.id.startsWith("temp-")}
                  onDragStart={() => setDragId(t.id)}
                  onDragEnd={() => { setDragId(null); setOverCol(null); }}
                  onClick={() => setEditing(t)}
                  className="hub-card"
                  style={{ padding: "10px 12px", cursor: "pointer", opacity: dragId === t.id ? 0.4 : 1, display: "flex", gap: 8, alignItems: "flex-start" }}
                >
                  <GripVertical size={14} style={{ color: "var(--text-faint)", flexShrink: 0, marginTop: 1, cursor: "grab" }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--text)", lineHeight: 1.4, wordBreak: "break-word" }}>{t.title}</p>
                    {t.description && (
                      <p style={{ margin: "4px 0 0", fontSize: "11.5px", color: "var(--text-faint)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.description}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Composer */}
              {composerCol === col.key && (
                <div className="hub-card" style={{ padding: 8 }}>
                  <textarea
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addCard(col.key); } if (e.key === "Escape") setComposerCol(null); }}
                    placeholder="Nova tarefa…"
                    rows={2}
                    style={{ width: "100%", boxSizing: "border-box", border: "1px solid var(--border)", borderRadius: 7, background: "var(--surface)", color: "var(--text)", padding: "7px 9px", fontSize: "12.5px", fontFamily: "inherit", outline: "none", resize: "vertical" }}
                  />
                  <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    <button type="button" onClick={() => addCard(col.key)} style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: "var(--primary)", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Adicionar</button>
                    <button type="button" onClick={() => setComposerCol(null)} style={{ padding: "5px 10px", borderRadius: 7, border: "none", background: "none", color: "var(--text-faint)", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
                  </div>
                </div>
              )}

              {composerCol !== col.key && (
                <button type="button" onClick={() => { setComposerCol(col.key); setDraft(""); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 8px", borderRadius: 7, border: "none", background: "none", color: "var(--text-faint)", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  <Plus size={13} /> Adicionar tarefa
                </button>
              )}
            </div>
          </div>
        );
      })}

      {editing && (
        <EditModal task={editing} onClose={() => setEditing(null)} onSave={saveEdit} onDelete={remove} />
      )}
      {ToastComponent}
    </div>
  );
}

function EditModal({ task, onClose, onSave, onDelete }: {
  task: KanbanTask;
  onClose: () => void;
  onSave: (id: string, title: string, description: string) => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description ?? "");
  const [pending, startTransition] = useTransition();

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} className="hub-card" style={{ width: "100%", maxWidth: 440, padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "13px", fontWeight: 800, color: "var(--text)" }}><Pencil size={14} /> Editar tarefa</span>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", display: "flex" }}><X size={16} /></button>
        </div>
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={lbl}>Título</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>Descrição</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} style={{ ...inp, resize: "vertical" }} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderTop: "1px solid var(--border)" }}>
          <button type="button" onClick={() => onDelete(task.id)} disabled={pending} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 8, border: "1px solid color-mix(in srgb, var(--c-danger) 35%, transparent)", background: "color-mix(in srgb, var(--c-danger) 8%, transparent)", color: "var(--c-danger)", fontSize: "12.5px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            <Trash2 size={13} /> Excluir
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", fontSize: "12.5px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
            <button type="button" onClick={() => startTransition(() => onSave(task.id, title, desc))} disabled={pending} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--primary)", color: "#fff", fontSize: "12.5px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {pending ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : null} Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 };
const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: "13px", fontFamily: "inherit", outline: "none" };
