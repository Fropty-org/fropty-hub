import type { Metadata } from "next";
import Link from "next/link";
import { getClientFeedbacks } from "@/app/actions/feedback";
import { Plus, MessageSquarePlus } from "lucide-react";
import type { Feedback, FeedbackType, FeedbackStatus } from "@/app/lib/types/feedback";

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
  bug:      "#ef4444",
  elogio:   "#22c55e",
  critica:  "#EF9F27",
  outro:    "var(--text-faint)",
};

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  recebido:      "Recebido",
  em_analise:    "Em Análise",
  aprovado:      "Aprovado",
  descartado:    "Descartado",
  implementado:  "Implementado",
};

const STATUS_COLOR: Record<FeedbackStatus, string> = {
  recebido:     "var(--text-faint)",
  em_analise:   "#EF9F27",
  aprovado:     "var(--primary)",
  descartado:   "#ef4444",
  implementado: "#22c55e",
};

export default async function FeedbackPage() {
  const feedbacks = await getClientFeedbacks();

  return (
    <div style={{ padding: "40px 32px", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, gap: 16, flexWrap: "wrap" }}>
        <div>
          <p style={{ color: "var(--text-faint)", fontSize: "13px", margin: "0 0 4px" }}>Portal</p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, color: "var(--text)" }}>
            Feedback
          </h1>
        </div>
        <Link
          href="/portal/feedback/novo"
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "var(--primary)", color: "#fff",
            padding: "9px 18px", borderRadius: 10,
            fontSize: "13px", fontWeight: 700, textDecoration: "none",
          }}
        >
          <Plus size={15} /> Enviar Feedback
        </Link>
      </div>

      {feedbacks.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 24px",
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 14,
        }}>
          <MessageSquarePlus size={40} style={{ color: "var(--text-faint)", marginBottom: 12 }} />
          <p style={{ margin: "0 0 8px", fontWeight: 700, color: "var(--text)" }}>Nenhum feedback enviado</p>
          <p style={{ margin: "0 0 20px", fontSize: "13px", color: "var(--text-faint)" }}>
            Compartilhe sugestões, problemas ou elogios sobre nossos serviços.
          </p>
          <Link href="/portal/feedback/novo" style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "var(--primary)", color: "#fff",
            padding: "9px 18px", borderRadius: 10,
            fontSize: "13px", fontWeight: 700, textDecoration: "none",
          }}>
            <Plus size={15} /> Enviar Feedback
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {feedbacks.map((fb) => (
            <FeedbackCard key={fb.id} feedback={fb} />
          ))}
        </div>
      )}
    </div>
  );
}

function FeedbackCard({ feedback }: { feedback: Feedback }) {
  const type   = feedback.type   as FeedbackType;
  const status = feedback.status as FeedbackStatus;

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 14, padding: "18px 20px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{
            fontSize: "11px", fontWeight: 700, padding: "3px 8px",
            borderRadius: 6,
            background: `color-mix(in srgb, ${TYPE_COLOR[type]} 15%, transparent)`,
            color: TYPE_COLOR[type],
          }}>
            {TYPE_LABEL[type] ?? type}
          </span>
          {feedback.product && (
            <span style={{
              fontSize: "11px", fontWeight: 600, padding: "3px 8px",
              borderRadius: 6, background: "var(--surface-2)",
              border: "1px solid var(--border)", color: "var(--text-faint)",
            }}>
              {feedback.product}
            </span>
          )}
        </div>
        <span style={{
          fontSize: "11px", fontWeight: 700, padding: "3px 8px",
          borderRadius: 6,
          background: `color-mix(in srgb, ${STATUS_COLOR[status]} 15%, transparent)`,
          color: STATUS_COLOR[status],
        }}>
          {STATUS_LABEL[status] ?? status}
        </span>
      </div>

      <h3 style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>
        {feedback.title}
      </h3>
      <p style={{ margin: "0 0 8px", fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
        {feedback.description}
      </p>

      {feedback.admin_response && (
        <div style={{
          marginTop: 12, padding: "12px 14px",
          background: "rgba(91,87,232,0.08)", borderRadius: 10,
          borderLeft: "3px solid var(--primary)",
        }}>
          <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 700, color: "var(--primary)" }}>
            Resposta da equipe Fropty
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
            {feedback.admin_response}
          </p>
        </div>
      )}

      <p style={{ margin: "10px 0 0", fontSize: "11px", color: "var(--text-faint)" }}>
        {new Date(feedback.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
      </p>
    </div>
  );
}
