export type ProjectStatus =
  | "aguardando"
  | "em_desenvolvimento"
  | "revisao"
  | "entregue"
  | "manutencao";

export type TicketStatus = "aberto" | "em_andamento" | "resolvido" | "fechado";
export type TicketPriority = "baixa" | "media" | "alta";

export interface ClientProject {
  id: string;
  name: string;
  status: ProjectStatus;
  startedAt: string;
  deliveredAt?: string;
  progress: number; // 0-100
  description: string;
  addons: string[];
  maintenancePlan?: "basico" | "pro";
}

export interface TokenTransaction {
  id: string;
  date: string;
  description: string;
  type: "credit" | "debit";
  amount: number;
  balance: number;
}

export interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  projectId?: string;
  projectName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  role?: "cliente" | "dev" | "admin";
  projects: ClientProject[];
  tokenBalance: number;
  tokenHistory: TokenTransaction[];
  plan?: "sem_plano" | "basico" | "pro";
  planRenewal?: string;
}
