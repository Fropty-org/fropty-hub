"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { requireAuth, requireRole } from "@/app/lib/auth/require-role";
import type { Feedback } from "@/app/lib/types/feedback";

export async function getClientFeedbacks(): Promise<Feedback[]> {
  const userId = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("feedbacks")
    .select("*")
    .eq("client_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[feedback] getClientFeedbacks:", error.message);
    return [];
  }

  return (data ?? []) as Feedback[];
}

export async function submitFeedback(formData: FormData): Promise<{ error?: string }> {
  const userId = await requireAuth();
  const title       = (formData.get("title")       as string)?.trim().slice(0, 200);
  const description = (formData.get("description") as string)?.trim().slice(0, 5000);
  const type        = (formData.get("type")        as string)?.trim();
  const product     = (formData.get("product")     as string)?.trim() || null;

  if (!title || !description) return { error: "Título e descrição são obrigatórios." };

  const validTypes = ["sugestao", "bug", "elogio", "critica", "outro"];
  if (!validTypes.includes(type)) return { error: "Tipo inválido." };

  const supabase = await createClient();

  const { error } = await supabase.from("feedbacks").insert({
    client_id:   userId,
    title,
    description,
    type,
    product,
  });

  if (error) {
    console.error("[feedback] submitFeedback:", error.message);
    return { error: "Erro ao enviar feedback. Tente novamente." };
  }

  revalidatePath("/portal/feedback");
  redirect("/portal/feedback");
}

export async function getAllFeedbacksAdmin(): Promise<Feedback[]> {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: feedbacks, error } = await supabase
    .from("feedbacks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[feedback] getAllFeedbacksAdmin:", error.message);
    return [];
  }

  if (!feedbacks || feedbacks.length === 0) return [];

  const clientIds = [...new Set(feedbacks.map((f) => f.client_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name")
    .in("id", clientIds);

  const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.name ?? "—"]));

  return feedbacks.map((f) => ({
    ...f,
    client_name: nameMap.get(f.client_id) ?? "—",
  })) as Feedback[];
}

export async function respondToFeedback(
  id: string,
  response: string,
  status: string,
  impact: string
): Promise<{ error?: string }> {
  await requireRole("admin");

  const validStatus = ["recebido", "em_analise", "aprovado", "descartado", "implementado"];
  const validImpact = ["alto", "medio", "baixo"];

  if (!validStatus.includes(status)) return { error: "Status inválido." };
  if (impact && !validImpact.includes(impact)) return { error: "Impacto inválido." };

  const supabase = await createClient();

  const { error } = await supabase
    .from("feedbacks")
    .update({
      admin_response: response.trim().slice(0, 5000) || null,
      status,
      impact:         impact || null,
      responded_at:   response.trim() ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) {
    console.error("[feedback] respondToFeedback:", error.message);
    return { error: "Erro ao responder. Tente novamente." };
  }

  revalidatePath("/admin/feedback");
  revalidatePath(`/admin/feedback/${id}`);
  return {};
}
