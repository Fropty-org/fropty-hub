import type { Metadata } from "next";
import { getProfile } from "@/app/lib/auth/session";
import { createClient } from "@/app/lib/supabase/server";
import ProfileForm from "./ProfileForm";

export const metadata: Metadata = { title: "Meu Perfil — Fropty" };

export default async function PerfilPage() {
  const profile  = await getProfile();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const name    = profile?.name || user?.email?.split("@")[0] || "Cliente";
  const email   = user?.email ?? "";
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div style={{ padding: "40px 32px", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)" }}>Meu Perfil</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>Gerencie seu nome e foto de perfil.</p>
      </div>

      <ProfileForm
        userId={profile?.id ?? user?.id ?? ""}
        name={name}
        email={email}
        avatarUrl={profile?.avatar_url ?? null}
        initials={initials}
      />
    </div>
  );
}
