import type { LucideIcon } from "lucide-react";
import {
  Circle, FileText, Search, FileCheck, FileSignature,
  Wrench, Package, Headphones, XCircle,
} from "lucide-react";
import type { ProjectStatus, ContractStatus, ContractType } from "@/app/lib/types/projects";

export const PROJECT_STATUSES: Record<ProjectStatus, { label: string; color: string; Icon: LucideIcon }> = {
  lead:      { label: "Lead",      color: "#94a3b8", Icon: Circle },
  briefing:  { label: "Briefing",  color: "#3b82f6", Icon: FileText },
  escopo:    { label: "Escopo",    color: "#8b5cf6", Icon: Search },
  proposta:  { label: "Proposta",  color: "#f59e0b", Icon: FileCheck },
  contrato:  { label: "Contrato",  color: "#EF9F27", Icon: FileSignature },
  execucao:  { label: "Execução",  color: "#06b6d4", Icon: Wrench },
  entrega:   { label: "Entrega",   color: "#22c55e", Icon: Package },
  suporte:   { label: "Suporte",   color: "#a855f7", Icon: Headphones },
  encerrado: { label: "Encerrado", color: "#94a3b8", Icon: XCircle },
};

export const PROJECT_PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  critica: { label: "Crítica", color: "#ef4444" },
  alta:    { label: "Alta",    color: "#f97316" },
  media:   { label: "Média",   color: "#f59e0b" },
  baixa:   { label: "Baixa",   color: "#94a3b8" },
};

export const CONTRACT_STATUS_MAP: Record<ContractStatus, { label: string; color: string }> = {
  rascunho:  { label: "Rascunho",  color: "#94a3b8" },
  enviado:   { label: "Enviado",   color: "#3b82f6" },
  assinado:  { label: "Assinado",  color: "#22c55e" },
  encerrado: { label: "Encerrado", color: "#94a3b8" },
  cancelado: { label: "Cancelado", color: "#ef4444" },
};

export const CONTRACT_TYPE_MAP: Record<ContractType, string> = {
  projeto:    "Projeto",
  retainer:   "Retainer",
  manutencao: "Manutenção",
  licenca:    "Licença",
  outro:      "Outro",
};
