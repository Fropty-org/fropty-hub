// Estado de acesso do cliente derivado da vigência do plano (plan_renewal).
// Cliente sem plan_renewal (ex.: sem_plano) não tem ciclo pago → nunca bloqueia.

export type AccessState = "ok" | "expiring" | "overdue";

export interface AccessStatus {
  state:    AccessState;
  daysLeft: number | null;   // dias até o vencimento (negativo se vencido)
  renewal:  string | null;   // ISO date original
}

/** Janela (em dias) em que o aviso de vencimento passa a aparecer. */
export const RENEWAL_NOTICE_DAYS = 10;

export function getAccessStatus(planRenewal: string | null | undefined): AccessStatus {
  if (!planRenewal) return { state: "ok", daysLeft: null, renewal: null };

  // A vigência vale até o fim do dia da renovação.
  const renewal = new Date(`${planRenewal}T23:59:59`);
  const now = new Date();
  const daysLeft = Math.ceil((renewal.getTime() - now.getTime()) / 86_400_000);

  if (daysLeft < 0) return { state: "overdue", daysLeft, renewal: planRenewal };
  if (daysLeft <= RENEWAL_NOTICE_DAYS) return { state: "expiring", daysLeft, renewal: planRenewal };
  return { state: "ok", daysLeft, renewal: planRenewal };
}
