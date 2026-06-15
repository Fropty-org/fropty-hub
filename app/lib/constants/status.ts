import type { ProjectStatus } from "@/app/lib/types/cliente";

export const STATUS_MAP: Record<ProjectStatus, { label: string; color: string; icon: string }> = {
  aguardando:         { label: "Aguardando início",  color: "#94a3b8", icon: "ti-clock" },
  em_desenvolvimento: { label: "Em desenvolvimento", color: "#3b82f6", icon: "ti-code" },
  revisao:            { label: "Em revisão",          color: "#EF9F27", icon: "ti-eye" },
  entregue:           { label: "Entregue",            color: "#22c55e", icon: "ti-circle-check" },
  manutencao:         { label: "Em manutenção",       color: "var(--primary)", icon: "ti-tools" },
};

export type TicketStatus = "aberto" | "em_andamento" | "resolvido" | "fechado";
export type TicketPriority = "baixa" | "media" | "alta";

export const TICKET_STATUS_MAP: Record<TicketStatus, { label: string; color: string; icon: string }> = {
  aberto:       { label: "Aberto",       color: "#3b82f6", icon: "ti-circle-dot" },
  em_andamento: { label: "Em andamento", color: "#EF9F27", icon: "ti-loader-2" },
  resolvido:    { label: "Resolvido",    color: "#22c55e", icon: "ti-circle-check" },
  fechado:      { label: "Fechado",      color: "#94a3b8", icon: "ti-circle-x" },
};

export const TICKET_PRIORITY_MAP: Record<TicketPriority, { label: string; color: string }> = {
  baixa: { label: "Baixa", color: "#94a3b8" },
  media: { label: "Média", color: "#EF9F27" },
  alta:  { label: "Alta",  color: "#ef4444" },
};
