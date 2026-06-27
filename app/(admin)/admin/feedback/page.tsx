import type { Metadata } from "next";
import Link from "next/link";
import { getAllFeedbacksAdmin } from "@/app/actions/feedback";
import type { FeedbackType, FeedbackStatus } from "@/app/lib/types/feedback";

export const metadata: Metadata = { title: "Feedback — Admin" };

const TYPE_LABEL: Record<FeedbackType, string> = {
  sugestao: "Sugestão", bug: "Bug", elogio: "Elogio", critica: "Crítica", outro: "Outro",
};

const TYPE_COLOR: Record<FeedbackType, string> = {
  sugestao: "var(--primary)", bug: "#ef4444", elogio: "#22c55e", critica: "#EF9F27", outro: "var(--text-faint)",
};

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  recebido: "Recebido", em_analise: "Em Análise", aprovado: "Aprovado", descartado: "Descartado", implementado: "Implementado",
};

const STATUS_COLOR: Record<FeedbackStatus, string> = {
  recebido: "var(--text-faint)", em_analise: "#EF9F27", aprovado: "var(--primary)", descartado: "#ef4444", implementado: "#22c55e",
};

export default async function AdminFeedbackPage() {
  const feedbacks = await getAllFeedbacksAdmin();

  return (
    <div style={{ padding: "40px 32px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: "var(--text-faint)", fontSize: "13px", margin: "0 0 4px" }}>Admin</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, color: "var(--text)" }}>Feedback</h1>
      </div>

      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 14, overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Cliente", "Tipo", "Título", "Produto", "Status", "Data"].map((h) => (
                <th key={h} style={{
                  padding: "12px 16px", textAlign: "left",
                  fontSize: "11px", fontWeight: 700,
                  color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {feedbacks.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px" }}>
                  Nenhum feedback recebido.
                </td>
              </tr>
            ) : feedbacks.map((fb, idx) => {
              const type   = fb.type   as FeedbackType;
              const status = fb.status as FeedbackStatus;
              return (
                <tr key={fb.id} style={{ borderBottom: idx < feedbacks.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td style={{ padding: "13px 16px", fontSize: "13px", color: "var(--text-muted)" }}>
                    {fb.client_name ?? "—"}
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{
                      fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                      background: `color-mix(in srgb, ${TYPE_COLOR[type]} 15%, transparent)`,
                      color: TYPE_COLOR[type],
                    }}>
                      {TYPE_LABEL[type] ?? type}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <Link href={`/admin/feedback/${fb.id}`} style={{
                      fontSize: "13px", fontWeight: 600, color: "var(--text)", textDecoration: "none",
                    }}>
                      {fb.title}
                    </Link>
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: "13px", color: "var(--text-faint)" }}>
                    {fb.product || "—"}
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{
                      fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                      background: `color-mix(in srgb, ${STATUS_COLOR[status]} 15%, transparent)`,
                      color: STATUS_COLOR[status],
                    }}>
                      {STATUS_LABEL[status] ?? status}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: "12px", color: "var(--text-faint)" }}>
                    {new Date(fb.created_at).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
