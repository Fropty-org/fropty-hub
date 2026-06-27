export type ProjectStatus =
  | "lead"
  | "briefing"
  | "escopo"
  | "proposta"
  | "contrato"
  | "execucao"
  | "entrega"
  | "suporte"
  | "encerrado";

export type ProjectPriority = "critica" | "alta" | "media" | "baixa";

export interface Project {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  estimated_hours?: number;
  estimated_cost?: number;
  start_date?: string;
  due_date?: string;
  delivered_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  client_name?: string;
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  author_id: string;
  content: string;
  status_from?: string;
  status_to?: string;
  created_at: string;
  author_name?: string;
}

export type ContractStatus = "rascunho" | "enviado" | "assinado" | "encerrado" | "cancelado";

export type ContractType = "projeto" | "retainer" | "manutencao" | "licenca" | "outro";

export interface Contract {
  id: string;
  client_id: string;
  project_id?: string;
  title: string;
  description?: string;
  status: ContractStatus;
  type: ContractType;
  value?: number;
  start_date?: string;
  end_date?: string;
  file_url?: string;
  signed_at?: string;
  created_at: string;
  updated_at: string;
  client_name?: string;
  project_title?: string;
}
