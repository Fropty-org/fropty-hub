import { computeSla, type SlaState } from "@/app/lib/constants/sla";
import type { TicketPriority } from "@/app/lib/constants/status";
import { Gauge, Clock, ClipboardList, type LucideIcon } from "lucide-react";

interface Props {
  priority:        TicketPriority;
  createdAt:       string;
  firstResponseAt: string | null;
  resolvedAt:      string | null;
  status:          string;
}

function barColor(s: SlaState): string {
  if (s.done) return s.breached ? "#ef4444" : "#22c55e";
  if (s.breached) return "#ef4444";
  if (s.ratio >= 0.75) return "#EF9F27";
  return "#3b82f6";
}

function statusText(s: SlaState): string {
  if (s.done) return s.breached ? "Fora do prazo" : "No prazo";
  if (s.breached) return "Estourado";
  if (s.ratio >= 0.75) return "Em risco";
  return "Dentro do prazo";
}

function Bar({ title, Icon, s }: { title: string; Icon: LucideIcon; s: SlaState }) {
  const color = barColor(s);
  const pct = Math.min(100, Math.round(s.ratio * 100));
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon size={14} style={{ color }} /> {title}
        </span>
        <span style={{ fontSize: "11px", fontWeight: 700, color }}>{statusText(s)}</span>
      </div>
      <div style={{ height: 8, background: "var(--surface-2)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.max(3, pct)}%`, background: color, borderRadius: 99, transition: "width 0.3s" }} />
      </div>
      <p style={{ margin: "5px 0 0", fontSize: "11px", color: "var(--text-faint)" }}>
        {s.done ? "Concluído em " : "Decorrido "} {s.label}
      </p>
    </div>
  );
}

export function SlaBars({ priority, createdAt, firstResponseAt, resolvedAt, status }: Props) {
  const { response, resolution } = computeSla({ priority, createdAt, firstResponseAt, resolvedAt, status });

  return (
    <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16, padding: "20px 22px", marginBottom: 20 }}>
      <p style={{ margin: "0 0 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        <Gauge size={14} style={{ marginRight: 6 }} />
        SLA — prioridade {priority}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
        <Bar title="Tempo de resposta" Icon={Clock} s={response} />
        {resolution
          ? <Bar title="Tempo de resolução" Icon={ClipboardList} s={resolution} />
          : (
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <ClipboardList size={14} style={{ color: "var(--text-faint)" }} /> Tempo de resolução
              </span>
              <p style={{ margin: "8px 0 0", fontSize: "11px", color: "var(--text-faint)" }}>Inicia quando o chamado entrar em atendimento.</p>
            </div>
          )}
      </div>
    </div>
  );
}
