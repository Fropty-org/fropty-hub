import { TICKET_STATUS_MAP, TICKET_PRIORITY_MAP, type BadgeTone } from "@/app/lib/constants/status";
import { PROJECT_STATUSES, PROJECT_PRIORITY_MAP, CONTRACT_STATUS_MAP } from "@/app/lib/constants/projects";

/**
 * Fonte única de renderização de status/prioridade. Em vez de cada tela
 * reimplementar um mapa + estilo inline com hex, use:
 *   <StatusBadge kind="ticket" status={t.status} />
 *
 * Renderiza via classes `.hub-badge .hub-badge-{tone}` do design system —
 * 100% theme-safe (responde ao dark mode), zero cor inline. Os tons vêm do
 * campo `tone` dos mapas canônicos:
 *   - ticket / ticket-priority   → status.ts
 *   - project / project-priority → projects.ts (PROJECT_STATUSES / PRIORITY)
 *   - contract                   → projects.ts (CONTRACT_STATUS_MAP)
 */
type StatusKind =
  | "ticket" | "project" | "contract"
  | "ticket-priority" | "project-priority";

const STATUS_MAPS: Record<StatusKind, Record<string, { label: string; tone: BadgeTone }>> = {
  ticket:             TICKET_STATUS_MAP,
  project:            PROJECT_STATUSES,
  contract:           CONTRACT_STATUS_MAP,
  "ticket-priority":  TICKET_PRIORITY_MAP,
  "project-priority": PROJECT_PRIORITY_MAP,
};

interface StatusBadgeProps {
  kind: StatusKind;
  status: string;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ kind, status, size = "md", className }: StatusBadgeProps) {
  const cfg = STATUS_MAPS[kind][status] ?? { label: status, tone: "neutral" as BadgeTone };
  const cls = [
    "hub-badge",
    `hub-badge-${cfg.tone}`,
    size === "sm" ? "sm" : "",
    className ?? "",
  ].filter(Boolean).join(" ");

  return <span className={cls}>{cfg.label}</span>;
}
