import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import type { Database } from "@/app/lib/supabase/types";
import type { UserRole } from "./roles";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Retorna o usuário Supabase autenticado.
 * cache() garante no máximo 1 chamada por request (deduplicação React).
 */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
});

/**
 * Retorna o perfil completo do usuário autenticado.
 * Deduplicado por request — múltiplos layouts/pages chamam sem overhead.
 */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return data;
});

/** Exige autenticação — redireciona para login se não autenticado. */
export async function requireAuth() {
  const user = await getSession();
  if (!user) redirect("/area-cliente");
  return user;
}

/**
 * Exige role específico — redireciona para login se não autenticado
 * ou para a home do role correto se o acesso for negado.
 */
export async function requireRole(role: UserRole | UserRole[]) {
  const profile = await getProfile();
  if (!profile) redirect("/area-cliente");
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(profile.role as UserRole)) {
    redirect("/area-cliente");
  }
  return profile;
}
