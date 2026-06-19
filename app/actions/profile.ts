"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import { requireAuth } from "@/app/lib/auth/require-role";

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
  if (updateError) return { error: "Não foi possível alterar a senha. Tente novamente." };

  return { success: "Senha alterada com sucesso!" };
}

export async function updateTheme(theme: "dark" | "light"): Promise<void> {
  const userId = await requireAuth();
  if (theme !== "dark" && theme !== "light") return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ theme }).eq("id", userId);
}
