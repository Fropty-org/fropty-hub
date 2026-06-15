import type { Metadata } from "next";
import { getProfile } from "@/app/lib/auth/session";
import { createClient } from "@/app/lib/supabase/server";
import { DevSidebar } from "@/app/components/dev/DevSidebar";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DevPortalLayout({ children }: { children: React.ReactNode }) {
  const profile  = await getProfile();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const name         = profile?.name || user?.email?.split("@")[0] || "Dev";
  const initials     = name.slice(0, 2).toUpperCase();
  const initialTheme = (profile?.theme ?? "dark") as "dark" | "light";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <DevSidebar name={name} initials={initials} initialTheme={initialTheme} />
      <main style={{ flex: 1, overflow: "hidden" }}>{children}</main>
    </div>
  );
}
