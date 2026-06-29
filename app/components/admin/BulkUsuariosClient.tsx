"use client";

import { useState, useTransition } from "react";
import { UserRowActions } from "./UserRowActions";
import { adminBulkUpdatePlan } from "@/app/actions/admin";
import { CheckSquare, Square, ChevronDown, Loader2 } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: "cliente" | "admin";
  plan: "sem_plano" | "basico" | "pro";
  token_balance: number;
  is_active: boolean;
}

interface Props {
  users: User[];
}

const PLAN_OPTIONS = [
  { value: "sem_plano", label: "Sem plano" },
  { value: "basico",    label: "Básico" },
  { value: "pro",       label: "Pro" },
];

export function BulkUsuariosClient({ users }: Props) {
  const [selected,    setSelected]    = useState<Set<string>>(new Set());
  const [bulkPlan,    setBulkPlan]    = useState("sem_plano");
  const [feedback,    setFeedback]    = useState("");
  const [isPending,   startTransition] = useTransition();

  const allSelected  = selected.size === users.length && users.length > 0;
  const someSelected = selected.size > 0 && !allSelected;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(users.map((u) => u.id)));
  }

  function applyBulk() {
    if (!selected.size) return;
    startTransition(async () => {
      const result = await adminBulkUpdatePlan(Array.from(selected), bulkPlan);
      if (result?.error) {
        setFeedback(`Erro: ${result.error}`);
      } else {
        setFeedback(`Plano atualizado para ${selected.size} usuário(s).`);
        setSelected(new Set());
        setTimeout(() => setFeedback(""), 3000);
      }
    });
  }

  return (
    <>
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
          padding: "12px 20px", background: "rgba(91,87,232,0.07)",
          border: "1px solid rgba(91,87,232,0.2)", borderRadius: 12, marginBottom: 12,
        }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)" }}>
            {selected.size} selecionado{selected.size !== 1 ? "s" : ""}
          </span>
          <span style={{ color: "var(--border)", margin: "0 2px" }}>|</span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Alterar plano:</span>
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <select
              value={bulkPlan}
              onChange={(e) => setBulkPlan(e.target.value)}
              style={{
                appearance: "none", background: "var(--card-bg)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "6px 28px 6px 10px", fontSize: "12px", fontWeight: 600,
                color: "var(--text)", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {PLAN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={12} style={{ position: "absolute", right: 8, color: "var(--text-faint)", pointerEvents: "none" }} />
          </div>
          <button
            onClick={applyBulk}
            disabled={isPending}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: "var(--primary)", color: "#fff", border: "none",
              borderRadius: 8, padding: "7px 14px", fontSize: "12px", fontWeight: 700,
              cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1,
              fontFamily: "inherit",
            }}
          >
            {isPending ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : null}
            Aplicar
          </button>
          <button
            onClick={() => setSelected(new Set())}
            style={{ background: "none", border: "none", fontSize: "12px", color: "var(--text-faint)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
          >
            Cancelar
          </button>
          {feedback && <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: 600 }}>{feedback}</span>}
        </div>
      )}

      <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "40px 1.4fr 180px 90px 130px 130px 80px 110px", padding: "12px 20px", borderBottom: "1px solid var(--border)", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", minWidth: 920 }}>
            <button
              onClick={toggleAll}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: allSelected ? "var(--primary)" : someSelected ? "var(--primary)" : "var(--text-faint)", display: "flex", alignItems: "center" }}
            >
              {allSelected
                ? <CheckSquare size={15} />
                : someSelected
                  ? <CheckSquare size={15} style={{ opacity: 0.5 }} />
                  : <Square size={15} />}
            </button>
            <span>Nome / Email</span>
            <span>ID</span>
            <span>Role</span>
            <span>Plano</span>
            <span>Tokens</span>
            <span style={{ textAlign: "center" }}>Status</span>
            <span style={{ textAlign: "center" }}>Acesso</span>
          </div>

          {users.map((u, i) => (
            <div
              key={u.id}
              style={{
                display: "grid", gridTemplateColumns: "40px 1.4fr 180px 90px 130px 130px 80px 110px",
                padding: "14px 20px", borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center", gap: 8, minWidth: 920,
                background: selected.has(u.id) ? "rgba(91,87,232,0.04)" : "transparent",
                transition: "background 0.1s",
              }}
            >
              <button
                onClick={() => toggle(u.id)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: selected.has(u.id) ? "var(--primary)" : "var(--text-faint)", display: "flex", alignItems: "center" }}
              >
                {selected.has(u.id) ? <CheckSquare size={15} /> : <Square size={15} />}
              </button>

              <div>
                <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{u.name || ""}</p>
                <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={u.email ?? ""}>{u.email ?? ""}</p>
              </div>

              <span title={u.id} style={{ fontSize: "11px", color: "var(--text-faint)", fontFamily: "monospace", cursor: "help", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {u.id.slice(0, 8)}…
              </span>

              <UserRowActions
                userId={u.id}
                name={u.name ?? ""}
                role={u.role}
                plan={u.plan}
                tokenBalance={u.token_balance}
                isActive={u.is_active}
              />
            </div>
          ))}

          {users.length === 0 && <p style={{ padding: "32px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px", margin: 0 }}>Nenhum usuário ainda.</p>}
        </div>
      </div>
    </>
  );
}
