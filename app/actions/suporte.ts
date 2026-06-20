"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import { createServiceClient } from "@/app/lib/supabase/service";
import { requireAuth, requireRole } from "@/app/lib/auth/require-role";
import { dbCreateTicket } from "@/app/lib/db/tickets";
import {
  sendNewTicketAlert,
  sendNewMessageAlert,
} from "@/app/lib/email/send";

function isValidAttachmentUrl(url: string): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return false;
  return url.startsWith(`${supabaseUrl}/storage/v1/object/`);
}

export async function createTicket(formData: FormData) {
  const userId      = await requireAuth();
  const subject     = (formData.get("subject")       as string)?.trim().slice(0, 200);
  const category    = (formData.get("category")      as string)?.trim();
  const body        = (formData.get("body")           as string)?.trim().slice(0, 10000);
  const projectId   = (formData.get("project_id")    as string)?.trim() || null;
  const onBehalfOf  = (formData.get("on_behalf_of")  as string)?.trim() || null;
  const priorityRaw = ((formData.get("priority")     as string) ?? "").trim();
  const priority    = (["baixa", "media", "alta"].includes(priorityRaw) ? priorityRaw : "media") as "baixa" | "media" | "alta";
  const attachments = formData.getAll("attachments[]")
    .map((v) => (v as string).trim())
    .filter((url) => url && isValidAttachmentUrl(url))
    .slice(0, 10);

  if (!subject || !body) return { error: "Preencha o assunto e a descrição." };

  const supabase = await createClient();

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", userId)
    .single();

  const isAdmin = callerProfile?.role === "admin";

  // Admin abre em nome de um cliente; cliente abre o próprio chamado.
  let clientId = userId;
  if (isAdmin) {
    if (!onBehalfOf) return { error: "Selecione o cliente." };
    const { data: target } = await supabase
      .from("profiles")
      .select("id, role, is_active")
      .eq("id", onBehalfOf)
      .eq("role", "cliente")
      .eq("is_active", true)
      .single();
    if (!target) return { error: "Cliente não encontrado ou inativo." };
    clientId = target.id;
  }

  const { data: clientProfile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", clientId)
    .single();

  const { data: authUser } = await supabase.auth.getUser();
  const clientEmail = isAdmin ? "" : (authUser.user?.email ?? "");

  const result = await dbCreateTicket({
    clientId,
    projectId:   projectId || null,
    subject,
    category:    category || "Geral",
    body,
    priority,
    senderId:    clientId,        // a mensagem inicial pertence ao cliente do chamado
    senderRole:  "cliente",
    useService:  isAdmin,         // admin em nome de cliente precisa bypassar RLS
    attachments: attachments.length > 0 ? attachments : undefined,
  });

  if (result.error) return { error: "Erro ao abrir chamado. Tente novamente." };

  sendNewTicketAlert({
    subject,
    category: category || "Geral",
    clientName:  clientProfile?.name ?? "Cliente",
    clientEmail,
    ticketId:    result.ticketId!,
  });

  revalidatePath("/portal/suporte");
  return { success: true, ticketId: result.ticketId };
}

export async function sendMessage(formData: FormData) {
  const userId   = await requireAuth();
  const ticketId    = (formData.get("ticket_id") as string)?.trim();
  const body        = (formData.get("body") as string)?.trim().slice(0, 5000);
  const attachments = formData.getAll("attachments[]")
    .map((v) => (v as string).trim())
    .filter((url) => url && isValidAttachmentUrl(url))
    .slice(0, 10);

  if (!ticketId || !body) return { error: "Mensagem não pode estar vazia." };

  const supabase = await createClient();

  const { data: senderProfile } = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", userId)
    .single();

  const senderRole = (senderProfile?.role as "cliente" | "admin") ?? "cliente";
  const senderName = senderProfile?.name ?? "Fropty";

  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, subject, client_id")
    .eq("id", ticketId)
    .single();

  if (!ticket) return { error: "Ticket não encontrado." };

  if (senderRole === "cliente" && ticket.client_id !== userId) {
    return { error: "Ticket não encontrado." };
  }

  const { error } = await supabase.from("ticket_messages").insert({
    ticket_id:   ticketId,
    sender_id:   userId,
    sender_role: senderRole,
    body,
    ...(attachments.length > 0 ? { attachments } : {}),
  });

  if (error) return { error: "Erro ao enviar mensagem. Tente novamente." };

  if (senderRole === "cliente") {
    const adminEmail = process.env.CONTACT_EMAIL;
    if (adminEmail) {
      sendNewMessageAlert({
        toEmail:       adminEmail,
        toName:        "Time Fropty",
        fromName:      senderName,
        senderRole,
        ticketSubject: ticket.subject,
        ticketId,
        preview:       body,
      });
    }
  } else {
    // Usa service client para operação admin (auth.admin requer service role key)
    const serviceSupabase = createServiceClient();
    const { data: clientAuth } = await serviceSupabase.auth.admin.getUserById(ticket.client_id);
    const { data: clientProfile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", ticket.client_id)
      .single();

    const clientEmail = clientAuth?.user?.email;
    if (clientEmail) {
      sendNewMessageAlert({
        toEmail:       clientEmail,
        toName:        clientProfile?.name ?? "Cliente",
        fromName:      "Time Fropty",
        senderRole,
        ticketSubject: ticket.subject,
        ticketId,
        preview:       body,
      });
    }
  }

  revalidatePath(`/portal/suporte/${ticketId}`);
  revalidatePath(`/admin/suporte/${ticketId}`);
  return { success: true };
}

export async function updateTicket(formData: FormData) {
  await requireRole("admin");

  const ticketId   = (formData.get("ticket_id")  as string)?.trim();
  const statusRaw  = (formData.get("status")      as string)?.trim();
  const priorityRaw = (formData.get("priority")   as string)?.trim();

  if (!ticketId) return { error: "ID do chamado inválido." };

  const validStatus   = ["aberto", "em_andamento", "resolvido", "fechado"] as const;
  const validPriority = ["baixa", "media", "alta"] as const;

  type TicketStatus   = typeof validStatus[number];
  type TicketPriority = typeof validPriority[number];

  const update: { status?: TicketStatus; priority?: TicketPriority } = {};
  if (statusRaw   && (validStatus   as readonly string[]).includes(statusRaw))   update.status   = statusRaw   as TicketStatus;
  if (priorityRaw && (validPriority as readonly string[]).includes(priorityRaw)) update.priority = priorityRaw as TicketPriority;

  if (Object.keys(update).length === 0) return { error: "Nenhum campo para atualizar." };

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("tickets")
    .update(update)
    .eq("id", ticketId);

  if (error) return { error: "Erro ao atualizar chamado." };

  revalidatePath(`/portal/suporte/${ticketId}`);
  revalidatePath(`/portal/suporte`);
  return { success: true };
}
