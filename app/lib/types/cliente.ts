export type TicketStatus = "aberto" | "em_andamento" | "resolvido" | "fechado" | "reaberto";
export type TicketPriority = "baixa" | "media" | "alta";

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
  clientName?: string;
  clientId?: string;
  ticketNumber?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  role?: "cliente" | "admin";
  tokenBalance: number;
  tokenHistory: TokenTransaction[];
  plan?: "sem_plano" | "basico" | "pro";
  planRenewal?: string;
}
