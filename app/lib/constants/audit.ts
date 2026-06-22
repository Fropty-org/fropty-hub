// Configuração central das ações de auditoria — rótulo, ícone, cor e severidade.
// Severidade: "critical" (acesso/permissão), "high" (mudança sensível), "normal".

export type AuditSeverity = "critical" | "high" | "normal";

export interface AuditActionInfo {
  label:    string;
  icon:     string;
  color:    string;
  severity: AuditSeverity;
}

export const AUDIT_ACTIONS: Record<string, AuditActionInfo> = {
  revoke_access:     { label: "Acesso revogado",        icon: "ti-ban",          color: "#ef4444", severity: "critical" },
  restore_access:    { label: "Acesso restaurado",      icon: "ti-rotate",       color: "#22c55e", severity: "high" },
  update_role:       { label: "Role alterada",          icon: "ti-shield-lock",  color: "#a855f7", severity: "critical" },
  invite_client:     { label: "Cliente convidado",      icon: "ti-user-plus",    color: "#22c55e", severity: "high" },
  credit_tokens:     { label: "Crédito de tokens",      icon: "ti-coins",        color: "#EF9F27", severity: "normal" },
  set_token_balance: { label: "Saldo de tokens definido", icon: "ti-coins",      color: "#EF9F27", severity: "high" },
  update_plan:       { label: "Plano alterado",         icon: "ti-credit-card",  color: "#3b82f6", severity: "normal" },
};

export function auditActionInfo(action: string): AuditActionInfo {
  return AUDIT_ACTIONS[action] ?? { label: action, icon: "ti-point", color: "#94a3b8", severity: "normal" };
}

// Formata a metadata em texto legível por chave conhecida.
const META_LABELS: Record<string, string> = {
  amount:       "Quantidade",
  description:  "Descrição",
  balance:      "Saldo",
  plan:         "Plano",
  role:         "Role",
  name:         "Nome",
  email:        "E-mail",
  status:       "Status",
  progress:     "Progresso",
  previewUrl:   "Prévia",
  clientId:     "Cliente",
  tokenBalance: "Tokens",
};

const PLAN_LABELS: Record<string, string> = {
  sem_plano: "Sem plano",
  basico:    "Básico",
  pro:       "Pro",
};

export function formatAuditMeta(metadata: Record<string, unknown> | null): { label: string; value: string }[] {
  if (!metadata) return [];
  return Object.entries(metadata)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([key, raw]) => {
      let value = String(raw);
      if (key === "plan") value = PLAN_LABELS[value] ?? value;
      if (key === "role") value = value === "admin" ? "Admin" : "Cliente";
      if (key === "progress") value = `${value}%`;
      if (value.length > 60) value = value.slice(0, 60) + "…";
      return { label: META_LABELS[key] ?? key, value };
    });
}
