"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import { requireRole } from "@/app/lib/auth/require-role";
import type { TicketStatus, TicketPriority, ProjectStatus } from "@/app/lib/types/cliente";

const VALID_TICKET_STATUSES: TicketStatus[] = ["aberto", "em_andamento", "resolvido", "fechado"];
const VALID_TICKET_PRIORITIES: TicketPriority[] = ["baixa", "media", "alta"];
const VALID_PROJECT_STATUSES: ProjectStatus[] = [
  "aguardando", "em_desenvolvimento", "revisao", "entregue", "manutencao",
];

export async function updateTicketStatus(ticketId: string, status: TicketStatus): Promise<void> {
  await requireRole("admin");
  if (!VALID_TICKET_STATUSES.includes(status)) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("tickets")
    .update({ status })
    .eq("id", ticketId);

  if (error) return;
  revalidatePath("/admin/suporte");
  revalidatePath(`/area-cliente/suporte/${ticketId}`);
}

export async function updateTicketPriority(ticketId: string, priority: TicketPriority): Promise<void> {
  await requireRole("admin");
  if (!VALID_TICKET_PRIORITIES.includes(priority)) return;

  const supabase = await createClient();
  await supabase.from("tickets").update({ priority }).eq("id", ticketId);
  revalidatePath("/admin/suporte");
}

export async function updateProjectStatus(projectId: string, status: ProjectStatus, progress?: number): Promise<void> {
  await requireRole("admin");
  if (!VALID_PROJECT_STATUSES.includes(status)) return;
  const safeProgress = progress !== undefined ? Math.min(100, Math.max(0, progress)) : undefined;

  const supabase = await createClient();
  await supabase.from("projects").update({
    status,
    ...(safeProgress !== undefined ? { progress: safeProgress } : {}),
  }).eq("id", projectId);

  revalidatePath("/admin/projetos");
  revalidatePath("/area-cliente/projetos");
}

export async function sendDevMessage(formData: FormData): Promise<void> {
  const userId   = await requireRole("admin");
  const ticketId = (formData.get("ticket_id") as string)?.trim();
  const body     = (formData.get("body") as string)?.trim().slice(0, 5000);

  if (!ticketId || !body) return;

  const supabase = await createClient();
  await supabase.from("ticket_messages").insert({
    ticket_id:   ticketId,
    sender_id:   userId,
    sender_role: "admin" as const,
    body,
  });

  revalidatePath(`/admin/suporte/${ticketId}`);
  revalidatePath(`/area-cliente/suporte/${ticketId}`);
}
