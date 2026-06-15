import type { Metadata } from "next";
import { createClient } from "@/app/lib/supabase/server";

export const metadata: Metadata = { title: "Auditoria — Admin" };

const ACTION_LABEL: Record<string, string> = {
  credit_tokens:  "Crédito de tokens",
  create_project: "Projeto criado",
  update_project: "Projeto atualizado",
  update_role:    "Role alterada",
};

export default async function AdminAuditPage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("admin_audit_log")
    .select("*, profiles:admin_id(name)")
    .order("created_at", { ascending: false })
    .limit(200);

  const list = logs ?? [];

  return (
    <div style={{ padding: "40px 32px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)" }}>
          Auditoria
        </h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>
          Últimas {list.length} ações administrativas
        </p>
      </div>

      <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "180px 1fr 120px 160px",
            padding: "12px 20px",
            borderBottom: "1px solid var(--border)",
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--text-faint)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <span>Data</span>
          <span>Ação</span>
          <span>Admin</span>
          <span>Alvo</span>
        </div>

        {list.map((log, i) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const adminName = (log.profiles as any)?.name ?? log.admin_id.slice(0, 8);
          const date = new Date(log.created_at).toLocaleString("pt-BR", {
            day: "2-digit", month: "2-digit", year: "2-digit",
            hour: "2-digit", minute: "2-digit",
          });
          const label = ACTION_LABEL[log.action] ?? log.action;

          return (
            <div
              key={log.id}
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr 120px 160px",
                padding: "13px 20px",
                borderBottom: i < list.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center",
                fontSize: "13px",
                gap: 8,
              }}
            >
              <span style={{ color: "var(--text-faint)", fontSize: "12px", fontVariantNumeric: "tabular-nums" }}>
                {date}
              </span>
              <div>
                <p style={{ margin: "0 0 2px", fontWeight: 700, color: "var(--text)" }}>{label}</p>
                {log.metadata && (
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)", fontFamily: "monospace" }}>
                    {JSON.stringify(log.metadata).slice(0, 80)}
                  </p>
                )}
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>{adminName}</span>
              <span style={{ fontSize: "11px", color: "var(--text-faint)", fontFamily: "monospace" }}>
                {log.target_type && `${log.target_type}: `}
                {log.target_id?.slice(0, 12) ?? "—"}
              </span>
            </div>
          );
        })}

        {list.length === 0 && (
          <p style={{ padding: "40px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px", margin: 0 }}>
            Nenhuma ação registrada ainda.
          </p>
        )}
      </div>
    </div>
  );
}
