import { createClient } from "@/app/lib/supabase/server";

export async function dbSendMessage({
  ticketId,
  senderId,
  senderRole,
  body,
}: {
  ticketId:   string;
  senderId:   string;
  senderRole: "cliente" | "dev" | "admin";
  body:       string;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("ticket_messages")
    .insert({ ticket_id: ticketId, sender_id: senderId, sender_role: senderRole, body });

  return { error: error?.message ?? null };
}

export async function dbGetTicketMessages(ticketId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ticket_messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  return { data: data ?? [], error: error?.message ?? null };
}
