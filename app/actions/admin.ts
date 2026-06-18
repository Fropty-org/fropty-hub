"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import { requireRole } from "@/app/lib/auth/require-role";
import { logAdminAction } from "@/app/lib/db/audit";
import type { ProjectStatus } from "@/app/lib/types/cliente";

const VALID_PROJECT_STATUSES: ProjectStatus[] = [
  "aguardando", "em_desenvolvimento", "revisao", "entregue", "manutencao",
];

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

export async function adminCreateProject(formData: FormData): Promise<void> {
  const adminId     = await requireRole("admin");
  const clientId    = (formData.get("client_id") as string)?.trim();
  const name        = (formData.get("name") as string)?.trim().slice(0, 200);
  const description = ((formData.get("description") as string)?.trim() || "").slice(0, 500);

  if (!clientId || !name) return;

  const supabase = await createClient();
  const { data } = await supabase.from("projects").insert({
    client_id: clientId, name, description,
    status: "aguardando" as const, progress: 0, addons: [],
  }).select("id").single();
  logAdminAction({ adminId, action: "create_project", targetType: "project", targetId: data?.id, metadata: { name, clientId } });
  revalidatePath("/admin/projetos");
}

export async function adminUpdateProject(formData: FormData): Promise<void> {
  const adminId = await requireRole("admin");
  const projectId   = (formData.get("project_id") as string)?.trim();
  const status      = (formData.get("status") as string)?.trim() as ProjectStatus;
  const progressRaw = formData.get("progress");
  const progress    = progressRaw !== null ? Math.min(100, Math.max(0, parseInt(progressRaw as string, 10))) : undefined;
  const previewUrl  = (formData.get("preview_url") as string | null)?.trim() || null;

  if (!projectId || !VALID_PROJECT_STATUSES.includes(status)) return;

  // Valida URL se fornecida
  if (previewUrl) {
    try { new URL(previewUrl); } catch { return; }
  }

  const supabase = await createClient();
  await supabase.from("projects").update({
    status,
    ...(progress !== undefined ? { progress } : {}),
    ...(previewUrl !== undefined ? { preview_url: previewUrl } : {}),
  }).eq("id", projectId);

  logAdminAction({ adminId, action: "update_project", targetType: "project", targetId: projectId, metadata: { status, progress, previewUrl } });
  revalidatePath("/admin/projetos");
  revalidatePath("/portal/projetos");
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
