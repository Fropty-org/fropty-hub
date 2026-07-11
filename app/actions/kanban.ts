"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import { getProfile } from "@/app/lib/auth/session";
import type { Database } from "@/app/lib/supabase/types";

export type KanbanTask = Database["public"]["Tables"]["kanban_tasks"]["Row"];
export type KanbanColumn = "todo" | "doing" | "done";

const COLUMNS: KanbanColumn[] = ["todo", "doing", "done"];

/**
 * Resolve o escopo do quadro a partir do papel do usuário:
 * admin -> quadro único da equipe; cliente -> quadro próprio.
 * O gating de acesso do cliente (serviço "kanban") é feito na página.
 */
async function resolveScope(): Promise<
  | { scope: "admin_team"; ownerId: null; userId: string }
  | { scope: "client"; ownerId: string; userId: string }
  | null
> {
  const profile = await getProfile();
  if (!profile) return null;
  if (profile.role === "admin") return { scope: "admin_team", ownerId: null, userId: profile.id };
  return { scope: "client", ownerId: profile.id, userId: profile.id };
}

export async function getKanbanTasks(): Promise<KanbanTask[]> {
  const ctx = await resolveScope();
  if (!ctx) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kanban_tasks")
    .select("*")
    .eq("scope", ctx.scope)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) { console.error("[getKanbanTasks]", error.message); return []; }
  return (data ?? []) as KanbanTask[];
}

export async function createKanbanTask(
  columnKey: string,
  title: string,
  description?: string,
): Promise<{ error?: string; id?: string }> {
  const ctx = await resolveScope();
  if (!ctx) return { error: "Não autenticado." };
  const col = (COLUMNS.includes(columnKey as KanbanColumn) ? columnKey : "todo") as KanbanColumn;
  const t = title.trim().slice(0, 200);
  if (!t) return { error: "Informe um título." };

  const supabase = await createClient();
  // posição = fim da coluna
  const { data: last } = await supabase
    .from("kanban_tasks")
    .select("position")
    .eq("scope", ctx.scope)
    .eq("column_key", col)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (last?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("kanban_tasks")
    .insert({ scope: ctx.scope, owner_id: ctx.ownerId, column_key: col, title: t, description: description?.trim() || null, position })
    .select("id")
    .single();
  if (error) return { error: error.message };
  revalidatePath("/portal/kanban");
  revalidatePath("/admin/kanban");
  return { id: data.id };
}

export async function updateKanbanTask(
  id: string,
  fields: { title?: string; description?: string | null },
): Promise<{ error?: string }> {
  const ctx = await resolveScope();
  if (!ctx) return { error: "Não autenticado." };
  const patch: { title?: string; description?: string | null } = {};
  if (typeof fields.title === "string") {
    const t = fields.title.trim().slice(0, 200);
    if (!t) return { error: "Informe um título." };
    patch.title = t;
  }
  if (fields.description !== undefined) patch.description = fields.description?.toString().trim() || null;
  if (!Object.keys(patch).length) return {};

  const supabase = await createClient();
  const { error } = await supabase.from("kanban_tasks").update(patch).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/portal/kanban");
  revalidatePath("/admin/kanban");
  return {};
}

export async function moveKanbanTask(id: string, columnKey: string): Promise<{ error?: string }> {
  const ctx = await resolveScope();
  if (!ctx) return { error: "Não autenticado." };
  const col = (COLUMNS.includes(columnKey as KanbanColumn) ? columnKey : "todo") as KanbanColumn;

  const supabase = await createClient();
  const { data: last } = await supabase
    .from("kanban_tasks")
    .select("position")
    .eq("scope", ctx.scope)
    .eq("column_key", col)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (last?.position ?? -1) + 1;

  const { error } = await supabase.from("kanban_tasks").update({ column_key: col, position }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/portal/kanban");
  revalidatePath("/admin/kanban");
  return {};
}

export async function deleteKanbanTask(id: string): Promise<{ error?: string }> {
  const ctx = await resolveScope();
  if (!ctx) return { error: "Não autenticado." };
  const supabase = await createClient();
  const { error } = await supabase.from("kanban_tasks").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/portal/kanban");
  revalidatePath("/admin/kanban");
  return {};
}
