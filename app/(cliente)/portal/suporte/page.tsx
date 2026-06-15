import type { Metadata } from "next";
import { createClient } from "@/app/lib/supabase/server";
import { SuporteClient } from "@/app/components/suporte/SuporteClient";
import type { Ticket, TicketStatus, TicketPriority } from "@/app/lib/types/cliente";
import type { Database } from "@/app/lib/supabase/types";

type TicketRow    = Database["public"]["Tables"]["tickets"]["Row"];
type ProjectRow   = Database["public"]["Tables"]["projects"]["Row"];

export const metadata: Metadata = { title: "Suporte" };

export default async function SuportePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [ticketsResult, projectsResult] = await Promise.all([
    supabase
      .from("tickets")
      .select("*")
      .eq("client_id", user!.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("projects")
      .select("id, name")
      .eq("client_id", user!.id)
      .order("created_at", { ascending: false }),
  ]);

  if (ticketsResult.error)  console.error("[portal/suporte] tickets:", ticketsResult.error.message);
  if (projectsResult.error) console.error("[portal/suporte] projects:", projectsResult.error.message);

  const tickets: Ticket[] = ((ticketsResult.data ?? []) as TicketRow[]).map((t) => ({
    id:        t.id,
    subject:   t.subject,
    category:  t.category,
    status:    t.status as TicketStatus,
    priority:  t.priority as TicketPriority,
    projectId: t.project_id ?? undefined,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }));

  const projects = ((projectsResult.data ?? []) as Pick<ProjectRow, "id" | "name">[]).map((p) => ({
    id:   p.id,
    name: p.name,
  }));

  return <SuporteClient tickets={tickets} projects={projects} />;
}
