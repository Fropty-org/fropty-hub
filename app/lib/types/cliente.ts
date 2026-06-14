export type ProjectStatus =
  | "aguardando"
  | "em_desenvolvimento"
  | "revisao"
  | "entregue"
  | "manutencao";

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

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  projects: ClientProject[];
  tokenBalance: number;
  tokenHistory: TokenTransaction[];
  plan?: "basico" | "pro";
  planRenewal?: string;
}
