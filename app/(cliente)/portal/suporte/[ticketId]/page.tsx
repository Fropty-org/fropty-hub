import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTicketDetail } from "@/app/actions/suporte";
import { TicketConversation } from "@/app/components/suporte/TicketConversation";
import { AdminTicketActions } from "@/app/components/suporte/AdminTicketActions";
import { TICKET_STATUS_MAP, TICKET_PRIORITY_MAP } from "@/app/lib/constants/status";
import { ArrowLeft, ChevronRight, Clock } from "lucide-react";

export const metadata: Metadata = { title: "Chamado" };

interface Props { params: Promise<{ ticketId: string }> }

function fDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function TicketDetailPage({ params }: Props) {
  const { ticketId } = await params;
  const detail = await getTicketDetail(ticketId);
  if (!detail) notFound();

  const { ticket, messages, currentUserId, currentUserName, isAdmin, senderRole } = detail;

  const statusInfo   = TICKET_STATUS_MAP[ticket.status as keyof typeof TICKET_STATUS_MAP];
  const priorityInfo = TICKET_PRIORITY_MAP[ticket.priority as keyof typeof TICKET_PRIORITY_MAP];
  const ticketNum    = ticket.ticket_number ? `UFT${String(ticket.ticket_number).padStart(4, "0")}` : null;

  return (
    <div style={{ padding: "36px 32px", maxWidth: 820, margin: "0 auto" }}>

      {/* ── Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: "12px" }}>
        <Link
          href="/portal/suporte"
          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px 5px 8px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-faint)", textDecoration: "none", fontWeight: 600 }}
        >
          <ArrowLeft size={13} /> Suporte
        </Link>
        <ChevronRight size={12} style={{ color: "var(--text-faint)" }} />
        <span style={{ color: "var(--text-muted)" }}>{ticketNum ?? "Chamado"}</span>
      </div>

      {/* ── Header card ── */}
      <div className="hub-card" style={{ padding: "22px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              {ticketNum && (
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "2px 8px" }}>
                  {ticketNum}
                </span>
              )}
              {statusInfo && (
                <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "var(--r-full)", color: statusInfo.color, background: `${statusInfo.color}15`, border: `1px solid ${statusInfo.color}28` }}>
                  {statusInfo.label}
                </span>
              )}
              {priorityInfo && (
                <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "var(--r-full)", color: priorityInfo.color, background: `${priorityInfo.color}12`, border: `1px solid ${priorityInfo.color}22` }}>
                  {priorityInfo.label}
                </span>
              )}
            </div>
            <h1 style={{ margin: "0 0 6px", fontSize: "1.15rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
              {ticket.subject}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>{ticket.category}</span>
              {isAdmin && ticket.client_name && (
                <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>
                  Cliente: <strong style={{ color: "var(--text-muted)" }}>{ticket.client_name}</strong>
                </span>
              )}
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "12px", color: "var(--text-faint)" }}>
                <Clock size={11} /> Aberto em {fDate(ticket.created_at)}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Admin actions ── */}
      {isAdmin && (
        <div style={{ marginBottom: 20 }}>
          <AdminTicketActions
            ticketId={ticketId}
            currentStatus={ticket.status as "aberto" | "em_andamento" | "resolvido" | "fechado" | "reaberto"}
            currentPriority={ticket.priority as "baixa" | "media" | "alta"}
          />
        </div>
      )}

      {/* ── Conversa ── */}
      <TicketConversation
        ticketId={ticketId}
        initialMessages={messages}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        ticketStatus={ticket.status as "aberto" | "em_andamento" | "resolvido" | "fechado" | "reaberto"}
        senderRole={senderRole}
      />
    </div>
  );
}
