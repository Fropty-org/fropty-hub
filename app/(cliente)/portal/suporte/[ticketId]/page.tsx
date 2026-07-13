import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTicketDetail } from "@/app/actions/suporte";
import { AdminTicketActions } from "@/app/components/suporte/AdminTicketActions";
import { TicketWorkspace } from "@/app/components/suporte/TicketWorkspace";
import { ArrowLeft, ChevronRight, ClipboardCheck } from "lucide-react";

export const metadata: Metadata = { title: "Chamado" };

interface Props { params: Promise<{ ticketId: string }> }

export default async function TicketDetailPage({ params }: Props) {
  const { ticketId } = await params;
  const detail = await getTicketDetail(ticketId);
  if (!detail) notFound();

  const { ticket, messages, currentUserId, currentUserName, isAdmin, senderRole } = detail;

  const ticketNum = ticket.ticket_number ? `UFT${String(ticket.ticket_number).padStart(4, "0")}` : null;

  return (
    <div className="hub-page" style={{ maxWidth: 1180, margin: "0 auto" }}>

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
      {!isAdmin && ticket.status === "resolvido" && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16, flexWrap: "wrap",
          background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.25)",
          borderRadius: 14, padding: "16px 20px", marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ClipboardCheck size={19} style={{ color: "var(--c-success)" }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>
                Nossa equipe marcou este chamado como resolvido
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                A solução funcionou? Confirme para encerrar ou reabra se precisar de mais ajuda.
              </p>
            </div>
          </div>
          <a
            href={`/portal/suporte/${ticketId}/avaliar`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0,
              background: "var(--c-success)", color: "#fff",
              borderRadius: 10, padding: "9px 18px",
              fontSize: "13px", fontWeight: 700, textDecoration: "none",
              boxShadow: "0 4px 14px rgba(34,197,94,0.3)",
            }}
          >
            <ClipboardCheck size={14} /> Avaliar solução
          </a>
        </div>
      )}

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
      />
    </div>
  );
}
