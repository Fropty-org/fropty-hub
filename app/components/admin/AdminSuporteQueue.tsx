"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Loader2, Bookmark, Plus, X } from "lucide-react";
import { HubEmptyState } from "@/app/components/ui/HubEmptyState";
import { SlaGauge } from "@/app/components/suporte/SlaGauge";
import { TicketBadge } from "@/app/components/suporte/TicketBadge";
import { useT } from "@/app/lib/i18n/I18nProvider";
import { computeSla } from "@/app/lib/constants/sla";
import { assignTicket } from "@/app/actions/suporte";
import { TICKET_STATUS_MAP, type TicketPriority, type TicketStatus } from "@/app/lib/constants/status";

export interface QueueTicket {
  id:              string;
  ticketNumber:    number | null;
  subject:         string;
  category:        string;
  status:          string;
  priority:        string;
  clientId:        string;
  clientName:      string;
  assignedTo:      string | null;
  assigneeName:    string;
  createdAt:       string;
  firstResponseAt: string | null;
  resolvedAt:      string | null;
  updatedAt:       string;
}

interface Analyst { id: string; name: string; }

/** Seletor de responsável por linha. Fora do <a> do assunto (HTML válido). */
function AssigneeSelect({ ticketId, value, analysts }: { ticketId: string; value: string | null; analysts: Analyst[] }) {
  const t = useT();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [val, setVal] = useState(value ?? "");

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <select
        value={val}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          setVal(next);
          start(async () => { await assignTicket(ticketId, next || null); router.refresh(); });
        }}
        className="hub-input"
        style={{ fontSize: 12, padding: "4px 24px 4px 8px", width: "100%", opacity: pending ? 0.5 : 1, color: val ? "var(--text)" : "var(--text-faint)" }}
        aria-label={t("serviceDesk.queue.filters.responsible")}
      >
        <option value="">{t("serviceDesk.queue.unassigned")}</option>
        {analysts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      {pending && <Loader2 size={12} style={{ position: "absolute", right: 7, color: "var(--text-faint)", animation: "spin 1s linear infinite", pointerEvents: "none" }} />}
    </div>
  );
}

const OPEN_STATUSES = ["aberto", "em_andamento", "reaberto"];

// Colunas do board, na ordem do fluxo do chamado.
const BOARD_STATUSES: TicketStatus[] = ["aberto", "em_andamento", "reaberto", "resolvido", "fechado"];

/* Card vertical de um chamado no board. */
function KanbanCard({ r, analysts, now }: { r: { t: QueueTicket; breached: boolean }; analysts: Analyst[]; now: number }) {
  const t = r.t;
  const uft = t.ticketNumber != null ? `UFT${String(t.ticketNumber).padStart(4, "0")}` : "—";
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: r.breached ? "3px solid var(--c-danger)" : "3px solid transparent", borderRadius: 12, padding: "11px 12px", display: "flex", flexDirection: "column", gap: 9 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <Link href={`/portal/suporte/${t.id}`} style={{ textDecoration: "none", minWidth: 0 }}>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.01em" }}>{uft}</span>
        </Link>
        <SlaPie t={t} now={now} size={22} />
      </div>
      <Link href={`/portal/suporte/${t.id}`} style={{ textDecoration: "none" }}>
        <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {t.subject}
        </p>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <TicketBadge kind="ticket-priority" status={t.priority} size="sm" />
        <span style={{ fontSize: "11.5px", color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.clientName}</span>
      </div>
      <AssigneeSelect ticketId={t.id} value={t.assignedTo} analysts={analysts} />
    </div>
  );
}

/** Estado de SLA "ativo" da linha: a barra que está correndo (ou concluída). */
function activeSla(t: QueueTicket, now?: number) {
  const { response, resolution } = computeSla({
    priority:        (["baixa", "media", "alta"].includes(t.priority) ? t.priority : "media") as TicketPriority,
    createdAt:       t.createdAt,
    firstResponseAt: t.firstResponseAt,
    resolvedAt:      t.resolvedAt,
    status:          t.status,
    now,
  });
  // Antes do primeiro atendimento → SLA de resposta; depois → resolução.
  const state = t.firstResponseAt ? (resolution ?? response) : response;
  const phase = t.firstResponseAt ? "Resolução" : "Resposta";
  return { state, phase };
}

/* Pizza de progresso do SLA (mesma linguagem visual da tela do chamado):
   disco preenchido = fração do prazo ativo decorrida, dentro de um anel claro.
   Sempre centralizado (inset simétrico). */
function SlaPie({ t, now, size = 20 }: { t: QueueTicket; now: number; size?: number }) {
  const isOpen = OPEN_STATUSES.includes(t.status);
  let color = "var(--c-success)";
  let pct = 1;
  let title = "Concluído";
  if (isOpen) {
    const { state, phase } = activeSla(t, now);
    color = state.breached ? "var(--c-danger)" : state.ratio > 0.75 ? "var(--c-warning)" : "var(--c-info)";
    pct = state.ratio;
    title = `${phase}: ${state.label}`;
  }
  return <SlaGauge color={color} pct={pct} title={title} size={size} />;
}

interface Props {
  tickets: QueueTicket[];
  clients: { id: string; name: string }[];
  analysts: Analyst[];
  currentUserId: string;
}

type StatusFilter = "todos" | "aberto" | "em_andamento" | "reaberto" | "resolvido" | "fechado" | "atraso";
type SortMode = "urgencia" | "recente";

interface SavedView {
  name: string;
  f: { search: string; client: string; status: StatusFilter; priority: string; assignee: string; sort: SortMode };
}
const VIEWS_KEY = "fropty-suporte-views";

export function AdminSuporteQueue({ tickets, clients, analysts, currentUserId }: Props) {
  const t = useT();
  const [search, setSearch]       = useState("");
  const [client, setClient]       = useState("todos");
  const [status, setStatus]       = useState<StatusFilter>("todos");
  const [priority, setPriority]   = useState("todos");
  const [assignee, setAssignee]   = useState("todos");
  const [sort, setSort]           = useState<SortMode>("urgencia");
  const [, setPage]               = useState(1);
  const [now, setNow]             = useState(() => Date.now());

  // Relógio de SLA ao vivo: re-renderiza a fila a cada 30s para o tempo
  // decorrido e o estado de estouro acompanharem o relógio sem recarregar.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Views salvas (presets de filtro) — persistidas por navegador em localStorage.
  const [views, setViews] = useState<SavedView[]>([]);
  useEffect(() => {
    try { const raw = localStorage.getItem(VIEWS_KEY); if (raw) setViews(JSON.parse(raw)); } catch {}
  }, []);
  function persistViews(next: SavedView[]) {
    setViews(next);
    try { localStorage.setItem(VIEWS_KEY, JSON.stringify(next)); } catch {}
  }
  function saveCurrentView() {
    const name = window.prompt(t("serviceDesk.queue.viewNamePrompt"))?.trim();
    if (!name) return;
    persistViews([...views.filter(v => v.name !== name), { name, f: { search, client, status, priority, assignee, sort } }]);
  }
  function applyView(v: SavedView) {
    setSearch(v.f.search); setClient(v.f.client); setStatus(v.f.status);
    setPriority(v.f.priority); setAssignee(v.f.assignee); setSort(v.f.sort); setPage(1);
  }
  function deleteView(name: string) {
    persistViews(views.filter(v => v.name !== name));
  }

  const enriched = useMemo(
    () => tickets.map((t) => {
      const isOpen = OPEN_STATUSES.includes(t.status);
      const { state } = activeSla(t, now);
      return { t, isOpen, breached: isOpen && state.breached, ratio: isOpen ? state.ratio : -1 };
    }),
    [tickets, now],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = enriched.filter(({ t, breached }) => {
      if (q && !t.subject.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)
          && !(`uft${String(t.ticketNumber ?? "").padStart(4, "0")}`).includes(q)) return false;
      if (client !== "todos" && t.clientId !== client) return false;
      if (priority !== "todos" && t.priority !== priority) return false;
      if (assignee === "meus" && t.assignedTo !== currentUserId) return false;
      if (assignee === "nao" && t.assignedTo !== null) return false;
      if (assignee !== "todos" && assignee !== "meus" && assignee !== "nao" && t.assignedTo !== assignee) return false;
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
  }, [enriched, search, client, priority, assignee, status, sort, currentUserId]);

  // Board por status: quando um status específico está filtrado, mostramos só
  // aquela coluna; "todos"/"atraso" mostram todas.
  const visibleColumns = (status === "todos" || status === "atraso")
    ? BOARD_STATUSES
    : BOARD_STATUSES.filter((s) => s === status);

  const openCount     = enriched.filter((r) => r.isOpen).length;
  const breachedCount = enriched.filter((r) => r.breached).length;

  function resetPage<T>(setter: (v: T) => void) {
    return (v: T) => { setter(v); setPage(1); };
  }

  return (
    <div className="hub-page" style={{ maxWidth: "none" }}>
      {/* Header + resumo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
            {t("serviceDesk.queue.title")}
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
            {t("serviceDesk.queue.summary", { total: tickets.length, open: openCount, late: breachedCount })}
          </p>
        </div>
        <Link
          href="/portal/suporte/novo"
          className="hub-btn hub-btn-primary"
          style={{ textDecoration: "none", flexShrink: 0 }}
        >
          <Plus size={15} /> {t("serviceDesk.newTicket")}
        </Link>
      </div>

      {/* Views salvas */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "12px", fontWeight: 700, color: "var(--text-faint)" }}>
          <Bookmark size={13} /> {t("serviceDesk.queue.views")}
        </span>
        {views.length === 0 && (
          <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>{t("serviceDesk.queue.noViews")}</span>
        )}
        {views.map((v) => (
          <span key={v.name} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-full)", padding: "3px 4px 3px 10px", fontSize: "12px" }}>
            <button type="button" onClick={() => applyView(v)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text)", fontWeight: 600, fontFamily: "inherit", padding: 0 }}>
              {v.name}
            </button>
            <button type="button" onClick={() => deleteView(v.name)} aria-label={`Excluir visão ${v.name}`} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", display: "flex", padding: 2 }}>
              <X size={11} />
            </button>
          </span>
        ))}
        <button type="button" onClick={saveCurrentView} className="hub-btn hub-btn-ghost" style={{ padding: "3px 10px", fontSize: "12px" }}>
          <Plus size={12} /> {t("serviceDesk.queue.saveView")}
        </button>
      </div>

      {/* Filtros */}
      <div className="hub-card" style={{ padding: "12px 14px", marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }} />
          <input
            value={search}
            onChange={(e) => resetPage(setSearch)(e.target.value)}
            placeholder={t("serviceDesk.searchPlaceholder")}
            className="hub-input"
            style={{ paddingLeft: 32, width: "100%" }}
          />
        </div>
        <select value={client} onChange={(e) => resetPage(setClient)(e.target.value)} className="hub-input" style={{ flex: "0 1 150px" }}>
          <option value="todos">{t("serviceDesk.queue.filters.clients")}</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={status} onChange={(e) => resetPage(setStatus as (v: string) => void)(e.target.value)} className="hub-input" style={{ flex: "0 1 140px" }}>
          <option value="todos">{t("serviceDesk.queue.filters.status")}</option>
          <option value="atraso">{t("serviceDesk.queue.options.late")}</option>
          <option value="aberto">{t("serviceDesk.status.aberto")}</option>
          <option value="em_andamento">{t("serviceDesk.status.em_andamento")}</option>
          <option value="reaberto">{t("serviceDesk.status.reaberto")}</option>
          <option value="resolvido">{t("serviceDesk.status.resolvido")}</option>
          <option value="fechado">{t("serviceDesk.status.fechado")}</option>
        </select>
        <select value={priority} onChange={(e) => resetPage(setPriority)(e.target.value)} className="hub-input" style={{ flex: "0 1 130px" }}>
          <option value="todos">{t("serviceDesk.queue.filters.priority")}</option>
          <option value="alta">{t("serviceDesk.priority.alta")}</option>
          <option value="media">{t("serviceDesk.priority.media")}</option>
          <option value="baixa">{t("serviceDesk.priority.baixa")}</option>
        </select>
        <select value={assignee} onChange={(e) => resetPage(setAssignee)(e.target.value)} className="hub-input" style={{ flex: "0 1 150px" }}>
          <option value="todos">{t("serviceDesk.queue.filters.responsible")}</option>
          <option value="meus">{t("serviceDesk.queue.options.myTickets")}</option>
          <option value="nao">{t("serviceDesk.queue.options.unassigned")}</option>
          {analysts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="hub-input" style={{ flex: "0 1 130px" }}>
          <option value="urgencia">{t("serviceDesk.queue.options.urgency")}</option>
          <option value="recente">{t("serviceDesk.queue.options.recent")}</option>
        </select>
      </div>

      {/* Fila */}
      {filtered.length === 0 ? (
        <div className="hub-card" style={{ padding: "8px 0" }}>
          <HubEmptyState
            variant="default"
            title={t("serviceDesk.queue.emptyTitle")}
            description={t("serviceDesk.queue.emptyDesc")}
          />
        </div>
      ) : (
        <div className="suporte-board" style={{ display: "grid", gridTemplateColumns: `repeat(${visibleColumns.length}, minmax(258px, 1fr))`, gap: 14, alignItems: "start", overflowX: "auto", paddingBottom: 6 }}>
          {visibleColumns.map((col) => {
            const meta = TICKET_STATUS_MAP[col];
            const items = filtered.filter((r) => r.t.status === col);
            return (
              <div key={col} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 14, display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 250px)" }}>
                {/* Cabeçalho da coluna */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: meta.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text)" }}>{t(`serviceDesk.status.${col}`)}</span>
                  <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 99, padding: "1px 8px", minWidth: 22, textAlign: "center" }}>
                    {items.length}
                  </span>
                </div>
                {/* Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12, overflowY: "auto" }}>
                  {items.length === 0 ? (
                    <p style={{ margin: "6px 4px", fontSize: "12px", color: "var(--text-faint)", textAlign: "center" }}>{t("serviceDesk.queue.columnEmpty")}</p>
                  ) : (
                    items.map((r) => <KanbanCard key={r.t.id} r={r} analysts={analysts} now={now} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
