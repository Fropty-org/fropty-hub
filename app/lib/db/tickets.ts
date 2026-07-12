import { createServiceClient } from "@/app/lib/supabase/service";

type TicketPriority = "baixa" | "media" | "alta";

interface CreateTicketInput {
  clientId:    string;
  subject:     string;
  category:    string;
  body:        string;
  priority?:   TicketPriority;
  senderId:    string;
  senderRole:  "cliente" | "admin";
  attachments?: string[];
  // Mantido por compatibilidade de chamada; hoje a criação é SEMPRE via service
  // role (ver nota abaixo). Não altera o comportamento.
  useService?: boolean;
}

// A criação de chamado passa SEMPRE pelo service client (bypassa RLS). A tabela
// `tickets` não tem mais policy de INSERT para o cliente (migration 0045): abrir
// chamado direto no PostgREST pulava o débito de token da server action. Com o
// insert restrito ao servidor, o único caminho é a server action, que valida
// saldo e debita o token. O `client_id` é sempre definido no servidor a partir
// do usuário autenticado (ou do alvo validado, no fluxo admin-em-nome-de).
export async function dbCreateTicket(input: CreateTicketInput) {
  const supabase = createServiceClient();

  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .insert({
      client_id:  input.clientId,
      subject:    input.subject,
      category:   input.category,
      status:     "aberto" as const,
      priority:   (input.priority ?? "media") as TicketPriority,
    })
    .select("id, ticket_number")
    .single();

  if (ticketError || !ticket) return { error: ticketError?.message ?? "Erro ao criar ticket" };

  const { error: msgError } = await supabase
    .from("ticket_messages")
    .insert({
      ticket_id:   ticket.id,
      sender_id:   input.senderId,
      sender_role: input.senderRole,
      body:        input.body,
      ...(input.attachments?.length ? { attachments: input.attachments } : {}),
    });

  if (msgError) console.error("[db/tickets] create message error:", msgError.message);

  return { ticketId: ticket.id, ticketNumber: ticket.ticket_number as number | undefined };
}
