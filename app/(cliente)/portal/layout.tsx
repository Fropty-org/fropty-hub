import type { Metadata } from "next";
import { getProfile } from "@/app/lib/auth/session";
import { createClient } from "@/app/lib/supabase/server";
import { ClientSidebar } from "@/app/components/cliente/ClientSidebar";
import { UserAvatarMenu } from "@/app/components/auth/UserAvatarMenu";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Nav items são gerados dinamicamente com badge de tickets abertos

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // getProfile() é cacheado — não gera query extra (pai já chamou requireRole)
  const profile = await getProfile();

  // Busca e-mail do usuário Auth (não armazenado em profiles por design)
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) console.error("[portal/layout] getUser error:", userError.message);
  if (!user)     console.error("[portal/layout] getUser returned null user — profile:", profile?.id);

  const displayName   = profile?.name || user?.email?.split("@")[0] || "Cliente";
  const initials      = displayName.slice(0, 2).toUpperCase();
  const email         = user?.email ?? "";

  // Contagem de tickets abertos para badge (seguro contra user null)
  const { count: openTickets, error: ticketsError } = user
    ? await supabase
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .eq("client_id", user.id)
        .in("status", ["aberto", "em_andamento"])
    : { count: 0, error: null };

  if (ticketsError) console.error("[portal/layout] tickets error:", ticketsError.message);

  const portalNav = [
    { id: "dashboard",  href: "/portal/dashboard",  icon: "ti-layout-dashboard", label: "Painel" },
    { id: "projetos",   href: "/portal/projetos",   icon: "ti-folder",           label: "Projetos" },
    { id: "suporte",    href: "/portal/suporte",    icon: "ti-message-circle",   label: "Suporte", badge: openTickets ?? 0 },
    { id: "financeiro", href: "/portal/financeiro", icon: "ti-credit-card",      label: "Financeiro" },
    { id: "perfil",     href: "/portal/perfil",     icon: "ti-user-circle",      label: "Meu Perfil" },
  ];

  // Objeto compatível com ClientUser (campos mínimos necessários)
  const sidebarUser = {
    id:             profile?.id ?? "",
    name:           displayName,
    email,
    avatarInitials: initials,
    role:           "cliente" as const,
    plan:           profile?.plan ?? undefined,
    planRenewal:    profile?.plan_renewal ?? undefined,
    tokenBalance:   profile?.token_balance ?? 0,
    projects:       [],
    tokenHistory:   [],
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      {/* Sidebar com nav do portal — substitui links legados do area-cliente */}
      <ClientSidebar
        user={sidebarUser}
        navItems={portalNav}
        avatarUrl={profile?.avatar_url ?? null}
        initialTheme={profile?.theme ?? "dark"}
      />

      {/* Menu de usuário fora do sidebar — visível no mobile futuramente */}
      {/* UserAvatarMenu é usado aqui como overlay alternativo; no desktop
          o ClientSidebar já mostra o user. Em breakpoints menores (Sprint 2)
          o sidebar vira drawer e este menu aparece no topbar. */}
      <div style={{ display: "none" }} aria-hidden>
        <UserAvatarMenu
          name={displayName}
          email={email}
          initials={initials}
          role="cliente"
          plan={profile?.plan}
        />
      </div>

      <main className="portal-main-content" style={{ flex: 1, overflow: "hidden" }}>
        {children}
      </main>
    </div>
  );
}
