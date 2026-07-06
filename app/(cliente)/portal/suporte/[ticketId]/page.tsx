import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTicketDetail } from "@/app/actions/suporte";
import { getArticles } from "@/app/actions/knowledge";
import { TicketConversation } from "@/app/components/suporte/TicketConversation";
import { AdminTicketActions } from "@/app/components/suporte/AdminTicketActions";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { ArrowLeft, BookOpen, ChevronRight, Clock, ClipboardCheck } from "lucide-react";
import { SlaBars } from "@/app/components/suporte/SlaBars";

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

  const relatedArticles = !isAdmin
    ? await getArticles(ticket.category).then((arts) => arts.slice(0, 3))
    : [];

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
              <StatusBadge kind="ticket" status={ticket.status} />
              <StatusBadge kind="ticket-priority" status={ticket.priority} />
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

      {/* ── SLA bars (todos os usuários) ── */}
      <SlaBars
        priority={ticket.priority as "baixa" | "media" | "alta"}
        createdAt={ticket.created_at}
        firstResponseAt={(ticket as Record<string, unknown>).first_response_at as string | null ?? null}
        resolvedAt={(ticket as Record<string, unknown>).resolved_at as string | null ?? null}
        status={ticket.status}
      />

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

      {/* ── Artigos relacionados (cliente only) ── */}
      {!isAdmin && relatedArticles.length > 0 && (
        <div className="hub-card" style={{ padding: "18px 20px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <BookOpen size={14} style={{ color: "var(--primary)" }} />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>Artigos relacionados</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {relatedArticles.map((art) => (
              <Link
                key={art.id}
                href={`/portal/base-conhecimento/${art.slug}`}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface-2)", textDecoration: "none", transition: "background 0.1s" }}
                className="hub-row-link"
              >
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "color-mix(in srgb, var(--primary) 10%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <BookOpen size={13} style={{ color: "var(--primary)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {art.title}
                  </p>
                  {art.excerpt && (
                    <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {art.excerpt}
                    </p>
                  )}
                </div>
                <ChevronRight size={13} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
              </Link>
            ))}
          </div>
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
