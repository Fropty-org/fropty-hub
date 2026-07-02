import type { TicketPriority } from "@/app/lib/constants/status";

// Metas de SLA por prioridade, em horas (tempo corrido).
// - resposta:  da abertura até o chamado entrar em atendimento (em_andamento)
// - resolucao: do início do atendimento até o analista marcar como resolvido
export const SLA_TARGETS: Record<TicketPriority, { response: number; resolution: number }> = {
  alta:  { response: 4,  resolution: 24 },
  media: { response: 8,  resolution: 48 },
  baixa: { response: 24, resolution: 72 },
};

export interface SlaState {
  /** horas decorridas */
  elapsedH: number;
  /** meta em horas */
  targetH: number;
  /** 0..1+ (pode passar de 1 quando estoura) */
  ratio: number;
  /** já concluído (resposta dada / resolução feita) */
  done: boolean;
  /** estourou a meta */
  breached: boolean;
  label: string; // ex: "3h 20min / 4h"
}

function fmtH(hours: number): string {
  const totalMin = Math.max(0, Math.round(hours * 60));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function build(elapsedMs: number, targetH: number, done: boolean): SlaState {
  const elapsedH = elapsedMs / 3_600_000;
  const ratio = targetH > 0 ? elapsedH / targetH : 0;
  return {
    elapsedH,
    targetH,
    ratio,
    done,
    breached: ratio > 1,
    label: `${fmtH(elapsedH)} / ${fmtH(targetH)}`,
  };
}

interface SlaInput {
  priority: TicketPriority;
  createdAt: string;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  status: string;
  now?: number;
}

export type SlaSummaryTone = "ok" | "risk" | "breach" | "met" | "missed";

export interface SlaSummary {
  /** qual relógio está valendo agora */
  kind: "response" | "resolution";
  tone: SlaSummaryTone;
  /** texto curto para chip de lista, ex.: "Responder em 2h" / "SLA estourado" */
  label: string;
  /** chamado ainda aberto (relógio correndo) */
  running: boolean;
}

/**
 * Resume o SLA de um chamado em um único chip para listas:
 * enquanto aberto, mostra o relógio ativo (resposta → resolução) com prazo
 * restante; depois de resolvido/fechado, informa se as metas foram cumpridas.
 */
export function computeSlaSummary(input: SlaInput): SlaSummary {
  const { response, resolution } = computeSla(input);
  const closed = input.status === "resolvido" || input.status === "fechado";

  if (closed) {
    const missed = response.breached || (resolution?.breached ?? false);
    return {
      kind: resolution ? "resolution" : "response",
      tone: missed ? "missed" : "met",
      label: missed ? "SLA estourado" : "SLA cumprido",
      running: false,
    };
  }

  // Relógio ativo: resposta enquanto não houver primeiro atendimento; depois, resolução.
  const active = response.done && resolution ? resolution : response;
  const kind: SlaSummary["kind"] = active === response ? "response" : "resolution";
  const verb = kind === "response" ? "Responder" : "Resolver";

  if (active.breached) {
    return { kind, tone: "breach", label: "SLA estourado", running: true };
  }
  const remaining = fmtH(active.targetH - active.elapsedH);
  return {
    kind,
    tone: active.ratio >= 0.75 ? "risk" : "ok",
    label: `${verb} em ${remaining}`,
    running: true,
  };
}

/** Calcula o estado das duas barras de SLA (resposta e resolução). */
export function computeSla({ priority, createdAt, firstResponseAt, resolvedAt, status, now = Date.now() }: SlaInput) {
  const target = SLA_TARGETS[priority] ?? SLA_TARGETS.media;

  // Resposta: created_at → first_response_at (ou agora, se ainda não respondido)
  const created = new Date(createdAt).getTime();
  const responseEnd = firstResponseAt ? new Date(firstResponseAt).getTime() : now;
  const response = build(responseEnd - created, target.response, !!firstResponseAt);

  // Resolução: só começa quando há primeiro atendimento.
  let resolution: SlaState | null = null;
  if (firstResponseAt) {
    const start = new Date(firstResponseAt).getTime();
    // Em "reaberto"/"em_andamento" o relógio corre; resolvido/fechado congela em resolved_at
    const end = resolvedAt ? new Date(resolvedAt).getTime() : now;
    resolution = build(end - start, target.resolution, !!resolvedAt && (status === "resolvido" || status === "fechado"));
  }

  return { response, resolution };
}
