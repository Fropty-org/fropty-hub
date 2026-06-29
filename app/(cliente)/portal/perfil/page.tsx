import type { Metadata } from "next";
import { getProfile } from "@/app/lib/auth/session";
import { createClient } from "@/app/lib/supabase/server";
import ProfileForm from "@/app/components/cliente/ProfileForm";
import PasswordChangeForm from "@/app/components/cliente/PasswordChangeForm";

export const metadata: Metadata = { title: "Meu Perfil — Fropty" };

export default async function PerfilPage() {
  const profile  = await getProfile();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const name  = profile?.name || user?.email?.split("@")[0] || "Cliente";
  const email = user?.email ?? "";

  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div style={{ padding: "36px 32px", maxWidth: 700, margin: "0 auto" }}>

      {/* Avatar header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 32, padding: "24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--surface-2)", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 800, color: "var(--text)", flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{name}</h1>
          <p style={{ margin: "3px 0 8px", fontSize: "13px", color: "var(--text-faint)" }}>{email}</p>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--border)", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", letterSpacing: "0.04em" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary)" }}><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
            Cliente
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <ProfileForm name={name} email={email} />
        <PasswordChangeForm />
      </div>
    </div>
  );
}
