import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { getProfile } from "@/app/lib/auth/session";
import { TicketConversation } from "@/app/components/suporte/TicketConversation";
import { TICKET_STATUS_MAP, TICKET_PRIORITY_MAP } from "@/app/lib/constants/status";
import type { Ticket, TicketStatus, TicketPriority } from "@/app/lib/types/cliente";
import type { Database } from "@/app/lib/supabase/types";

type TicketRow  = Database["public"]["Tables"]["tickets"]["Row"];
type MessageRow = Database["public"]["Tables"]["ticket_messages"]["Row"];

export const metadata: Metadata = { title: "Chamado" };

interface Props {
  params: Promise<{ ticketId: string }>;
}

export default async function TicketDetailPage({ params }: Props) {
  const { ticketId } = await params;
  const supabase     = await createClient();
  const profile      = await getProfile();
  const { data: { user } } = await supabase.auth.getUser();

  const [ticketResult, messagesResult] = await Promise.all([
    supabase
      .from("tickets")
      .select("*")
      .eq("id", ticketId)
      .eq("client_id", user!.id)
      .single(),
    supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true }),
  ]);

  if (ticketResult.error || !ticketResult.data) notFound();

  const row = ticketResult.data as TicketRow;

  const ticket: Ticket = {
    id:        row.id,
    subject:   row.subject,
    category:  row.category,
    status:    row.status as TicketStatus,
    priority:  row.priority as TicketPriority,
    projectId: row.project_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  const messages = (messagesResult.data ?? []) as MessageRow[];
  const statusInfo   = TICKET_STATUS_MAP[ticket.status];
  const priorityInfo = TICKET_PRIORITY_MAP[ticket.priority];

  return (
    <div style={{ padding: "40px 32px", maxWidth: 780, margin: "0 auto" }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: "13px" }}>
        <Link
          href="/portal/suporte"
          style={{ color: "var(--text-faint)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
        >
          <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
          Suporte
        </Link>
        <span style={{ color: "var(--text-faint)" }}>/</span>
        <span style={{ color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {ticket.subject}
        </span>
      </div>

      {/* Header do ticket */}
      <div
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          borderRadius: 16,
          padding: "24px",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 6px", color: "var(--text)" }}>
              {ticket.subject}
            </h1>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--text-faint)" }}>
              {ticket.category} · Aberto em {new Date(ticket.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <span
              style={{
                fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: 999,
                background: `${statusInfo.color}18`, color: statusInfo.color, border: `1px solid ${statusInfo.color}30`,
                display: "inline-flex", alignItems: "center", gap: 5,
              }}
            >
              <i className={`ti ${statusInfo.icon}`} style={{ fontSize: 11 }} />
              {statusInfo.label}
            </span>
            <span
              style={{
                fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: 999,
                background: `${priorityInfo.color}15`, color: priorityInfo.color, border: `1px solid ${priorityInfo.color}25`,
              }}
            >
              {priorityInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Conversa com realtime */}
      <TicketConversation
        ticketId={ticket.id}
        initialMessages={messages}
        currentUserId={user!.id}
        currentUserName={profile?.name ?? user!.email ?? "Você"}
        ticketStatus={ticket.status}
      />
    </div>
  );
}
