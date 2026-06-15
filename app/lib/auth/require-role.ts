import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { ROLE_HOME, DEFAULT_ROLE, type UserRole } from "./roles";

/**
 * Verifica que o usuário autenticado tem o role exigido.
 * Redireciona para login se não autenticado, ou para a home correta se role errado.
 * Retorna o userId para evitar segunda query nas actions.
 */
export async function requireRole(requiredRole: UserRole): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/area-cliente");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as UserRole) ?? DEFAULT_ROLE;

  if (role !== requiredRole) redirect(ROLE_HOME[role]);

  return user.id;
}

/** Verifica auth sem exigir role específico. */
export async function requireAuth(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/area-cliente");
  return user.id;
}
