"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ChevronRight, Loader2, Bookmark, Plus, X } from "lucide-react";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { Pagination } from "@/app/components/ui/Pagination";
import { HubEmptyState } from "@/app/components/ui/HubEmptyState";
import { computeSla } from "@/app/lib/constants/sla";
import { assignTicket } from "@/app/actions/suporte";
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
        aria-label="Responsável pelo chamado"
      >
        <option value="">— Não atribuído</option>
        {analysts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      {pending && <Loader2 size={12} style={{ position: "absolute", right: 7, color: "var(--text-faint)", animation: "spin 1s linear infinite", pointerEvents: "none" }} />}
    </div>
  );
}

const OPEN_STATUSES = ["aberto", "em_andamento", "reaberto"];
const PAGE_SIZE = 20;

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
function SlaPie({ t, now }: { t: QueueTicket; now: number }) {
  const isOpen = OPEN_STATUSES.includes(t.status);
  let color = "var(--c-success)";
  let pct = 1;
  let title = "Concluído";
  if (isOpen) {
    const { state, phase } = activeSla(t, now);
    color = state.breached ? "var(--c-danger)" : state.ratio > 0.75 ? "var(--c-warning)" : "var(--c-info)";
    pct = Math.min(1, state.ratio);
    title = `${phase}: ${state.label}`;
  }
  return (
    <span title={title} style={{ position: "relative", display: "inline-block", width: 20, height: 20, borderRadius: "50%", boxSizing: "border-box", border: `2px solid ${`color-mix(in srgb, ${color} 40%, transparent)`}` }}>
      <span style={{ position: "absolute", inset: 2.5, borderRadius: "50%", background: `conic-gradient(${color} ${pct * 360}deg, var(--surface) 0)` }} />
    </span>
  );
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
  const [search, setSearch]       = useState("");
  const [client, setClient]       = useState("todos");
  const [status, setStatus]       = useState<StatusFilter>("todos");
  const [priority, setPriority]   = useState("todos");
  const [assignee, setAssignee]   = useState("todos");
  const [sort, setSort]           = useState<SortMode>("urgencia");
  const [page, setPage]           = useState(1);
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
    const name = window.prompt("Nome da visão:")?.trim();
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
            Fila do Service Desk
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
            {tickets.length} chamados · {openCount} em aberto ·{" "}
            <span style={{ color: breachedCount > 0 ? "var(--c-danger)" : "var(--text-muted)", fontWeight: breachedCount > 0 ? 700 : 400 }}>
              {breachedCount} em atraso
            </span>
          </p>
        </div>
        <Link
          href="/portal/suporte/novo"
          className="hub-btn hub-btn-primary"
          style={{ textDecoration: "none", flexShrink: 0 }}
        >
          <Plus size={15} /> Novo chamado
        </Link>
      </div>

      {/* Views salvas */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "12px", fontWeight: 700, color: "var(--text-faint)" }}>
          <Bookmark size={13} /> Visões:
        </span>
        {views.length === 0 && (
          <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>nenhuma salva ainda</span>
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
          <Plus size={12} /> Salvar visão atual
        </button>
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
        <select value={client} onChange={(e) => resetPage(setClient)(e.target.value)} className="hub-input" style={{ flex: "0 1 150px" }}>
          <option value="todos">Clientes</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={status} onChange={(e) => resetPage(setStatus as (v: string) => void)(e.target.value)} className="hub-input" style={{ flex: "0 1 140px" }}>
          <option value="todos">Status</option>
          <option value="atraso">⚠ Em atraso (SLA)</option>
          <option value="aberto">Aberto</option>
          <option value="em_andamento">Em andamento</option>
          <option value="reaberto">Reaberto</option>
          <option value="resolvido">Aguardando validação</option>
          <option value="fechado">Fechado</option>
        </select>
        <select value={priority} onChange={(e) => resetPage(setPriority)(e.target.value)} className="hub-input" style={{ flex: "0 1 130px" }}>
          <option value="todos">Prioridade</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>
        <select value={assignee} onChange={(e) => resetPage(setAssignee)(e.target.value)} className="hub-input" style={{ flex: "0 1 150px" }}>
          <option value="todos">Responsável</option>
          <option value="meus">Meus chamados</option>
          <option value="nao">Não atribuídos</option>
          {analysts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="hub-input" style={{ flex: "0 1 130px" }}>
          <option value="urgencia">Urgência</option>
          <option value="recente">Recentes</option>
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
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1.1fr) 168px 150px 104px 64px 24px", padding: "10px 18px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)" }}>
            <span>UFT</span><span>Cliente</span><span>Responsável</span><span style={{ textAlign: "center" }}>Status</span><span style={{ textAlign: "center" }}>Prioridade</span><span style={{ textAlign: "center" }}>SLA</span><span />
          </div>

          {paged.map((r, i) => {
            const t = r.t;
            return (
              <div
                key={t.id}
                className="hub-row-link"
                style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1.1fr) 168px 150px 104px 64px 24px", padding: "12px 18px", alignItems: "center", borderBottom: i < paged.length - 1 ? "1px solid var(--border)" : "none", color: "inherit", borderLeft: r.breached ? "3px solid var(--c-danger)" : "3px solid transparent" }}
              >
                <Link href={`/portal/suporte/${t.id}`} style={{ minWidth: 0, textDecoration: "none", color: "inherit", paddingRight: 12 }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>
                    {t.ticketNumber != null ? `UFT${String(t.ticketNumber).padStart(4, "0")}` : "—"}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.subject}
                  </p>
                </Link>
                <span style={{ fontSize: "12.5px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 12 }}>{t.clientName}</span>
                <span style={{ paddingRight: 12 }}><AssigneeSelect ticketId={t.id} value={t.assignedTo} analysts={analysts} /></span>
                <span style={{ display: "flex", justifyContent: "center" }}><StatusBadge kind="ticket" status={t.status} size="sm" /></span>
                <span style={{ display: "flex", justifyContent: "center" }}><StatusBadge kind="ticket-priority" status={t.priority} size="sm" /></span>
                <span style={{ display: "flex", justifyContent: "center" }}><SlaPie t={t} now={now} /></span>
                <Link href={`/portal/suporte/${t.id}`} style={{ display: "flex", justifyContent: "flex-end", color: "var(--text-faint)" }} aria-label="Abrir chamado">
                  <ChevronRight size={14} />
                </Link>
              </div>
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
