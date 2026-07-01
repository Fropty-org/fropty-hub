export interface PortalNavItem {
  id:     string;
  href:   string;
  icon:   string;
  label:  string;
  /** Grupo de navegação (renderizado como seção na sidebar). */
  group?: string;
}

/** Rótulos das seções da sidebar do cliente, na ordem de exibição. */
export const PORTAL_NAV_GROUPS: Record<string, string> = {
  principal:   "Principal",
  comunicacao: "Comunique-se",
  trabalho:    "Meu Trabalho",
  conta:       "Minha Conta",
  recursos:    "Recursos",
};

/**
 * Fonte única de verdade para a navegação do portal do cliente.
 * Usado por ClientSidebar (default) e portal/layout.tsx (com badges dinâmicos).
 * Não adicionar item de menu em apenas um dos dois lugares — ambos leem daqui.
 * A ordem aqui define a ordem dentro de cada grupo; os grupos seguem
 * PORTAL_NAV_GROUPS.
 */
export const PORTAL_NAV_ITEMS: PortalNavItem[] = [
  { id: "dashboard",         href: "/portal/dashboard",         icon: "LayoutDashboard",   label: "Painel",               group: "principal" },
  { id: "chat",             href: "/portal/chat",              icon: "MessagesSquare",    label: "Chat",                 group: "comunicacao" },
  { id: "suporte",          href: "/portal/suporte",           icon: "MessageCircle",     label: "Suporte",              group: "comunicacao" },
  { id: "projetos",         href: "/portal/projetos",          icon: "FolderKanban",      label: "Projetos",             group: "trabalho" },
  { id: "kanban",           href: "/portal/kanban",            icon: "LayoutGrid",        label: "Kanban",               group: "trabalho" },
  { id: "calendario",       href: "/portal/calendario",        icon: "CalendarDays",      label: "Calendário",           group: "trabalho" },
  { id: "contratos",        href: "/portal/contratos",         icon: "FileSignature",     label: "Contratos",            group: "conta" },
  { id: "financeiro",       href: "/portal/financeiro",        icon: "CreditCard",        label: "Financeiro",           group: "conta" },
  { id: "planos",           href: "/portal/planos",            icon: "Sparkles",          label: "Planos",               group: "conta" },
  { id: "roadmap",          href: "/portal/roadmap",           icon: "Map",               label: "Roadmap",              group: "recursos" },
  { id: "feedback",         href: "/portal/feedback",          icon: "MessageSquarePlus", label: "Feedback",             group: "recursos" },
  { id: "base-conhecimento",href: "/portal/base-conhecimento", icon: "BookOpen",          label: "Base de Conhecimento", group: "recursos" },
  { id: "perfil",           href: "/portal/perfil",            icon: "UserCircle",        label: "Meu Perfil",           group: "recursos" },
];
