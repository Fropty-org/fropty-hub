"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronRight, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { Pagination } from "@/app/components/ui/Pagination";
import { HubEmptyState } from "@/app/components/ui/HubEmptyState";
import { computeSla } from "@/app/lib/constants/sla";
import type { TicketPriority } from "@/app/lib/constants/status";

export interface QueueTicket {
  id:              string;
  ticketNumber:    number | null;
  subject:         string;
  category:        string;
  status:          string;
  priority:        string;
  clientId:        string;
  clientName:      string;
  createdAt:       string;
  firstResponseAt: string | null;
  resolvedAt:      string | null;
  updatedAt:       string;
}

const OPEN_STATUSES = ["aberto", "em_andamento", "reaberto"];
const PAGE_SIZE = 20;

/** Estado de SLA "ativo" da linha: a barra que está correndo (ou concluída). */
function activeSla(t: QueueTicket) {
  const { response, resolution } = computeSla({
    priority:        (["baixa", "media", "alta"].includes(t.priority) ? t.priority : "media") as TicketPriority,
    createdAt:       t.createdAt,
    firstResponseAt: t.firstResponseAt,
    resolvedAt:      t.resolvedAt,
    status:          t.status,
  });
  // Antes do primeiro atendimento → SLA de resposta; depois → resolução.
  const state = t.firstResponseAt ? (resolution ?? response) : response;
  const phase = t.firstResponseAt ? "Resolução" : "Resposta";
  return { state, phase };
}

function SlaCell({ t }: { t: QueueTicket }) {
  const isOpen = OPEN_STATUSES.includes(t.status);
  const { state, phase } = activeSla(t);

  if (!isOpen) {
    return <span className="hub-badge hub-badge-neutral sm">Concluído</span>;
  }

  const tone = state.breached ? "danger" : state.ratio > 0.75 ? "warning" : "info";
  return (
    <span className={`hub-badge hub-badge-${tone} sm`} title={`${phase}: ${state.label}`}>
      {state.breached && <AlertTriangle size={11} />}
      {phase[0]}· {state.label}
    </span>
  );
}

interface Props {
  tickets: QueueTicket[];
  clients: { id: string; name: string }[];
}

type StatusFilter = "todos" | "aberto" | "em_andamento" | "reaberto" | "resolvido" | "fechado" | "atraso";
type SortMode = "urgencia" | "recente";

export function AdminSuporteQueue({ tickets, clients }: Props) {
  const [search, setSearch]       = useState("");
  const [client, setClient]       = useState("todos");
  const [status, setStatus]       = useState<StatusFilter>("todos");
  const [priority, setPriority]   = useState("todos");
  const [sort, setSort]           = useState<SortMode>("urgencia");
  const [page, setPage]           = useState(1);

  const enriched = useMemo(
    () => tickets.map((t) => {
      const isOpen = OPEN_STATUSES.includes(t.status);
      const { state } = activeSla(t);
      return { t, isOpen, breached: isOpen && state.breached, ratio: isOpen ? state.ratio : -1 };
    }),
    [tickets],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = enriched.filter(({ t, breached }) => {
      if (q && !t.subject.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)
          && !(`uft${String(t.ticketNumber ?? "").padStart(4, "0")}`).includes(q)) return false;
      if (client !== "todos" && t.clientId !== client) return false;
      if (priority !== "todos" && t.priority !== priority) return false;
      if (status === "atraso") return breached;
      if (status === "todos") return true;
      return t.status === status;
    });

    rows.sort((a, b) => {
      if (sort === "recente") return new Date(b.t.updatedAt).getTime() - new Date(a.t.updatedAt).getTime();
      // urgência: em atraso primeiro, depois maior ratio, abertos antes de fechados
      if (a.breached !== b.breached) return a.breached ? -1 : 1;
      return b.ratio - a.ratio;
    });
    return rows;
  }, [enriched, search, client, priority, status, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openCount     = enriched.filter((r) => r.isOpen).length;
  const breachedCount = enriched.filter((r) => r.breached).length;

  function resetPage<T>(setter: (v: T) => void) {
    return (v: T) => { setter(v); setPage(1); };
  }

  return (
    <div style={{ padding: "24px 24px", maxWidth: 1180, margin: "0 auto" }}>
      {/* Header + resumo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
            Fila de Suporte
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
            {tickets.length} chamados · {openCount} em aberto ·{" "}
            <span style={{ color: breachedCount > 0 ? "var(--c-danger)" : "var(--text-muted)", fontWeight: breachedCount > 0 ? 700 : 400 }}>
              {breachedCount} em atraso
            </span>
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="hub-card" style={{ padding: "12px 14px", marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }} />
          <input
            value={search}
            onChange={(e) => resetPage(setSearch)(e.target.value)}
            placeholder="Buscar assunto, categoria ou UFT…"
            className="hub-input"
            style={{ paddingLeft: 32, width: "100%" }}
          />
        </div>
        <select value={client} onChange={(e) => resetPage(setClient)(e.target.value)} className="hub-input" style={{ flex: "0 1 180px" }}>
          <option value="todos">Todos os clientes</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={status} onChange={(e) => resetPage(setStatus as (v: string) => void)(e.target.value)} className="hub-input" style={{ flex: "0 1 160px" }}>
          <option value="todos">Todos os status</option>
          <option value="atraso">⚠ Em atraso (SLA)</option>
          <option value="aberto">Aberto</option>
          <option value="em_andamento">Em andamento</option>
          <option value="reaberto">Reaberto</option>
          <option value="resolvido">Aguardando validação</option>
          <option value="fechado">Fechado</option>
        </select>
        <select value={priority} onChange={(e) => resetPage(setPriority)(e.target.value)} className="hub-input" style={{ flex: "0 1 140px" }}>
          <option value="todos">Toda prioridade</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="hub-input" style={{ flex: "0 1 150px" }}>
          <option value="urgencia">Ordenar: urgência</option>
          <option value="recente">Ordenar: recentes</option>
        </select>
      </div>

      {/* Fila */}
      {filtered.length === 0 ? (
        <div className="hub-card" style={{ padding: "8px 0" }}>
          <HubEmptyState
            variant="default"
            title="Nenhum chamado na fila"
            description="Ajuste os filtros ou aguarde novos chamados."
          />
        </div>
      ) : (
        <div className="hub-card" style={{ overflow: "hidden", padding: 0 }}>
          {/* Cabeçalho */}
          <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1.1fr 130px 100px 150px 80px 28px", padding: "10px 18px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)" }}>
            <span>Chamado</span><span>Cliente</span><span>Status</span><span>Prioridade</span><span>SLA</span><span style={{ textAlign: "right" }}>Atualizado</span><span />
          </div>

          {paged.map((r, i) => {
            const t = r.t;
            const updated = new Date(t.updatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
            return (
              <Link
                key={t.id}
                href={`/portal/suporte/${t.id}`}
                className="hub-row-link"
                style={{ display: "grid", gridTemplateColumns: "2.2fr 1.1fr 130px 100px 150px 80px 28px", padding: "12px 18px", alignItems: "center", borderBottom: i < paged.length - 1 ? "1px solid var(--border)" : "none", textDecoration: "none", color: "inherit", borderLeft: r.breached ? "3px solid var(--c-danger)" : "3px solid transparent" }}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.subject}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-faint)" }}>
                    {t.ticketNumber != null && <span style={{ fontWeight: 700 }}>UFT{String(t.ticketNumber).padStart(4, "0")}</span>} · {t.category}
                  </p>
                </div>
                <span style={{ fontSize: "12.5px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{t.clientName}</span>
                <span><StatusBadge kind="ticket" status={t.status} size="sm" /></span>
                <span><StatusBadge kind="ticket-priority" status={t.priority} size="sm" /></span>
                <span><SlaCell t={t} /></span>
                <span style={{ fontSize: "12px", color: "var(--text-faint)", textAlign: "right" }}>{updated}</span>
                <ChevronRight size={14} style={{ color: "var(--text-faint)" }} />
              </Link>
            );
          })}

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderTop: "1px solid var(--border)" }}>
              <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>
                {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} de {filtered.length}
              </span>
              <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
