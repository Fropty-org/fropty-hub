"use client";

import { useState, useTransition } from "react";
import { UserRowActions } from "./UserRowActions";
import { UserRowMenu } from "./UserRowMenu";
import { adminBulkUpdatePlan } from "@/app/actions/admin";
import { useT } from "@/app/lib/i18n/I18nProvider";
import { CheckSquare, Square, ChevronDown, Loader2 } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: "cliente" | "admin";
  plan: "sem_plano" | "basico" | "pro";
  token_balance: number;
  is_active: boolean;
  phone?: string | null;
  company?: string | null;
  created_at?: string | null;
  avatar_url?: string | null;
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
  const t = useT();
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
        setFeedback(t("admin.users.bulk.updated", { n: selected.size }));
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
          padding: "12px 20px", background: "color-mix(in srgb, var(--primary) 7%, transparent)",
          border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)", borderRadius: 12, marginBottom: 12,
        }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)" }}>
            {t("admin.users.bulk.selected", { n: selected.size })}
          </span>
          <span style={{ color: "var(--border)", margin: "0 2px" }}>|</span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>{t("admin.users.bulk.changePlan")}</span>
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
              {PLAN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{t(`admin.plans.${o.value}`)}</option>)}
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
            {t("admin.users.bulk.apply")}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            style={{ background: "none", border: "none", fontSize: "12px", color: "var(--text-faint)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
          >
            {t("admin.users.bulk.cancel")}
          </button>
          {feedback && <span style={{ fontSize: "12px", color: "var(--c-success)", fontWeight: 600 }}>{feedback}</span>}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "36px minmax(150px,1.2fr) 130px minmax(170px,1.3fr) 120px 95px 100px 120px 110px 80px 120px 48px", padding: "8px 16px", borderBottom: "1px solid var(--border)", fontSize: "10px", fontWeight: 800, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 1348, gap: 8 }}>
          <button
            onClick={toggleAll}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: allSelected ? "var(--primary)" : someSelected ? "var(--primary)" : "var(--text-faint)", display: "flex", alignItems: "center" }}
          >
            {allSelected ? <CheckSquare size={14} /> : someSelected ? <CheckSquare size={14} style={{ opacity: 0.5 }} /> : <Square size={14} />}
          </button>
          <span>{t("admin.users.table.user")}</span>
          <span>{t("admin.users.table.company")}</span>
          <span>{t("admin.users.table.email")}</span>
          <span>{t("admin.users.table.phone")}</span>
          <span>{t("admin.users.table.date")}</span>
          <span>{t("admin.users.table.role")}</span>
          <span>{t("admin.users.table.plan")}</span>
          <span>{t("admin.users.table.tokens")}</span>
          <span style={{ textAlign: "center" }}>{t("admin.users.table.status")}</span>
          <span style={{ textAlign: "center" }}>{t("admin.users.table.access")}</span>
          <span style={{ textAlign: "center" }}>{t("admin.users.table.actions")}</span>
        </div>

        {users.map((u, i) => {
          const initials = (u.name || u.email || "?").slice(0, 2).toUpperCase();
          const dateStr  = u.created_at ? new Date(u.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "";
          return (
            <div
              key={u.id}
              style={{
                display: "grid", gridTemplateColumns: "36px minmax(150px,1.2fr) 130px minmax(170px,1.3fr) 120px 95px 100px 120px 110px 80px 120px 48px",
                padding: "8px 16px", borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center", gap: 8, minWidth: 1348,
                background: selected.has(u.id) ? "color-mix(in srgb, var(--primary) 4%, transparent)" : "transparent",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => { if (!selected.has(u.id)) (e.currentTarget as HTMLDivElement).style.background = "var(--surface-2)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = selected.has(u.id) ? "color-mix(in srgb, var(--primary) 4%, transparent)" : "transparent"; }}
            >
              <button onClick={() => toggle(u.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: selected.has(u.id) ? "var(--primary)" : "var(--text-faint)", display: "flex", alignItems: "center" }}>
                {selected.has(u.id) ? <CheckSquare size={14} /> : <Square size={14} />}
              </button>

              {/* Avatar + Nome */}
              <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--surface-2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color: "var(--text)", flexShrink: 0, overflow: "hidden" }}>
                  {u.avatar_url
                    ? <img src={u.avatar_url} alt={u.name ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer" onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    : initials}
                </div>
                <p style={{ margin: 0, fontSize: "12.5px", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
                  {u.name || <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>—</span>}
                </p>
              </div>

              {/* Empresa */}
              <span style={{ fontSize: "12px", color: u.company ? "var(--text)" : "var(--text-faint)", fontWeight: u.company ? 500 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={u.company ?? ""}>
                {u.company || "—"}
              </span>

              {/* Email */}
              <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={u.email ?? ""}>
                {u.email || "—"}
              </span>

              {/* Telefone */}
              <span style={{ fontSize: "12px", color: u.phone ? "var(--text)" : "var(--text-faint)", fontWeight: u.phone ? 500 : 400 }}>
                {u.phone || "—"}
              </span>

              {/* Data de cadastro */}
              <span style={{ fontSize: "11.5px", color: "var(--text-faint)" }}>
                {dateStr || "—"}
              </span>

              <UserRowActions
                userId={u.id}
                name={u.name ?? ""}
                role={u.role}
                plan={u.plan}
                tokenBalance={u.token_balance}
                isActive={u.is_active}
              />

              <UserRowMenu
                userId={u.id}
                name={u.name ?? ""}
                email={u.email ?? ""}
                role={u.role}
              />
            </div>
          );
        })}

        {users.length === 0 && (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>{t("admin.users.table.empty")}</p>
          </div>
        )}
      </div>
    </>
  );
}
