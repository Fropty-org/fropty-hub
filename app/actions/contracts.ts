"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import { createServiceClient } from "@/app/lib/supabase/service";
import { requireAuth, requireRole } from "@/app/lib/auth/require-role";
import type { Contract, ContractStatus, ContractType } from "@/app/lib/types/projects";

export async function getClientContracts(): Promise<Contract[]> {
  const userId = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contracts")
    .select("*, projects:project_id(title)")
    .eq("client_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[getClientContracts]", error.message);
    return [];
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map((c) => ({
    ...(c as object),
    project_title: (c.projects as { title?: string } | null)?.title ?? undefined,
  })) as Contract[];
}

export async function getContract(id: string): Promise<Contract | null> {
  const userId = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contracts")
    .select("*, projects:project_id(title), profiles:client_id(name)")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const row = data as Record<string, unknown>;
  return {
    ...(row as object),
    project_title: (row.projects as { title?: string } | null)?.title ?? undefined,
    client_name:   (row.profiles as { name?: string } | null)?.name ?? "—",
  } as Contract;
}

export async function getAllContracts(): Promise<Contract[]> {
  await requireRole("admin");
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("contracts")
    .select("*, profiles:client_id(name), projects:project_id(title)")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[getAllContracts]", error.message);
    return [];
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map((c) => ({
    ...(c as object),
    client_name:   (c.profiles as { name?: string } | null)?.name ?? "—",
    project_title: (c.projects as { title?: string } | null)?.title ?? undefined,
  })) as Contract[];
}

export async function createContract(formData: FormData): Promise<{ error?: string; id?: string }> {
  await requireRole("admin");
  const supabase = createServiceClient();

  const clientId    = (formData.get("client_id") as string)?.trim();
  const title       = (formData.get("title") as string)?.trim().slice(0, 200);
  const description = (formData.get("description") as string)?.trim() || null;
  const status      = ((formData.get("status") as string) || "rascunho") as ContractStatus;
  const type        = ((formData.get("type") as string) || "projeto") as ContractType;
  const projectId   = (formData.get("project_id") as string)?.trim() || null;
  const startDate   = (formData.get("start_date") as string)?.trim() || null;
  const endDate     = (formData.get("end_date") as string)?.trim() || null;
  const value       = parseFloat((formData.get("value") as string) ?? "") || null;
  const fileUrl     = (formData.get("file_url") as string)?.trim() || null;

  if (!clientId || !title) return { error: "Cliente e título são obrigatórios." };

  const { data, error } = await supabase
    .from("contracts")
    .insert({
      client_id:  clientId,
      project_id: projectId,
      title,
      description,
      status,
      type,
      start_date: startDate,
      end_date:   endDate,
      value,
      file_url:   fileUrl,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createContract]", error.message);
    return { error: "Erro ao criar contrato." };
  }

  revalidatePath("/admin/contratos");
  return { id: data.id };
}

export async function updateContractStatus(
  id: string,
  status: ContractStatus,
): Promise<{ error?: string }> {
  await requireRole("admin");
  const supabase = createServiceClient();

  const update: { status: ContractStatus; signed_at?: string } = { status };
  if (status === "assinado") update.signed_at = new Date().toISOString();

  const { error } = await supabase
    .from("contracts")
    .update(update)
    .eq("id", id);

  if (error) return { error: "Erro ao atualizar contrato." };

  revalidatePath(`/admin/contratos/${id}`);
  revalidatePath(`/portal/contratos/${id}`);
  revalidatePath("/admin/contratos");
  return {};
}
