"use client";

import { PROJECT_STATUSES, PROJECT_PRIORITY_MAP, CONTRACT_STATUS_MAP } from "@/app/lib/constants/projects";
import type { BadgeTone } from "@/app/lib/constants/status";
import { useT } from "@/app/lib/i18n/I18nProvider";

type Kind = "project" | "project-priority" | "contract";

const MAP: Record<Kind, { map: Record<string, { tone: BadgeTone }>; ns: string }> = {
  "project":          { map: PROJECT_STATUSES,      ns: "admin.projects.status" },
  "project-priority": { map: PROJECT_PRIORITY_MAP,  ns: "admin.projects.priority" },
  "contract":         { map: CONTRACT_STATUS_MAP,   ns: "admin.contracts.status" },
};

/**
 * Badge de status/prioridade de projeto e contrato com rótulo traduzido (i18n),
 * só para o admin. O tom (cor) vem dos mapas canônicos; o texto vem do dicionário.
 * Não substitui o StatusBadge no lado do cliente (ainda em pt-BR).
 */
export function AdminStatusBadge({ kind, status, size, className }: { kind: Kind; status: string; size?: "sm" | "md"; className?: string }) {
  const t = useT();
  const { map, ns } = MAP[kind];
  const tone = map[status]?.tone ?? "neutral";
  const label = t(`${ns}.${status}`);
  const cls = ["hub-badge", `hub-badge-${tone}`, size === "sm" ? "sm" : "", className ?? ""].filter(Boolean).join(" ");
  return <span className={cls}>{label}</span>;
}
