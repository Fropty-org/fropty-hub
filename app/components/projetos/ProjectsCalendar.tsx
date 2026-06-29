"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import type { Project } from "@/app/lib/types/projects";
import { PROJECT_STATUSES } from "@/app/lib/constants/projects";

interface Props { projects: Project[] }

const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MONTH_NAMES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

type ViewMode = "Dia" | "Semana" | "Mês" | "Ano";

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getDow(y: number, m: number, d: number) { const x = new Date(y, m, d).getDay(); return x === 0 ? 6 : x - 1; }

export function ProjectsCalendar({ projects }: Props) {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view,  setView]  = useState<ViewMode>("Mês");

  function prev() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function next() { if (month === 11) { setMonth(0);  setYear(y => y + 1); } else setMonth(m => m + 1); }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDow    = getDow(year, month, 1);
  const rows        = Math.ceil((firstDow + daysInMonth) / 7);

  const projectsByDay: Record<number, Project[]> = {};
  for (const p of projects) {
    const ds = p.due_date ?? p.start_date;
    if (!ds) continue;
    const d = new Date(ds);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!projectsByDay[day]) projectsByDay[day] = [];
      projectsByDay[day].push(p);
    }
  }

  // Upcoming events (next 5)
  const upcoming = projects
    .filter(p => p.due_date && new Date(p.due_date) >= today)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

      {/* Main calendar */}
      <div style={{ flex: 1, background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, overflow: "hidden" }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderBottom: "1px solid var(--border)",
        }}>
          {/* Month + nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", minWidth: 160 }}>
              {MONTH_NAMES[month]} {year}
            </span>
            <button onClick={prev} style={navBtn}><ChevronLeft size={14} /></button>
            <button onClick={next} style={navBtn}><ChevronRight size={14} /></button>
            <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }} style={todayBtn}>
              Hoje
            </button>
          </div>

          {/* View toggle */}
          <div style={{ display: "flex", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 3, gap: 2 }}>
            {(["Dia","Semana","Mês","Ano"] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "5px 12px", borderRadius: 6, border: "none", fontFamily: "inherit",
                  fontSize: "12px", fontWeight: 600, cursor: "pointer",
                  background: view === v ? "var(--card-bg)" : "transparent",
                  color: view === v ? "var(--text)" : "var(--text-faint)",
                  boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Weekday headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: "1px solid var(--border)" }}>
          {WEEK_DAYS.map(wd => (
            <div key={wd} style={{
              padding: "8px 4px", textAlign: "center",
              fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.06em", color: "var(--text-faint)",
            }}>
              {wd}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
          {Array.from({ length: rows * 7 }).map((_, idx) => {
            const day     = idx - firstDow + 1;
            const isValid = day >= 1 && day <= daysInMonth;
            const isToday = isValid && `${year}-${month}-${day}` === todayKey;
            const dayProjects = isValid ? (projectsByDay[day] ?? []) : [];
            const isLastRow   = Math.floor(idx / 7) === rows - 1;
            const isLastCol   = idx % 7 === 6;

            return (
              <div
                key={idx}
                style={{
                  minHeight: 90, padding: "6px 8px",
                  borderRight: isLastCol ? "none" : "1px solid var(--border)",
                  borderBottom: isLastRow ? "none" : "1px solid var(--border)",
                  background: isToday ? "rgba(99,102,241,0.04)" : "transparent",
                }}
              >
                {isValid && (
                  <>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 24, height: 24, borderRadius: "50%",
                      fontSize: "12px", fontWeight: isToday ? 800 : 500,
                      color: isToday ? "#fff" : "var(--text-muted)",
                      background: isToday ? "var(--primary)" : "transparent",
                      marginBottom: 4,
                    }}>
                      {day}
                    </span>

                    {/* Events as colored blocks (Preline style) */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {dayProjects.slice(0, 3).map(p => {
                        const st = PROJECT_STATUSES[p.status] ?? { color: "#6366f1", label: p.status };
                        return (
                          <Link
                            key={p.id}
                            href={`/portal/projetos/${p.id}`}
                            title={p.title}
                            style={{
                              display: "block", fontSize: "10.5px", fontWeight: 600,
                              color: "#fff", borderRadius: 4,
                              padding: "2px 6px", textDecoration: "none",
                              background: st.color,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}
                          >
                            {p.title}
                          </Link>
                        );
                      })}
                      {dayProjects.length > 3 && (
                        <span style={{ fontSize: "10px", color: "var(--text-faint)", paddingLeft: 4 }}>
                          +{dayProjects.length - 3} mais
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Side panel */}
      <div style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: "16px" }}>
          {upcoming.length === 0 ? (
            <>
              <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>
                Sem próximos prazos
              </p>
              <p style={{ margin: 0, fontSize: "11.5px", color: "var(--text-faint)", lineHeight: 1.5 }}>
                Nenhum projeto com prazo próximo.
              </p>
            </>
          ) : (
            <>
              <p style={{ margin: "0 0 12px", fontSize: "12px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Próximos prazos
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {upcoming.map(p => {
                  const st   = PROJECT_STATUSES[p.status] ?? { color: "#6366f1", label: p.status };
                  const date = new Date(p.due_date!).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
                  return (
                    <Link key={p.id} href={`/portal/projetos/${p.id}`} style={{ textDecoration: "none" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <div style={{ width: 3, height: "100%", minHeight: 32, borderRadius: 99, background: st.color, flexShrink: 0 }} />
                        <div>
                          <p style={{ margin: "0 0 2px", fontSize: "12px", fontWeight: 600, color: "var(--text)", lineHeight: 1.3 }}>
                            {p.title}
                          </p>
                          <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>{date}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: "16px" }}>
          <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Integrar calendário
          </p>
          {["Google Calendar", "Outlook", "Apple Calendar"].map(cal => (
            <div key={cal} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CalendarDays size={13} style={{ color: "var(--text-faint)" }} />
                <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{cal}</span>
              </div>
              <button style={{
                fontSize: "10.5px", fontWeight: 700, color: "var(--primary)",
                background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
              }}>
                Conectar
              </button>
            </div>
          ))}
        </div>
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
const todayBtn: React.CSSProperties = {
  fontSize: "12px", fontWeight: 600, padding: "5px 12px", borderRadius: 7,
  background: "var(--surface-2)", border: "1px solid var(--border)",
  cursor: "pointer", color: "var(--text-muted)", fontFamily: "inherit",
};
