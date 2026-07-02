"use server";

import { createClient } from "@/app/lib/supabase/server";
import { getProfile } from "@/app/lib/auth/session";

export type SearchResultType =
  | "nav" | "action" | "ticket" | "project" | "contract" | "kb" | "roadmap" | "feedback";

export interface SearchResult {
  id:       string;
  type:     SearchResultType;
  title:    string;
  subtitle?: string;
  href:     string;
}

export interface SearchResults {
  nav:       SearchResult[];
  actions:   SearchResult[];
  tickets:   SearchResult[];
  projects:  SearchResult[];
  contracts: SearchResult[];
  kb:        SearchResult[];
  roadmap:   SearchResult[];
  feedbacks: SearchResult[];
}

const CLIENT_NAV: SearchResult[] = [
  { id: "nav-dashboard",  type: "nav", title: "Painel",               href: "/portal/dashboard" },
  { id: "nav-suporte",    type: "nav", title: "Suporte",              href: "/portal/suporte" },
  { id: "nav-projetos",   type: "nav", title: "Projetos",             href: "/portal/projetos" },
  { id: "nav-contratos",  type: "nav", title: "Contratos",            href: "/portal/contratos" },
  { id: "nav-financeiro", type: "nav", title: "Financeiro",           href: "/portal/financeiro" },
  { id: "nav-planos",     type: "nav", title: "Planos",               href: "/portal/planos" },
  { id: "nav-roadmap",    type: "nav", title: "Roadmap",              href: "/portal/roadmap" },
  { id: "nav-feedback",   type: "nav", title: "Feedback",             href: "/portal/feedback" },
  { id: "nav-kb",         type: "nav", title: "Base de Conhecimento", href: "/portal/base-conhecimento" },
  { id: "nav-perfil",     type: "nav", title: "Meu Perfil",           href: "/portal/perfil" },
];

const ADMIN_NAV: SearchResult[] = [
  { id: "nav-overview",   type: "nav", title: "Overview",             href: "/admin/overview" },
  { id: "nav-usuarios",   type: "nav", title: "Usuários",             href: "/admin/usuarios" },
  { id: "nav-cs",         type: "nav", title: "Customer Success",     href: "/admin/customer-success" },
  { id: "nav-projetos",   type: "nav", title: "Projetos",             href: "/admin/projetos" },
  { id: "nav-contratos",  type: "nav", title: "Contratos",            href: "/admin/contratos" },
  { id: "nav-financeiro", type: "nav", title: "Financeiro",           href: "/admin/financeiro" },
  { id: "nav-suporte",    type: "nav", title: "Service Desk",         href: "/portal/suporte" },
  { id: "nav-roadmap",    type: "nav", title: "Roadmap",              href: "/admin/roadmap" },
  { id: "nav-feedback",   type: "nav", title: "Feedback",             href: "/admin/feedback" },
  { id: "nav-kb",         type: "nav", title: "Base de Conhecimento", href: "/admin/base-conhecimento" },
  { id: "nav-analytics",  type: "nav", title: "Analytics",            href: "/admin/analytics" },
  { id: "nav-audit",      type: "nav", title: "Auditoria",            href: "/admin/audit" },
];

const CLIENT_ACTIONS: SearchResult[] = [
  { id: "act-chamado",  type: "action", title: "Abrir chamado",    subtitle: "consome 1 token", href: "/portal/suporte/novo" },
  { id: "act-feedback", type: "action", title: "Enviar feedback",  href: "/portal/feedback/novo" },
  { id: "act-votar",    type: "action", title: "Votar no roadmap", href: "/portal/roadmap" },
  { id: "act-upgrade",  type: "action", title: "Fazer upgrade de plano", href: "/portal/planos" },
];

const ADMIN_ACTIONS: SearchResult[] = [
  { id: "act-convidar", type: "action", title: "Convidar cliente",       href: "/admin/usuarios/novo" },
  { id: "act-chamado",  type: "action", title: "Abrir chamado",          subtitle: "em nome de cliente", href: "/portal/suporte/novo" },
  { id: "act-artigo",   type: "action", title: "Novo artigo na base",    href: "/admin/base-conhecimento/novo" },
  { id: "act-roadmap",  type: "action", title: "Novo item de roadmap",   href: "/admin/roadmap/novo" },
];

const EMPTY: Omit<SearchResults, "nav" | "actions"> = {
  tickets: [], projects: [], contracts: [], kb: [], roadmap: [], feedbacks: [],
};

function matches(q: string) {
  return (i: SearchResult) => i.title.toLowerCase().includes(q);
}

export async function searchPortal(query: string): Promise<SearchResults> {
  const q = query.trim().toLowerCase();

  const profile = await getProfile();
  const isAdmin = profile?.role === "admin";

  const navAll     = isAdmin ? ADMIN_NAV : CLIENT_NAV;
  const actionsAll = isAdmin ? ADMIN_ACTIONS : CLIENT_ACTIONS;

  const nav     = q.length === 0 ? navAll     : navAll.filter(matches(q));
  const actions = q.length === 0 ? actionsAll : actionsAll.filter(matches(q));

  if (q.length < 2) {
    return { nav, actions, ...EMPTY };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !profile) {
    return { nav, actions, ...EMPTY };
  }

  // "UFT0012" / "0012" → busca pelo número do chamado; senão, pelo assunto
  const uftMatch     = /^(?:uft\s*)?0*(\d{1,6})$/i.exec(q);
  const ticketNumber = uftMatch ? Number.parseInt(uftMatch[1], 10) : null;

  let ticketsQuery = supabase.from("tickets").select("id, subject, status, ticket_number");
  ticketsQuery = ticketNumber !== null
    ? ticketsQuery.eq("ticket_number", ticketNumber)
    : ticketsQuery.ilike("subject", `%${q}%`);
  if (!isAdmin) ticketsQuery = ticketsQuery.eq("client_id", user.id);

  const [ticketsRes, projectsRes, contractsRes, kbRes, roadmapRes, feedbacksRes] = await Promise.all([
    ticketsQuery.limit(5),

    // Projects
    isAdmin
      ? supabase.from("projects").select("id, title, status").ilike("title", `%${q}%`).limit(5)
      : supabase.from("projects").select("id, title, status").eq("client_id", user.id).ilike("title", `%${q}%`).limit(5),

    // Contracts
    isAdmin
      ? supabase.from("contracts").select("id, title, status").ilike("title", `%${q}%`).limit(5)
      : supabase.from("contracts").select("id, title, status").eq("client_id", user.id).ilike("title", `%${q}%`).limit(5),

    // KB Articles
    supabase.from("knowledge_articles").select("id, title, slug, category")
      .eq("published", true).ilike("title", `%${q}%`).limit(5),

    // Roadmap (itens públicos)
    supabase.from("roadmap_items").select("id, title, status")
      .eq("visibility", "publico").ilike("title", `%${q}%`).limit(5),

    // Feedbacks
    isAdmin
      ? supabase.from("feedbacks").select("id, title, status").ilike("title", `%${q}%`).limit(5)
      : supabase.from("feedbacks").select("id, title, status").eq("client_id", user.id).ilike("title", `%${q}%`).limit(5),
  ]);

  const tickets = (ticketsRes.data ?? []).map(t => ({
    id:       t.id,
    type:     "ticket" as const,
    title:    t.subject,
    subtitle: `UFT${String(t.ticket_number).padStart(4, "0")} · ${t.status}`,
    href:     `/portal/suporte/${t.id}`,
  }));

  const projects = (projectsRes.data ?? []).map(p => ({
    id:       p.id,
    type:     "project" as const,
    title:    p.title,
    subtitle: p.status,
    href:     isAdmin ? `/admin/projetos/${p.id}` : `/portal/projetos/${p.id}`,
  }));

  const contracts = (contractsRes.data ?? []).map(c => ({
    id:       c.id,
    type:     "contract" as const,
    title:    c.title,
    subtitle: c.status,
    href:     isAdmin ? `/admin/contratos/${c.id}` : `/portal/contratos/${c.id}`,
  }));

  const kb = (kbRes.data ?? []).map(a => ({
    id:       a.id,
    type:     "kb" as const,
    title:    a.title,
    subtitle: a.category,
    href:     `/portal/base-conhecimento/${a.slug}`,
  }));

  const roadmap = (roadmapRes.data ?? []).map(r => ({
    id:       r.id,
    type:     "roadmap" as const,
    title:    r.title,
    subtitle: r.status,
    href:     isAdmin ? "/admin/roadmap" : "/portal/roadmap",
  }));

  const feedbacks = (feedbacksRes.data ?? []).map(f => ({
    id:       f.id,
    type:     "feedback" as const,
    title:    f.title,
    subtitle: f.status,
    href:     isAdmin ? "/admin/feedback" : "/portal/feedback",
  }));

  return { nav, actions, tickets, projects, contracts, kb, roadmap, feedbacks };
}
