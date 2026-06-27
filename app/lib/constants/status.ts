import { Circle, Loader2, CheckCircle, XCircle, RotateCcw, type LucideIcon } from "lucide-react";

export type TicketStatus = "aberto" | "em_andamento" | "resolvido" | "fechado" | "reaberto";
export type TicketPriority = "baixa" | "media" | "alta";

export const TICKET_STATUS_MAP: Record<TicketStatus, { label: string; color: string; icon: string; Icon: LucideIcon }> = {
  aberto:       { label: "Aberto",       color: "#3b82f6", icon: "ti-circle-dot",    Icon: Circle },
  em_andamento: { label: "Em andamento", color: "#EF9F27", icon: "ti-loader-2",      Icon: Loader2 },
  resolvido:    { label: "Aguardando validação", color: "#22c55e", icon: "ti-circle-check", Icon: CheckCircle },
  fechado:      { label: "Fechado",      color: "#94a3b8", icon: "ti-circle-x",      Icon: XCircle },
  reaberto:     { label: "Reaberto",     color: "#a855f7", icon: "ti-arrow-back-up", Icon: RotateCcw },
};

export const TICKET_PRIORITY_MAP: Record<TicketPriority, { label: string; color: string }> = {
  baixa: { label: "Baixa", color: "#94a3b8" },
  media: { label: "Média", color: "#EF9F27" },
  alta:  { label: "Alta",  color: "#ef4444" },
};
