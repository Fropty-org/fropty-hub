"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { TICKET_STATUS_MAP, TICKET_PRIORITY_MAP } from "@/app/lib/constants/status";
import type { Ticket } from "@/app/lib/types/cliente";
import { Coins, Headphones, Plus, Search, X, Circle, CheckCircle, Smile, History, ChevronRight, Ticket as TicketIcon, AlertTriangle, LucideIcon } from "lucide-react";

type FilterMode = "todos" | "abertos" | "fechados";

interface Props {
  tickets:      Ticket[];
  isAdmin?:     boolean;
  clients?:     { id: string; name: string }[];
  tokenBalance?: number;
}

function NoTokenModal({ onClose }: { onClose: () => void }) {
  // Renderiza em portal no body para escapar do overflow/transform do layout
  // do portal (PullToRefresh aplica transform, prendendo o position:fixed).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(4,3,22,0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2000, padding: 24,
        animation: "fadeIn 0.15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 20, padding: "36px 32px", maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,0.45)" }}
      >
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(239,159,39,0.1)", border: "1px solid rgba(239,159,39,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <Coins size={24} style={{ color: "#EF9F27" }} />
        </div>
        <h3 style={{ margin: "0 0 10px", fontSize: "1.1rem", fontWeight: 800, color: "var(--text)" }}>
          Tokens insuficientes
        </h3>
        <p style={{ margin: "0 0 24px", fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.65 }}>
          Você precisa de tokens para abrir chamados de suporte. Adquira tokens ou um plano para continuar.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Link
            href="/portal/financeiro"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", background: "#EF9F27", color: "#fff", fontWeight: 700, fontSize: "13px", borderRadius: 10, textDecoration: "none" }}
          >
            <Coins size={13} /> Ver tokens
          </Link>
          <button
            onClick={onClose}
            style={{ padding: "10px 18px", background: "var(--surface)", color: "var(--text-muted)", fontWeight: 600, fontSize: "13px", borderRadius: 10, border: "1px solid var(--border)", cursor: "pointer", fontFamily: "inherit" }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function SuporteClient({ tickets, isAdmin, tokenBalance = 0 }: Props) {
  const [search,       setSearch]       = useState("");
  const [filter,       setFilter]       = useState<FilterMode>("todos");
  const [showNoToken,  setShowNoToken]  = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tickets.filter((t) => {
      const matchSearch = !q || t.subject.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      const isOpen      = t.status !== "fechado";
      const matchFilter =
        filter === "todos"   ? true :
        filter === "abertos" ? isOpen :
        !isOpen;
      return matchSearch && matchFilter;
    });
  }, [tickets, search, filter]);

  const openTickets   = filtered.filter((t) => t.status !== "fechado");
  const closedTickets = filtered.filter((t) => t.status === "fechado");

  const totalOpen     = tickets.filter((t) => t.status !== "fechado").length;
  const totalResolved = tickets.filter((t) => t.status === "fechado").length;
  const totalHigh     = tickets.filter((t) => t.priority === "alta" && t.status !== "fechado").length;

  return (
    <div className="suporte-root" style={{ padding: "36px 32px", maxWidth: 940, margin: "0 auto" }}>
    <style>{`
      @media (max-width: 640px) {
        .suporte-root { padding: 16px 14px !important; }
        .suporte-header-row { flex-direction: column !important; align-items: flex-start !important; }
        .suporte-stats { grid-template-columns: 1fr 1fr !important; }
        .suporte-filter-row { flex-direction: column !important; }
        .suporte-filter-buttons { width: 100% !important; justify-content: stretch !important; }
        .suporte-filter-buttons button { flex: 1 !important; }
        .suporte-ticket-badges { display: none !important; }
        .suporte-ticket-date { display: none !important; }
        .ticket-meta-grid { flex-direction: column !important; gap: 8px !important; }
        .ticket-detail-root { padding: 16px 14px !important; }
        .breadcrumb-title { display: none !important; }
      }
    `}</style>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        className="dot-bg animate-fade-up"
        style={{
          borderRadius: 20,
          border: "1px solid var(--card-border)",
          background: "var(--card-bg)",
          padding: "28px 28px 24px",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Gradient glow top-right */}
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 220, height: 220,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(91,87,232,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="suporte-header-row" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <span className="section-chip" style={{ marginBottom: 12 }}>
              <Headphones size={11} />
              Service Desk
            </span>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)", letterSpacing: "-0.02em" }}>
              Suporte
            </h1>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>
              {isAdmin
                ? "Todos os chamados · Abra em nome de um cliente quando necessário"
                : "Abra chamados e acompanhe suas solicitações em tempo real"}
            </p>
          </div>
          {!isAdmin && tokenBalance <= 0 ? (
            <button
              onClick={() => setShowNoToken(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                padding: "10px 18px",
                borderRadius: 10,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: "inherit",
                flexShrink: 0,
                boxShadow: "0 4px 16px rgba(91,87,232,0.35)",
                transition: "opacity 0.15s, transform 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <Plus size={15} /> Novo chamado
            </button>
          ) : (
            <Link
              href="/portal/suporte/novo"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                padding: "10px 18px",
                borderRadius: 10,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: "inherit",
                flexShrink: 0,
                textDecoration: "none",
                boxShadow: "0 4px 16px rgba(91,87,232,0.35)",
                transition: "opacity 0.15s, transform 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <Plus size={15} /> Novo chamado
            </Link>
          )}
          {showNoToken && <NoTokenModal onClose={() => setShowNoToken(false)} />}
        </div>

        {/* Stats row */}
        <div className="suporte-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 24 }}>
          <StatCard
            label="Total de chamados"
            value={tickets.length}
            Icon={TicketIcon}
            color="var(--primary)"
          />
          <StatCard
            label="Em aberto"
            value={totalOpen}
            Icon={Circle}
            color="#3b82f6"
          />
          {totalHigh > 0 ? (
            <StatCard
              label="Alta prioridade"
              value={totalHigh}
              Icon={AlertTriangle}
              color="#ef4444"
            />
          ) : (
            <StatCard
              label="Resolvidos"
              value={totalResolved}
              Icon={CheckCircle}
              color="#22c55e"
            />
          )}
        </div>
      </div>

      {/* ── Busca + filtros ─────────────────────────────────────── */}
      <div className="suporte-filter-row" style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
        <div
          style={{
            flex: 1,
            minWidth: 200,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: 10,
            padding: "8px 14px",
            transition: "border-color 0.15s",
          }}
          onFocusCapture={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-hover)"; }}
          onBlurCapture={(e)  => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--card-border)"; }}
        >
          <Search size={15} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por assunto ou categoria…"
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--text)",
              fontSize: "13px",
              fontFamily: "inherit",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", padding: 0, display: "flex", fontFamily: "inherit" }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="suporte-filter-buttons" style={{ display: "flex", gap: 6 }}>
          {(["todos", "abertos", "fechados"] as FilterMode[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: "1px solid",
                borderColor: filter === f ? "rgba(91,87,232,0.5)" : "var(--card-border)",
                background: filter === f ? "rgba(91,87,232,0.12)" : "var(--card-bg)",
                color: filter === f ? "var(--primary)" : "var(--text-muted)",
                fontWeight: 600,
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
                textTransform: "capitalize",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Estado vazio total ──────────────────────────────────── */}
      {tickets.length === 0 && (
        <div
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: 16,
            padding: "56px 24px",
            textAlign: "center",
          }}
        >
          <div style={{
            width: 64, height: 64,
            borderRadius: "50%",
            background: "rgba(91,87,232,0.12)",
            border: "1px solid rgba(91,87,232,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Headphones size={28} style={{ color: "var(--primary)" }} />
          </div>
          <p style={{ fontWeight: 700, fontSize: "15px", color: "var(--text)", margin: "0 0 6px" }}>
            Nenhum chamado ainda
          </p>
          <p style={{ color: "var(--text-faint)", margin: isAdmin ? 0 : "0 0 24px", fontSize: "13px" }}>
            {isAdmin
              ? "Nenhum cliente abriu chamado. Use “Novo chamado” para abrir em nome de um cliente."
              : "Quando precisar de suporte, estamos aqui."}
          </p>
          {!isAdmin && (
            <Link
              href="/portal/suporte/novo"
              style={{
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                padding: "10px 22px",
                borderRadius: 10,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: "inherit",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 16px rgba(91,87,232,0.35)",
              }}
            >
              <Plus size={14} /> Abrir primeiro chamado
            </Link>
          )}
        </div>
      )}

      {/* ── Chamados abertos ────────────────────────────────────── */}
      {(filter !== "fechados") && (
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span className="section-chip">
              <Circle size={11} style={{ color: "#3b82f6" }} />
              Abertos
            </span>
            {openTickets.length > 0 && (
              <span style={{
                fontSize: "11px", fontWeight: 700,
                background: "rgba(59,130,246,0.12)",
                color: "#3b82f6",
                border: "1px solid rgba(59,130,246,0.25)",
                borderRadius: 999, padding: "2px 9px",
              }}>
                {openTickets.length}
              </span>
            )}
          </div>

          {openTickets.length === 0 && tickets.length > 0 ? (
            <div
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                borderRadius: 14,
                padding: "24px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{
                width: 40, height: 40,
                borderRadius: "50%",
                background: "rgba(34,197,94,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <Smile size={20} style={{ color: "#22c55e" }} />
              </div>
              <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "14px", fontWeight: 500 }}>
                Tudo resolvido — nenhum chamado em aberto.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {openTickets.map((t) => <TicketCard key={t.id} ticket={t} showClient={isAdmin} />)}
            </div>
          )}
        </section>
      )}

      {/* ── Histórico ───────────────────────────────────────────── */}
      {closedTickets.length > 0 && (filter !== "abertos") && (
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span className="section-chip">
              <History size={11} />
              Histórico
            </span>
            <span style={{
              fontSize: "11px", fontWeight: 700,
              background: "rgba(148,163,184,0.1)",
              color: "var(--text-faint)",
              border: "1px solid rgba(148,163,184,0.15)",
              borderRadius: 999, padding: "2px 9px",
            }}>
              {closedTickets.length}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {closedTickets.map((t) => <TicketCard key={t.id} ticket={t} dimmed showClient={isAdmin} />)}
          </div>
        </section>
      )}
    </div>
  );
}

/* ── StatCard ──────────────────────────────────────────────────── */
function StatCard({ label, value, Icon, color }: { label: string; value: number; Icon: LucideIcon; color: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid var(--card-border)",
      borderRadius: 12,
      padding: "14px 16px",
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}>
      <div style={{
        width: 36, height: 36,
        borderRadius: 10,
        background: `${color}15`,
        border: `1px solid ${color}25`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{value}</p>
        <p style={{ margin: "3px 0 0", fontSize: "11px", color: "var(--text-faint)" }}>{label}</p>
      </div>
    </div>
  );
}

/* ── TicketCard ────────────────────────────────────────────────── */
function TicketCard({ ticket, dimmed, showClient }: { ticket: Ticket; dimmed?: boolean; showClient?: boolean }) {
  const statusInfo   = TICKET_STATUS_MAP[ticket.status];
  const priorityInfo = TICKET_PRIORITY_MAP[ticket.priority];
  const updatedDate  = new Date(ticket.updatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  const borderAccent = priorityInfo.color;

  return (
    <Link
      href={`/portal/suporte/${ticket.id}`}
      className="card-hover"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderLeft: `3px solid ${borderAccent}`,
        borderRadius: 12,
        padding: "14px 18px 14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        flexWrap: "wrap",
        textDecoration: "none",
        opacity: dimmed ? 0.65 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {/* Status icon */}
      <div style={{
        width: 32, height: 32,
        borderRadius: 9,
        background: `${statusInfo.color}12`,
        border: `1px solid ${statusInfo.color}25`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <statusInfo.Icon size={15} style={{ color: statusInfo.color }} />
      </div>

      {/* Info principal */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: "13px", color: "var(--text)", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {ticket.subject}
        </p>
        <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>
          {ticket.ticketNumber && (
            <span style={{ fontWeight: 700, color: "var(--text-faint)", letterSpacing: "0.04em", marginRight: 4 }}>
              {`UFT${String(ticket.ticketNumber).padStart(4, "0")}`} ·{" "}
            </span>
          )}
          {showClient && ticket.clientName && (
            <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{ticket.clientName} · </span>
          )}
          <span>{ticket.category}</span>
          <span className="suporte-ticket-date"> · {updatedDate}</span>
        </p>
      </div>

      {/* Badges */}
      <div className="suporte-ticket-badges" style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
        <span style={{
          fontSize: "10px", fontWeight: 700, padding: "3px 9px", borderRadius: 999,
          background: `${statusInfo.color}15`, color: statusInfo.color,
          border: `1px solid ${statusInfo.color}28`,
          whiteSpace: "nowrap",
        }}>
          {statusInfo.label}
        </span>
        <span style={{
          fontSize: "10px", fontWeight: 700, padding: "3px 9px", borderRadius: 999,
          background: `${priorityInfo.color}12`, color: priorityInfo.color,
          border: `1px solid ${priorityInfo.color}22`,
          whiteSpace: "nowrap",
        }}>
          {priorityInfo.label}
        </span>
        <ChevronRight size={13} style={{ color: "var(--text-faint)", marginLeft: 2 }} />
      </div>
    </Link>
  );
}
