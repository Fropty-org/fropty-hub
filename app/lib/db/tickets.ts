import { createClient } from "@/app/lib/supabase/server";

interface CreateTicketInput {
  clientId:    string;
  projectId:   string | null;
  subject:     string;
  category:    string;
  body:        string;
  attachments?: string[];
}

export async function dbCreateTicket(input: CreateTicketInput) {
  const supabase = await createClient();

  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .insert({
      client_id:  input.clientId,
      project_id: input.projectId,
      subject:    input.subject,
      category:   input.category,
      status:     "aberto"  as const,
      priority:   "media"   as const,
    })
    .select("id")
    .single();

  if (ticketError || !ticket) return { error: ticketError?.message ?? "Erro ao criar ticket" };

  const { error: msgError } = await supabase
    .from("ticket_messages")
    .insert({
      ticket_id:   ticket.id,
      sender_id:   input.clientId,
      sender_role: "cliente" as const,
      body:        input.body,
      ...(input.attachments?.length ? { attachments: input.attachments } : {}),
    });

  if (msgError) console.error("[db/tickets] create message error:", msgError.message);

  return { ticketId: ticket.id };
}
