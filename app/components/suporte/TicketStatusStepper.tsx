import { Check } from "lucide-react";

/**
 * Stepper horizontal da jornada do chamado: Aberto → Em andamento → Resolvido
 * → Fechado. Reaberto volta ao estágio "Aberto" com destaque.
 */
const STAGES = [
  { key: "aberto",       label: "Aberto" },
  { key: "em_andamento", label: "Em andamento" },
  { key: "resolvido",    label: "Resolvido" },
  { key: "fechado",      label: "Fechado" },
];

function stageIndex(status: string): number {
  switch (status) {
    case "aberto":
    case "reaberto":     return 0;
    case "em_andamento": return 1;
    case "resolvido":    return 2;
    case "fechado":      return 3;
    default:             return 0;
  }
}

export function TicketStatusStepper({ status }: { status: string }) {
  const current = stageIndex(status);
  const reopened = status === "reaberto";
  const accent = reopened ? "var(--c-warning)" : "var(--primary)";

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 0, marginTop: 16 }}>
      {STAGES.map((s, i) => {
        const done    = i < current;
        const active  = i === current;
        const color   = done || active ? accent : "var(--border-strong, var(--border))";
        const textCol = done || active ? "var(--text)" : "var(--text-faint)";
        return (
          <div key={s.key} style={{ display: "flex", alignItems: "flex-start", flex: i < STAGES.length - 1 ? 1 : "0 0 auto", minWidth: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? accent : active ? `color-mix(in srgb, ${accent} 16%, transparent)` : "var(--surface-2)",
                border: `2px solid ${color}`,
                color: done ? "#fff" : active ? accent : "var(--text-faint)",
                fontSize: "11px", fontWeight: 800,
              }}>
                {done ? <Check size={13} /> : i + 1}
              </div>
              <span style={{ fontSize: "10.5px", fontWeight: active ? 700 : 500, color: textCol, whiteSpace: "nowrap" }}>
                {active && reopened ? "Reaberto" : s.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div style={{ flex: 1, height: 2, marginTop: 11, background: i < current ? accent : "var(--border)", borderRadius: 2, minWidth: 16 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
