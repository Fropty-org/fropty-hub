import type { Metadata } from "next";
import { getProfile } from "@/app/lib/auth/session";
import { createClient } from "@/app/lib/supabase/server";
import ProfileForm from "@/app/components/cliente/ProfileForm";
import PasswordChangeForm from "@/app/components/cliente/PasswordChangeForm";

export const metadata: Metadata = { title: "Meu Perfil — Admin Fropty" };

export default async function AdminPerfilPage() {
  const profile  = await getProfile();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const name  = profile?.name || user?.email?.split("@")[0] || "Admin";
  const email = user?.email ?? "";

  return (
    <div style={{ padding: "40px 32px", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)" }}>Meu Perfil</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>Gerencie seu nome e segurança da conta.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <ProfileForm name={name} email={email} />
        <PasswordChangeForm />
      </div>
    </div>
  );
}
