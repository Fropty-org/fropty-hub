import {
  LayoutGrid, Activity, ShoppingBag, Briefcase, School, BarChart2,
  Stethoscope, ShoppingCart, Wrench, Dumbbell, BookOpen, Bike, Coins, Building2,
  type LucideIcon,
} from "lucide-react";

export type Category = "todos" | "saude" | "comercio" | "servicos" | "educacao" | "gestao";

export interface PortfolioItem {
  id: string;
  title: string;
  category: Category;
  description: string;
  tags: string[];
  /** @deprecated Use Icon instead */
  icon: string;
  Icon: LucideIcon;
  color: string;
  addons: string[];
  highlight?: boolean;
}

export const CATEGORIES: { id: Category; label: string; /** @deprecated */ icon: string; Icon: LucideIcon }[] = [
  { id: "todos",    label: "Todos",      icon: "ti-layout-grid",         Icon: LayoutGrid },
  { id: "saude",    label: "Saúde",      icon: "ti-heart-rate-monitor",  Icon: Activity },
  { id: "comercio", label: "Comércio",   icon: "ti-shopping-bag",        Icon: ShoppingBag },
  { id: "servicos", label: "Serviços",   icon: "ti-briefcase",           Icon: Briefcase },
  { id: "educacao", label: "Educação",   icon: "ti-school",              Icon: School },
  { id: "gestao",   label: "Gestão",     icon: "ti-chart-bar",           Icon: BarChart2 },
];

export const PORTFOLIO: PortfolioItem[] = [
  {
    id: "clinica",
    title: "Agendamento de clínica",
    category: "saude",
    description: "App de agendamento online com confirmação por WhatsApp, prontuário digital e painel para recepcionistas.",
    tags: ["Agendamento", "WhatsApp", "Painel admin"],
    icon: "ti-stethoscope",
    Icon: Stethoscope,
    color: "#22c55e",
    addons: ["Integração WhatsApp", "Painel administrativo", "Notificações push"],
    highlight: true,
  },
  {
    id: "loja",
    title: "Catálogo + pedidos",
    category: "comercio",
    description: "Catálogo digital com carrinho de compras, integração de pagamento e gestão de estoque simplificada.",
    tags: ["E-commerce", "Estoque", "Pagamentos"],
    icon: "ti-shopping-cart",
    Icon: ShoppingCart,
    color: "#f97316",
    addons: ["Login com Google", "Relatórios e exportação", "Backup automático"],
  },
  {
    id: "prestador",
    title: "App para prestadores",
    category: "servicos",
    description: "Agenda de clientes, orçamentos digitais, controle de pagamentos e histórico de serviços realizados.",
    tags: ["Agenda", "Orçamentos", "Financeiro"],
    icon: "ti-tool",
    Icon: Wrench,
    color: "var(--primary)",
    addons: ["Notificações push", "Relatórios e exportação"],
  },
  {
    id: "academia",
    title: "Gestão de academia",
    category: "saude",
    description: "Controle de matrículas, frequência de alunos, planos mensais e integração com catraca via QR code.",
    tags: ["Matrículas", "Frequência", "QR code"],
    icon: "ti-barbell",
    Icon: Dumbbell,
    color: "#a855f7",
    addons: ["Login com Google", "Painel administrativo", "Backup automático"],
  },
  {
    id: "escola",
    title: "Portal para escola",
    category: "educacao",
    description: "Comunicados para pais, lançamento de notas, agenda escolar e chat entre professores e responsáveis.",
    tags: ["Comunicados", "Notas", "Chat"],
    icon: "ti-book",
    Icon: BookOpen,
    color: "#3b82f6",
    addons: ["Notificações push", "Membro administrativo adicional"],
    highlight: true,
  },
  {
    id: "delivery",
    title: "App de delivery local",
    category: "comercio",
    description: "Cardápio digital, pedidos em tempo real, rastreamento de entregadores e painel do restaurante.",
    tags: ["Delivery", "Tempo real", "Rastreamento"],
    icon: "ti-bike",
    Icon: Bike,
    color: "#ef4444",
    addons: ["Painel administrativo", "Notificações push", "WhatsApp"],
  },
  {
    id: "financeiro",
    title: "Controle financeiro",
    category: "gestao",
    description: "Lançamento de receitas e despesas, relatórios por categoria, metas mensais e exportação em Excel.",
    tags: ["Finanças", "Relatórios", "Metas"],
    icon: "ti-coins",
    Icon: Coins,
    color: "#EF9F27",
    addons: ["Relatórios e exportação", "Backup automático", "Login com Google"],
  },
  {
    id: "imobiliaria",
    title: "Imobiliária digital",
    category: "servicos",
    description: "Catálogo de imóveis com filtros avançados, agendamento de visitas e gestão de propostas.",
    tags: ["Imóveis", "Filtros", "Visitas"],
    icon: "ti-building",
    Icon: Building2,
    color: "#06b6d4",
    addons: ["Painel administrativo", "Relatórios e exportação"],
  },
];
