import type { LucideIcon } from "lucide-react";
import {
  Circle, FileText, Search, FileCheck, FileSignature,
  Wrench, Package, Headphones, XCircle,
} from "lucide-react";
import type { ProjectStatus, ContractStatus, ContractType } from "@/app/lib/types/projects";
import type { BadgeTone } from "@/app/lib/constants/status";

export const PROJECT_STATUSES: Record<ProjectStatus, { label: string; tone: BadgeTone; color: string; Icon: LucideIcon }> = {
  lead:      { label: "Lead",      tone: "neutral", color: "#94a3b8", Icon: Circle },
  briefing:  { label: "Briefing",  tone: "info",    color: "#3b82f6", Icon: FileText },
  escopo:    { label: "Escopo",    tone: "purple",  color: "#8b5cf6", Icon: Search },
  proposta:  { label: "Proposta",  tone: "warning", color: "#f59e0b", Icon: FileCheck },
  contrato:  { label: "Contrato",  tone: "accent",  color: "#EF9F27", Icon: FileSignature },
  execucao:  { label: "Execução",  tone: "cyan",    color: "#06b6d4", Icon: Wrench },
  entrega:   { label: "Entrega",   tone: "success", color: "#22c55e", Icon: Package },
  suporte:   { label: "Suporte",   tone: "purple",  color: "#a855f7", Icon: Headphones },
  encerrado: { label: "Encerrado", tone: "neutral", color: "#94a3b8", Icon: XCircle },
};

/**
 * Status considerados "ativos" — projeto em andamento, excluindo `lead`
 * (pré-venda, ainda não é do cliente) e `encerrado` (finalizado).
 * Fonte única para contagens de "projetos ativos" (dashboard, overview…).
 */
export const ACTIVE_PROJECT_STATUSES: ProjectStatus[] = [
  "briefing", "escopo", "proposta", "contrato", "execucao", "entrega", "suporte",
];

/**
 * Progresso (%) derivado do estágio do pipeline. Não há coluna `progress` no
 * banco — o avanço é inferido do `status`, mantendo lista/kanban/modal coerentes.
 */
const STATUS_PROGRESS: Record<ProjectStatus, number> = {
  lead: 5, briefing: 15, escopo: 30, proposta: 45, contrato: 60,
  execucao: 80, entrega: 95, suporte: 100, encerrado: 100,
};

export function projectProgress(status: string): number {
  return STATUS_PROGRESS[status as ProjectStatus] ?? 0;
}

export const PROJECT_PRIORITY_MAP: Record<string, { label: string; tone: BadgeTone; color: string }> = {
  critica: { label: "Crítica", tone: "danger",  color: "#ef4444" },
  alta:    { label: "Alta",    tone: "warning", color: "#f97316" },
  media:   { label: "Média",   tone: "info",    color: "#f59e0b" },
  baixa:   { label: "Baixa",   tone: "neutral", color: "#94a3b8" },
};

export const CONTRACT_STATUS_MAP: Record<ContractStatus, { label: string; tone: BadgeTone; color: string }> = {
  rascunho:  { label: "Rascunho",  tone: "neutral", color: "#94a3b8" },
  enviado:   { label: "Enviado",   tone: "info",    color: "#3b82f6" },
  assinado:  { label: "Assinado",  tone: "success", color: "#22c55e" },
  encerrado: { label: "Encerrado", tone: "neutral", color: "#94a3b8" },
  cancelado: { label: "Cancelado", tone: "danger",  color: "#ef4444" },
};

export const CONTRACT_TYPE_MAP: Record<ContractType, string> = {
  projeto:    "Projeto",
  retainer:   "Retainer",
  manutencao: "Manutenção",
  licenca:    "Licença",
  outro:      "Outro",
};
