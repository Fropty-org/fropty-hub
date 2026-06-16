export type BarbStatus = "disponivel" | "atendendo" | "folga";
export type AgendStatus = "confirmado" | "pendente" | "chegou" | "cancelado";

export type Barbeiro = {
  id: number; name: string; specialty: string; status: BarbStatus;
  rating: number; reviewCount: number; color: string; monthlyCount: number;
};

export type Agendamento = {
  id: number; clienteNome: string; telefone: string; servico: string;
  barbeiro: string; barbeiroId: number; hora: string; dia: number;
  duracao: number; status: AgendStatus; observacoes?: string; valor: number;
};

export type Servico = {
  id: number; nome: string; preco: number; duracao: number; ativo: boolean; descricao: string;
};

export type ClienteBarb = {
  id: number; nome: string; telefone: string; ultimaVisita: string;
  servicosFavoritos: string[]; totalGasto: number; visitas: number;
  observacoes: string; status: "vip" | "regular" | "novo";
};

export type FilaItem = {
  id: number; nome: string; servico: string; entrada: string; espera: number;
};

export const SERVICOS: Servico[] = [
  { id: 1, nome: "Corte Masculino", preco: 45, duracao: 30, ativo: true, descricao: "Corte tradicional ou moderno, tesoura ou máquina" },
  { id: 2, nome: "Barba", preco: 35, duracao: 30, ativo: true, descricao: "Aparar, modelar ou fazer a barba na navalha" },
  { id: 3, nome: "Combo (Corte + Barba)", preco: 70, duracao: 55, ativo: true, descricao: "Corte completo + barba na navalha. Nosso mais pedido!" },
  { id: 4, nome: "Progressiva Masculina", preco: 120, duracao: 90, ativo: true, descricao: "Alinhamento e progressiva para cabelos rebeldes" },
  { id: 5, nome: "Coloração", preco: 90, duracao: 75, ativo: false, descricao: "Coloração profissional com produtos premium" },
  { id: 6, nome: "Sobrancelha", preco: 20, duracao: 15, ativo: true, descricao: "Design de sobrancelha com pinça e navalha" },
];

export const BARBEIROS: Barbeiro[] = [
  { id: 1, name: "Rafael Costa", specialty: "Cortes clássicos e degradê", status: "disponivel", rating: 4.9, reviewCount: 312, color: "#c9a84c", monthlyCount: 87 },
  { id: 2, name: "Marcos Vinicius", specialty: "Barbas e navalha", status: "atendendo", rating: 4.7, reviewCount: 198, color: "#5B57E8", monthlyCount: 64 },
  { id: 3, name: "Bruno Alves", specialty: "Progressivas e coloração", status: "atendendo", rating: 4.8, reviewCount: 241, color: "#10B981", monthlyCount: 72 },
  { id: 4, name: "Diego Santos", specialty: "Cortes modernos e desenho", status: "folga", rating: 4.6, reviewCount: 156, color: "#EF9F27", monthlyCount: 53 },
];

export const AGENDAMENTOS: Agendamento[] = [
  { id: 1, clienteNome: "Carlos Mendes", telefone: "(11) 99234-5678", servico: "Combo (Corte + Barba)", barbeiro: "Rafael Costa", barbeiroId: 1, hora: "08:00", dia: 0, duracao: 55, status: "chegou", observacoes: "Cliente VIP", valor: 70 },
  { id: 2, clienteNome: "João Paulo Silva", telefone: "(11) 98765-4321", servico: "Corte Masculino", barbeiro: "Marcos Vinicius", barbeiroId: 2, hora: "09:00", dia: 0, duracao: 30, status: "confirmado", valor: 45 },
  { id: 3, clienteNome: "Renato Carvalho", telefone: "(11) 97654-3210", servico: "Barba", barbeiro: "Bruno Alves", barbeiroId: 3, hora: "10:00", dia: 0, duracao: 30, status: "chegou", valor: 35 },
  { id: 4, clienteNome: "Fábio Nascimento", telefone: "(11) 96543-2109", servico: "Sobrancelha", barbeiro: "Rafael Costa", barbeiroId: 1, hora: "11:00", dia: 0, duracao: 15, status: "pendente", valor: 20 },
  { id: 5, clienteNome: "André Luiz Ferreira", telefone: "(11) 95432-1098", servico: "Corte Masculino", barbeiro: "Marcos Vinicius", barbeiroId: 2, hora: "08:30", dia: 1, duracao: 30, status: "confirmado", valor: 45 },
  { id: 6, clienteNome: "Marcelo Souza", telefone: "(11) 94321-0987", servico: "Combo (Corte + Barba)", barbeiro: "Rafael Costa", barbeiroId: 1, hora: "09:30", dia: 1, duracao: 55, status: "confirmado", valor: 70 },
  { id: 7, clienteNome: "Eduardo Ribeiro", telefone: "(11) 93210-9876", servico: "Progressiva Masculina", barbeiro: "Bruno Alves", barbeiroId: 3, hora: "10:30", dia: 1, duracao: 90, status: "pendente", valor: 120 },
  { id: 8, clienteNome: "Leonardo Martins", telefone: "(11) 92109-8765", servico: "Barba", barbeiro: "Marcos Vinicius", barbeiroId: 2, hora: "14:00", dia: 1, duracao: 30, status: "confirmado", valor: 35 },
  { id: 9, clienteNome: "Rodrigo Pereira", telefone: "(11) 91098-7654", servico: "Corte Masculino", barbeiro: "Bruno Alves", barbeiroId: 3, hora: "09:00", dia: 2, duracao: 30, status: "confirmado", valor: 45 },
  { id: 10, clienteNome: "Alexandre Costa", telefone: "(11) 90987-6543", servico: "Combo (Corte + Barba)", barbeiro: "Rafael Costa", barbeiroId: 1, hora: "10:00", dia: 2, duracao: 55, status: "confirmado", valor: 70 },
  { id: 11, clienteNome: "Sérgio Andrade", telefone: "(11) 89876-5432", servico: "Sobrancelha", barbeiro: "Marcos Vinicius", barbeiroId: 2, hora: "11:00", dia: 2, duracao: 15, status: "cancelado", valor: 20 },
  { id: 12, clienteNome: "Flávio Lima", telefone: "(11) 88765-4321", servico: "Progressiva Masculina", barbeiro: "Bruno Alves", barbeiroId: 3, hora: "08:00", dia: 3, duracao: 90, status: "confirmado", valor: 120 },
  { id: 13, clienteNome: "Paulo Roberto Santos", telefone: "(11) 87654-3210", servico: "Barba", barbeiro: "Rafael Costa", barbeiroId: 1, hora: "10:30", dia: 3, duracao: 30, status: "pendente", valor: 35 },
  { id: 14, clienteNome: "Márcio Oliveira", telefone: "(11) 86543-2109", servico: "Corte Masculino", barbeiro: "Marcos Vinicius", barbeiroId: 2, hora: "14:00", dia: 3, duracao: 30, status: "confirmado", valor: 45 },
  { id: 15, clienteNome: "Hélio Barbosa", telefone: "(11) 85432-1098", servico: "Combo (Corte + Barba)", barbeiro: "Bruno Alves", barbeiroId: 3, hora: "15:30", dia: 3, duracao: 55, status: "pendente", valor: 70 },
  { id: 16, clienteNome: "Vinícius Rodrigues", telefone: "(11) 84321-0987", servico: "Corte Masculino", barbeiro: "Rafael Costa", barbeiroId: 1, hora: "09:00", dia: 4, duracao: 30, status: "confirmado", valor: 45 },
  { id: 17, clienteNome: "Caio Henrique Alves", telefone: "(11) 83210-9876", servico: "Barba", barbeiro: "Marcos Vinicius", barbeiroId: 2, hora: "10:00", dia: 4, duracao: 30, status: "confirmado", valor: 35 },
  { id: 18, clienteNome: "Guilherme Moreira", telefone: "(11) 82109-8765", servico: "Combo (Corte + Barba)", barbeiro: "Bruno Alves", barbeiroId: 3, hora: "11:00", dia: 4, duracao: 55, status: "pendente", valor: 70 },
  { id: 19, clienteNome: "Rafael Augusto Nunes", telefone: "(11) 81098-7654", servico: "Corte Masculino", barbeiro: "Rafael Costa", barbeiroId: 1, hora: "09:30", dia: 5, duracao: 30, status: "confirmado", valor: 45 },
  { id: 20, clienteNome: "Felipe Cunha", telefone: "(11) 80987-6543", servico: "Progressiva Masculina", barbeiro: "Bruno Alves", barbeiroId: 3, hora: "11:00", dia: 5, duracao: 90, status: "confirmado", valor: 120 },
  { id: 21, clienteNome: "Thiago Cardoso", telefone: "(11) 79876-5432", servico: "Sobrancelha", barbeiro: "Marcos Vinicius", barbeiroId: 2, hora: "14:00", dia: 5, duracao: 15, status: "pendente", valor: 20 },
  { id: 22, clienteNome: "Mateus Gomes", telefone: "(11) 78765-4321", servico: "Combo (Corte + Barba)", barbeiro: "Rafael Costa", barbeiroId: 1, hora: "09:00", dia: 6, duracao: 55, status: "confirmado", valor: 70 },
  { id: 23, clienteNome: "Danilo Freitas", telefone: "(11) 77654-3210", servico: "Barba", barbeiro: "Marcos Vinicius", barbeiroId: 2, hora: "10:30", dia: 6, duracao: 30, status: "confirmado", valor: 35 },
];

export const CLIENTES: ClienteBarb[] = [
  { id: 1, nome: "Carlos Mendes", telefone: "(11) 99234-5678", ultimaVisita: "12/06/2026", servicosFavoritos: ["Combo (Corte + Barba)"], totalGasto: 840, visitas: 12, observacoes: "Prefere Rafael. VIP desde 2024.", status: "vip" },
  { id: 2, nome: "João Paulo Silva", telefone: "(11) 98765-4321", ultimaVisita: "10/06/2026", servicosFavoritos: ["Corte Masculino"], totalGasto: 315, visitas: 7, observacoes: "", status: "regular" },
  { id: 3, nome: "Marcelo Souza", telefone: "(11) 94321-0987", ultimaVisita: "08/06/2026", servicosFavoritos: ["Combo (Corte + Barba)", "Barba"], totalGasto: 560, visitas: 8, observacoes: "Alérgico a alguns produtos", status: "vip" },
  { id: 4, nome: "Eduardo Ribeiro", telefone: "(11) 93210-9876", ultimaVisita: "05/06/2026", servicosFavoritos: ["Progressiva Masculina"], totalGasto: 480, visitas: 4, observacoes: "", status: "regular" },
  { id: 5, nome: "Leonardo Martins", telefone: "(11) 92109-8765", ultimaVisita: "03/06/2026", servicosFavoritos: ["Barba"], totalGasto: 175, visitas: 5, observacoes: "", status: "regular" },
  { id: 6, nome: "Rodrigo Pereira", telefone: "(11) 91098-7654", ultimaVisita: "01/06/2026", servicosFavoritos: ["Corte Masculino"], totalGasto: 90, visitas: 2, observacoes: "Novo cliente", status: "novo" },
  { id: 7, nome: "Alexandre Costa", telefone: "(11) 90987-6543", ultimaVisita: "28/05/2026", servicosFavoritos: ["Combo (Corte + Barba)"], totalGasto: 700, visitas: 10, observacoes: "", status: "vip" },
  { id: 8, nome: "Paulo Roberto Santos", telefone: "(11) 87654-3210", ultimaVisita: "25/05/2026", servicosFavoritos: ["Barba", "Sobrancelha"], totalGasto: 220, visitas: 4, observacoes: "", status: "regular" },
  { id: 9, nome: "Vinícius Rodrigues", telefone: "(11) 84321-0987", ultimaVisita: "20/05/2026", servicosFavoritos: ["Corte Masculino"], totalGasto: 45, visitas: 1, observacoes: "Primeira visita", status: "novo" },
  { id: 10, nome: "Guilherme Moreira", telefone: "(11) 82109-8765", ultimaVisita: "15/05/2026", servicosFavoritos: ["Combo (Corte + Barba)"], totalGasto: 280, visitas: 4, observacoes: "", status: "regular" },
];

export const FILA: FilaItem[] = [
  { id: 1, nome: "Pedro Augusto", servico: "Corte Masculino", entrada: "14:20", espera: 15 },
  { id: 2, nome: "Leandro Ferreira", servico: "Barba", entrada: "14:35", espera: 30 },
  { id: 3, nome: "Thiago Rocha", servico: "Combo (Corte + Barba)", entrada: "14:40", espera: 45 },
  { id: 4, nome: "Gustavo Lima", servico: "Sobrancelha", entrada: "14:52", espera: 55 },
];

export const DASHBOARD_STATS = {
  agendamentosHoje: 12,
  clientesAtendidos: 8,
  faturamentoDia: 520,
  horarioPico: "10h–11h",
};

export const CHART_AGEND_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
export const CHART_AGEND_VALUES = [8, 12, 9, 15, 18, 22, 6];
