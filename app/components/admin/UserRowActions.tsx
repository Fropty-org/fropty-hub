"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/app/components/ui/Toast";
import { Lock, LockOpen, Check } from "lucide-react";
import {
  adminSetTokenBalance,
  adminUpdateUserPlan,
  adminUpdateUserRole,
  adminRevokeAccess,
  adminRestoreAccess,
} from "@/app/actions/admin";

const ROLE_COLOR: Record<string, string> = {
  cliente: "var(--c-info)",
  admin:   "var(--brand-accent)",
};

const PLAN_COLOR: Record<string, string> = {
  sem_plano: "var(--text-faint)",
  basico:    "var(--c-info)",
  pro:       "var(--primary)",
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

// Select estilizado como badge/pill (Preline): fundo suave da cor do valor,
// sem chrome de <select> nativo além de uma seta neutra discreta.
function pillSelectStyle(color: string): React.CSSProperties {
  return {
    appearance: "none",
    background: `color-mix(in srgb, ${color} 14%, transparent)`,
    border: `1px solid color-mix(in srgb, ${color} 26%, transparent)`,
    borderRadius: 999,
    color,
    padding: "4px 22px 4px 10px",
    fontSize: "11px",
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
    width: "100%",
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='3'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 7px center",
  };
}
const saveBtnStyle: React.CSSProperties = {
  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
  border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)",
  cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center",
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
      {/* Role — badge/pill estilo Preline, editável */}
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <select value={role} onChange={(e) => setRole(e.target.value as "cliente" | "admin")} style={pillSelectStyle(ROLE_COLOR[role] ?? "var(--text-muted)")}>
          <option value="cliente">Cliente</option>
          <option value="admin">Admin</option>
        </select>
        {role !== roleInit && (
          <button type="button" onClick={saveRole} disabled={pending} title="Salvar papel" style={saveBtnStyle}><Check size={12} /></button>
        )}
      </div>

      {/* Plano — badge/pill estilo Preline, editável */}
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <select value={plan} onChange={(e) => setPlan(e.target.value as Props["plan"])} style={pillSelectStyle(PLAN_COLOR[plan])}>
          <option value="sem_plano">Sem plano</option>
          <option value="basico">Básico</option>
          <option value="pro">Pro</option>
        </select>
        {plan !== planInit && (
          <button type="button" onClick={savePlan} disabled={pending} title="Salvar plano" style={saveBtnStyle}><Check size={12} /></button>
        )}
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
          <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: "rgba(34,197,94,0.1)", color: "var(--c-success)", border: "1px solid rgba(34,197,94,0.3)", display: "inline-block" }}>Ativo</span>
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
            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.08)", color: "var(--c-success)", fontSize: "11px", fontWeight: 700, cursor: pending ? "wait" : "pointer", fontFamily: "inherit" }}
          >
            <LockOpen size={13} /> Desbloquear
          </button>
        )}
      </div>

      {ToastComponent}
    </>
  );
}
