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
import { extractUrls } from "@/app/lib/security/urls";
import { checkUrlsReputation } from "@/app/lib/security/url-reputation";

// Os anexos são paths relativos do bucket no formato "<pasta>/<uuid>.<ext>".
// A pasta é o uid do usuário (criação do chamado) ou o id do ticket (respostas).
// Valida o formato e garante o prefixo esperado (a policy do storage já força
// isso no upload; aqui é defesa em profundidade).
function isValidAttachmentPath(path: string, prefix: string): boolean {
  if (path.includes("..") || path.startsWith("/")) return false;
  return /^[^/]+\/[^/]+\.[A-Za-z0-9]+$/.test(path) && path.startsWith(`${prefix}/`);
}

export async function createTicket(formData: FormData) {
  const userId      = await requireAuth();
  const subject     = (formData.get("subject")       as string)?.trim().slice(0, 200);
  const category    = (formData.get("category")      as string)?.trim();
  const body        = (formData.get("body")           as string)?.trim().slice(0, 10000);
  const onBehalfOf  = (formData.get("on_behalf_of")  as string)?.trim() || null;
  const debitToken  = formData.get("debit_token") != null; // checkbox: presente = marcado
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
  // Cliente sempre debita o próprio token; admin escolhe debitar ou não (cortesia).
  const shouldDebit = isAdmin ? debitToken : true;
  if (shouldDebit) {
    const ledger = createServiceClient();
    const { error: debitError } = await ledger.from("token_transactions").insert({
      client_id:   clientId,
      amount:      1,
      type:        "debit" as const,
      description: `Abertura de chamado${result.ticketNumber ? ` #${result.ticketNumber}` : ""}: ${subject}`.slice(0, 255),
    });
    if (debitError) console.error("[createTicket] falha ao debitar token:", debitError.message);
  }

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
    .filter((p) => p && isValidAttachmentPath(p, ticketId))
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

  // FroptySentinel: se há link, a mensagem entra "pendente" e a reputação é
  // verificada logo em seguida (o resultado propaga por realtime UPDATE).
  const urls = extractUrls(body);
  const hasLinks = urls.length > 0;

  const { data: inserted, error } = await supabase.from("ticket_messages").insert({
    ticket_id:   ticketId,
    sender_id:   userId,
    sender_role: senderRole,
    body,
    ...(attachments.length > 0 ? { attachments } : {}),
    ...(hasLinks ? { link_status: "pending" } : {}),
  }).select("id").single();

  if (error) return { error: "Erro ao enviar mensagem. Tente novamente." };

  // Verifica a reputação e grava o veredito (via service client — o update do
  // link_status não depende da policy de escrita do usuário).
  if (hasLinks && inserted?.id) {
    const verdict = await checkUrlsReputation(urls);
    const service = createServiceClient();
    await service.from("ticket_messages").update({ link_status: verdict }).eq("id", inserted.id);
  }

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
  const me = await requireRole("admin");

  const ticketId   = (formData.get("ticket_id")  as string)?.trim();
  const statusRaw  = (formData.get("status")      as string)?.trim();
  const priorityRaw = (formData.get("priority")   as string)?.trim();
  const comment    = (formData.get("comment")     as string)?.trim().slice(0, 5000) || "";

  if (!ticketId) return { error: "ID do chamado inválido." };

  const validStatus   = ["aberto", "em_andamento", "resolvido", "fechado", "reaberto"] as const;
  const validPriority = ["baixa", "media", "alta"] as const;

  type TicketStatus   = typeof validStatus[number];
  type TicketPriority = typeof validPriority[number];

  const update: { status?: TicketStatus; priority?: TicketPriority; first_response_at?: string; resolved_at?: string | null } = {};
  if (statusRaw   && (validStatus   as readonly string[]).includes(statusRaw))   update.status   = statusRaw   as TicketStatus;
  if (priorityRaw && (validPriority as readonly string[]).includes(priorityRaw)) update.priority = priorityRaw as TicketPriority;

  if (Object.keys(update).length === 0) return { error: "Nenhum campo para atualizar." };

  const supabase = createServiceClient();

  // Estado anterior para detectar mudança de status e notificar o cliente
  const { data: before } = await supabase
    .from("tickets")
    .select("status, subject, client_id, ticket_number, first_response_at")
    .eq("id", ticketId)
    .single();

  const statusChangedToResolvido =
    update.status === "resolvido" && before?.status !== "resolvido";

  // Marcos de SLA
  const nowIso = new Date().toISOString();
  if (update.status === "em_andamento" && !before?.first_response_at) {
    update.first_response_at = nowIso;               // 1º atendimento → encerra SLA de resposta
  }
  if (statusChangedToResolvido) {
    update.resolved_at = nowIso;                      // resolução → encerra SLA de resolução
  }
  if (update.status === "reaberto") {
    update.resolved_at = null;                        // reaberto → relógio de resolução volta a correr
  }

  // Ao marcar como "Aguardando validação", o comentário é obrigatório e vai
  // junto com a mudança de status (uma única notificação para o cliente).
  if (statusChangedToResolvido && !comment) {
    return { error: "Escreva um comentário explicando a resolução antes de marcar como Aguardando validação." };
  }

  const { error } = await supabase
    .from("tickets")
    .update(update)
    .eq("id", ticketId);

  if (error) return { error: "Erro ao atualizar chamado." };

  // Registra o comentário do analista na conversa (quando informado)
  if (statusChangedToResolvido && comment) {
    await supabase.from("ticket_messages").insert({
      ticket_id:   ticketId,
      sender_id:   me,
      sender_role: "admin" as const,
      body:        comment,
    });
  }

  // Notifica o cliente por e-mail quando o status muda (com o comentário, se houver)
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
        note:         statusChangedToResolvido ? comment : undefined,
      });
    }
  }

  revalidatePath(`/portal/suporte/${ticketId}`);
  revalidatePath(`/portal/suporte`);
  return { success: true };
}

// Atribui (ou desatribui) um analista a um chamado. Ação de admin.
// assigneeId vazio/null → remove a atribuição. Escrita via service role
// (RLS de tickets restringe UPDATE ao time; alinhado ao updateTicket).
export async function assignTicket(ticketId: string, assigneeId: string | null) {
  const actorId = await requireRole("admin");

  const id = ticketId?.trim();
  if (!id) return { error: "ID do chamado inválido." };

  const assignee = assigneeId?.trim() || null;

  const supabase = createServiceClient();

  // Valida que, se informado, o responsável é um admin (analista) ativo.
  if (assignee) {
    const { data: analyst } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", assignee)
      .single();
    if (!analyst || analyst.role !== "admin") {
      return { error: "Responsável inválido." };
    }
  }

  // Estado anterior — para saber quem foi removido/adicionado e notificar.
  const { data: prevTicket } = await supabase
    .from("tickets")
    .select("assigned_to, ticket_number, subject")
    .eq("id", id)
    .single();
  const previous = prevTicket?.assigned_to ?? null;

  const { error } = await supabase
    .from("tickets")
    .update({ assigned_to: assignee })
    .eq("id", id);

  if (error) return { error: "Erro ao atribuir o chamado." };

  // Notifica no sininho quando o responsável muda (definido, removido ou trocado).
  // Não notifica quem executou a própria ação (evita ruído no self-assign).
  if (previous !== assignee) {
    const uft = prevTicket?.ticket_number != null
      ? `UFT${String(prevTicket.ticket_number).padStart(4, "0")}`
      : "chamado";
    const subject = prevTicket?.subject ?? "";
    const link = `/admin/suporte/${id}`;
    const notes: { user_id: string; title: string; body: string; type: string; link: string }[] = [];

    if (assignee && assignee !== actorId) {
      notes.push({
        user_id: assignee,
        title: `Você é o responsável pelo ${uft}`,
        body: subject,
        type: "ticket_assigned",
        link,
      });
    }
    if (previous && previous !== actorId) {
      notes.push({
        user_id: previous,
        title: `Você não é mais o responsável pelo ${uft}`,
        body: subject,
        type: "ticket_unassigned",
        link,
      });
    }
    if (notes.length > 0) {
      await supabase.from("notifications").insert(notes);
    }
  }

  revalidatePath("/admin/suporte");
  revalidatePath(`/portal/suporte/${id}`);
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
  const ticketUpdate: { status: "fechado" | "reaberto"; resolved_at?: string | null } = { status: newStatus };
  if (newStatus === "reaberto") ticketUpdate.resolved_at = null; // resolução volta a correr
  const { error: updErr } = await service.from("tickets").update(ticketUpdate).eq("id", ticketId);
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

// Cliente envia avaliação NPS/CSAT após fechar chamado.
// Salva como ticket_message com sender_role "cliente" para não exigir schema change.
export async function submitTicketNps(ticketId: string, rating: number, comment: string) {
  const userId  = await requireAuth();
  const supabase = await createClient();

  // Valida que o chamado pertence ao cliente
  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, status, client_id")
    .eq("id", ticketId)
    .eq("client_id", userId)
    .single();

  if (!ticket) return { error: "Chamado não encontrado." };
  if (!["resolvido", "fechado"].includes(ticket.status)) {
    return { error: "Não é possível avaliar um chamado que ainda não foi resolvido." };
  }

  const safeRating = Math.min(5, Math.max(1, Math.round(rating)));
  const stars = "⭐".repeat(safeRating);
  const body = `${stars} Avaliação: ${safeRating}/5${comment ? ` — ${comment.trim().slice(0, 1000)}` : ""}`;

  const { error } = await supabase.from("ticket_messages").insert({
    ticket_id:   ticketId,
    sender_id:   userId,
    sender_role: "cliente" as const,
    body,
    attachments: [],
  });

  if (error) return { error: "Erro ao registrar avaliação. Tente novamente." };

  revalidatePath(`/portal/suporte/${ticketId}`);
  revalidatePath(`/portal/suporte/${ticketId}/avaliar`);
  return { success: true };
}

export async function getTicketDetail(ticketId: string) {
  const userId  = await requireAuth();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", userId)
    .single();

  const isAdmin = profile?.role === "admin";

  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, subject, category, status, priority, client_id, assigned_to, ticket_number, created_at, updated_at, first_response_at, resolved_at, profiles:client_id(name), analyst:assigned_to(name)")
    .eq("id", ticketId)
    .single();

  if (!ticket) return null;
  if (!isAdmin && ticket.client_id !== userId) return null;

  const { data: messages } = await supabase
    .from("ticket_messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  const clientName = isAdmin
    ? ((ticket.profiles as { name?: string } | null)?.name ?? "Cliente")
    : (profile?.name ?? "");

  const analystName = (ticket.analyst as { name?: string } | null)?.name ?? null;

  // Participantes da conversa: nome + avatar (mesma foto do perfil) por sender.
  // Via service client porque a RLS de profiles não expõe a equipe ao cliente.
  const participants: Record<string, { name: string; avatarUrl: string | null }> = {};
  const senderIds = Array.from(new Set((messages ?? []).map((m) => m.sender_id).filter(Boolean)));
  if (senderIds.length > 0) {
    const service = createServiceClient();
    const { data: profs } = await service
      .from("profiles")
      .select("id, name, avatar_url")
      .in("id", senderIds);
    (profs ?? []).forEach((p) => {
      participants[p.id] = { name: p.name ?? "Usuário", avatarUrl: (p as { avatar_url?: string | null }).avatar_url ?? null };
    });
    // Fallback: foto vinda do OAuth (Google) no metadata do auth.users.
    for (const id of senderIds) {
      if (!participants[id]) participants[id] = { name: "Usuário", avatarUrl: null };
      if (!participants[id].avatarUrl) {
        const { data } = await service.auth.admin.getUserById(id);
        const meta = data?.user?.user_metadata as { avatar_url?: string; picture?: string } | undefined;
        const url = meta?.avatar_url ?? meta?.picture ?? null;
        if (url) participants[id].avatarUrl = url;
      }
    }
  }

  return {
    ticket: {
      ...ticket,
      ticket_number: (ticket as Record<string, unknown>).ticket_number as number | undefined,
      client_name: clientName,
      analyst_name: analystName,
    },
    messages: messages ?? [],
    participants,
    currentUserId:   userId,
    currentUserName: profile?.name ?? "",
    isAdmin,
    senderRole: (isAdmin ? "admin" : "cliente") as "admin" | "cliente",
  };
}
