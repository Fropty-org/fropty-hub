import { createClient } from "@/app/lib/supabase/server";
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
  // Quando true, usa service role (bypassa RLS) — necessário p/ admin abrir em nome de cliente
  useService?: boolean;
}

export async function dbCreateTicket(input: CreateTicketInput) {
  const supabase = input.useService ? createServiceClient() : await createClient();

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
