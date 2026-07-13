import type { Metadata } from "next";
import { createClient } from "@/app/lib/supabase/server";
import { AdminSuporteQueue, type QueueTicket } from "@/app/components/admin/AdminSuporteQueue";
import type { Database } from "@/app/lib/supabase/types";

type TicketRow = Database["public"]["Tables"]["tickets"]["Row"];

export const metadata: Metadata = { title: "Service Desk" };

export default async function AdminSuportePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [ticketsResult, clientsResult, analystsResult] = await Promise.all([
    supabase
      .from("tickets")
      .select("id, subject, category, status, priority, client_id, assigned_to, ticket_number, created_at, first_response_at, resolved_at, updated_at")
      .order("updated_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, name")
      .eq("role", "cliente")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("profiles")
      .select("id, name")
      .eq("role", "admin")
      .eq("is_active", true)
      .order("name"),
  ]);

  if (ticketsResult.error) console.error("[admin/suporte] tickets:", ticketsResult.error.message);
  if (clientsResult.error) console.error("[admin/suporte] clients:", clientsResult.error.message);
  if (analystsResult.error) console.error("[admin/suporte] analysts:", analystsResult.error.message);

  const clientMap = new Map((clientsResult.data ?? []).map((c) => [c.id, c.name ?? c.id]));
  const analysts = (analystsResult.data ?? []).map((a) => ({ id: a.id, name: a.name ?? a.id }));
  const analystMap = new Map(analysts.map((a) => [a.id, a.name]));

  const tickets: QueueTicket[] = ((ticketsResult.data ?? []) as TicketRow[]).map((t) => ({
    id:              t.id,
    ticketNumber:    t.ticket_number,
    subject:         t.subject,
    category:        t.category,
    status:          t.status,
    priority:        t.priority,
    clientId:        t.client_id,
    clientName:      clientMap.get(t.client_id) ?? "—",
    assignedTo:      t.assigned_to,
    assigneeName:    t.assigned_to ? (analystMap.get(t.assigned_to) ?? "—") : "",
    createdAt:       t.created_at,
    firstResponseAt: t.first_response_at,
    resolvedAt:      t.resolved_at,
    updatedAt:       t.updated_at,
  }));

  const clients = (clientsResult.data ?? []).map((c) => ({ id: c.id, name: c.name ?? c.id }));

  return (
    <AdminSuporteQueue
      tickets={tickets}
      clients={clients}
      analysts={analysts}
      currentUserId={user?.id ?? ""}
    />
  );
}
