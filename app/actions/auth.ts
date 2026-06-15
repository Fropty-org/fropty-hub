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
  const email    = (formData.get("email")    as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  if (!email || !password) {
    return { error: "Preencha email e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: "Email ou senha incorretos." };

  // Middleware lê o role do banco e redireciona para a home correta.
  // Cliente → /portal/dashboard (sem redirect adicional)
  // Dev     → middleware redireciona para /dev/tasks
  // Admin   → middleware redireciona para /admin/overview
  redirect(ROLE_HOME[DEFAULT_ROLE]);
}

/**
 * Cadastro de novo cliente.
 * Supabase cria o usuário; o trigger fn_on_auth_user_created cria o perfil com role='cliente'.
 * Se confirmação de e-mail estiver ativa, retorna { success } sem redirecionar.
 */
export async function signUp(formData: FormData) {
  const name     = (formData.get("name")     as string)?.trim();
  const email    = (formData.get("email")    as string)?.trim();
  const password = (formData.get("password") as string)?.trim();
  const confirm  = (formData.get("confirm")  as string)?.trim();

  if (!name || !email || !password || !confirm) {
    return { error: "Preencha todos os campos." };
  }
  if (password.length < 8) {
    return { error: "Senha deve ter pelo menos 8 caracteres." };
  }
  if (password !== confirm) {
    return { error: "As senhas não conferem." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // name e role são lidos pelo trigger fn_on_auth_user_created
      data: { name, role: "cliente" as const },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "E-mail já cadastrado. Faça login." };
    }
    return { error: "Erro ao criar conta. Tente novamente." };
  }

  // Supabase pode exigir confirmação de e-mail (configurável no Dashboard)
  if (data.session === null) {
    return { success: "Verifique seu e-mail para ativar a conta." };
  }

  redirect(ROLE_HOME["cliente"]);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/area-cliente");
}

export async function requestPasswordReset(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { error: "Informe seu e-mail." };

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fropty.com";

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/area-cliente/nova-senha`,
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

  redirect("/portal/dashboard");
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
