"use client";

import { TICKET_STATUS_MAP, TICKET_PRIORITY_MAP, type BadgeTone } from "@/app/lib/constants/status";
import { useT } from "@/app/lib/i18n/I18nProvider";

/**
 * Badge de status/prioridade do chamado com rótulo traduzido (i18n).
 * O tom (cor) vem dos mapas canônicos; o texto vem do dicionário ativo.
 * Use no Service Desk no lugar de <StatusBadge kind="ticket"/"ticket-priority">.
 */
export function TicketBadge({ kind, status, size, className }: { kind: "ticket" | "ticket-priority"; status: string; size?: "sm" | "md"; className?: string }) {
  const t = useT();
  const isPriority = kind === "ticket-priority";
  const map: Record<string, { tone: BadgeTone }> = isPriority ? TICKET_PRIORITY_MAP : TICKET_STATUS_MAP;
  const tone = map[status]?.tone ?? "neutral";
  const label = t(`serviceDesk.${isPriority ? "priority" : "status"}.${status}`);
  const cls = ["hub-badge", `hub-badge-${tone}`, size === "sm" ? "sm" : "", className ?? ""].filter(Boolean).join(" ");
  return <span className={cls}>{label}</span>;
}
