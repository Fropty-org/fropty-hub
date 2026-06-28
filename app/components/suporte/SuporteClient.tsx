"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { TICKET_STATUS_MAP, TICKET_PRIORITY_MAP } from "@/app/lib/constants/status";
import type { Ticket } from "@/app/lib/types/cliente";
import {
  Coins, Headphones, Plus, Search, X,
  Circle, CheckCircle, AlertTriangle,
  Ticket as TicketIcon, ChevronRight, LucideIcon,
} from "lucide-react";

type FilterMode = "todos" | "abertos" | "fechados";

interface Props {
  tickets:       Ticket[];
  isAdmin?:      boolean;
  clients?:      { id: string; name: string }[];
  tokenBalance?: number;
}

/* ── NoToken modal ─────────────────────────────────────────────────── */
function NoTokenModal({ onClose }: { onClose: () => void }) {
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
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(4,3,22,0.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 24, animation: "fadeIn 0.15s ease" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "36px 32px", maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,0.45)" }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(239,159,39,0.1)", border: "1px solid rgba(239,159,39,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <Coins size={24} style={{ color: "#EF9F27" }} />
        </div>
        <h3 style={{ margin: "0 0 10px", fontSize: "1.1rem", fontWeight: 800, color: "var(--text)" }}>Tokens insuficientes</h3>
        <p style={{ margin: "0 0 24px", fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.65 }}>
          Você precisa de tokens para abrir chamados de suporte. Adquira tokens ou um plano para continuar.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Link href="/portal/financeiro" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", background: "#EF9F27", color: "#fff", fontWeight: 700, fontSize: "13px", borderRadius: 10, textDecoration: "none" }}>
            <Coins size={13} /> Ver tokens
          </Link>
          <button onClick={onClose} style={{ padding: "10px 18px", background: "var(--surface-2)", color: "var(--text-muted)", fontWeight: 600, fontSize: "13px", borderRadius: 10, border: "1px solid var(--border)", cursor: "pointer", fontFamily: "inherit" }}>
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ── SuporteClient ─────────────────────────────────────────────────── */
export function SuporteClient({ tickets, isAdmin, tokenBalance = 0 }: Props) {
  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState<FilterMode>("todos");
  const [showNoToken, setShowNoToken] = useState(false);

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

  const totalOpen     = tickets.filter((t) => t.status !== "fechado").length;
  const totalResolved = tickets.filter((t) => t.status === "fechado").length;
  const totalHigh     = tickets.filter((t) => t.priority === "alta" && t.status !== "fechado").length;

  return (
    <div style={{ padding: "36px 32px", maxWidth: 1020, margin: "0 auto" }}>
      <style>{`
        @media (max-width: 640px) {
          .suporte-root-wrap { padding: 16px 14px !important; }
          .suporte-stats { grid-template-columns: 1fr 1fr !important; }
          .suporte-filters { flex-direction: column !important; }
          .sup-col-cat, .sup-col-priority, .sup-col-date { display: none !important; }
        }
      `}</style>

      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>
            {isAdmin ? "Service Desk" : "Suporte"}
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: "13px", color: "var(--text-faint)" }}>
            {isAdmin
              ? "Todos os chamados — abra em nome de um cliente quando necessário"
              : "Acompanhe e abra chamados de suporte em tempo real"}
          </p>
        </div>

        {!isAdmin && tokenBalance <= 0 ? (
          <button
            onClick={() => setShowNoToken(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--primary)", color: "#fff", border: "none", padding: "9px 18px", borderRadius: "var(--r-md)", fontWeight: 700, cursor: "pointer", fontSize: "13px", fontFamily: "inherit", boxShadow: "var(--shadow-brand)" }}
          >
            <Plus size={14} /> Novo chamado
          </button>
        ) : (
          <Link
            href="/portal/suporte/novo"
            style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--primary)", color: "#fff", padding: "9px 18px", borderRadius: "var(--r-md)", fontWeight: 700, fontSize: "13px", textDecoration: "none", boxShadow: "var(--shadow-brand)" }}
          >
            <Plus size={14} /> Novo chamado
          </Link>
        )}
        {showNoToken && <NoTokenModal onClose={() => setShowNoToken(false)} />}
      </div>

      {/* ── KPI cards ── */}
      <div className="suporte-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
        <StatCard label="Total" value={tickets.length}  Icon={TicketIcon}     color="var(--primary)" />
        <StatCard label="Em aberto" value={totalOpen}    Icon={Circle}        color="#3b82f6" />
        {totalHigh > 0
          ? <StatCard label="Alta prioridade" value={totalHigh}     Icon={AlertTriangle} color="#ef4444" />
          : <StatCard label="Resolvidos"       value={totalResolved} Icon={CheckCircle}   color="#22c55e" />
        }
      </div>

      {/* ── Search + filtros ── */}
      <div className="suporte-filters" style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{
          flex: 1, minWidth: 200,
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--r-md)", padding: "8px 14px",
        }}>
          <Search size={14} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por assunto ou categoria…"
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: "13px", fontFamily: "inherit" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", padding: 0, display: "flex", fontFamily: "inherit" }}>
              <X size={13} />
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {(["todos", "abertos", "fechados"] as FilterMode[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "7px 14px", borderRadius: "var(--r-md)", border: "1px solid",
                borderColor: filter === f ? "rgba(91,87,232,0.45)" : "var(--border)",
                background: filter === f ? "rgba(91,87,232,0.10)" : "var(--surface)",
                color: filter === f ? "var(--primary)" : "var(--text-muted)",
                fontWeight: 600, fontSize: "12px", cursor: "pointer",
                fontFamily: "inherit", textTransform: "capitalize",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabela Preline ── */}
      {tickets.length === 0 ? (
        <div className="hub-card" style={{ padding: "56px 24px", textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(91,87,232,0.10)", border: "1px solid rgba(91,87,232,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <Headphones size={24} style={{ color: "var(--primary)" }} />
          </div>
          <p style={{ fontWeight: 700, fontSize: "15px", color: "var(--text)", margin: "0 0 6px" }}>Nenhum chamado ainda</p>
          <p style={{ color: "var(--text-faint)", margin: isAdmin ? 0 : "0 0 22px", fontSize: "13px" }}>
            {isAdmin ? "Nenhum cliente abriu chamado ainda." : "Quando precisar de suporte, estamos aqui."}
          </p>
          {!isAdmin && (
            <Link href="/portal/suporte/novo" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 20px", background: "var(--primary)", color: "#fff", borderRadius: "var(--r-md)", fontWeight: 700, fontSize: "13px", textDecoration: "none" }}>
              <Plus size={14} /> Abrir primeiro chamado
            </Link>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="hub-card" style={{ padding: "32px 24px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px" }}>
          Nenhum chamado encontrado para &ldquo;{search}&rdquo;
        </div>
      ) : (
        <div className="hub-card" style={{ overflow: "hidden" }}>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>
              {filtered.length} chamado{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 110px 90px 110px 120px 32px",
            padding: "9px 20px", background: "var(--surface-2)",
            borderBottom: "1px solid var(--border)",
            fontSize: "11px", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-faint)",
          }}>
            <span>Chamado</span>
            <span className="sup-col-cat">Categoria</span>
            <span>Status</span>
            <span className="sup-col-priority">Prioridade</span>
            <span className="sup-col-date" style={{ textAlign: "right" }}>Atualizado</span>
            <span />
          </div>

          {filtered.map((t, i) => {
            const st  = TICKET_STATUS_MAP[t.status];
            const pri = TICKET_PRIORITY_MAP[t.priority];
            const updatedDate = new Date(t.updatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

            return (
              <Link
                key={t.id}
                href={`/portal/suporte/${t.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 110px 90px 110px 120px 32px",
                  padding: "13px 20px", alignItems: "center",
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                  textDecoration: "none", color: "inherit",
                  borderLeft: `3px solid ${pri.color}`,
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-2)"}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "transparent"}
              >
                {/* Assunto */}
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.subject}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-faint)" }}>
                    {t.ticketNumber && <span style={{ fontWeight: 700, marginRight: 4 }}>UFT{String(t.ticketNumber).padStart(4, "0")} ·</span>}
                    {isAdmin && t.clientName && <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{t.clientName} · </span>}
                  </p>
                </div>

                {/* Categoria */}
                <span className="sup-col-cat" style={{ fontSize: "12px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.category}
                </span>

                {/* Status */}
                <span style={{
                  fontSize: "11px", fontWeight: 700, padding: "3px 9px",
                  borderRadius: "var(--r-full)", whiteSpace: "nowrap",
                  color: st.color, background: `${st.color}15`, border: `1px solid ${st.color}28`,
                  display: "inline-block",
                }}>
                  {st.label}
                </span>

                {/* Prioridade */}
                <span className="sup-col-priority" style={{
                  fontSize: "11px", fontWeight: 700, padding: "3px 9px",
                  borderRadius: "var(--r-full)", whiteSpace: "nowrap",
                  color: pri.color, background: `${pri.color}12`, border: `1px solid ${pri.color}22`,
                  display: "inline-block",
                }}>
                  {pri.label}
                </span>

                {/* Data */}
                <span className="sup-col-date" style={{ fontSize: "12px", color: "var(--text-faint)", textAlign: "right" }}>
                  {updatedDate}
                </span>

                <ChevronRight size={14} style={{ color: "var(--text-faint)" }} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── StatCard ──────────────────────────────────────────────────────── */
function StatCard({ label, value, Icon, color }: { label: string; value: number; Icon: LucideIcon; color: string }) {
  return (
    <div className="hub-stat-card" style={{ border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, background: "var(--surface)" }}>
      <div style={{ width: 36, height: 36, borderRadius: "var(--r-md)", background: `${color}15`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{value}</p>
        <p style={{ margin: "3px 0 0", fontSize: "11px", color: "var(--text-faint)" }}>{label}</p>
      </div>
    </div>
  );
}
