import type { Metadata } from "next";
import Link from "next/link";
import { getClientFeedbacks } from "@/app/actions/feedback";
import { Plus, ChevronRight } from "lucide-react";
import type { Feedback, FeedbackType, FeedbackStatus } from "@/app/lib/types/feedback";
import { HubEmptyState } from "@/app/components/ui/HubEmptyState";

export const metadata: Metadata = { title: "Feedback" };

const TYPE_LABEL: Record<FeedbackType, string> = {
  sugestao: "Sugestão",
  bug:      "Bug",
  elogio:   "Elogio",
  critica:  "Crítica",
  outro:    "Outro",
};
const TYPE_COLOR: Record<FeedbackType, string> = {
  sugestao: "var(--primary)",
  bug:      "var(--c-danger)",
  elogio:   "var(--c-success)",
  critica:  "var(--brand-accent)",
  outro:    "var(--text-faint)",
};
const STATUS_LABEL: Record<FeedbackStatus, string> = {
  recebido:     "Recebido",
  em_analise:   "Em Análise",
  aprovado:     "Aprovado",
  descartado:   "Descartado",
  implementado: "Implementado",
};
const STATUS_COLOR: Record<FeedbackStatus, string> = {
  recebido:     "var(--text-faint)",
  em_analise:   "var(--brand-accent)",
  aprovado:     "var(--primary)",
  descartado:   "var(--c-danger)",
  implementado: "var(--c-success)",
};

function hexOf(cssVar: string): string {
  const map: Record<string, string> = {
    "var(--primary)":       "#5B57E8",
    "var(--c-danger)":      "#DC2626",
    "var(--c-success)":     "#16a34a",
    "var(--brand-accent)":  "#EF9F27",
    "var(--text-faint)":    "#aaaaaa",
  };
  return map[cssVar] ?? "#aaaaaa";
}

export default async function FeedbackPage() {
  const feedbacks = await getClientFeedbacks();

  return (
    <div style={{ padding: "24px 24px", maxWidth: 1020, margin: "0 auto" }}>

      {/* ── Page header ── */}
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        gap: 16, marginBottom: 28, flexWrap: "wrap",
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>
            Feedback
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: "13px", color: "var(--text-faint)" }}>
            Sugestões, problemas e elogios sobre os serviços Fropty
          </p>
        </div>
        <Link
          href="/portal/feedback/novo"
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "var(--cta-bg)", color: "var(--cta-text)",
            borderRadius: "var(--r-md)", padding: "9px 18px",
            fontSize: "13px", fontWeight: 700, textDecoration: "none",
            boxShadow: "var(--shadow-brand)",
          }}
        >
          <Plus size={14} /> Enviar feedback
        </Link>
      </div>

      {feedbacks.length === 0 ? (
        <div className="hub-card">
          <HubEmptyState variant="feedback" />
        </div>
      ) : (
        <div className="hub-card" style={{ overflow: "hidden" }}>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>
              {feedbacks.length} feedback{feedbacks.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 100px 110px 120px 32px",
            padding: "9px 20px",
            background: "var(--surface-2)", borderBottom: "1px solid var(--border)",
            fontSize: "11px", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-faint)",
          }}>
            <span>Título</span>
            <span>Tipo</span>
            <span>Status</span>
            <span style={{ textAlign: "right" }}>Data</span>
            <span />
          </div>

          {feedbacks.map((fb, i) => {
            const type   = fb.type   as FeedbackType;
            const status = fb.status as FeedbackStatus;
            const tc = hexOf(TYPE_COLOR[type]);
            const sc = hexOf(STATUS_COLOR[status]);

            return (
              <div key={fb.id}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 100px 110px 120px 32px",
                  padding: "13px 20px", alignItems: "center",
                  borderBottom: "1px solid var(--border)",
                }}>
                  {/* Título */}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {fb.title}
                    </p>
                    {fb.product && (
                      <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>{fb.product}</span>
                    )}
                  </div>

                  {/* Tipo */}
                  <span style={{
                    fontSize: "11px", fontWeight: 700, color: tc,
                    background: `${tc}18`, border: `1px solid ${tc}28`,
                    borderRadius: "var(--r-full)", padding: "3px 9px",
                    whiteSpace: "nowrap", display: "inline-block",
                  }}>
                    {TYPE_LABEL[type] ?? type}
                  </span>

                  {/* Status */}
                  <span style={{
                    fontSize: "11px", fontWeight: 700, color: sc,
                    background: `${sc}18`, border: `1px solid ${sc}28`,
                    borderRadius: "var(--r-full)", padding: "3px 9px",
                    whiteSpace: "nowrap", display: "inline-block",
                  }}>
                    {STATUS_LABEL[status] ?? status}
                  </span>

                  {/* Data */}
                  <span style={{ fontSize: "12px", color: "var(--text-faint)", textAlign: "right" }}>
                    {new Date(fb.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </span>

                  <ChevronRight size={14} style={{ color: "var(--text-faint)" }} />
                </div>

                {/* Resposta da equipe — inline abaixo da linha */}
                {fb.admin_response && (
                  <div style={{
                    margin: "0 20px 12px", padding: "11px 14px",
                    background: "rgba(91,87,232,0.06)", borderRadius: "var(--r-md)",
                    borderLeft: "3px solid var(--primary)",
                  }}>
                    <p style={{ margin: "0 0 3px", fontSize: "11px", fontWeight: 700, color: "var(--primary)" }}>
                      Resposta da equipe Fropty
                    </p>
                    <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.55 }}>
                      {fb.admin_response}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
