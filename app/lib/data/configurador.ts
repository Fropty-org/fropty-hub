import type { LucideIcon } from "lucide-react";

export type AddonType = "once" | "month";

export interface ServiceType {
  id: string;
  Icon: LucideIcon;
  label: string;
  price: number;
  desc: string;
}

export interface Addon {
  id: string;
  Icon: LucideIcon;
  label: string;
  desc: string;
  tech: string;
  price: number;
  type: AddonType;
  unit?: string;
  disclaimer?: string;
}

export interface MaintenancePlan {
  id: string;
  label: string;
  tokens: number;
  price: number;
  highlight: boolean;
  savingsStrike?: string;
  savingsText?: string;
}

import { Smartphone, Globe, Target, LayoutDashboard, BarChart2, GraduationCap, Lock, ShoppingBag, Wrench, CreditCard, Bell, MessageCircle, Search, Users, Mail, Users2, Database, Package } from "lucide-react";

/* ── Tipos de projeto ──────────────────────────────────────────── */
export const SERVICE_TYPES: ServiceType[] = [
  { id: "app_mobile",  Icon: Smartphone,       label: "App Mobile",          price: 499,  desc: "iOS e Android, nativo ou híbrido" },
  { id: "site",        Icon: Globe,            label: "Site Institucional",  price: 499,  desc: "Responsivo, SEO e identidade visual" },
  { id: "landing",     Icon: Target,           label: "Landing Page",        price: 349,  desc: "Conversão de leads com formulário inteligente" },
  { id: "saas",        Icon: LayoutDashboard,  label: "SaaS / Sistema Web",  price: 799,  desc: "Plataforma com auth, painel e banco de dados" },
  { id: "dashboard",   Icon: BarChart2,        label: "Dashboard / Admin",   price: 699,  desc: "Painel de gestão e visualização de dados" },
  { id: "ead",         Icon: GraduationCap,    label: "Plataforma EAD",      price: 899,  desc: "Cursos, módulos, vídeos e certificados" },
  { id: "members",     Icon: Lock,             label: "Área de Membros",     price: 599,  desc: "Conteúdo exclusivo com login restrito" },
  { id: "ecommerce",   Icon: ShoppingBag,      label: "E-commerce",          price: 699,  desc: "Loja com carrinho, checkout e pagamento" },
];

/* ── Add-ons ───────────────────────────────────────────────────── */
export const ADDONS: Addon[] = [
  // Funcionalidades
  { id: "google_auth",  Icon: Lock,           label: "Login com Google / redes sociais", desc: "Usuários entram com um clique, sem criar senha.",                                                  tech: "OAuth 2.0 · Google, Facebook, Apple",            price: 79,  type: "once" },
  { id: "admin",        Icon: Wrench,         label: "Painel administrativo",             desc: "Gerencie conteúdo, usuários e dados sem precisar de programador.",                                tech: "Dashboard com controle de acesso por perfil",    price: 149, type: "once" },
  { id: "payments",     Icon: CreditCard,     label: "Pagamento online",                  desc: "Stripe, Mercado Pago ou PagSeguro integrado com checkout seguro.",                               tech: "Payment gateway · PIX · cartão · boleto",       price: 149, type: "once" },
  { id: "push",         Icon: Bell,           label: "Notificações push",                 desc: "Avise seus clientes sobre novidades, pedidos ou lembretes direto no celular.",                    tech: "FCM · PWA Notifications",                       price: 99,  type: "once" },
  { id: "reports",      Icon: BarChart2,      label: "Relatórios e exportação",           desc: "Baixe seus dados em PDF ou Excel quando quiser.",                                                  tech: "Exportação estruturada · filtros avançados",    price: 89,  type: "once" },
  { id: "whatsapp",     Icon: MessageCircle,  label: "Integração com WhatsApp",           desc: "Notificações, confirmações e automações via WhatsApp Business.",                                 tech: "WhatsApp Business API",                         price: 119, type: "once" },
  { id: "seo",          Icon: Search,         label: "SEO técnico avançado",              desc: "Meta tags, sitemap, schema.org e otimização de Core Web Vitals.",                                tech: "Next-SEO · Schema.org · Google Search Console", price: 99,  type: "once" },
  { id: "crm",          Icon: Users,          label: "Integração com CRM",                desc: "Sincronize leads com RD Station, HubSpot ou Pipedrive automaticamente.",                         tech: "Webhooks · API REST · formulários integrados",  price: 119, type: "once" },
  { id: "email_mkt",    Icon: Mail,           label: "E-mail marketing",                  desc: "Envio de campanhas e fluxos automáticos via Mailchimp, SendGrid ou Brevo.",                      tech: "SMTP + API · automações · segmentação",         price: 99,  type: "once" },
  { id: "multiuser",    Icon: Users2,         label: "Acesso múltiplo ao painel",         desc: "Cada colaborador da sua equipe com perfil e permissões individuais no painel.",                   tech: "Role-based access control (RBAC)",               price: 129, type: "once", unit: "membro" },
  // Mensais
  { id: "backup",       Icon: Database,       label: "Backup automático diário",           desc: "Seus dados salvos todo dia, com restauração em caso de qualquer problema.",                       tech: "Backup incremental · retenção 30 dias",         price: 29,  type: "month", disclaimer: "* Sem esse recurso, a Fropty Apps não se responsabiliza por perda de dados." },
  // Entrega e suporte
  { id: "domain",       Icon: Globe,          label: "Domínio próprio",                   desc: "Seu projeto em seudominio.com.br em vez de seuapp.fropty.com. Setup incluso.",                   tech: "DNS · SSL · configuração completa",             price: 49,  type: "once",  disclaimer: "* Sujeito à disponibilidade. O registro (~R$40/ano) é por conta do cliente." },
  { id: "onboarding",   Icon: GraduationCap,  label: "Treinamento e onboarding",          desc: "Videochamada de até 1h ensinando você e sua equipe a usar o sistema.",                            tech: "Sessão gravada + material de apoio",            price: 79,  type: "once" },
  { id: "sourcecode",   Icon: Package,        label: "Licença do código-fonte",           desc: "Receba todos os arquivos do projeto. A partir daí, o código é seu.",                              tech: "Repositório GitHub transferido · você gerencia", price: 299, type: "once",  disclaimer: "* Inclui o código, mas não a infraestrutura (banco de dados, hospedagem, domínio)." },
];

/* ── Planos de manutenção ──────────────────────────────────────── */
export const MAINTENANCE: MaintenancePlan[] = [
  { id: "m_basic", label: "Básico",    tokens: 4, price: 49.90, highlight: false, savingsStrike: "R$ 1.200,00 avulso", savingsText: "Você economiza R$ 1.150,10" },
  { id: "m_pro",   label: "Pro",       tokens: 8, price: 89.90, highlight: true,  savingsStrike: "R$ 2.400,00 avulso", savingsText: "Você economiza R$ 2.310,10" },
  { id: "m_none",  label: "Sem plano", tokens: 0, price: 0,     highlight: false },
];
