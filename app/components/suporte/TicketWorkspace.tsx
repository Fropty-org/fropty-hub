"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/app/lib/supabase/browser";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { TicketConversation } from "@/app/components/suporte/TicketConversation";
import { computeSla, SLA_TARGETS, type SlaState } from "@/app/lib/constants/sla";
import type { TicketPriority, TicketStatus } from "@/app/lib/constants/status";
import type { Database } from "@/app/lib/supabase/types";
import {
  ChevronUp, ChevronDown, MoreVertical, Search, SlidersHorizontal,
  Eye, Download, LayoutGrid, Table as TableIcon, RefreshCw, Plus,
  User, Headphones, FileText, FileArchive, ClipboardCheck, MonitorSmartphone, Link as LinkIcon,
} from "lucide-react";

type MessageRow = Database["public"]["Tables"]["ticket_messages"]["Row"];

interface TicketLike {
  id: string;
  subject: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  ticket_number?: number;
  created_at: string;
  first_response_at?: string | null;
  resolved_at?: string | null;
  client_name?: string;
  analyst_name?: string | null;
}

interface Props {
  ticket: TicketLike;
  messages: MessageRow[];
  currentUserId: string;
  currentUserName: string;
  isAdmin: boolean;
  senderRole: "cliente" | "admin";
  ticketNum: string | null;
  participants?: Record<string, { name: string; avatarUrl: string | null }>;
}

type TabId = "formulario" | "associados" | "aprovacao" | "equipamento" | "anexos";

const TABS: { id: TabId; label: string }[] = [
  { id: "formulario",  label: "Formulário" },
  { id: "associados",  label: "Associados" },
  { id: "aprovacao",   label: "Aprovação" },
  { id: "equipamento", label: "Equipamento" },
  { id: "anexos",      label: "Anexos" },
];

function fDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }) +
    " • " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
function fDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function slaColor(s: SlaState | null): string {
  if (!s) return "var(--text-faint)";
  if (s.done) return s.breached ? "var(--c-danger)" : "var(--c-success)";
  if (s.breached) return "var(--c-danger)";
  if (s.ratio >= 0.75) return "var(--c-warning)";
  return "var(--c-info)";
}

/* Pizza de progresso do SLA: fatia preenchida = fração do prazo decorrida. */
function SlaClock({ s }: { s: SlaState | null }) {
  const color = slaColor(s);
  const pct = s ? Math.min(1, s.ratio) : 0;
  return (
    <span
      style={{
        width: 16, height: 16, borderRadius: "50%", flexShrink: 0, boxSizing: "border-box",
        border: `1.5px solid ${color}`,
        background: `conic-gradient(${color} ${pct * 360}deg, var(--surface) 0)`,
      }}
    />
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "9px 0" }}>
      <span style={{ fontSize: "13px", color: "var(--text-faint)" }}>{label}</span>
      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", textAlign: "right" }}>{children}</span>
    </div>
  );
}

export function TicketWorkspace({ ticket, messages, currentUserId, currentUserName, isAdmin, senderRole, ticketNum, participants }: Props) {
  // A descrição do chamado (1ª mensagem) vive na aba Formulário — fora da timeline.
  const descriptionId = messages[0]?.id;
  const actionMessages = messages.filter((m) => m.id !== descriptionId);
  const [tab, setTab] = useState<TabId>("formulario");
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [attView, setAttView] = useState<"table" | "grid">("table");
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const { response, resolution } = computeSla({
    priority: ticket.priority,
    createdAt: ticket.created_at,
    firstResponseAt: ticket.first_response_at ?? null,
    resolvedAt: ticket.resolved_at ?? null,
    status: ticket.status,
  });

  const target = SLA_TARGETS[ticket.priority] ?? SLA_TARGETS.media;
  const responseDue   = new Date(new Date(ticket.created_at).getTime() + target.response * 3_600_000).toISOString();
  const resolutionDue = new Date(new Date(ticket.created_at).getTime() + target.resolution * 3_600_000).toISOString();

  // Anexos: todos os arquivos das mensagens (autor = quem enviou a mensagem).
  const attachments = useMemo(() => {
    const clientName = ticket.client_name ?? "Cliente";
    return messages.flatMap((m) => (m.attachments ?? []).map((path) => ({
      path,
      name: path.split("/").pop() ?? path,
      author: m.sender_role === "cliente" ? clientName : (ticket.analyst_name ?? "Equipe Fropty"),
      authorRole: m.sender_role as "cliente" | "admin",
      date: m.created_at,
    })));
  }, [messages, ticket.client_name, ticket.analyst_name]);

  const resolveUrls = useCallback(async (paths: string[]) => {
    const toResolve = paths.filter((p) => !signedUrls[p]);
    if (toResolve.length === 0) return;
    const supabase = createClient();
    const { data } = await supabase.storage.from("ticket-attachments").createSignedUrls(toResolve, 3600);
    if (data) {
      setSignedUrls((prev) => {
        const next = { ...prev };
        data.forEach((it) => { if (it.signedUrl && it.path) next[it.path] = it.signedUrl; });
        return next;
      });
    }
  }, [signedUrls]);

  useEffect(() => {
    if (tab === "anexos" && attachments.length > 0) resolveUrls(attachments.map((a) => a.path));
  }, [tab, attachments, resolveUrls]);

  return (
    <div className="ticket-ws">
      <style>{`
        .ticket-ws { display: grid; grid-template-columns: minmax(0,1fr) 372px; gap: 20px; align-items: start; }
        .ticket-ws__main { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 22px 24px; min-width: 0; }
        .ticket-ws__aside { display: flex; flex-direction: column; gap: 20px; }
        .ticket-ws__panel { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 18px 20px; }
        .ticket-tab { position: relative; background: none; border: none; padding: 12px 2px; margin-right: 22px; font-size: 14px; font-weight: 600; color: var(--text-faint); cursor: pointer; font-family: inherit; }
        .ticket-tab[data-active="true"] { color: var(--primary); }
        .ticket-tab[data-active="true"]::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: var(--primary); border-radius: 2px; }
        .ticket-iconbtn { width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); display: inline-flex; align-items: center; justify-content: center; color: var(--text-muted); cursor: pointer; }
        .ticket-iconbtn:hover { background: var(--surface-2); }
        .ticket-iconbtn[data-active="true"] { color: var(--primary); border-color: color-mix(in srgb, var(--primary) 40%, var(--border)); }
        @media (max-width: 940px) {
          .ticket-ws { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── Coluna principal ── */}
      <div className="ticket-ws__main">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
              {ticketNum ?? ticket.subject}
            </h1>
            <StatusBadge kind="ticket" status={ticket.status} />
            <StatusBadge kind="ticket-priority" status={ticket.priority} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SlaClock s={response} />
              <div style={{ lineHeight: 1.25 }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)" }}>Resposta</div>
                <div style={{ fontSize: "11.5px", color: "var(--text-faint)" }}>{fDateTime(responseDue)}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SlaClock s={resolution} />
              <div style={{ lineHeight: 1.25 }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)" }}>Resolução</div>
                <div style={{ fontSize: "11.5px", color: "var(--text-faint)" }}>{fDateTime(resolutionDue)}</div>
              </div>
            </div>
            <button className="ticket-iconbtn" style={{ border: "none", background: "none", width: 28 }} title="Mais ações">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid var(--border)", marginTop: 18, marginBottom: 22, overflowX: "auto" }}>
          {TABS.map((t) => (
            <button key={t.id} className="ticket-tab" data-active={tab === t.id} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Conteúdo das abas */}
        {tab === "formulario" && <FormularioTab ticket={ticket} messages={messages} />}
        {tab === "anexos" && (
          <AnexosTab
            attachments={attachments}
            signedUrls={signedUrls}
            view={attView}
            setView={setAttView}
          />
        )}
        {tab === "associados" && <Placeholder Icon={LinkIcon} title="Solicitações associadas" desc="Vincule outros chamados e solicitações relacionados a este atendimento." />}
        {tab === "aprovacao" && <Placeholder Icon={ClipboardCheck} title="Aprovação" desc="Fluxos de aprovação aparecerão aqui quando este chamado exigir autorização." />}
        {tab === "equipamento" && <Placeholder Icon={MonitorSmartphone} title="Equipamento" desc="Equipamentos e ativos relacionados a este chamado aparecerão aqui." />}
      </div>

      {/* ── Painel lateral ── */}
      <aside className="ticket-ws__aside">
        {/* Detalhes */}
        <div className="ticket-ws__panel">
          <button onClick={() => setDetailsOpen((v) => !v)}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", padding: detailsOpen ? "2px 0 10px" : "2px 0", cursor: "pointer", fontFamily: "inherit" }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)" }}>Detalhes</span>
            {detailsOpen ? <ChevronUp size={18} style={{ color: "var(--text-faint)" }} /> : <ChevronDown size={18} style={{ color: "var(--text-faint)" }} />}
          </button>
          {detailsOpen && (
            <div style={{ borderTop: "1px solid var(--border)" }}>
              <DetailRow label="Data de abertura">{fDate(ticket.created_at)}</DetailRow>
              <DetailRow label="Situação">
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <StatusBadge kind="ticket" status={ticket.status} size="sm" />
                </span>
              </DetailRow>
              <DetailRow label="Aberto por">{ticket.client_name ?? "—"}</DetailRow>
              <DetailRow label="Analista atual">{ticket.analyst_name ?? "Não atribuído"}</DetailRow>
              <DetailRow label="Grupo">{ticket.category}</DetailRow>
            </div>
          )}
        </div>

        {/* Ações adicionadas */}
        <div className="ticket-ws__panel" style={{ display: "flex", flexDirection: "column", height: "min(620px, calc(100vh - 200px))" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)" }}>Ações adicionadas</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button className="ticket-iconbtn" style={{ width: 30, height: 30, border: "none", background: "none" }} title="Buscar"><Search size={16} /></button>
              <button className="ticket-iconbtn" style={{ width: 30, height: 30, border: "none", background: "none" }} title="Filtrar"><SlidersHorizontal size={16} /></button>
            </div>
          </div>
          <TicketConversation
            variant="panel"
            ticketId={ticket.id}
            initialMessages={actionMessages}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            ticketStatus={ticket.status}
            senderRole={senderRole}
            clientName={ticket.client_name}
            participants={participants}
          />
        </div>
      </aside>
    </div>
  );
}

/* ── Aba Formulário ── */
function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: "12px", color: "var(--text-faint)", marginBottom: 6 }}>{label}</label>
      <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 14px", fontSize: "14px", color: "var(--text)", whiteSpace: "pre-wrap" }}>
        {value || "—"}
      </div>
    </div>
  );
}
function FormularioTab({ ticket, messages }: { ticket: TicketLike; messages: MessageRow[] }) {
  const firstBody = messages.find((m) => m.sender_role === "cliente")?.body ?? "";
  const priorityLabel = { baixa: "Baixa", media: "Média", alta: "Alta" }[ticket.priority] ?? ticket.priority;
  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: "1.05rem", fontWeight: 800, color: "var(--text)" }}>{ticket.subject}</h2>
      <ReadField label="Assunto" value={ticket.subject} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ReadField label="Grupo" value={ticket.category} />
        <ReadField label="Prioridade" value={priorityLabel} />
      </div>
      <ReadField label="Descrição" value={firstBody} />
    </div>
  );
}

/* ── Aba Anexos ── */
interface Att { path: string; name: string; author: string; authorRole: "cliente" | "admin"; date: string; }
function fileIcon(name: string) {
  if (/\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(name)) return Eye;
  if (/\.(zip|rar|7z|gz)$/i.test(name)) return FileArchive;
  return FileText;
}
function AnexosTab({ attachments, signedUrls, view, setView }: {
  attachments: Att[]; signedUrls: Record<string, string>; view: "table" | "grid"; setView: (v: "table" | "grid") => void;
}) {
  const [q, setQ] = useState("");
  const filtered = attachments.filter((a) => a.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <h2 style={{ margin: "0 0 18px", fontSize: "1.05rem", fontWeight: 800, color: "var(--text)" }}>Anexos do formulário</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar"
            className="hub-input" style={{ paddingLeft: 34, height: 38 }} />
        </div>
        <button className="ticket-iconbtn" data-active={view === "grid"} title={view === "table" ? "Ver em grade" : "Ver em tabela"}
          onClick={() => setView(view === "table" ? "grid" : "table")}>
          {view === "table" ? <LayoutGrid size={17} /> : <TableIcon size={17} />}
        </button>
        <button className="ticket-iconbtn" title="Atualizar"><RefreshCw size={16} /></button>
        <button className="hub-btn hub-btn-primary" style={{ height: 38 }}><Plus size={15} /> Novo</button>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-faint)", fontSize: "13px" }}>
          Nenhum anexo neste chamado.
        </div>
      ) : view === "table" ? (
        <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 10 }}>
          <table className="hub-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Nome do arquivo</th><th>Autor</th><th>Data de inclusão</th><th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => {
                const url = signedUrls[a.path];
                const Icon = fileIcon(a.name);
                return (
                  <tr key={a.path + i}>
                    <td style={{ fontWeight: 600, color: "var(--text)" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <Icon size={14} style={{ color: "var(--text-faint)" }} /> {a.name}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", background: a.authorRole === "cliente" ? "var(--c-info-bg)" : "color-mix(in srgb, var(--primary) 12%, transparent)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                          {a.authorRole === "cliente" ? <User size={12} style={{ color: "var(--c-info)" }} /> : <Headphones size={12} style={{ color: "var(--primary)" }} />}
                        </span>
                        {a.author}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>{fDate(a.date)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <a href={url ?? "#"} target="_blank" rel="noopener noreferrer" className="ticket-iconbtn" style={{ width: 30, height: 30, border: "none", background: "none", opacity: url ? 1 : 0.4 }} title="Visualizar"><Eye size={16} /></a>
                        <a href={url ?? "#"} download className="ticket-iconbtn" style={{ width: 30, height: 30, border: "none", background: "none", opacity: url ? 1 : 0.4 }} title="Baixar"><Download size={16} /></a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 16 }}>
          {filtered.map((a, i) => {
            const url = signedUrls[a.path];
            const isImg = /\.(png|jpe?g|gif|webp|svg)$/i.test(a.name);
            const Icon = fileIcon(a.name);
            return (
              <div key={a.path + i} style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", background: "var(--surface)" }}>
                <a href={url ?? "#"} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 110, background: "var(--surface-2)", textDecoration: "none" }}>
                  {isImg && url
                    ? <img src={url} alt={a.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <Icon size={30} style={{ color: "var(--text-faint)" }} />}
                </a>
                <div style={{ padding: "10px 12px" }}>
                  <p style={{ margin: 0, fontSize: "12.5px", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</p>
                  <p style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--text-faint)" }}>{fDate(a.date)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Placeholder para abas sem backend ── */
function Placeholder({ Icon, title, desc }: { Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; title: string; desc: string }) {
  return (
    <div style={{ textAlign: "center", padding: "56px 24px", border: "1px dashed var(--border)", borderRadius: 12, background: "var(--surface-2)" }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
        <Icon size={22} style={{ color: "var(--text-faint)" }} />
      </div>
      <h3 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 700, color: "var(--text)" }}>{title}</h3>
      <p style={{ margin: "0 auto", maxWidth: 320, fontSize: "13px", color: "var(--text-faint)", lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}
