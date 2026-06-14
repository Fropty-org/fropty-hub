import type { ClientUser } from "../types/cliente";

export const MOCK_USER: ClientUser = {
  id: "usr_demo",
  name: "João Empreendedor",
  email: "joao@meunegocio.com.br",
  avatarInitials: "JE",
  plan: "pro",
  planRenewal: "2026-07-14",
  tokenBalance: 5,
  projects: [
    {
      id: "proj_001",
      name: "App de Agendamento",
      status: "em_desenvolvimento",
      startedAt: "2026-05-20",
      progress: 65,
      description: "App de agendamento online para clínica odontológica com painel admin e confirmação por WhatsApp.",
      addons: ["Painel administrativo", "Integração WhatsApp", "Notificações push"],
      maintenancePlan: "pro",
    },
    {
      id: "proj_002",
      name: "Catálogo Digital",
      status: "entregue",
      startedAt: "2026-02-10",
      deliveredAt: "2026-03-18",
      progress: 100,
      description: "Catálogo de produtos com carrinho e integração de pagamento para loja de roupas.",
      addons: ["Login com Google", "Relatórios e exportação"],
    },
  ],
  tokenHistory: [
    { id: "t1", date: "2026-06-01", description: "Recarga mensal — Plano Pro", type: "credit", amount: 8, balance: 8 },
    { id: "t2", date: "2026-06-05", description: "Ajuste de layout — tela de agendamento", type: "debit", amount: 1, balance: 7 },
    { id: "t3", date: "2026-06-10", description: "Nova funcionalidade — filtro por especialidade", type: "debit", amount: 2, balance: 5 },
    { id: "t4", date: "2026-05-01", description: "Recarga mensal — Plano Pro", type: "credit", amount: 8, balance: 8 },
    { id: "t5", date: "2026-05-08", description: "Correção de bug — notificação duplicada", type: "debit", amount: 1, balance: 7 },
    { id: "t6", date: "2026-05-15", description: "Integração WhatsApp — ajuste de mensagem", type: "debit", amount: 2, balance: 5 },
  ],
};
