"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/app/components/ui/Toast";
import { Lock, LockOpen } from "lucide-react";
import {
  adminSetTokenBalance,
  adminUpdateUserPlan,
  adminUpdateUserRole,
  adminRevokeAccess,
  adminRestoreAccess,
} from "@/app/actions/admin";

const ROLE_COLOR: Record<string, string> = {
  cliente: "#3b82f6",
  admin:   "#EF9F27",
};

const PLAN_LABEL: Record<string, string> = {
  sem_plano: "Sem plano",
  basico:    "Básico",
  pro:       "Pro",
};

interface Props {
  userId:       string;
  name:         string;
  role:         "cliente" | "admin";
  plan:         "sem_plano" | "basico" | "pro";
  tokenBalance: number;
  isActive:     boolean;
}

const selectStyle: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7,
  padding: "4px 5px", fontSize: "11px", fontFamily: "inherit", cursor: "pointer", width: "100%",
};
const saveBtnStyle: React.CSSProperties = {
  padding: "4px 6px", borderRadius: 6, border: "1px solid var(--border)",
  background: "var(--surface)", color: "var(--text-muted)", fontSize: "10px",
  cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
};

export function UserRowActions({ userId, name, role: roleInit, plan: planInit, tokenBalance: tokenInit, isActive: activeInit }: Props) {
  const { show, ToastComponent } = useToast();
  const [pending, startTransition] = useTransition();

  const [role,    setRole]    = useState(roleInit);
  const [plan,    setPlan]    = useState(planInit);
  const [tokens,  setTokens]  = useState(String(tokenInit));
  const [active,  setActive]  = useState(activeInit);

  const who = name || "cliente";

  function run(fn: (fd: FormData) => Promise<void>, fd: FormData, onOk: () => void, msg: string) {
    startTransition(async () => {
      try {
        await fn(fd);
        onOk();
        show(msg, "success");
      } catch {
        show("Não foi possível salvar. Tente novamente.", "error");
      }
    });
  }

  function saveRole() {
    const fd = new FormData();
    fd.set("user_id", userId); fd.set("role", role);
    run(adminUpdateUserRole, fd, () => {}, `Papel de ${who} atualizado para ${role}.`);
  }
  function savePlan() {
    const fd = new FormData();
    fd.set("user_id", userId); fd.set("plan", plan);
    run(adminUpdateUserPlan, fd, () => {}, `Plano de ${who} definido como ${PLAN_LABEL[plan]}.`);
  }
  function saveTokens() {
    const n = parseInt(tokens, 10);
    if (isNaN(n) || n < 0 || n > 99999) { show("Informe um valor entre 0 e 99999.", "error"); return; }
    const fd = new FormData();
    fd.set("user_id", userId); fd.set("balance", String(n));
    run(adminSetTokenBalance, fd, () => setTokens(String(n)), `Saldo de ${who} definido em ${n} token${n !== 1 ? "s" : ""}.`);
  }
  function toggleAccess() {
    const fd = new FormData();
    fd.set("user_id", userId);
    if (active) {
      run(adminRevokeAccess, fd, () => setActive(false), `Acesso de ${who} bloqueado.`);
    } else {
      run(adminRestoreAccess, fd, () => setActive(true), `Acesso de ${who} liberado.`);
    }
  }

  return (
    <>
      {/* Role */}
      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
        <select value={role} onChange={(e) => setRole(e.target.value as "cliente" | "admin")} style={{ ...selectStyle, color: ROLE_COLOR[role] ?? "var(--text)", fontWeight: 700 }}>
          <option value="cliente">cliente</option>
          <option value="admin">admin</option>
        </select>
        <button type="button" onClick={saveRole} disabled={pending} title="Salvar papel" style={saveBtnStyle}>✓</button>
      </div>

      {/* Plano */}
      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
        <select value={plan} onChange={(e) => setPlan(e.target.value as Props["plan"])} style={{ ...selectStyle, color: "var(--text)" }}>
          <option value="sem_plano">Sem plano</option>
          <option value="basico">Básico</option>
          <option value="pro">Pro</option>
        </select>
        <button type="button" onClick={savePlan} disabled={pending} title="Salvar plano" style={saveBtnStyle}>✓</button>
      </div>

      {/* Tokens — define o saldo direto */}
      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
        <input
          type="number" value={tokens} min={0} max={99999}
          onChange={(e) => setTokens(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") saveTokens(); }}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text)", padding: "4px 6px", fontSize: "12px", fontWeight: 700, fontFamily: "inherit", width: "70px" }}
        />
        <button type="button" onClick={saveTokens} disabled={pending} title="Definir saldo" style={saveBtnStyle}>✓</button>
      </div>

      {/* Status */}
      <span style={{ textAlign: "center" }}>
        {active ? (
          <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)", display: "inline-block" }}>Ativo</span>
        ) : (
          <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", display: "inline-block" }}>Bloqueado</span>
        )}
      </span>

      {/* Acesso — ação clara com rótulo */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        {role === "admin" ? (
          <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>—</span>
        ) : active ? (
          <button
            type="button" onClick={toggleAccess} disabled={pending}
            title="Bloquear o acesso deste cliente ao portal"
            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)", color: "#ef4444", fontSize: "11px", fontWeight: 700, cursor: pending ? "wait" : "pointer", fontFamily: "inherit" }}
          >
            <Lock size={13} /> Bloquear
          </button>
        ) : (
          <button
            type="button" onClick={toggleAccess} disabled={pending}
            title="Liberar novamente o acesso deste cliente"
            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.08)", color: "#22c55e", fontSize: "11px", fontWeight: 700, cursor: pending ? "wait" : "pointer", fontFamily: "inherit" }}
          >
            <LockOpen size={13} /> Desbloquear
          </button>
        )}
      </div>

      {ToastComponent}
    </>
  );
}
