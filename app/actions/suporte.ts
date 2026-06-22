"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { createServiceClient } from "@/app/lib/supabase/service";
import { requireAuth, requireRole } from "@/app/lib/auth/require-role";
import { dbCreateTicket } from "@/app/lib/db/tickets";
import {
  sendNewTicketAlert,
  sendNewMessageAlert,
  sendTicketOpenedToClient,
  sendTicketStatusChange,
  sendResolutionFeedbackToTeam,
} from "@/app/lib/email/send";

// Os anexos são paths relativos do bucket no formato "<uid>/<uuid>.<ext>".
// Valida o formato e garante que o path pertence à pasta do próprio usuário
// (a policy do storage já força isso no upload; aqui é defesa em profundidade).
function isValidAttachmentPath(path: string, ownerId: string): boolean {
  if (path.includes("..") || path.startsWith("/")) return false;
  return /^[0-9a-fA-F-]{36}\/[^/]+\.[A-Za-z0-9]+$/.test(path) && path.startsWith(`${ownerId}/`);
}

export async function createTicket(formData: FormData) {
  const userId      = await requireAuth();
  const subject     = (formData.get("subject")       as string)?.trim().slice(0, 200);
  const category    = (formData.get("category")      as string)?.trim();
  const body        = (formData.get("body")           as string)?.trim().slice(0, 10000);
  const onBehalfOf  = (formData.get("on_behalf_of")  as string)?.trim() || null;
  const priorityRaw = ((formData.get("priority")     as string) ?? "").trim();
  const priority    = (["baixa", "media", "alta"].includes(priorityRaw) ? priorityRaw : "media") as "baixa" | "media" | "alta";
  const attachments = formData.getAll("attachments[]")
    .map((v) => (v as string).trim())
    .filter((p) => p && isValidAttachmentPath(p, userId))
    .slice(0, 10);

  if (!subject || !body) return { error: "Preencha o assunto e a descrição." };

  const supabase = await createClient();

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role, name, token_balance")
    .eq("id", userId)
    .single();

  const isAdmin = callerProfile?.role === "admin";

  // Clientes sem tokens não podem abrir chamados
  if (!isAdmin && (callerProfile?.token_balance ?? 0) <= 0) {
    return { error: "Você não possui tokens disponíveis para abrir um chamado. Adquira tokens para continuar." };
  }

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
  // E-mail do cliente: quando admin abre em nome, busca via service role
  let clientEmail = isAdmin ? "" : (authUser.user?.email ?? "");
  if (isAdmin) {
    const serviceSupabase = createServiceClient();
    const { data: clientAuth } = await serviceSupabase.auth.admin.getUserById(clientId);
    clientEmail = clientAuth?.user?.email ?? "";
  }

  const result = await dbCreateTicket({
    clientId,
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

  // Abrir um chamado consome 1 token do cliente. Inserir a transação de débito
  // dispara o trigger trg_token_balance, que atualiza profiles.token_balance.
  // Usa service client porque o ledger (token_transactions) é protegido por RLS.
  const ledger = createServiceClient();
  const { error: debitError } = await ledger.from("token_transactions").insert({
    client_id:   clientId,
    amount:      1,
    type:        "debit" as const,
    description: `Abertura de chamado${result.ticketNumber ? ` #${result.ticketNumber}` : ""}: ${subject}`.slice(0, 255),
  });
  if (debitError) console.error("[createTicket] falha ao debitar token:", debitError.message);

  // Alerta para o time interno
  sendNewTicketAlert({
    subject,
    category: category || "Geral",
    clientName:  clientProfile?.name ?? "Cliente",
    clientEmail,
    ticketId:    result.ticketId!,
  });

  // Confirmação para o cliente com resumo do pedido
  if (clientEmail) {
    sendTicketOpenedToClient({
      toEmail:      clientEmail,
      toName:       clientProfile?.name ?? "Cliente",
      subject,
      category:     category || "Geral",
      priority,
      body,
      ticketNumber: result.ticketNumber,
      ticketId:     result.ticketId!,
    });
  }

  revalidatePath("/portal/suporte");
  // Navega direto para o chamado recém-criado. Evita que a página /novo
  // re-renderize com saldo zerado e pisque a tela de "tokens insuficientes" —
  // além de já mostrar ao cliente o UFT aberto (confirmação clara).
  redirect(`/portal/suporte/${result.ticketId}?novo=1`);
}

export async function sendMessage(formData: FormData) {
  const userId   = await requireAuth();
  const ticketId    = (formData.get("ticket_id") as string)?.trim();
  const body        = (formData.get("body") as string)?.trim().slice(0, 5000);
  const attachments = formData.getAll("attachments[]")
    .map((v) => (v as string).trim())
    .filter((p) => p && isValidAttachmentPath(p, userId))
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

  const validStatus   = ["aberto", "em_andamento", "resolvido", "fechado", "reaberto"] as const;
  const validPriority = ["baixa", "media", "alta"] as const;

  type TicketStatus   = typeof validStatus[number];
  type TicketPriority = typeof validPriority[number];

  const update: { status?: TicketStatus; priority?: TicketPriority } = {};
  if (statusRaw   && (validStatus   as readonly string[]).includes(statusRaw))   update.status   = statusRaw   as TicketStatus;
  if (priorityRaw && (validPriority as readonly string[]).includes(priorityRaw)) update.priority = priorityRaw as TicketPriority;

  if (Object.keys(update).length === 0) return { error: "Nenhum campo para atualizar." };

  const supabase = createServiceClient();

  // Estado anterior para detectar mudança de status e notificar o cliente
  const { data: before } = await supabase
    .from("tickets")
    .select("status, subject, client_id, ticket_number")
    .eq("id", ticketId)
    .single();

  const { error } = await supabase
    .from("tickets")
    .update(update)
    .eq("id", ticketId);

  if (error) return { error: "Erro ao atualizar chamado." };

  // Notifica o cliente por e-mail quando o status muda
  if (before && update.status && update.status !== before.status) {
    const { data: clientAuth } = await supabase.auth.admin.getUserById(before.client_id);
    const { data: clientProfile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", before.client_id)
      .single();

    const clientEmail = clientAuth?.user?.email;
    if (clientEmail) {
      sendTicketStatusChange({
        toEmail:      clientEmail,
        toName:       clientProfile?.name ?? "Cliente",
        subject:      before.subject,
        oldStatus:    before.status,
        newStatus:    update.status,
        ticketNumber: before.ticket_number ?? undefined,
        ticketId,
      });
    }
  }

  revalidatePath(`/portal/suporte/${ticketId}`);
  revalidatePath(`/portal/suporte`);
  return { success: true };
}

// Cliente avalia a resolução de um chamado que está "resolvido":
// aprovar → fechado; reprovar → reaberto (volta para a fila do time).
export async function respondResolution(formData: FormData) {
  const userId   = await requireAuth();
  const ticketId = (formData.get("ticket_id") as string)?.trim();
  const decision = (formData.get("decision") as string)?.trim(); // "aprovar" | "reprovar"
  const reason   = (formData.get("reason") as string)?.trim().slice(0, 2000) || "";

  if (!ticketId || (decision !== "aprovar" && decision !== "reprovar")) {
    return { error: "Requisição inválida." };
  }

  const supabase = await createClient();

  // Garante que o chamado é do próprio cliente e está aguardando validação
  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, subject, status, client_id, ticket_number")
    .eq("id", ticketId)
    .eq("client_id", userId)
    .single();

  if (!ticket) return { error: "Chamado não encontrado." };
  if (ticket.status !== "resolvido") {
    return { error: "Este chamado não está aguardando validação." };
  }

  const newStatus = decision === "aprovar" ? "fechado" : "reaberto";

  // Registra o retorno do cliente na conversa (mensagem do próprio cliente)
  const note = decision === "aprovar"
    ? `✅ Resolução confirmada pelo cliente.${reason ? `\n\n${reason}` : ""}`
    : `❌ Cliente não aprovou a resolução.${reason ? `\n\nMotivo: ${reason}` : ""}`;
  await supabase.from("ticket_messages").insert({
    ticket_id:   ticketId,
    sender_id:   userId,
    sender_role: "cliente" as const,
    body:        note,
  });

  // Atualiza o status via service role (cliente não tem UPDATE em tickets por RLS)
  const service = createServiceClient();
  const { error: updErr } = await service.from("tickets").update({ status: newStatus }).eq("id", ticketId);
  if (updErr) return { error: "Não foi possível registrar sua avaliação. Tente novamente." };

  // Notifica o cliente (confirmação) e o time interno
  const { data: clientProfile } = await supabase.from("profiles").select("name").eq("id", userId).single();
  const { data: authUser } = await supabase.auth.getUser();
  const clientEmail = authUser.user?.email ?? "";
  const clientName  = clientProfile?.name ?? "Cliente";

  if (clientEmail) {
    sendTicketStatusChange({
      toEmail:      clientEmail,
      toName:       clientName,
      subject:      ticket.subject,
      oldStatus:    "resolvido",
      newStatus,
      ticketNumber: ticket.ticket_number ?? undefined,
      ticketId,
    });
  }
  sendResolutionFeedbackToTeam({
    approved:     decision === "aprovar",
    clientName,
    subject:      ticket.subject,
    ticketNumber: ticket.ticket_number ?? undefined,
    ticketId,
    reason,
  });

  revalidatePath(`/portal/suporte/${ticketId}`);
  revalidatePath(`/portal/suporte`);
  revalidatePath(`/portal/suporte/${ticketId}/avaliar`);
  return { success: true };
}
