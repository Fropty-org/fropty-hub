import type { Metadata } from "next";
import { getProfile } from "@/app/lib/auth/session";
import { createClient } from "@/app/lib/supabase/server";
import { AdminSidebar } from "@/app/components/admin/AdminSidebar";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  const profile  = await getProfile();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
        className="portal-main-content"
        style={{
          flex: 1, overflow: "hidden",
          backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.10) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      >
        {children}
      </main>
    </div>
  );
}
