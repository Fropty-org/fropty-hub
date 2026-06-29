export interface PortalNavItem {
  id:    string;
  href:  string;
  icon:  string;
  label: string;
}

/**
 * Fonte única de verdade para a navegação do portal do cliente.
 * Usado por ClientSidebar (default) e portal/layout.tsx (com badges dinâmicos).
 * Não adicionar item de menu em apenas um dos dois lugares — ambos leem daqui.
 */
export const PORTAL_NAV_ITEMS: PortalNavItem[] = [
  { id: "dashboard",         href: "/portal/dashboard",         icon: "LayoutDashboard",   label: "Painel" },
  { id: "suporte",           href: "/portal/suporte",           icon: "MessageCircle",     label: "Suporte" },
  { id: "projetos",          href: "/portal/projetos",          icon: "FolderKanban",      label: "Projetos" },
  { id: "contratos",         href: "/portal/contratos",         icon: "FileSignature",     label: "Contratos" },
  { id: "financeiro",        href: "/portal/financeiro",        icon: "CreditCard",        label: "Financeiro" },
  { id: "planos",            href: "/portal/planos",            icon: "Sparkles",          label: "Planos" },
  { id: "roadmap",           href: "/portal/roadmap",           icon: "Map",               label: "Roadmap" },
  { id: "feedback",          href: "/portal/feedback",          icon: "MessageSquarePlus", label: "Feedback" },
  { id: "base-conhecimento", href: "/portal/base-conhecimento", icon: "BookOpen",          label: "Base de Conhecimento" },
  { id: "perfil",            href: "/portal/perfil",            icon: "UserCircle",        label: "Meu Perfil" },
];
