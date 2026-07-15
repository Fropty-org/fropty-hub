import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTicketDetail } from "@/app/actions/suporte";
import { AdminTicketActions } from "@/app/components/suporte/AdminTicketActions";
import { TicketWorkspace } from "@/app/components/suporte/TicketWorkspace";
import { ReviewBanner } from "@/app/components/suporte/ReviewBanner";
import { ArrowLeft, ChevronRight } from "lucide-react";

export const metadata: Metadata = { title: "Chamado" };

interface Props { params: Promise<{ ticketId: string }> }

export default async function TicketDetailPage({ params }: Props) {
  const { ticketId } = await params;
  const detail = await getTicketDetail(ticketId);
  if (!detail) notFound();

  const { ticket, messages, participants, currentUserId, currentUserName, isAdmin, senderRole } = detail;

  const ticketNum = ticket.ticket_number ? `UFT${String(ticket.ticket_number).padStart(4, "0")}` : null;

  return (
    <div className="hub-page">

      {/* ── Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: "12px" }}>
        <Link
          href="/portal/suporte"
          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px 5px 8px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-faint)", textDecoration: "none", fontWeight: 600 }}
        >
          <ArrowLeft size={13} /> Service Desk
        </Link>
        <ChevronRight size={12} style={{ color: "var(--text-faint)" }} />
        <span style={{ color: "var(--text-muted)" }}>{ticketNum ?? "Chamado"}</span>
      </div>

      {/* ── Banner "Avaliar solução" (cliente + status resolvido) ── */}
      {!isAdmin && ticket.status === "resolvido" && <ReviewBanner ticketId={ticketId} />}

      {/* ── Ações de admin (status/prioridade) ── */}
      {isAdmin && (
        <div style={{ marginBottom: 20 }}>
          <AdminTicketActions
            ticketId={ticketId}
            currentStatus={ticket.status as "aberto" | "em_andamento" | "resolvido" | "fechado" | "reaberto"}
            currentPriority={ticket.priority as "baixa" | "media" | "alta"}
          />
        </div>
      )}

      {/* ── Workspace (abas + Detalhes + Ações adicionadas) ── */}
      <TicketWorkspace
        ticket={{
          id: ticket.id,
          subject: ticket.subject,
          category: ticket.category,
          status: ticket.status as "aberto" | "em_andamento" | "resolvido" | "fechado" | "reaberto",
          priority: ticket.priority as "baixa" | "media" | "alta",
          ticket_number: ticket.ticket_number,
          created_at: ticket.created_at,
          first_response_at: (ticket as Record<string, unknown>).first_response_at as string | null ?? null,
          resolved_at: (ticket as Record<string, unknown>).resolved_at as string | null ?? null,
          client_name: ticket.client_name,
          analyst_name: (ticket as Record<string, unknown>).analyst_name as string | null ?? null,
        }}
        messages={messages}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        isAdmin={isAdmin}
        senderRole={senderRole}
        ticketNum={ticketNum}
        participants={participants}
      />
    </div>
  );
}
