import { Coins, Eye, Wrench, type LucideIcon } from "lucide-react";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readTime: number; // minutos
  /** @deprecated Use CoverIcon instead */
  coverIcon: string;
  CoverIcon: LucideIcon;
  coverColor: string;
}

export const allPosts: BlogPost[] = [
  {
    slug: "quanto-custa-fazer-um-app",
    title: "Quanto custa fazer um app em 2025?",
    description: "A resposta honesta sobre preços, prazos e o que realmente define o custo de um aplicativo sob medida.",
    date: "2026-05-20",
    category: "Mercado",
    readTime: 6,
    coverIcon: "ti-coins",
    CoverIcon: Coins,
    coverColor: "#EF9F27",
  },
  {
    slug: "preview-gratuita-como-funciona",
    title: "Como funciona a prévia gratuita da Fropty?",
    description: "Entenda o que você recebe antes de pagar qualquer coisa — e por que isso muda tudo na hora de contratar um desenvolvedor.",
    date: "2026-06-01",
    category: "Fropty",
    readTime: 4,
    coverIcon: "ti-eye",
    CoverIcon: Eye,
    coverColor: "var(--primary)",
  },
  {
    slug: "tokens-de-manutencao-o-que-sao",
    title: "Tokens de manutenção: o que são e como usar",
    description: "Descubra como o sistema de tokens da Fropty funciona na prática — e como aproveitá-los ao máximo para evoluir seu app.",
    date: "2026-06-10",
    category: "Produto",
    readTime: 5,
    coverIcon: "ti-tools",
    CoverIcon: Wrench,
    coverColor: "#22c55e",
  },
];
