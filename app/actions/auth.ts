"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { ROLE_HOME, DEFAULT_ROLE, type UserRole } from "@/app/lib/auth/roles";

/**
 * Login por email/senha.
 * Redireciona para ROLE_HOME["cliente"] (/portal/dashboard) como destino padrão.
 * O middleware intercepta a navegação e redireciona dev/admin para suas homes corretas,
 * evitando a query extra ao banco dentro do Server Action.
 */
export async function signIn(formData: FormData) {
  try {
    const email    = (formData.get("email")    as string)?.trim();
    const password = (formData.get("password") as string)?.trim();

    if (!email || !password) {
      return { error: "Preencha email e senha." };
    }

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return { error: "Email ou senha incorretos." };

    // Busca o role para redirecionar para a home correta de cada tipo de usuário
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user!.id)
      .single();

    const role = (profile?.role as UserRole) ?? DEFAULT_ROLE;
    // Retorna a URL em vez de redirect() para evitar problemas com startTransition no React 19
    return { redirectTo: ROLE_HOME[role] };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[signIn] unhandled exception:", msg);
    return { error: "Erro interno. Tente novamente mais tarde." };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { redirectTo: "/area-cliente" };
}

export async function requestPasswordReset(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { error: "Informe seu e-mail." };

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fropty.com";

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/area-cliente/nova-senha`,
  });

  // Sempre retorna sucesso (não revela se e-mail existe)
  return { success: "Se esse e-mail estiver cadastrado, você receberá o link em breve." };
}

export async function updatePassword(formData: FormData) {
  const password = (formData.get("password") as string)?.trim();
  const confirm  = (formData.get("confirm")  as string)?.trim();

  if (!password || password.length < 8) return { error: "Senha deve ter pelo menos 8 caracteres." };
  if (password !== confirm) return { error: "As senhas não conferem." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: "Não foi possível atualizar a senha. O link pode ter expirado." };

  redirect("/area-cliente/dashboard");
}

/**
 * Retorna o role do usuário autenticado.
 * Usado por Server Components que precisam do role sem importar session.ts completo.
 */
export async function getUserRole(): Promise<UserRole> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return DEFAULT_ROLE;

  // Usa RPC para chamar auth_role() no Postgres — evita query ao profiles
  const { data } = await supabase.rpc("auth_role");
  return (data as UserRole | null) ?? DEFAULT_ROLE;
}
