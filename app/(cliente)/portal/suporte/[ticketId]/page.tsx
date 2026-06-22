import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { createServiceClient } from "@/app/lib/supabase/service";
import { getProfile } from "@/app/lib/auth/session";
import { TicketConversation } from "@/app/components/suporte/TicketConversation";
import { TicketDetailBack } from "@/app/components/suporte/TicketDetailBack";
import { AdminTicketActions } from "@/app/components/suporte/AdminTicketActions";
import { TICKET_STATUS_MAP, TICKET_PRIORITY_MAP } from "@/app/lib/constants/status";
import type { Ticket, TicketStatus, TicketPriority } from "@/app/lib/types/cliente";
import type { Database } from "@/app/lib/supabase/types";

type TicketRow  = Database["public"]["Tables"]["tickets"]["Row"];
type MessageRow = Database["public"]["Tables"]["ticket_messages"]["Row"];

export const metadata: Metadata = { title: "Chamado" };

interface Props {
  params: Promise<{ ticketId: string }>;
  searchParams: Promise<{ novo?: string }>;
}

export default async function TicketDetailPage({ params, searchParams }: Props) {
  const { ticketId } = await params;
  const { novo } = await searchParams;
  const supabase     = await createClient();
  const profile      = await getProfile();
  const { data: { user } } = await supabase.auth.getUser();

  const isAdmin = profile?.role === "admin";
  const readClient = isAdmin ? createServiceClient() : supabase;

  let ticketQuery = readClient
    .from("tickets")
    .select("*")
    .eq("id", ticketId);

  if (!isAdmin) {
    ticketQuery = ticketQuery.eq("client_id", user!.id);
  }

  const [ticketResult, messagesResult] = await Promise.all([
    ticketQuery.single(),
    readClient
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true }),
  ]);

  if (ticketResult.error || !ticketResult.data) notFound();

  const row = ticketResult.data as TicketRow;

  const ticket: Ticket & { ticketNumber?: number } = {
    id:           row.id,
    subject:      row.subject,
    category:     row.category,
    status:       row.status as TicketStatus,
    priority:     row.priority as TicketPriority,
    createdAt:    row.created_at,
    updatedAt:    row.updated_at,
    ticketNumber: row.ticket_number,
  };

  const messages = (messagesResult.data ?? []) as MessageRow[];

  // Nome do cliente para identificar as mensagens na conversa
  let clientName = profile?.name ?? undefined;
  if (isAdmin) {
    const { data: cp } = await readClient.from("profiles").select("name").eq("id", row.client_id).single();
    clientName = cp?.name ?? undefined;
  }

  const statusInfo   = TICKET_STATUS_MAP[ticket.status]   ?? TICKET_STATUS_MAP["aberto"];
  const priorityInfo = TICKET_PRIORITY_MAP[ticket.priority] ?? TICKET_PRIORITY_MAP["media"];
  const ticketLabel  = ticket.ticketNumber
    ? `UFT${String(ticket.ticketNumber).padStart(4, "0")}`
    : null;

  return (
    <div className="ticket-detail-root" style={{ padding: "36px 32px", maxWidth: 800, margin: "0 auto" }}>

      {/* Breadcrumb */}
      <TicketDetailBack subject={ticket.subject} ticketLabel={ticketLabel} />

      {/* Confirmação de chamado recém-aberto */}
      {!isAdmin && novo && (
        <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, fontSize: "13px", color: "#22c55e", fontWeight: 600 }}>
          <i className="ti ti-circle-check" style={{ fontSize: 18 }} />
          Chamado aberto com sucesso! Nossa equipe responderá em breve.
        </div>
      )}

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
          <div style={{ flex: 1, minWidth: 0 }}>
            {ticketLabel && (
              <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", letterSpacing: "0.05em" }}>{ticketLabel}</p>
            )}
            <h1 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "var(--text)", letterSpacing: "-0.01em" }}>
              {ticket.subject}
            </h1>
          </div>
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

      {/* Ações admin (status, prioridade) */}
      {isAdmin && (
        <AdminTicketActions
          ticketId={ticket.id}
          currentStatus={ticket.status}
          currentPriority={ticket.priority}
        />
      )}

      {/* CTA de validação — cliente precisa avaliar a solução */}
      {!isAdmin && ticket.status === "resolvido" && (
        <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 16, padding: "20px 22px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <i className="ti ti-clipboard-check" style={{ fontSize: 22, color: "#22c55e" }} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: 800, color: "var(--text)" }}>Marcamos como resolvido</p>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>Confirme se a solução atendeu para encerrarmos o chamado.</p>
          </div>
          <Link
            href={`/portal/suporte/${ticket.id}/avaliar`}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 20px", borderRadius: 10, background: "#22c55e", color: "#fff", fontSize: "13px", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}
          >
            <i className="ti ti-clipboard-check" style={{ fontSize: 15 }} /> Avaliar solução
          </Link>
        </div>
      )}

      {/* Conversa com realtime */}
      <TicketConversation
        ticketId={ticket.id}
        initialMessages={messages}
        currentUserId={user!.id}
        currentUserName={profile?.name ?? user!.email ?? "Você"}
        ticketStatus={ticket.status}
        senderRole={isAdmin ? "admin" : "cliente"}
        clientName={clientName}
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
