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

  const isAdmin = profile?.role === "admin";

  let ticketQuery = supabase
    .from("tickets")
    .select("*")
    .eq("id", ticketId);

  // Cliente só pode ver os próprios tickets; admin pode ver qualquer um
  if (!isAdmin) {
    ticketQuery = ticketQuery.eq("client_id", user!.id);
  }

  const [ticketResult, messagesResult] = await Promise.all([
    ticketQuery.single(),
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
    <div className="ticket-detail-root" style={{ padding: "36px 32px", maxWidth: 800, margin: "0 auto" }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: "12px" }}>
        <Link
          href="/portal/suporte"
          style={{
            color: "var(--text-faint)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 10px 5px 8px",
            borderRadius: 8,
            border: "1px solid var(--card-border)",
            background: "var(--card-bg)",
            fontWeight: 600,
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-hover)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--card-border)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-faint)"; }}
        >
          <i className="ti ti-arrow-left" style={{ fontSize: 13 }} />
          Suporte
        </Link>
        <i className="ti ti-chevron-right" style={{ color: "var(--text-faint)", fontSize: 12 }} />
        <span className="breadcrumb-title" style={{ color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 360 }}>
          {ticket.subject}
        </span>
      </div>

      {/* Header do ticket */}
      <div
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          borderLeft: `3px solid ${priorityInfo.color}`,
          borderRadius: 16,
          padding: "22px 24px",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <h1 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "var(--text)", letterSpacing: "-0.01em", flex: 1 }}>
            {ticket.subject}
          </h1>
          <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
            <span style={{
              fontSize: "11px", fontWeight: 700, padding: "4px 11px", borderRadius: 999,
              background: `${statusInfo.color}15`, color: statusInfo.color,
              border: `1px solid ${statusInfo.color}28`,
              display: "inline-flex", alignItems: "center", gap: 5,
            }}>
              <i className={`ti ${statusInfo.icon}`} style={{ fontSize: 10 }} />
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="ticket-meta-grid" style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <MetaItem icon="ti-tag" label="Categoria" value={ticket.category} />
          <MetaItem icon="ti-flag" label="Prioridade" value={priorityInfo.label} color={priorityInfo.color} />
          <MetaItem icon="ti-calendar" label="Aberto em" value={new Date(ticket.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })} />
          <MetaItem icon="ti-refresh" label="Atualizado" value={new Date(ticket.updatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} />
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

function MetaItem({ icon, label, value, color }: { icon: string; label: string; value: string; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <i className={`ti ${icon}`} style={{ fontSize: 13, color: "var(--text-faint)", flexShrink: 0 }} />
      <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>{label}:</span>
      <span style={{ fontSize: "12px", fontWeight: 700, color: color ?? "var(--text-muted)" }}>{value}</span>
    </div>
  );
}
