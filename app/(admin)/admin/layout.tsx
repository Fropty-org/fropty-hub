import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProfile } from "@/app/lib/auth/session";
import { createClient } from "@/app/lib/supabase/server";
import { AdminSidebar } from "@/app/components/admin/AdminSidebar";
import { HubTopbar } from "@/app/components/HubTopbar";
import { CommandPalette } from "@/app/components/CommandPalette";
import { SentinelHeartbeat } from "@/app/components/cliente/SentinelHeartbeat";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  const profile  = await getProfile();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Se o usuário tem MFA ativo e o AAL ainda é 1, redireciona para o challenge
  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aalData?.currentLevel === "aal1" && aalData?.nextLevel === "aal2") {
    redirect("/auth/mfa");
  }

  const name         = profile?.name || user?.email?.split("@")[0] || "Admin";
  const initials     = name.slice(0, 2).toUpperCase();
  const initialTheme = (profile?.theme ?? "dark") as "dark" | "light";
  const avatarUrl    = (profile as { avatar_url?: string })?.avatar_url
                    || user?.user_metadata?.avatar_url
                    || user?.user_metadata?.picture
                    || null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <AdminSidebar name={name} initials={initials} userId={user?.id ?? ""} initialTheme={initialTheme} avatarUrl={avatarUrl} />
      <main
        className="portal-main-content hub-bg-diagonal"
        style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}
      >
        <HubTopbar
          userId={user?.id ?? ""}
          initials={initials}
          avatarUrl={avatarUrl}
          profileHref="/admin/perfil"
          name={name}
          email={user?.email ?? ""}
          roleLabel="Admin"
          initialTheme={initialTheme}
        />
        <div style={{ flex: 1 }}>{children}</div>
      </main>

      {/* Busca global Cmd+K */}
      <CommandPalette />

      {/* Heartbeat do FroptySentinel (fake, validação) */}
      <SentinelHeartbeat />
    </div>
  );
}
