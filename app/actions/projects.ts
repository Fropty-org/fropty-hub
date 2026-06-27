"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import { createServiceClient } from "@/app/lib/supabase/service";
import { requireAuth, requireRole } from "@/app/lib/auth/require-role";
import type { Project, ProjectUpdate, ProjectStatus } from "@/app/lib/types/projects";

export async function getClientProjects(): Promise<Project[]> {
  const userId = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[getClientProjects]", error.message);
    return [];
  }
  return (data ?? []) as Project[];
}

export async function getProject(id: string): Promise<{ project: Project | null; updates: ProjectUpdate[] }> {
  const userId = await requireAuth();
  const supabase = await createClient();

  const { data: project, error: pe } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (pe || !project) return { project: null, updates: [] };

  const { data: updates, error: ue } = await supabase
    .from("project_updates")
    .select("*, profiles:author_id(name)")
    .eq("project_id", id)
    .order("created_at", { ascending: true });

  if (ue) console.error("[getProject updates]", ue.message);

  const mapped = ((updates ?? []) as Array<Record<string, unknown>>).map((u) => ({
    ...(u as object),
    author_name: (u.profiles as { name?: string } | null)?.name ?? "—",
  })) as ProjectUpdate[];

  return { project: project as Project, updates: mapped };
}

export async function getAllProjects(): Promise<Project[]> {
  await requireRole("admin");
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*, profiles:client_id(name)")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[getAllProjects]", error.message);
    return [];
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map((p) => ({
    ...(p as object),
    client_name: (p.profiles as { name?: string } | null)?.name ?? "—",
  })) as Project[];
}

export async function createProject(formData: FormData): Promise<{ error?: string; id?: string }> {
  const adminId = await requireRole("admin");
  const supabase = createServiceClient();

  const clientId      = (formData.get("client_id") as string)?.trim();
  const title         = (formData.get("title") as string)?.trim().slice(0, 200);
  const description   = (formData.get("description") as string)?.trim() || null;
  const status        = (formData.get("status") as ProjectStatus) || "lead";
  const priority      = (formData.get("priority") as string) || "media";
  const startDate     = (formData.get("start_date") as string)?.trim() || null;
  const dueDate       = (formData.get("due_date") as string)?.trim() || null;
  const estHours      = parseInt((formData.get("estimated_hours") as string) ?? "", 10) || null;
  const estCost       = parseFloat((formData.get("estimated_cost") as string) ?? "") || null;
  const notes         = (formData.get("notes") as string)?.trim() || null;

  if (!clientId || !title) return { error: "Cliente e título são obrigatórios." };

  const { data, error } = await supabase
    .from("projects")
    .insert({
      client_id:        clientId,
      title,
      description,
      status,
      priority,
      start_date:       startDate,
      due_date:         dueDate,
      estimated_hours:  estHours,
      estimated_cost:   estCost,
      notes,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createProject]", error.message);
    return { error: "Erro ao criar projeto." };
  }

  revalidatePath("/admin/projetos");
  return { id: data.id };
}

export async function updateProjectStatus(
  id: string,
  status: ProjectStatus,
  note?: string,
): Promise<{ error?: string }> {
  const adminId = await requireRole("admin");
  const supabase = createServiceClient();

  const { data: before } = await supabase
    .from("projects")
    .select("status")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", id);

  if (error) return { error: "Erro ao atualizar status." };

  if (note || (before && before.status !== status)) {
    await supabase.from("project_updates").insert({
      project_id:  id,
      author_id:   adminId,
      content:     note || `Status alterado para ${status}`,
      status_from: before?.status ?? null,
      status_to:   status,
    });
  }

  revalidatePath(`/admin/projetos/${id}`);
  revalidatePath(`/portal/projetos/${id}`);
  revalidatePath("/admin/projetos");
  return {};
}

export async function addProjectUpdate(
  projectId: string,
  content: string,
): Promise<{ error?: string }> {
  const adminId = await requireRole("admin");
  const supabase = createServiceClient();

  const trimmed = content.trim().slice(0, 5000);
  if (!trimmed) return { error: "Conteúdo não pode ser vazio." };

  const { error } = await supabase.from("project_updates").insert({
    project_id: projectId,
    author_id:  adminId,
    content:    trimmed,
  });

  if (error) return { error: "Erro ao adicionar atualização." };

  revalidatePath(`/admin/projetos/${projectId}`);
  revalidatePath(`/portal/projetos/${projectId}`);
  return {};
}
