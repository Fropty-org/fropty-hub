import type { Database } from "@/app/lib/supabase/types";

type EventRow = Database["public"]["Tables"]["project_events"]["Row"];

interface Props {
  events: EventRow[];
}

const SOURCE_STYLE: Record<string, { color: string; icon: string; label: string }> = {
  github: { color: "#e2e8f0", icon: "ti-brand-github", label: "GitHub" },
  vercel: { color: "#3b82f6", icon: "ti-brand-vercel", label: "Vercel" },
  fropty: { color: "var(--primary)", icon: "ti-sparkles",    label: "Fropty" },
};

export function EventTimeline({ events }: Props) {
  if (events.length === 0) {
    return (
      <div style={{ padding: "32px 24px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px" }}>
        <i className="ti ti-history" style={{ fontSize: 28, display: "block", marginBottom: 8 }} />
        Nenhum evento registrado ainda.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {events.map((ev, i) => {
        const src     = SOURCE_STYLE[ev.source] ?? SOURCE_STYLE.fropty;
        const date    = new Date(ev.created_at);
        const isLast  = i === events.length - 1;

        return (
          <div key={ev.id} style={{ display: "flex", gap: 14, position: "relative" }}>
            {/* Linha vertical */}
            {!isLast && (
              <div style={{ position: "absolute", left: 15, top: 32, bottom: 0, width: 1, background: "var(--border)" }} />
            )}

            {/* Ícone */}
            <div style={{ flexShrink: 0, zIndex: 1 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${src.color}15`, border: `1px solid ${src.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className={`ti ${src.icon}`} style={{ fontSize: 14, color: src.color }} />
              </div>
            </div>

            {/* Conteúdo */}
            <div style={{ flex: 1, paddingBottom: isLast ? 0 : 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text)", flex: 1 }}>{ev.title}</p>
                <span style={{ fontSize: "11px", color: "var(--text-faint)", flexShrink: 0 }}>
                  {date.toLocaleDateString("pt-BR")} {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {ev.actor && (
                <p style={{ margin: "0 0 3px", fontSize: "11px", color: "var(--text-faint)" }}>
                  <i className="ti ti-user" style={{ fontSize: 11 }} /> {ev.actor}
                </p>
              )}

              {ev.body && (
                <p style={{ margin: "0 0 4px", fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.45, whiteSpace: "pre-wrap", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                  {ev.body}
                </p>
              )}

              {ev.url && (
                <a href={ev.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: src.color, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <i className="ti ti-external-link" style={{ fontSize: 11 }} /> Ver detalhes
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
