"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { NewTicketForm } from "./NewTicketForm";
import { TICKET_STATUS_MAP, TICKET_PRIORITY_MAP } from "@/app/lib/constants/status";
import type { Ticket } from "@/app/lib/types/cliente";

type FilterMode = "todos" | "abertos" | "fechados";

interface Props {
  tickets: Ticket[];
  projects: { id: string; name: string }[];
}

export function SuporteClient({ tickets, projects }: Props) {
  const [showForm, setShowForm]   = useState(false);
  const [search,   setSearch]     = useState("");
  const [filter,   setFilter]     = useState<FilterMode>("todos");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tickets.filter((t) => {
      const matchSearch = !q || t.subject.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      const isOpen   = t.status === "aberto" || t.status === "em_andamento";
      const matchFilter =
        filter === "todos"   ? true :
        filter === "abertos" ? isOpen :
        !isOpen;
      return matchSearch && matchFilter;
    });
  }, [tickets, search, filter]);

  const openTickets   = filtered.filter((t) => t.status === "aberto" || t.status === "em_andamento");
  const closedTickets = filtered.filter((t) => t.status === "resolvido" || t.status === "fechado");

  return (
    <div style={{ padding: "40px 32px", maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)" }}>
            Suporte
          </h1>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>
            Abra chamados e acompanhe o status das suas solicitações
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--cta-bg)",
            color: "var(--cta-text)",
            border: "none",
            padding: "10px 18px",
            borderRadius: 10,
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "13px",
            fontFamily: "inherit",
          }}
        >
          <i className="ti ti-plus" /> Novo chamado
        </button>
      </div>

      {/* Busca + filtros */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
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
          }}
        >
          <i className="ti ti-search" style={{ color: "var(--text-faint)", fontSize: 15, flexShrink: 0 }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar chamados…"
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
              <i className="ti ti-x" style={{ fontSize: 13 }} />
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {(["todos", "abertos", "fechados"] as FilterMode[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "1px solid",
                borderColor: filter === f ? "var(--primary)" : "var(--card-border)",
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

      {/* Modal de novo chamado */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(4,3,22,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 24,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
              borderRadius: 20,
              padding: "32px",
              width: "100%",
              maxWidth: 560,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>
                Abrir chamado
              </h2>
              <button
                onClick={() => setShowForm(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", fontSize: 20, padding: 4, fontFamily: "inherit" }}
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <NewTicketForm projects={projects} onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {/* Chamados abertos */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
          <i className="ti ti-circle-dot" style={{ color: "#3b82f6" }} />
          Chamados abertos
          {openTickets.length > 0 && (
            <span style={{ fontSize: "11px", fontWeight: 700, background: "#3b82f610", color: "#3b82f6", border: "1px solid #3b82f630", borderRadius: 999, padding: "2px 8px" }}>
              {openTickets.length}
            </span>
          )}
        </h2>

        {openTickets.length === 0 ? (
          <div
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
              borderRadius: 14,
              padding: "28px 24px",
              textAlign: "center",
            }}
          >
            <i className="ti ti-mood-happy" style={{ fontSize: 32, color: "#22c55e", display: "block", marginBottom: 8 }} />
            <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "14px" }}>
              Nenhum chamado aberto. Tudo certo!
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {openTickets.map((t) => <TicketRow key={t.id} ticket={t} />)}
          </div>
        )}
      </section>

      {/* Histórico */}
      {closedTickets.length > 0 && (
        <section>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-history" style={{ color: "var(--text-faint)" }} />
            Histórico
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {closedTickets.map((t) => <TicketRow key={t.id} ticket={t} />)}
          </div>
        </section>
      )}

      {tickets.length === 0 && (
        <div
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: 16,
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <i className="ti ti-headset" style={{ fontSize: 40, color: "var(--text-faint)", display: "block", marginBottom: 12 }} />
          <p style={{ color: "var(--text-muted)", margin: "0 0 20px", fontSize: "15px" }}>
            Nenhum chamado ainda.
          </p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: "var(--cta-bg)",
              color: "var(--cta-text)",
              border: "none",
              padding: "10px 22px",
              borderRadius: 10,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "13px",
              fontFamily: "inherit",
            }}
          >
            Abrir primeiro chamado
          </button>
        </div>
      )}
    </div>
  );
}

function TicketRow({ ticket }: { ticket: Ticket }) {
  const statusInfo   = TICKET_STATUS_MAP[ticket.status];
  const priorityInfo = TICKET_PRIORITY_MAP[ticket.priority];
  const updatedDate  = new Date(ticket.updatedAt).toLocaleDateString("pt-BR");

  return (
    <Link
      href={`/portal/suporte/${ticket.id}`}
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: 12,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
        textDecoration: "none",
        transition: "border-color 0.15s, background 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--primary)";
        (e.currentTarget as HTMLAnchorElement).style.background  = "var(--surface)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--card-border)";
        (e.currentTarget as HTMLAnchorElement).style.background  = "var(--card-bg)";
      }}
    >
      {/* Status dot */}
      <i className={`ti ${statusInfo.icon}`} style={{ color: statusInfo.color, fontSize: 18, flexShrink: 0 }} />

      {/* Info principal */}
      <div style={{ flex: 1, minWidth: 160 }}>
        <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>
          {ticket.subject}
        </p>
        <p style={{ margin: 0, fontSize: "12px", color: "var(--text-faint)" }}>
          {ticket.category} · Atualizado em {updatedDate}
        </p>
      </div>

      {/* Badges */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap", alignItems: "center" }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 999,
            background: `${statusInfo.color}18`,
            color: statusInfo.color,
            border: `1px solid ${statusInfo.color}30`,
          }}
        >
          {statusInfo.label}
        </span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 999,
            background: `${priorityInfo.color}15`,
            color: priorityInfo.color,
            border: `1px solid ${priorityInfo.color}25`,
          }}
        >
          {priorityInfo.label}
        </span>
        <i className="ti ti-chevron-right" style={{ fontSize: 14, color: "var(--text-faint)" }} />
      </div>
    </Link>
  );
}
