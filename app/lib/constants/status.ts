import { Circle, Loader2, CheckCircle, XCircle, RotateCcw, type LucideIcon } from "lucide-react";

/**
 * Tom semântico de badge — mapeia 1:1 para as classes `.hub-badge-{tone}`
 * do design system (globals.css). É a forma theme-safe de renderizar status:
 * o `<StatusBadge>` lê `tone`, nunca o hex. O campo `color` (hex) permanece
 * apenas para consumidores legados que compõem cores dinâmicas (ex.: bordas,
 * ícones) e será removido conforme as telas migram para o componente.
 */
export type BadgeTone =
  | "success" | "warning" | "danger" | "info"
  | "neutral" | "primary" | "accent" | "purple" | "cyan";

export type TicketStatus = "aberto" | "em_andamento" | "resolvido" | "fechado" | "reaberto";
export type TicketPriority = "baixa" | "media" | "alta";

export const TICKET_STATUS_MAP: Record<TicketStatus, { label: string; tone: BadgeTone; color: string; icon: string; Icon: LucideIcon }> = {
  aberto:       { label: "Aberto",       tone: "info",    color: "#3b82f6", icon: "ti-circle-dot",    Icon: Circle },
  em_andamento: { label: "Em andamento", tone: "accent",  color: "#EF9F27", icon: "ti-loader-2",      Icon: Loader2 },
  resolvido:    { label: "Aguardando validação", tone: "success", color: "#22c55e", icon: "ti-circle-check", Icon: CheckCircle },
  fechado:      { label: "Fechado",      tone: "neutral", color: "#94a3b8", icon: "ti-circle-x",      Icon: XCircle },
  reaberto:     { label: "Reaberto",     tone: "purple",  color: "#a855f7", icon: "ti-arrow-back-up", Icon: RotateCcw },
};

export const TICKET_PRIORITY_MAP: Record<TicketPriority, { label: string; tone: BadgeTone; color: string }> = {
  baixa: { label: "Baixa", tone: "neutral", color: "#94a3b8" },
  media: { label: "Média", tone: "warning", color: "#EF9F27" },
  alta:  { label: "Alta",  tone: "danger",  color: "#ef4444" },
};
