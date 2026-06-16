export type OSStatus = "diagnostico" | "andamento" | "aguardando_peca" | "pronto" | "entregue";

export type OrdemServico = {
  id: string;
  clienteNome: string;
  telefone: string;
  veiculo: { placa: string; marca: string; modelo: string; ano: number; cor: string; km: number };
  defeitoRelatado: string;
  servicos: string[];
  pecas: { nome: string; codigo: string; quantidade: number; precoUnit: number }[];
  mecanico: string;
  mecanicoId: number;
  status: OSStatus;
  dataEntrada: string;
  previsaoEntrega: string;
  valorTotal: number;
  timeline: { hora: string; descricao: string }[];
};

export type Veiculo = {
  id: number; placa: string; marca: string; modelo: string; ano: number;
  cor: string; corHex: string; km: number; clienteNome: string; proximaRevisao: string;
};

export type Peca = {
  id: number; nome: string; codigo: string; quantidade: number; minimo: number;
  precoUnit: number; fornecedor: string;
};

export type Mecanico = {
  id: number; nome: string; especialidade: string; color: string;
  osMes: number; osAtual: string | null;
};

export type ClienteOficina = {
  id: number; nome: string; telefone: string; cidade: string;
  totalGasto: number; veiculosIds: number[];
};

export const MECANICOS: Mecanico[] = [
  { id: 1, nome: "Carlos Silva", especialidade: "Motor e elétrica", color: "#5B57E8", osMes: 18, osAtual: "#0042" },
  { id: 2, nome: "Fábio Mendonça", especialidade: "Suspensão e freios", color: "#10B981", osMes: 15, osAtual: "#0039" },
  { id: 3, nome: "Rodrigo Teixeira", especialidade: "Funilaria e pintura", color: "#EF9F27", osMes: 12, osAtual: null },
  { id: 4, nome: "Henrique Costa", especialidade: "Ar-condicionado e câmbio", color: "#8B5CF6", osMes: 9, osAtual: "#0041" },
];

export const ORDENS: OrdemServico[] = [
  {
    id: "#0042", clienteNome: "Roberto Almeida", telefone: "(11) 98765-4321",
    veiculo: { placa: "ABC-1234", marca: "Chevrolet", modelo: "Onix", ano: 2021, cor: "Prata", km: 48200 },
    defeitoRelatado: "Motor falhando em aceleração e barulho no escapamento",
    servicos: ["Diagnóstico elétrico", "Troca de velas", "Ajuste de escapamento"],
    pecas: [{ nome: "Vela de ignição", codigo: "VL-4401", quantidade: 4, precoUnit: 28 }, { nome: "Abraçadeira inox", codigo: "AB-220", quantidade: 2, precoUnit: 15 }],
    mecanico: "Carlos Silva", mecanicoId: 1, status: "andamento",
    dataEntrada: "14/06/2026", previsaoEntrega: "17/06/2026", valorTotal: 380,
    timeline: [{ hora: "09:15", descricao: "OS aberta — veículo recebido" }, { hora: "11:30", descricao: "Diagnóstico concluído — bobina defeituosa" }, { hora: "14:00", descricao: "Peças solicitadas ao fornecedor" }],
  },
  {
    id: "#0041", clienteNome: "Fernanda Lima", telefone: "(21) 97654-3210",
    veiculo: { placa: "DEF-5678", marca: "Toyota", modelo: "Corolla", ano: 2020, cor: "Branco", km: 62400 },
    defeitoRelatado: "Ar-condicionado não gela e câmbio automático solavancando",
    servicos: ["Recarga de ar-condicionado", "Verificação do câmbio automático"],
    pecas: [{ nome: "Fluido de transmissão ATF", codigo: "FT-880", quantidade: 3, precoUnit: 45 }],
    mecanico: "Henrique Costa", mecanicoId: 4, status: "aguardando_peca",
    dataEntrada: "13/06/2026", previsaoEntrega: "18/06/2026", valorTotal: 620,
    timeline: [{ hora: "08:30", descricao: "Veículo recebido" }, { hora: "10:45", descricao: "Diagnóstico concluído" }, { hora: "13:00", descricao: "Aguardando chegada do fluido ATF" }],
  },
  {
    id: "#0040", clienteNome: "Paulo Henrique Santos", telefone: "(31) 96543-2109",
    veiculo: { placa: "GHI-9012", marca: "Volkswagen", modelo: "Gol", ano: 2018, cor: "Vermelho", km: 87300 },
    defeitoRelatado: "Freios falhando, pedal mole e barulho ao frear",
    servicos: ["Troca de pastilhas dianteiras", "Sangria do sistema de freios", "Troca de disco de freio"],
    pecas: [{ nome: "Pastilha de freio dianteira", codigo: "PF-220", quantidade: 2, precoUnit: 85 }, { nome: "Disco de freio", codigo: "DF-180", quantidade: 2, precoUnit: 120 }],
    mecanico: "Fábio Mendonça", mecanicoId: 2, status: "pronto",
    dataEntrada: "12/06/2026", previsaoEntrega: "15/06/2026", valorTotal: 540,
    timeline: [{ hora: "07:50", descricao: "Veículo recebido" }, { hora: "09:30", descricao: "Diagnóstico de freios realizado" }, { hora: "14:20", descricao: "Serviço concluído — cliente avisado" }],
  },
  {
    id: "#0039", clienteNome: "Claudia Pereira", telefone: "(41) 95432-1098",
    veiculo: { placa: "JKL-3456", marca: "Fiat", modelo: "Strada", ano: 2022, cor: "Preto", km: 31800 },
    defeitoRelatado: "Suspensão batendo em buraco e direção com folga",
    servicos: ["Troca de amortecedores dianteiros", "Alinhamento e balanceamento"],
    pecas: [{ nome: "Amortecedor dianteiro", codigo: "AM-44D", quantidade: 2, precoUnit: 220 }],
    mecanico: "Fábio Mendonça", mecanicoId: 2, status: "andamento",
    dataEntrada: "16/06/2026", previsaoEntrega: "17/06/2026", valorTotal: 680,
    timeline: [{ hora: "08:00", descricao: "Veículo recebido" }, { hora: "09:15", descricao: "Desmontagem iniciada" }],
  },
  {
    id: "#0038", clienteNome: "Bruno Castilho", telefone: "(51) 94321-0987",
    veiculo: { placa: "MNO-7890", marca: "Honda", modelo: "Civic", ano: 2019, cor: "Azul", km: 55100 },
    defeitoRelatado: "Motor superaquecendo e vazamento de líquido de arrefecimento",
    servicos: ["Troca de radiador", "Troca de mangueiras", "Flush do sistema de arrefecimento"],
    pecas: [{ nome: "Radiador completo", codigo: "RD-Civic19", quantidade: 1, precoUnit: 480 }, { nome: "Mangueira superior", codigo: "MG-SUP", quantidade: 1, precoUnit: 65 }],
    mecanico: "Carlos Silva", mecanicoId: 1, status: "diagnostico",
    dataEntrada: "16/06/2026", previsaoEntrega: "19/06/2026", valorTotal: 890,
    timeline: [{ hora: "11:00", descricao: "Veículo recebido — motor frio para inspeção" }],
  },
  {
    id: "#0037", clienteNome: "Mariana Azevedo", telefone: "(62) 93210-9876",
    veiculo: { placa: "PQR-1234", marca: "Renault", modelo: "Kwid", ano: 2023, cor: "Laranja", km: 18700 },
    defeitoRelatado: "Revisão dos 20.000 km",
    servicos: ["Troca de óleo e filtro", "Revisão de freios", "Verificação geral"],
    pecas: [{ nome: "Óleo motor 5W30", codigo: "OL-5W30", quantidade: 4, precoUnit: 28 }, { nome: "Filtro de óleo", codigo: "FO-440", quantidade: 1, precoUnit: 25 }],
    mecanico: "Rodrigo Teixeira", mecanicoId: 3, status: "entregue",
    dataEntrada: "10/06/2026", previsaoEntrega: "10/06/2026", valorTotal: 220,
    timeline: [{ hora: "08:30", descricao: "Veículo recebido" }, { hora: "11:00", descricao: "Revisão concluída" }, { hora: "14:30", descricao: "Veículo entregue ao cliente" }],
  },
  {
    id: "#0036", clienteNome: "Gustavo Ramos", telefone: "(71) 92109-8765",
    veiculo: { placa: "STU-5678", marca: "Jeep", modelo: "Renegade", ano: 2021, cor: "Cinza", km: 42000 },
    defeitoRelatado: "Ruído no motor ao acelerar e perda de potência",
    servicos: ["Troca de correia dentada", "Troca de tensionador", "Regulagem de motor"],
    pecas: [{ nome: "Correia dentada", codigo: "CD-Rene21", quantidade: 1, precoUnit: 180 }, { nome: "Tensionador", codigo: "TN-220", quantidade: 1, precoUnit: 95 }],
    mecanico: "Carlos Silva", mecanicoId: 1, status: "pronto",
    dataEntrada: "14/06/2026", previsaoEntrega: "16/06/2026", valorTotal: 750,
    timeline: [{ hora: "07:45", descricao: "Veículo recebido" }, { hora: "15:30", descricao: "Troca concluída — pronto para retirada" }],
  },
];

export const VEICULOS: Veiculo[] = [
  { id: 1, placa: "ABC-1234", marca: "Chevrolet", modelo: "Onix", ano: 2021, cor: "Prata", corHex: "#C0C0C0", km: 48200, clienteNome: "Roberto Almeida", proximaRevisao: "60.000 km ou Dez/2026" },
  { id: 2, placa: "DEF-5678", marca: "Toyota", modelo: "Corolla", ano: 2020, cor: "Branco", corHex: "#F5F5F5", km: 62400, clienteNome: "Fernanda Lima", proximaRevisao: "70.000 km ou Mar/2027" },
  { id: 3, placa: "GHI-9012", marca: "Volkswagen", modelo: "Gol", ano: 2018, cor: "Vermelho", corHex: "#DC2626", km: 87300, clienteNome: "Paulo Santos", proximaRevisao: "90.000 km ou Jun/2026" },
  { id: 4, placa: "JKL-3456", marca: "Fiat", modelo: "Strada", ano: 2022, cor: "Preto", corHex: "#1F2937", km: 31800, clienteNome: "Claudia Pereira", proximaRevisao: "40.000 km ou Nov/2026" },
  { id: 5, placa: "MNO-7890", marca: "Honda", modelo: "Civic", ano: 2019, cor: "Azul", corHex: "#1D4ED8", km: 55100, clienteNome: "Bruno Castilho", proximaRevisao: "60.000 km ou Ago/2026" },
  { id: 6, placa: "STU-5678", marca: "Jeep", modelo: "Renegade", ano: 2021, cor: "Cinza", corHex: "#6B7280", km: 42000, clienteNome: "Gustavo Ramos", proximaRevisao: "50.000 km ou Jan/2027" },
];

export const PECAS: Peca[] = [
  { id: 1, nome: "Filtro de óleo", codigo: "FO-440", quantidade: 12, minimo: 5, precoUnit: 25, fornecedor: "Filtros Brasil" },
  { id: 2, nome: "Pastilha de freio dianteira", codigo: "PF-220", quantidade: 6, minimo: 4, precoUnit: 85, fornecedor: "Freios Premium" },
  { id: 3, nome: "Correia dentada universal", codigo: "CD-UNIV", quantidade: 1, minimo: 3, precoUnit: 180, fornecedor: "Gates Brasil" },
  { id: 4, nome: "Fluido de freio DOT 4", codigo: "FF-DOT4", quantidade: 8, minimo: 3, precoUnit: 22, fornecedor: "Bosch Auto" },
  { id: 5, nome: "Amortecedor dianteiro", codigo: "AM-44D", quantidade: 0, minimo: 2, precoUnit: 220, fornecedor: "Monroe BR" },
  { id: 6, nome: "Óleo motor 5W30 (1L)", codigo: "OL-5W30", quantidade: 24, minimo: 10, precoUnit: 28, fornecedor: "Shell Helix" },
  { id: 7, nome: "Rolamento de roda dianteiro", codigo: "RW-DT", quantidade: 2, minimo: 4, precoUnit: 145, fornecedor: "SKF Brasil" },
  { id: 8, nome: "Filtro de ar", codigo: "FA-220", quantidade: 9, minimo: 4, precoUnit: 35, fornecedor: "Filtros Brasil" },
  { id: 9, nome: "Bateria 60Ah", codigo: "BAT-60", quantidade: 3, minimo: 2, precoUnit: 380, fornecedor: "Moura Baterias" },
  { id: 10, nome: "Pneu 195/65R15", codigo: "PN-195R15", quantidade: 4, minimo: 2, precoUnit: 290, fornecedor: "Pirelli BR" },
];

export const CLIENTES_OFICINA: ClienteOficina[] = [
  { id: 1, nome: "Roberto Almeida", telefone: "(11) 98765-4321", cidade: "São Paulo, SP", totalGasto: 1840, veiculosIds: [1] },
  { id: 2, nome: "Fernanda Lima", telefone: "(21) 97654-3210", cidade: "Rio de Janeiro, RJ", totalGasto: 920, veiculosIds: [2] },
  { id: 3, nome: "Paulo Henrique Santos", telefone: "(31) 96543-2109", cidade: "Belo Horizonte, MG", totalGasto: 1240, veiculosIds: [3] },
  { id: 4, nome: "Claudia Pereira", telefone: "(41) 95432-1098", cidade: "Curitiba, PR", totalGasto: 680, veiculosIds: [4] },
  { id: 5, nome: "Bruno Castilho", telefone: "(51) 94321-0987", cidade: "Porto Alegre, RS", totalGasto: 2100, veiculosIds: [5] },
  { id: 6, nome: "Gustavo Ramos", telefone: "(71) 92109-8765", cidade: "Salvador, BA", totalGasto: 1560, veiculosIds: [6] },
];

export const DASHBOARD_OS_STATS = { osAbertas: 7, veiculosOficina: 5, faturamentoMes: 12840, pecasCriticas: 3 };
export const CHART_OS_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const CHART_OS_ABERTAS = [3, 5, 4, 7, 6, 4];
export const CHART_OS_FECHADAS = [2, 4, 5, 4, 5, 3];

export const OS_STATUS_MAP: Record<OSStatus, { label: string; bg: string; color: string }> = {
  diagnostico: { label: "Aguardando diagnóstico", bg: "rgba(234,179,8,0.15)", color: "#ca8a04" },
  andamento: { label: "Em andamento", bg: "rgba(59,130,246,0.15)", color: "#3b82f6" },
  aguardando_peca: { label: "Aguardando peça", bg: "rgba(239,159,39,0.15)", color: "#EF9F27" },
  pronto: { label: "Pronto p/ retirada", bg: "rgba(16,185,129,0.15)", color: "#10B981" },
  entregue: { label: "Entregue", bg: "rgba(107,114,128,0.1)", color: "#9ca3af" },
};
