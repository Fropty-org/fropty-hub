"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays, Plus } from "lucide-react";
import type { Project } from "@/app/lib/types/projects";
import type { ProjectStatus } from "@/app/lib/types/projects";
import { PROJECT_STATUSES } from "@/app/lib/constants/projects";

interface Props {
  projects: Project[];
  /** Base do link do projeto. Cliente: "/portal/projetos" (padrão); admin: "/admin/projetos". */
  basePath?: string;
}

type ViewMode = "Dia" | "Semana" | "Mês" | "Ano";

const WEEK_DAYS  = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const WEEK_FULL  = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const MONTH_NAMES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];
const MONTH_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

/** Índice do dia da semana com a semana começando na segunda (0=Seg … 6=Dom). */
function dowMon(d: Date) { const x = d.getDay(); return x === 0 ? 6 : x - 1; }
function keyOf(d: Date)  { return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }
function addDays(d: Date, n: number)   { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
function addMonths(d: Date, n: number) { return new Date(d.getFullYear(), d.getMonth() + n, 1); }
function startOfWeek(d: Date)          { return addDays(d, -dowMon(d)); }
function sameDay(a: Date, b: Date)     { return keyOf(a) === keyOf(b); }

/** Parser seguro para "YYYY-MM-DD" (evita shift de fuso do new Date(string)). */
function parseDate(s: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(s);
}

export function ProjectsCalendar({ projects, basePath = "/portal/projetos" }: Props) {
  const today = new Date();
  const [cursor, setCursor] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  const [view,   setView]   = useState<ViewMode>("Mês");
  const [hidden, setHidden] = useState<Set<ProjectStatus>>(new Set());

  const isAdmin = basePath.includes("/admin");

  /** Projetos visíveis agrupados por dia (respeita o filtro de status). */
  const byDate = useMemo(() => {
    const map: Record<string, Project[]> = {};
    for (const p of projects) {
      if (hidden.has(p.status)) continue;
      const ds = p.due_date ?? p.start_date;
      if (!ds) continue;
      const k = keyOf(parseDate(ds));
      (map[k] ??= []).push(p);
    }
    return map;
  }, [projects, hidden]);

  const eventsOn = (d: Date) => byDate[keyOf(d)] ?? [];

  const upcoming = useMemo(() =>
    projects
      .filter(p => !hidden.has(p.status) && p.due_date && parseDate(p.due_date) >= today)
      .sort((a, b) => parseDate(a.due_date!).getTime() - parseDate(b.due_date!).getTime())
      .slice(0, 5),
  [projects, hidden]); // eslint-disable-line react-hooks/exhaustive-deps

  function shift(dir: -1 | 1) {
    if (view === "Dia")    setCursor(c => addDays(c, dir));
    else if (view === "Semana") setCursor(c => addDays(c, dir * 7));
    else if (view === "Mês")    setCursor(c => addMonths(c, dir));
    else setCursor(c => new Date(c.getFullYear() + dir, c.getMonth(), 1));
  }
  function goToday() { setCursor(new Date(today.getFullYear(), today.getMonth(), today.getDate())); }
  function toggleStatus(s: ProjectStatus) {
    setHidden(prev => { const n = new Set(prev); if (n.has(s)) n.delete(s); else n.add(s); return n; });
  }

  // ── Título do cabeçalho conforme a visão ──
  const title = (() => {
    if (view === "Dia") return `${cursor.getDate()} de ${MONTH_NAMES[cursor.getMonth()]} de ${cursor.getFullYear()}`;
    if (view === "Ano") return String(cursor.getFullYear());
    if (view === "Semana") {
      const s = startOfWeek(cursor), e = addDays(s, 6);
      const sameMonth = s.getMonth() === e.getMonth();
      return sameMonth
        ? `${s.getDate()} – ${e.getDate()} de ${MONTH_NAMES[s.getMonth()]} ${s.getFullYear()}`
        : `${s.getDate()} ${MONTH_SHORT[s.getMonth()]} – ${e.getDate()} ${MONTH_SHORT[e.getMonth()]} ${e.getFullYear()}`;
    }
    return `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`;
  })();

  const statusList = Object.entries(PROJECT_STATUSES) as [ProjectStatus, { label: string; color: string }][];

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>

      {/* ─────────── Painel esquerdo: mini-mês + fontes ─────────── */}
      <aside style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <MiniMonth cursor={cursor} today={today} byDate={byDate}
          onPick={(d) => { setCursor(d); setView("Dia"); }}
          onShiftMonth={(dir) => setCursor(c => addMonths(c, dir))} />

        <div className="hub-card" style={{ padding: "14px 16px" }}>
          <p style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Etapas
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {statusList.map(([key, st]) => {
              const on = !hidden.has(key);
              return (
                <button key={key} onClick={() => toggleStatus(key)}
                  style={{ display: "flex", alignItems: "center", gap: 9, padding: "5px 6px", borderRadius: "var(--r-sm)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: "left" }}>
                  <span style={{
                    width: 15, height: 15, borderRadius: 4, flexShrink: 0,
                    background: on ? st.color : "transparent",
                    border: `1.5px solid ${on ? st.color : "var(--border-2)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {on && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                  </span>
                  <span style={{ fontSize: "12.5px", fontWeight: 500, color: on ? "var(--text)" : "var(--text-faint)" }}>{st.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ─────────── Centro: cabeçalho + visão ─────────── */}
      <div className="hub-card" style={{ flex: 1, minWidth: 320, padding: 0, overflow: "hidden" }}>

        {/* Cabeçalho */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 18px", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{title}</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => shift(-1)} style={navBtn} aria-label="Anterior"><ChevronLeft size={15} /></button>
              <button onClick={() => shift(1)} style={navBtn} aria-label="Próximo"><ChevronRight size={15} /></button>
            </div>
            <button onClick={goToday} style={todayBtn}>Hoje</button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 3, gap: 2 }}>
              {(["Dia","Semana","Mês","Ano"] as ViewMode[]).map(v => (
                <button key={v} onClick={() => setView(v)}
                  style={{
                    padding: "5px 12px", borderRadius: 6, border: "none", fontFamily: "inherit",
                    fontSize: "12px", fontWeight: 600, cursor: "pointer",
                    background: view === v ? "var(--card-bg)" : "transparent",
                    color: view === v ? "var(--text)" : "var(--text-faint)",
                    boxShadow: view === v ? "var(--shadow-sm)" : "none",
                    transition: "background .15s, color .15s",
                  }}>
                  {v}
                </button>
              ))}
            </div>
            {isAdmin && (
              <Link href={`${basePath}/novo`} className="hub-btn hub-btn-primary hub-btn-sm" title="Novo projeto">
                <Plus size={14} />
              </Link>
            )}
          </div>
        </div>

        {view === "Mês"    && <MonthView    cursor={cursor} today={today} eventsOn={eventsOn} basePath={basePath} />}
        {view === "Semana" && <WeekView     cursor={cursor} today={today} eventsOn={eventsOn} basePath={basePath} />}
        {view === "Dia"    && <DayView      cursor={cursor} eventsOn={eventsOn} basePath={basePath} />}
        {view === "Ano"    && <YearView     cursor={cursor} today={today} byDate={byDate}
          onPickMonth={(m) => { setCursor(new Date(cursor.getFullYear(), m, 1)); setView("Mês"); }} />}
      </div>

      {/* ─────────── Painel direito: próximos + integrações ─────────── */}
      <aside style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="hub-card" style={{ padding: "16px" }}>
          <p style={{ margin: "0 0 12px", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Próximos prazos
          </p>
          {upcoming.length === 0 ? (
            <p style={{ margin: 0, fontSize: "12px", color: "var(--text-faint)", lineHeight: 1.5 }}>
              Nenhum projeto com prazo próximo.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {upcoming.map(p => {
                const st = PROJECT_STATUSES[p.status] ?? { color: "var(--primary)", label: p.status };
                const date = parseDate(p.due_date!).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
                return (
                  <Link key={p.id} href={`${basePath}/${p.id}`} style={{ textDecoration: "none", display: "flex", gap: 8, alignItems: "stretch" }}>
                    <span style={{ width: 3, borderRadius: 99, background: st.color, flexShrink: 0 }} />
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text)", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
                      <span style={{ display: "block", fontSize: "11px", color: "var(--text-faint)" }}>{date} · {st.label}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="hub-card" style={{ padding: "16px" }}>
          <p style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Integrar calendário
          </p>
          {["Google Calendar", "Outlook", "Apple Calendar"].map((cal, i, arr) => (
            <div key={cal} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CalendarDays size={13} style={{ color: "var(--text-faint)" }} />
                <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{cal}</span>
              </span>
              <a href="/api/calendar" style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--primary)", textDecoration: "none" }}>
                Exportar
              </a>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

/* ═══════════════════════════ Visões ═══════════════════════════ */

function EventPill({ p, basePath, block }: { p: Project; basePath: string; block?: boolean }) {
  const st = PROJECT_STATUSES[p.status] ?? { color: "var(--primary)", label: p.status };
  return (
    <Link href={`${basePath}/${p.id}`} title={`${p.title} · ${st.label}`}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        fontSize: "11px", fontWeight: 600, color: "var(--text)",
        borderRadius: 5, padding: block ? "5px 8px" : "2px 6px",
        textDecoration: "none",
        background: `color-mix(in srgb, ${st.color} 16%, transparent)`,
        borderLeft: `2px solid ${st.color}`,
        overflow: "hidden",
      }}>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
    </Link>
  );
}

function MonthView({ cursor, today, eventsOn, basePath }: {
  cursor: Date; today: Date; eventsOn: (d: Date) => Project[]; basePath: string;
}) {
  const y = cursor.getFullYear(), m = cursor.getMonth();
  const first = new Date(y, m, 1);
  const gridStart = startOfWeek(first);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const rows = cells.some((_, i) => i >= 35 && cells[i].getMonth() === m) ? 6 : 5;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: "1px solid var(--border)" }}>
        {WEEK_DAYS.map(wd => (
          <div key={wd} style={{ padding: "8px 4px", textAlign: "center", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)" }}>{wd}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
        {cells.slice(0, rows * 7).map((d, idx) => {
          const inMonth = d.getMonth() === m;
          const isToday = sameDay(d, today);
          const evs = eventsOn(d);
          const lastCol = idx % 7 === 6;
          const lastRow = Math.floor(idx / 7) === rows - 1;
          return (
            <div key={idx} style={{
              minHeight: 96, padding: "6px 7px",
              borderRight: lastCol ? "none" : "1px solid var(--border)",
              borderBottom: lastRow ? "none" : "1px solid var(--border)",
              background: isToday ? "color-mix(in srgb, var(--primary) 6%, transparent)" : "transparent",
              opacity: inMonth ? 1 : 0.4,
            }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 24, height: 24, borderRadius: "50%", marginBottom: 4,
                fontSize: "12px", fontWeight: isToday ? 800 : 500,
                color: isToday ? "#fff" : "var(--text-muted)",
                background: isToday ? "var(--primary)" : "transparent",
              }}>{d.getDate()}</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {evs.slice(0, 3).map(p => <EventPill key={p.id} p={p} basePath={basePath} />)}
                {evs.length > 3 && <span style={{ fontSize: "10px", color: "var(--text-faint)", paddingLeft: 4 }}>+{evs.length - 3} mais</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ cursor, today, eventsOn, basePath }: {
  cursor: Date; today: Date; eventsOn: (d: Date) => Project[]; basePath: string;
}) {
  const start = startOfWeek(cursor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", minHeight: 420 }}>
      {days.map((d, i) => {
        const isToday = sameDay(d, today);
        const evs = eventsOn(d);
        return (
          <div key={i} style={{ borderRight: i < 6 ? "1px solid var(--border)" : "none", display: "flex", flexDirection: "column" }}>
            <div style={{ textAlign: "center", padding: "10px 4px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-faint)" }}>{WEEK_DAYS[i]}</div>
              <div style={{
                margin: "4px auto 0", width: 28, height: 28, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontWeight: isToday ? 800 : 600,
                color: isToday ? "#fff" : "var(--text)",
                background: isToday ? "var(--primary)" : "transparent",
              }}>{d.getDate()}</div>
            </div>
            <div style={{ padding: "8px 6px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
              {evs.length === 0
                ? <span style={{ fontSize: "10.5px", color: "var(--text-faint)", textAlign: "center", marginTop: 8 }}>—</span>
                : evs.map(p => <EventPill key={p.id} p={p} basePath={basePath} block />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayView({ cursor, eventsOn, basePath }: {
  cursor: Date; eventsOn: (d: Date) => Project[]; basePath: string;
}) {
  const evs = eventsOn(cursor);
  return (
    <div style={{ padding: "20px 22px", minHeight: 420 }}>
      <p style={{ margin: "0 0 16px", fontSize: "13px", fontWeight: 700, color: "var(--text-muted)" }}>
        {WEEK_FULL[dowMon(cursor)]}
      </p>
      {evs.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", textAlign: "center", gap: 10 }}>
          <div className="hub-empty-icon"><CalendarDays size={22} /></div>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>Nenhum prazo neste dia</p>
          <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-faint)" }}>Os projetos com entrega nesta data aparecem aqui.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 640 }}>
          {evs.map(p => {
            const st = PROJECT_STATUSES[p.status] ?? { color: "var(--primary)", label: p.status };
            return (
              <Link key={p.id} href={`${basePath}/${p.id}`} className="hub-card-sm" style={{
                display: "flex", alignItems: "center", gap: 12, textDecoration: "none",
                borderLeft: `3px solid ${st.color}`,
              }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: st.color, flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
                  <span style={{ display: "block", fontSize: "11.5px", color: "var(--text-faint)" }}>{st.label}</span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function YearView({ cursor, today, byDate, onPickMonth }: {
  cursor: Date; today: Date; byDate: Record<string, Project[]>; onPickMonth: (m: number) => void;
}) {
  const y = cursor.getFullYear();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, padding: 18 }}>
      {Array.from({ length: 12 }, (_, m) => {
        const first = new Date(y, m, 1);
        const gridStart = startOfWeek(first);
        const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
        return (
          <button key={m} onClick={() => onPickMonth(m)} className="hub-card-sm" style={{ padding: "12px", cursor: "pointer", textAlign: "left", border: "1px solid var(--border)", background: "var(--card-bg)" }}>
            <div style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{MONTH_NAMES[m]}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1 }}>
              {WEEK_DAYS.map(wd => <span key={wd} style={{ fontSize: "8px", textAlign: "center", color: "var(--text-faint)", fontWeight: 700 }}>{wd[0]}</span>)}
              {cells.slice(0, 42).map((d, i) => {
                const inMonth = d.getMonth() === m;
                const isToday = sameDay(d, today);
                const has = inMonth && (byDate[keyOf(d)]?.length ?? 0) > 0;
                return (
                  <span key={i} style={{
                    fontSize: "8.5px", textAlign: "center", lineHeight: "13px", height: 13, borderRadius: 3,
                    color: !inMonth ? "transparent" : isToday ? "#fff" : has ? "var(--primary)" : "var(--text-muted)",
                    fontWeight: has || isToday ? 800 : 400,
                    background: isToday ? "var(--primary)" : "transparent",
                  }}>{inMonth ? d.getDate() : ""}</span>
                );
              })}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function MiniMonth({ cursor, today, byDate, onPick, onShiftMonth }: {
  cursor: Date; today: Date; byDate: Record<string, Project[]>;
  onPick: (d: Date) => void; onShiftMonth: (dir: -1 | 1) => void;
}) {
  const y = cursor.getFullYear(), m = cursor.getMonth();
  const gridStart = startOfWeek(new Date(y, m, 1));
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  return (
    <div className="hub-card" style={{ padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text)" }}>{MONTH_NAMES[m]} {y}</span>
        <div style={{ display: "flex", gap: 2 }}>
          <button onClick={() => onShiftMonth(-1)} style={miniNav} aria-label="Mês anterior"><ChevronLeft size={13} /></button>
          <button onClick={() => onShiftMonth(1)} style={miniNav} aria-label="Próximo mês"><ChevronRight size={13} /></button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1 }}>
        {WEEK_DAYS.map(wd => <span key={wd} style={{ fontSize: "9px", textAlign: "center", color: "var(--text-faint)", fontWeight: 700, paddingBottom: 3 }}>{wd[0]}</span>)}
        {cells.slice(0, 42).map((d, i) => {
          const inMonth = d.getMonth() === m;
          const isToday = sameDay(d, today);
          const has = inMonth && (byDate[keyOf(d)]?.length ?? 0) > 0;
          return (
            <button key={i} onClick={() => onPick(d)} style={{
              position: "relative", height: 24, borderRadius: 6, border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: "10.5px",
              fontWeight: isToday ? 800 : 500,
              color: !inMonth ? "var(--text-faint)" : isToday ? "#fff" : "var(--text)",
              background: isToday ? "var(--primary)" : "transparent",
              opacity: inMonth ? 1 : 0.45,
            }}>
              {d.getDate()}
              {has && !isToday && <span style={{ position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", width: 3, height: 3, borderRadius: "50%", background: "var(--primary)" }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const navBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  width: 28, height: 28, borderRadius: 7,
  background: "var(--surface-2)", border: "1px solid var(--border)",
  cursor: "pointer", color: "var(--text)",
};
const miniNav: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  width: 22, height: 22, borderRadius: 6,
  background: "transparent", border: "none", cursor: "pointer", color: "var(--text-faint)",
};
const todayBtn: React.CSSProperties = {
  fontSize: "12px", fontWeight: 600, padding: "5px 12px", borderRadius: 7,
  background: "var(--surface-2)", border: "1px solid var(--border)",
  cursor: "pointer", color: "var(--text-muted)", fontFamily: "inherit",
};
