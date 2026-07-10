import type { Metadata } from "next";
import { getProfile } from "@/app/lib/auth/session";
import { createClient } from "@/app/lib/supabase/server";
import { ProfileSettings } from "@/app/components/cliente/ProfileSettings";

export const metadata: Metadata = { title: "Meu Perfil — Fropty" };

export default async function PerfilPage() {
  const profile  = await getProfile();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const name           = profile?.name || user?.email?.split("@")[0] || "Cliente";
  const email          = user?.email ?? "";
  const avatarUrl      = (profile as { avatar_url?: string })?.avatar_url ?? null;
  const googlePhotoUrl = (user?.user_metadata?.avatar_url || user?.user_metadata?.picture) ?? null;
  const phoneNumber    = (profile as { phone_number?: string | null })?.phone_number ?? null;
  const company        = (profile as { company?: string | null })?.company ?? null;

  return (
    <div className="hub-page" style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>Conta</h1>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-faint)" }}>Gerencie suas informações pessoais e segurança.</p>
      </div>
      <ProfileSettings name={name} email={email} role="cliente" avatarUrl={avatarUrl} googlePhotoUrl={googlePhotoUrl} phoneNumber={phoneNumber} company={company} />
    </div>
  );
}
