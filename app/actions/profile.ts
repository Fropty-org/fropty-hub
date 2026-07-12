"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import { createServiceClient } from "@/app/lib/supabase/service";
import { requireAuth } from "@/app/lib/auth/require-role";
import { isWeakPasswordError, SENTINEL_PASSWORD_MESSAGE } from "@/app/lib/auth/password-error";
import { isPwnedPassword } from "@/app/lib/auth/pwned";

const PASSWORD_MIN_LENGTH = 10;
const PASSWORD_REGEX = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number:    /[0-9]/,
  special:   /[^A-Za-z0-9]/,
};

function validatePasswordStrength(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH)
    return `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  if (!PASSWORD_REGEX.uppercase.test(password))
    return "A senha deve conter pelo menos uma letra maiúscula.";
  if (!PASSWORD_REGEX.lowercase.test(password))
    return "A senha deve conter pelo menos uma letra minúscula.";
  if (!PASSWORD_REGEX.number.test(password))
    return "A senha deve conter pelo menos um número.";
  if (!PASSWORD_REGEX.special.test(password))
    return "A senha deve conter pelo menos um caractere especial (!@#$%...).";
  return null;
}


export async function updateProfile(formData: FormData): Promise<{ error?: string; success?: string }> {
  const userId = await requireAuth();
  const name = (formData.get("name") as string)?.trim().slice(0, 100);
  if (!name) return { error: "Nome não pode estar vazio." };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ name }).eq("id", userId);
  if (error) return { error: "Erro ao salvar. Tente novamente." };

  revalidatePath("/portal");
  revalidatePath("/portal/perfil");
  revalidatePath("/portal/dashboard");
  revalidatePath("/admin");
  revalidatePath("/admin/perfil");
  return { success: "Perfil atualizado!" };
}

export async function updatePhoneNumber(phone: string): Promise<{ error?: string; success?: string }> {
  const userId = await requireAuth();
  const cleaned = phone.replace(/\s/g, "").slice(0, 20);
  if (cleaned && !/^\+?\d{8,15}$/.test(cleaned)) return { error: "Telefone inválido. Use formato +5511999990000." };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ phone_number: cleaned || null } as never).eq("id", userId);
  if (error) return { error: "Erro ao salvar telefone." };

  revalidatePath("/portal/perfil");
  revalidatePath("/admin/perfil");
  return { success: "Telefone atualizado!" };
}

export async function changePassword(formData: FormData): Promise<{ error?: string; success?: string }> {
  await requireAuth();

  const currentPassword  = (formData.get("current_password")  as string)?.trim();
  const newPassword      = (formData.get("new_password")      as string)?.trim();
  const confirmPassword  = (formData.get("confirm_password")  as string)?.trim();

  if (!currentPassword || !newPassword || !confirmPassword)
    return { error: "Preencha todos os campos." };

  if (newPassword !== confirmPassword)
    return { error: "Nova senha e confirmação não conferem." };

  if (newPassword === currentPassword)
    return { error: "A nova senha deve ser diferente da senha atual." };

  const strengthError = validatePasswordStrength(newPassword);
  if (strengthError) return { error: strengthError };

  if (await isPwnedPassword(newPassword)) return { error: SENTINEL_PASSWORD_MESSAGE };

  const supabase = await createClient();

  // Verifica senha atual re-autenticando com email + senha atual
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Sessão inválida. Faça login novamente." };

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email:    user.email,
    password: currentPassword,
  });

  if (signInError) return { error: "Senha atual incorreta." };

  // Atualiza para a nova senha
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) {
    if (isWeakPasswordError(updateError)) return { error: SENTINEL_PASSWORD_MESSAGE };
    return { error: "Não foi possível alterar a senha. Tente novamente." };
  }

  return { success: "Senha alterada com sucesso!" };
}

export async function dismissOnboarding(): Promise<void> {
  const userId = await requireAuth();
  const supabase = await createClient();
  await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", userId);
  revalidatePath("/portal/dashboard");
}

export async function saveAvatarUrl(url: string): Promise<{ error?: string }> {
  const userId = await requireAuth();
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
  if (error) return { error: "Erro ao salvar foto." };
  revalidatePath("/portal/perfil");
  revalidatePath("/admin/perfil");
  return {};
}

export async function uploadAvatar(formData: FormData): Promise<{ error?: string; url?: string }> {
  const userId = await requireAuth();
  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) return { error: "Nenhum arquivo selecionado." };
  if (file.size > 2 * 1024 * 1024) return { error: "Imagem deve ter no máximo 2MB." };
  if (!file.type.startsWith("image/")) return { error: "Formato inválido. Use JPG, PNG ou WebP." };

  const ext  = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const path = `${userId}/avatar.${ext}`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { error: "Erro ao fazer upload. Tente novamente." };

  const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
  const urlWithBust = `${publicUrl}?t=${Date.now()}`;

  const { error: dbError } = await supabase
    .from("profiles")
    .update({ avatar_url: urlWithBust })
    .eq("id", userId);

  if (dbError) return { error: "Erro ao salvar foto." };

  revalidatePath("/portal/perfil");
  revalidatePath("/admin/perfil");
  return { url: urlWithBust };
}

export async function updateTheme(theme: "dark" | "light"): Promise<void> {
  const userId = await requireAuth();
  if (theme !== "dark" && theme !== "light") return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ theme }).eq("id", userId);
}

const PLAN_NAME: Record<string, string> = {
  basico:    "Básico",
  pro:       "Pro",
  enterprise: "Enterprise",
};

export async function requestPlanUpgrade(plan: string): Promise<{ error?: string; success?: string }> {
  const userId = await requireAuth();
  const planLabel = PLAN_NAME[plan] ?? plan;

  // Insert via service role: a tabela `tickets` não tem policy de INSERT para o
  // cliente (migration 0045) — a criação é sempre feita no servidor. Este
  // chamado comercial é gratuito (não debita token, diferente do Service Desk).
  const supabase = createServiceClient();
  const { data: ticket, error } = await supabase
    .from("tickets")
    .insert({
      client_id: userId,
      subject:   `Upgrade de plano para ${planLabel}`,
      category:  "Comercial",
      priority:  "alta",
      status:    "aberto",
    })
    .select("id")
    .single();

  if (error || !ticket) return { error: "Não foi possível criar o chamado. Tente novamente." };

  // Registra a solicitação como primeira mensagem do chamado (a tabela `tickets`
  // não guarda corpo; o texto vive em `ticket_messages`).
  await supabase.from("ticket_messages").insert({
    ticket_id:   ticket.id,
    sender_id:   userId,
    sender_role: "cliente",
    body:        `Solicitação de upgrade para o plano ${planLabel}.`,
  });

  revalidatePath("/portal/planos");
  revalidatePath("/portal/suporte");
  return { success: `Solicitação de upgrade para o plano ${planLabel} enviada! Nossa equipe entrará em contato.` };
}
