"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import { requireAuth, requireRole } from "@/app/lib/auth/require-role";
import type { RoadmapItem } from "@/app/lib/types/roadmap";

export async function getRoadmapItems(status?: string): Promise<RoadmapItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from("roadmap_items")
    .select("*")
    .eq("visibility", "publico")
    .order("votes", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: items, error } = await query;
  if (error) {
    console.error("[roadmap] getRoadmapItems:", error.message);
    return [];
  }

  if (!user || !items) return (items ?? []) as RoadmapItem[];

  const { data: votes } = await supabase
    .from("roadmap_votes")
    .select("item_id")
    .eq("user_id", user.id);

  const votedSet = new Set((votes ?? []).map((v) => v.item_id));

  return items.map((item) => ({
    ...item,
    user_voted: votedSet.has(item.id),
  })) as RoadmapItem[];
}

export async function toggleVote(itemId: string): Promise<{ voted: boolean; error?: string }> {
  await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("toggle_roadmap_vote", { p_item_id: itemId });
  if (error) {
    console.error("[roadmap] toggleVote:", error.message);
    return { voted: false, error: "Não foi possível registrar o voto." };
  }

  revalidatePath("/portal/roadmap");
  return { voted: data as boolean };
}

export async function getAllRoadmapAdmin(): Promise<RoadmapItem[]> {
  await requireRole("admin");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("roadmap_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[roadmap] getAllRoadmapAdmin:", error.message);
    return [];
  }

  return (data ?? []) as RoadmapItem[];
}

export async function createRoadmapItem(data: {
  title: string;
  description?: string;
  status: string;
  category: string;
  visibility: string;
  target_version?: string;
}): Promise<{ error?: string }> {
  await requireRole("admin");
  const supabase = await createClient();

  const { error } = await supabase.from("roadmap_items").insert({
    title:          data.title.trim().slice(0, 200),
    description:    data.description?.trim().slice(0, 1000),
    status:         data.status,
    category:       data.category,
    visibility:     data.visibility,
    target_version: data.target_version?.trim() || null,
  });

  if (error) {
    console.error("[roadmap] createRoadmapItem:", error.message);
    return { error: "Erro ao criar item." };
  }

  revalidatePath("/admin/roadmap");
  revalidatePath("/portal/roadmap");
  return {};
}

export async function updateRoadmapItem(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    status: string;
    category: string;
    visibility: string;
    target_version: string;
  }>
): Promise<{ error?: string }> {
  await requireRole("admin");
  const supabase = await createClient();

  const { error } = await supabase
    .from("roadmap_items")
    .update(data)
    .eq("id", id);

  if (error) {
    console.error("[roadmap] updateRoadmapItem:", error.message);
    return { error: "Erro ao atualizar item." };
  }

  revalidatePath("/admin/roadmap");
  revalidatePath("/portal/roadmap");
  return {};
}
