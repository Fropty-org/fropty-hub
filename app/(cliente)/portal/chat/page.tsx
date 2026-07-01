import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { getProfile } from "@/app/lib/auth/session";
import { Send, Search, Edit, MessageCircle } from "lucide-react";
import { TICKET_STATUS_MAP } from "@/app/lib/constants/status";

export const metadata: Metadata = { title: "Chat" };

// Derivados da fonte canônica de status de chamado (status.ts) — cobre todos
// os status reais (inclui "reaberto") e mantém rótulos/cores consistentes.
const STATUS_DOT: Record<string, string> = Object.fromEntries(
  Object.entries(TICKET_STATUS_MAP).map(([k, v]) => [k, v.color]),
);
const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(TICKET_STATUS_MAP).map(([k, v]) => [k, v.label]),
);

export default async function ChatPage() {
  const supabase = await createClient();
  const profile  = await getProfile();

  const { data: tickets } = await supabase
    .from("tickets")
    .select("id, subject, status, category, updated_at, created_at")
    .eq("client_id", profile?.id ?? "")
    .order("updated_at", { ascending: false })
    .limit(30);

  // Fetch messages from the most recent ticket for preview
  const firstTicket = tickets?.[0];
  const { data: messages } = firstTicket ? await supabase
    .from("ticket_messages")
    .select("id, body, sender_role, created_at")
    .eq("ticket_id", firstTicket.id)
    .order("created_at", { ascending: true })
    .limit(20) : { data: [] };

  const userName  = profile?.name ?? "Você";
  const userInit  = (userName[0] ?? "U").toUpperCase();

  return (
    <div style={{ display: "flex", height: "calc(100vh - 48px)", overflow: "hidden", gap: 0 }}>

      {/* ── Left: conversation list ── */}
      <div style={{
        width: 320, flexShrink: 0,
        display: "flex", flexDirection: "column",
        background: "var(--card-bg)", borderRight: "1px solid var(--border)",
      }}>
        {/* Header */}
        <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--text)" }}>Inbox</span>
            <Link href="/portal/suporte/novo" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 28, height: 28, borderRadius: 8,
              background: "var(--surface-2)", border: "1px solid var(--border)",
              color: "var(--text-muted)", textDecoration: "none",
            }}>
              <Edit size={13} />
            </Link>
          </div>

          {/* Clareza Chat × Suporte */}
          <p style={{ margin: "0 0 10px", fontSize: "11.5px", color: "var(--text-faint)", lineHeight: 1.45 }}>
            Conversas dos seus chamados. Para abrir uma nova solicitação, use o{" "}
            <Link href="/portal/suporte/novo" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>Suporte</Link>.
          </p>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)", pointerEvents: "none" }} />
            <input placeholder="Buscar…" style={{
              width: "100%", boxSizing: "border-box",
              padding: "7px 10px 7px 30px", borderRadius: 8,
              border: "1px solid var(--border)", background: "var(--surface)",
              color: "var(--text)", fontSize: "12px", fontFamily: "inherit", outline: "none",
            }} />
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginTop: 10 }}>
            {["Todos", "Menções", "Arquivados"].map((tab, i) => (
              <button key={tab} style={{
                flex: 1, padding: "5px 0", background: "none", cursor: "pointer",
                border: "none", borderBottom: i === 0 ? "2px solid var(--primary)" : "2px solid transparent",
                fontSize: "12px", fontWeight: i === 0 ? 700 : 500,
                color: i === 0 ? "var(--text)" : "var(--text-faint)", fontFamily: "inherit",
              }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {(!tickets || tickets.length === 0) ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <MessageCircle size={32} style={{ color: "var(--text-faint)", opacity: 0.35, display: "block", margin: "0 auto 10px" }} />
              <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-faint)" }}>Nenhuma conversa.<br />Abra um chamado para começar.</p>
            </div>
          ) : tickets.map((t, i) => {
            const dot  = STATUS_DOT[t.status]   ?? "#64748b";
            const isFirst = i === 0;
            const date = t.updated_at
              ? (() => {
                  const d = new Date(t.updated_at);
                  const now = new Date();
                  const diffH = (now.getTime() - d.getTime()) / 3600000;
                  if (diffH < 1)    return `${Math.floor(diffH * 60)}min`;
                  if (diffH < 24)   return `${Math.floor(diffH)}h`;
                  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
                })()
              : "";

            return (
              <Link
                key={t.id}
                href={`/portal/suporte/${t.id}`}
                style={{
                  display: "flex", gap: 10, padding: "12px 14px",
                  borderBottom: "1px solid var(--border)", textDecoration: "none",
                  color: "inherit", transition: "background 0.1s",
                  background: isFirst ? "rgba(99,102,241,0.06)" : "transparent",
                  borderLeft: isFirst ? "3px solid var(--primary)" : "3px solid transparent",
                }}
              >
                {/* Avatar Fropty */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: 800, color: "#fff",
                  }}>
                    F
                  </div>
                  <span style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: 10, height: 10, borderRadius: "50%",
                    background: dot, border: "2px solid var(--card-bg)",
                  }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      Fropty Hub
                    </span>
                    <span style={{ fontSize: "10.5px", color: "var(--text-faint)", flexShrink: 0 }}>{date}</span>
                  </div>
                  <p style={{ margin: "0 0 3px", fontSize: "12px", fontWeight: isFirst ? 700 : 400, color: isFirst ? "var(--text)" : "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.subject}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "10.5px", color: "var(--text-faint)" }}>{t.category ?? ""}</span>
                    {isFirst && (
                      <span style={{
                        fontSize: "10px", fontWeight: 800, minWidth: 18, height: 18,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        borderRadius: 999, background: "var(--primary)", color: "#fff",
                        padding: "0 5px",
                      }}>
                        {(messages?.length ?? 0) > 0 ? messages!.length : 1}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Right: conversation view ── */}
      {firstTicket ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg)", minWidth: 0 }}>
          {/* Chat header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 20px", background: "var(--card-bg)", borderBottom: "1px solid var(--border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: 800, color: "#fff",
                }}>
                  F
                </div>
                <span style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "2px solid var(--card-bg)" }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 700, color: "var(--text)" }}>Fropty Hub</p>
                <p style={{ margin: 0, fontSize: "11.5px", color: "#22c55e", fontWeight: 600 }}>Online</p>
              </div>
            </div>
            <Link href={`/portal/suporte/${firstTicket.id}`} style={{
              fontSize: "12px", fontWeight: 600, color: "var(--primary)",
              textDecoration: "none", padding: "6px 12px", borderRadius: 8,
              border: "1px solid var(--primary)", background: "rgba(99,102,241,0.06)",
            }}>
              Ver chamado completo →
            </Link>
          </div>

          {/* Subject bar */}
          <div style={{ padding: "10px 20px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{firstTicket.subject}</span>
            <span style={{
              fontSize: "10.5px", fontWeight: 700, padding: "2px 9px", borderRadius: 999,
              background: `${STATUS_DOT[firstTicket.status]}20`, color: STATUS_DOT[firstTicket.status],
              border: `1px solid ${STATUS_DOT[firstTicket.status]}30`,
            }}>
              {STATUS_LABEL[firstTicket.status] ?? firstTicket.status}
            </span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Date divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: "11px", color: "var(--text-faint)", whiteSpace: "nowrap" }}>
                {new Date(firstTicket.created_at ?? "").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            {(!messages || messages.length === 0) ? (
              <p style={{ textAlign: "center", color: "var(--text-faint)", fontSize: "12.5px" }}>Nenhuma mensagem ainda.</p>
            ) : messages.map(msg => {
              const isClient = msg.sender_role === "cliente";
              const time = msg.created_at
                ? new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                : "";
              return (
                <div key={msg.id} style={{ display: "flex", gap: 10, flexDirection: isClient ? "row-reverse" : "row", alignItems: "flex-end" }}>
                  {/* Avatar */}
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    background: isClient ? "var(--surface-2)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    border: isClient ? "1px solid var(--border)" : "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: 800,
                    color: isClient ? "var(--text)" : "#fff",
                  }}>
                    {isClient ? userInit : "F"}
                  </div>
                  <div style={{ maxWidth: "65%", display: "flex", flexDirection: "column", alignItems: isClient ? "flex-end" : "flex-start", gap: 2 }}>
                    <div style={{
                      padding: "10px 14px", borderRadius: isClient ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                      background: isClient ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "var(--card-bg)",
                      border: isClient ? "none" : "1px solid var(--border)",
                      color: isClient ? "#fff" : "var(--text)",
                      fontSize: "13px", lineHeight: 1.5,
                    }}>
                      {msg.body}
                    </div>
                    <span style={{ fontSize: "10.5px", color: "var(--text-faint)" }}>{time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input area */}
          <div style={{
            padding: "12px 20px", borderTop: "1px solid var(--border)",
            background: "var(--card-bg)", display: "flex", alignItems: "center", gap: 10,
          }}>
            <input
              placeholder={`Responder ao chamado...`}
              disabled
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 10,
                border: "1px solid var(--border)", background: "var(--surface)",
                color: "var(--text)", fontSize: "13px", fontFamily: "inherit", outline: "none",
                cursor: "not-allowed", opacity: 0.7,
              }}
            />
            <Link href={`/portal/suporte/${firstTicket.id}`} style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 40, height: 40, borderRadius: "50%",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff", textDecoration: "none", flexShrink: 0,
            }}>
              <Send size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "var(--bg)" }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1))",
            border: "1px solid rgba(99,102,241,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <MessageCircle size={26} style={{ color: "var(--primary)" }} />
          </div>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>Selecione uma conversa</p>
          <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-faint)", textAlign: "center", maxWidth: 260 }}>
            Escolha um chamado à esquerda para ver a conversa.
          </p>
          <Link href="/portal/suporte/novo" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 18px", borderRadius: 9, textDecoration: "none",
            border: "1.5px solid var(--primary)", color: "var(--primary)",
            fontSize: "12.5px", fontWeight: 700, background: "rgba(99,102,241,0.06)",
          }}>
            <Send size={13} /> Novo chamado
          </Link>
        </div>
      )}
    </div>
  );
}
