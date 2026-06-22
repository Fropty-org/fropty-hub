"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import { createServiceClient } from "@/app/lib/supabase/service";
import { requireRole } from "@/app/lib/auth/require-role";
import { logAdminAction } from "@/app/lib/db/audit";
import { sanitizeServiceIds } from "@/app/lib/constants/services";

export async function adminCreditTokens(formData: FormData): Promise<void> {
  const adminId     = await requireRole("admin");
  const userId      = (formData.get("user_id") as string)?.trim();
  const amount      = parseInt((formData.get("amount") as string) ?? "0", 10);
  const description = ((formData.get("description") as string)?.trim() || "Crédito manual").slice(0, 255);

  if (!userId || amount <= 0 || amount > 9999) return;

  const supabase = await createClient();
  await supabase.from("token_transactions").insert({
    client_id:   userId,
    amount,
    type:        "credit" as const,
    description: `${description} [admin:${adminId.slice(0, 8)}]`,
  });
  logAdminAction({ adminId, action: "credit_tokens", targetType: "user", targetId: userId, metadata: { amount, description } });
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/financeiro");
}

export async function adminInviteClient(formData: FormData): Promise<{ error?: string; success?: string }> {
  const adminId      = await requireRole("admin");
  const email        = (formData.get("email") as string)?.trim().toLowerCase();
  const name         = (formData.get("name") as string)?.trim() || email.split("@")[0];
  const tokenBalance = Math.max(0, parseInt((formData.get("token_balance") as string) ?? "0", 10));
  const plan         = (formData.get("plan") as string)?.trim() || "sem_plano";
  const services     = sanitizeServiceIds(formData.getAll("services").map((s) => String(s)));
  const contractRaw  = (formData.get("contract_start") as string | null)?.trim() || "";
  const contractStart = /^\d{4}-\d{2}-\d{2}$/.test(contractRaw) ? contractRaw : null;

  if (!email) return { error: "Informe o e-mail." };

  const service = createServiceClient();
  const { data, error } = await service.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fropty.com"}/auth/callback?next=/area-cliente/nova-senha`,
    data: { name, role: "cliente", token_balance: tokenBalance, plan, services, contract_start: contractStart },
  });

  if (error) return { error: error.message };

  logAdminAction({ adminId, action: "invite_client", targetType: "user", targetId: data?.user?.id, metadata: { email, name, plan, tokenBalance, services, contractStart } });
  revalidatePath("/admin/usuarios");
  return { success: `Convite enviado para ${email}` };
}

export async function adminRevokeAccess(formData: FormData): Promise<void> {
  const adminId = await requireRole("admin");
  const userId  = (formData.get("user_id") as string)?.trim();
  if (!userId || userId === adminId) return; // impede auto-revogação

  const service = createServiceClient();
  const { data: target } = await service.from("profiles").select("role, name, email").eq("id", userId).single();
  if (target?.role === "admin") return; // nunca revogar outro admin

  await service.auth.admin.updateUserById(userId, { ban_duration: "87600h" });
  await service.from("profiles").update({ is_active: false }).eq("id", userId);
  logAdminAction({ adminId, action: "revoke_access", targetType: "user", targetId: userId, metadata: { name: target?.name, email: target?.email } });
  revalidatePath("/admin/usuarios");
}

export async function adminRestoreAccess(formData: FormData): Promise<void> {
  const adminId = await requireRole("admin");
  const userId  = (formData.get("user_id") as string)?.trim();
  if (!userId) return;

  const service = createServiceClient();
  const { data: target } = await service.from("profiles").select("name, email").eq("id", userId).single();
  await service.auth.admin.updateUserById(userId, { ban_duration: "none" });
  await service.from("profiles").update({ is_active: true }).eq("id", userId);
  logAdminAction({ adminId, action: "restore_access", targetType: "user", targetId: userId, metadata: { name: target?.name, email: target?.email } });
  revalidatePath("/admin/usuarios");
}

export async function adminSetTokenBalance(formData: FormData): Promise<void> {
  const adminId = await requireRole("admin");
  const userId  = (formData.get("user_id") as string)?.trim();
  const balance = parseInt((formData.get("balance") as string) ?? "0", 10);

  if (!userId || isNaN(balance) || balance < 0 || balance > 99999) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ token_balance: balance }).eq("id", userId);
  logAdminAction({ adminId, action: "set_token_balance", targetType: "user", targetId: userId, metadata: { balance } });
  revalidatePath("/admin/usuarios");
}

export async function adminUpdateUserPlan(formData: FormData): Promise<void> {
  const adminId = await requireRole("admin");
  const userId  = (formData.get("user_id") as string)?.trim();
  const plan    = (formData.get("plan") as string)?.trim();

  if (!userId || !["sem_plano", "basico", "pro"].includes(plan)) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ plan: plan as "sem_plano" | "basico" | "pro" }).eq("id", userId);
  logAdminAction({ adminId, action: "update_plan", targetType: "user", targetId: userId, metadata: { plan } });
  revalidatePath("/admin/usuarios");
}

export async function adminUpdateUserRole(formData: FormData): Promise<void> {
  const adminId = await requireRole("admin");
  const userId  = (formData.get("user_id") as string)?.trim();
  const role    = (formData.get("role") as string)?.trim();

  if (!userId || !["cliente", "admin"].includes(role)) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ role: role as "cliente" | "admin" }).eq("id", userId);
  logAdminAction({ adminId, action: "update_role", targetType: "user", targetId: userId, metadata: { role } });
  revalidatePath("/admin/usuarios");
}
