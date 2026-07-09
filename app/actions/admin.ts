"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import { createServiceClient } from "@/app/lib/supabase/service";
import { requireRole } from "@/app/lib/auth/require-role";
import { logAdminAction } from "@/app/lib/db/audit";
import { sanitizeServiceIds } from "@/app/lib/constants/services";

export async function adminBulkUpdatePlan(
  userIds: string[],
  plan: string,
): Promise<{ error?: string }> {
  const adminId = await requireRole("admin");
  if (!userIds.length || !["sem_plano", "basico", "pro"].includes(plan)) return { error: "Dados inválidos" };

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("profiles")
    .update({ plan })
    .in("id", userIds);

  if (error) return { error: error.message };
  logAdminAction({ adminId, action: "bulk_update_plan", targetType: "user", targetId: userIds.join(","), metadata: { plan, count: userIds.length } });
  revalidatePath("/admin/usuarios");
  return {};
}

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
  const company      = (formData.get("company") as string)?.trim() || null;
  const tokenBalance = Math.max(0, parseInt((formData.get("token_balance") as string) ?? "0", 10));
  const plan         = (formData.get("plan") as string)?.trim() || "sem_plano";
  const services     = sanitizeServiceIds(formData.getAll("services").map((s) => String(s)));
  const contractRaw  = (formData.get("contract_start") as string | null)?.trim() || "";
  const contractStart = /^\d{4}-\d{2}-\d{2}$/.test(contractRaw) ? contractRaw : null;

  if (!email) return { error: "Informe o e-mail." };

  const service = createServiceClient();
  const { data, error } = await service.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_HUB_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fropty.com"}/auth/callback?next=/area-cliente/nova-senha`,
    data: { name, role: "cliente", token_balance: tokenBalance, plan, services, contract_start: contractStart, company },
  });

  if (error) return { error: error.message };

  logAdminAction({ adminId, action: "invite_client", targetType: "user", targetId: data?.user?.id, metadata: { email, name, company, plan, tokenBalance, services, contractStart } });
  revalidatePath("/admin/usuarios");
  return { success: `Convite enviado para ${email}` };
}

export async function adminUpdateUserProfile(formData: FormData): Promise<{ error?: string; success?: string }> {
  const adminId = await requireRole("admin");
  const userId  = (formData.get("user_id") as string)?.trim();
  if (!userId) return { error: "Usuário inválido." };

  const email   = (formData.get("email") as string)?.trim().toLowerCase() || "";
  const name    = (formData.get("name") as string)?.trim() || email.split("@")[0] || "cliente";
  const company = (formData.get("company") as string)?.trim() || null;
  const phone   = (formData.get("phone") as string)?.trim() || null;
  const plan    = (formData.get("plan") as string)?.trim() || "sem_plano";
  const services = sanitizeServiceIds(formData.getAll("services").map((s) => String(s)));
  const balance = parseInt((formData.get("token_balance") as string) ?? "0", 10);
  const contractRaw   = (formData.get("contract_start") as string | null)?.trim() || "";
  const contractStart = /^\d{4}-\d{2}-\d{2}$/.test(contractRaw) ? contractRaw : null;

  if (!email) return { error: "Informe o e-mail." };
  if (!["sem_plano", "basico", "pro"].includes(plan)) return { error: "Plano inválido." };
  if (isNaN(balance) || balance < 0 || balance > 99999) return { error: "Saldo de tokens inválido (0–99999)." };

  const service = createServiceClient();
  const { data: target } = await service.from("profiles").select("email").eq("id", userId).single();
  if (!target) return { error: "Usuário não encontrado." };

  // E-mail mudou → atualiza no Auth (confirmado) antes de refletir em profiles
  if (email !== target.email) {
    const { error: authErr } = await service.auth.admin.updateUserById(userId, { email, email_confirm: true });
    if (authErr) return { error: `E-mail: ${authErr.message}` };
  }

  const { error } = await service
    .from("profiles")
    .update({
      name,
      email,
      company,
      phone_number: phone,
      plan: plan as "sem_plano" | "basico" | "pro",
      token_balance: balance,
      services,
      contract_start: contractStart,
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  logAdminAction({ adminId, action: "update_profile", targetType: "user", targetId: userId, metadata: { name, company, email, plan, balance, services, contractStart } });
  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${userId}/editar`);
  return { success: "Alterações salvas." };
}

export async function adminExportUsers(): Promise<{ rows: Record<string, unknown>[]; error?: string }> {
  await requireRole("admin");
  const service = createServiceClient();
  const { data, error } = await service
    .from("profiles")
    .select("name,email,company,phone_number,role,plan,token_balance,is_active,contract_start,created_at")
    .order("created_at", { ascending: false });
  if (error) return { rows: [], error: error.message };
  const rows = (data ?? []).map((u) => ({
    nome:          u.name ?? "",
    email:         u.email ?? "",
    empresa:       u.company ?? "",
    telefone:      u.phone_number ?? "",
    papel:         u.role ?? "",
    plano:         u.plan ?? "",
    tokens:        u.token_balance ?? 0,
    status:        u.is_active === false ? "bloqueado" : "ativo",
    inicio_contrato: u.contract_start ?? "",
    criado_em:     u.created_at ?? "",
  }));
  return { rows };
}

export interface BulkInviteRow {
  email: string;
  name?: string;
  company?: string;
  plan?: string;
  token_balance?: number;
}

export async function adminBulkInviteClients(
  rows: BulkInviteRow[],
): Promise<{ invited: number; failed: { email: string; error: string }[] }> {
  const adminId = await requireRole("admin");
  const service = createServiceClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_HUB_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fropty.com"}/auth/callback?next=/area-cliente/nova-senha`;

  let invited = 0;
  const failed: { email: string; error: string }[] = [];

  for (const r of rows.slice(0, 200)) {
    const email = r.email?.trim().toLowerCase() ?? "";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      failed.push({ email: r.email || "(vazio)", error: "e-mail inválido" });
      continue;
    }
    const plan = ["sem_plano", "basico", "pro"].includes(r.plan ?? "") ? (r.plan as string) : "sem_plano";
    const tokenBalance = Math.max(0, Math.min(99999, Math.trunc(Number(r.token_balance) || 0)));
    const name = r.name?.trim() || email.split("@")[0];
    const company = r.company?.trim() || null;

    const { error } = await service.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { name, role: "cliente", token_balance: tokenBalance, plan, services: [], contract_start: null, company },
    });
    if (error) failed.push({ email, error: error.message });
    else invited++;
  }

  logAdminAction({ adminId, action: "bulk_invite", targetType: "user", metadata: { invited, failed: failed.length } });
  revalidatePath("/admin/usuarios");
  return { invited, failed };
}

export async function adminDeleteUser(formData: FormData): Promise<{ error?: string }> {
  const adminId = await requireRole("admin");
  const userId  = (formData.get("user_id") as string)?.trim();
  if (!userId) return { error: "Usuário inválido." };
  if (userId === adminId) return { error: "Você não pode excluir a própria conta." };

  const service = createServiceClient();
  const { data: target } = await service.from("profiles").select("role, name, email").eq("id", userId).single();
  if (!target) return { error: "Usuário não encontrado." };
  if (target.role === "admin") return { error: "Não é possível excluir outro administrador." };

  // Remove do Auth; FKs em cascata limpam profiles + dados relacionados
  const { error } = await service.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  logAdminAction({ adminId, action: "delete_user", targetType: "user", targetId: userId, metadata: { name: target.name, email: target.email } });
  revalidatePath("/admin/usuarios");
  return {};
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
