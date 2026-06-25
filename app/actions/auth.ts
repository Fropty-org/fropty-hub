"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { createServiceClient } from "@/app/lib/supabase/service";
import { ROLE_HOME, DEFAULT_ROLE, type UserRole } from "@/app/lib/auth/roles";
import { isWeakPasswordError, SENTINEL_PASSWORD_MESSAGE } from "@/app/lib/auth/password-error";
import { isPwnedPassword } from "@/app/lib/auth/pwned";
import { sendWelcomeEmail } from "@/app/lib/email/send";

export type LoginState = { error?: string } | null;

/**
 * Login por email/senha — assinatura de useActionState (prevState, formData).
 *
 * Usado via `<form action={...}>` (envio NATIVO do formulário). Nesse modo o
 * redirect() do servidor é confiável: vira a resposta da navegação e o browser
 * a segue carregando o cookie de sessão já gravado. (Chamar a action de forma
 * imperativa — await signIn(fd) dentro de startTransition — NÃO dispara o
 * NEXT_REDIRECT no cliente, e era por isso que o login "não saía da tela".)
 */
export async function signIn(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  let target: string | null = null;
  try {
    const email    = (formData.get("email")    as string)?.trim();
    const password = (formData.get("password") as string)?.trim();
    console.error("[signIn] called", { hasEmail: !!email, hasPassword: !!password });

    if (!email || !password) {
      return { error: "Preencha email e senha." };
    }

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password });
    console.error("[signIn] auth", { ok: !error, errMsg: error?.message ?? null, userId: user?.id ?? null });

    if (error) return { error: "Email ou senha incorretos." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user!.id)
      .single();
    console.error("[signIn] profile", { role: profile?.role ?? null, is_active: profile?.is_active ?? null });

    if (profile?.is_active === false) {
      await supabase.auth.signOut();
      return { error: "Seu acesso foi revogado. Entre em contato com o suporte." };
    }

    const role = (profile?.role as UserRole) ?? DEFAULT_ROLE;
    target = ROLE_HOME[role];
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[signIn] unhandled exception:", msg);
    return { error: "Erro interno. Tente novamente mais tarde." };
  }
  // FORA do try/catch: redirect() lança NEXT_REDIRECT (não é erro real).
  console.error("[signIn] redirecting to", target);
  redirect(target);
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
  const siteUrl = process.env.NEXT_PUBLIC_HUB_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://fropty.com";

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

  if (await isPwnedPassword(password)) return { error: SENTINEL_PASSWORD_MESSAGE };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    if (isWeakPasswordError(error)) return { error: SENTINEL_PASSWORD_MESSAGE };
    return { error: "Não foi possível atualizar a senha. O link pode ter expirado." };
  }

  // Boas-vindas: enviado uma única vez, agora que a senha foi de fato criada.
  // Um reset de senha de cliente já ativo (welcomed_at preenchido) não reenvia.
  if (user) {
    const service = createServiceClient();
    const { data: profile } = await service
      .from("profiles")
      .select("name, plan, token_balance, welcomed_at")
      .eq("id", user.id)
      .single();

    if (profile && !profile.welcomed_at) {
      sendWelcomeEmail({
        toEmail:      user.email ?? "",
        toName:       profile.name || user.email?.split("@")[0] || "Cliente",
        plan:         profile.plan ?? "sem_plano",
        tokenBalance: profile.token_balance ?? 0,
      });
      await service.from("profiles").update({ welcomed_at: new Date().toISOString() }).eq("id", user.id);
    }
  }

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
