export type Role = "visitor" | "admin";
export type Section =
  | "dashboard"
  | "catalog"
  | "orders"
  | "customers"
  | "financial"
  | "notifications"
  | "profile"
  | "admin";
export type ToastType = "success" | "error" | "warning" | "info";
export type Toast = { id: string; type: ToastType; message: string };

export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  available: boolean;
  description: string;
  color: string;
  image: string;
};

export type CartItem = { product: Product; qty: number };

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  discount: number;
  status: "delivered" | "preparing" | "cancelled";
  date: Date;
  customer: string;
};

export type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  totalSpent: number;
  lastOrder: string;
  status: "active" | "inactive" | "vip";
  orders: number;
};

export type Notification = {
  id: number;
  type: "order" | "customer" | "stock" | "goal";
  title: string;
  message: string;
  time: string;
  read: boolean;
};

export type ProfileData = {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
};

export const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: "Sonho de Doce de Leite", price: 8, category: "Salgados & Doces", stock: 24, available: true, description: "Sonho artesanal recheado com doce de leite cremoso. Massa fofinha e irresistível.", color: "#EF9F27", image: "https://picsum.photos/seed/donut-caramel/400/300" },
  { id: 2, name: "Croissant de Presunto", price: 12, category: "Pães & Croissants", stock: 18, available: true, description: "Croissant folhado recheado com presunto e queijo. Assado na hora, crocante por fora.", color: "#C2783A", image: "https://picsum.photos/seed/croissant-ham/400/300" },
  { id: 3, name: "Bolo de Cenoura", price: 45, category: "Bolos & Tortas", stock: 6, available: true, description: "Bolo de cenoura com cobertura de brigadeiro de chocolate. Fatia generosa.", color: "#E85D26", image: "https://picsum.photos/seed/carrot-cake/400/300" },
  { id: 4, name: "Kit Festa (6 un)", price: 42, category: "Kits & Combos", stock: 12, available: true, description: "Kit com 6 mini salgados sortidos: coxinha, bolinha de queijo e risole. Ideal para festas.", color: "#5B57E8", image: "https://picsum.photos/seed/party-food-platter/400/300" },
  { id: 5, name: "Café Especial 250g", price: 7, category: "Bebidas", stock: 0, available: false, description: "Café torrado e moído especialmente selecionado. Aroma intenso e sabor equilibrado.", color: "#6B4423", image: "https://picsum.photos/seed/specialty-coffee/400/300" },
  { id: 6, name: "Pão de Queijo (10 un)", price: 18, category: "Pães & Croissants", stock: 30, available: true, description: "Pão de queijo artesanal com polvilho azedo e queijo minas. Crocante por fora, mole por dentro.", color: "#D4A837", image: "https://picsum.photos/seed/cheese-bread-rolls/400/300" },
  { id: 7, name: "Torta de Frango", price: 38, category: "Bolos & Tortas", stock: 8, available: true, description: "Torta recheada com frango desfiado, catupiry e milho. Massa crocante e recheio cremoso.", color: "#4A90D9", image: "https://picsum.photos/seed/chicken-pie/400/300" },
  { id: 8, name: "Brownie de Chocolate", price: 9, category: "Salgados & Doces", stock: 20, available: true, description: "Brownie denso e fudgy com chocolate belga 70%. Levemente crocante por fora.", color: "#3D2010", image: "https://picsum.photos/seed/chocolate-brownie/400/300" },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 1, name: "Ana Paula Rodrigues", email: "ana.rodrigues@email.com", phone: "(11) 98765-4321", city: "São Paulo, SP", totalSpent: 892, lastOrder: "há 2 dias", status: "vip", orders: 18 },
  { id: 2, name: "Carlos Eduardo Lima", email: "carlos.lima@gmail.com", phone: "(21) 99234-5678", city: "Rio de Janeiro, RJ", totalSpent: 340, lastOrder: "há 5 dias", status: "active", orders: 7 },
  { id: 3, name: "Fernanda Souza Costa", email: "fernanda.costa@outlook.com", phone: "(31) 97654-3210", city: "Belo Horizonte, MG", totalSpent: 156, lastOrder: "há 12 dias", status: "active", orders: 4 },
  { id: 4, name: "Ricardo Almeida", email: "r.almeida@empresa.com.br", phone: "(41) 98123-4567", city: "Curitiba, PR", totalSpent: 0, lastOrder: "há 3 meses", status: "inactive", orders: 1 },
  { id: 5, name: "Juliana Ferreira Santos", email: "juju.santos@email.com", phone: "(51) 96789-0123", city: "Porto Alegre, RS", totalSpent: 1240, lastOrder: "ontem", status: "vip", orders: 31 },
  { id: 6, name: "Marcos Oliveira", email: "marcos.o@gmail.com", phone: "(62) 95432-1098", city: "Goiânia, GO", totalSpent: 420, lastOrder: "há 1 semana", status: "active", orders: 9 },
  { id: 7, name: "Beatriz Mendes", email: "bia.mendes@icloud.com", phone: "(85) 98876-5432", city: "Fortaleza, CE", totalSpent: 78, lastOrder: "há 1 mês", status: "active", orders: 2 },
  { id: 8, name: "Pedro Henrique Gomes", email: "pedroh.gomes@email.com", phone: "(71) 97654-8901", city: "Salvador, BA", totalSpent: 675, lastOrder: "há 3 dias", status: "vip", orders: 14 },
  { id: 9, name: "Larissa Nascimento", email: "larissa.n@gmail.com", phone: "(91) 99012-3456", city: "Belém, PA", totalSpent: 0, lastOrder: "há 4 meses", status: "inactive", orders: 1 },
  { id: 10, name: "Thiago Carvalho", email: "thiago.carvalho@work.com", phone: "(11) 94567-8901", city: "São Paulo, SP", totalSpent: 230, lastOrder: "há 10 dias", status: "active", orders: 5 },
  { id: 11, name: "Camila Rocha", email: "camila.rocha@email.com", phone: "(48) 98901-2345", city: "Florianópolis, SC", totalSpent: 1580, lastOrder: "hoje", status: "vip", orders: 42 },
  { id: 12, name: "Diego Martins", email: "diego.m@outlook.com", phone: "(27) 97890-1234", city: "Vitória, ES", totalSpent: 112, lastOrder: "há 3 semanas", status: "active", orders: 3 },
  { id: 13, name: "Isabela Torres", email: "isa.torres@gmail.com", phone: "(61) 96543-2109", city: "Brasília, DF", totalSpent: 45, lastOrder: "há 2 meses", status: "inactive", orders: 1 },
  { id: 14, name: "Gabriel Freitas", email: "gabriel.f@email.com", phone: "(82) 95678-9012", city: "Maceió, AL", totalSpent: 388, lastOrder: "há 4 dias", status: "active", orders: 8 },
  { id: 15, name: "Natalia Campos", email: "nati.campos@gmail.com", phone: "(11) 93456-7890", city: "São Paulo, SP", totalSpent: 920, lastOrder: "há 1 dia", status: "vip", orders: 22 },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 1, type: "order", title: "Novo pedido recebido", message: "Ana Paula fez um pedido de R$89 — Kit Festa + Bolo de Cenoura", time: "há 2 min", read: false },
  { id: 2, type: "customer", title: "Novo cliente cadastrado", message: "Gabriel Freitas se cadastrou e realizou o primeiro pedido", time: "há 15 min", read: false },
  { id: 3, type: "stock", title: "Estoque baixo", message: "Bolo de Cenoura com apenas 2 unidades restantes", time: "há 1 hora", read: false },
  { id: 4, type: "goal", title: "Meta do dia atingida! 🎯", message: "Parabéns! Você atingiu a meta de R$800 em vendas hoje", time: "há 2 horas", read: false },
  { id: 5, type: "order", title: "Pedido entregue", message: "Pedido #1042 de Juliana Ferreira foi marcado como entregue", time: "há 3 horas", read: true },
  { id: 6, type: "stock", title: "Produto esgotado", message: "Café Especial está sem estoque — considere reabastecer", time: "há 5 horas", read: true },
  { id: 7, type: "customer", title: "Cliente VIP voltou", message: "Camila Rocha fez o 42º pedido — ela merece um mimo!", time: "ontem", read: true },
  { id: 8, type: "goal", title: "Semana recorde", message: "Semana com melhor faturamento do mês — R$3.240 arrecadados", time: "ontem", read: true },
];

export const DASHBOARD_ACTIVITIES = [
  { avatar: "A", color: "#5B57E8", action: "Ana Paula fez um pedido de R$89", time: "há 2 min" },
  { avatar: "C", color: "#10B981", action: "Camila Rocha pediu Pão de Queijo × 3", time: "há 8 min" },
  { avatar: "G", color: "#EF9F27", action: "Gabriel Freitas se cadastrou", time: "há 15 min" },
  { avatar: "P", color: "#E85D26", action: "Pedro Gomes pediu Kit Festa", time: "há 22 min" },
  { avatar: "J", color: "#4A90D9", action: "Juliana pagou pedido #1041 — R$156", time: "há 45 min" },
  { avatar: "M", color: "#8B5CF6", action: "Marcos cancelou pedido #1039", time: "há 1h 12min" },
];

export const FINANCE_MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
export const FINANCE_VALUES = [4200, 5800, 4900, 7200, 6100, 8450];
export const CHART_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
export const CHART_VALUES = [320, 480, 390, 710, 650, 890, 540];
