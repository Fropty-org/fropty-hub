import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { TICKET_STATUS_MAP, TICKET_PRIORITY_MAP } from "@/app/lib/constants/status";
import { updateTicketStatus } from "@/app/actions/dev";
import type { TicketStatus, TicketPriority } from "@/app/lib/types/cliente";

export const metadata: Metadata = { title: "Fila de Tickets — Dev" };

export default async function DevTasksPage() {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("tickets")
    .select("*, profiles:client_id(name), projects:project_id(name)")
    .in("status", ["aberto", "em_andamento"])
    .order("priority", { ascending: false })
    .order("created_at", { ascending: true });

  const tickets = rows ?? [];

  return (
    <div style={{ padding: "40px 32px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)" }}>
          Fila de Tickets
        </h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>
          {tickets.length} chamado{tickets.length !== 1 ? "s" : ""} em aberto
        </p>
      </div>

      {tickets.length === 0 ? (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16, padding: "60px 24px", textAlign: "center" }}>
          <i className="ti ti-mood-happy" style={{ fontSize: 40, color: "#22c55e", display: "block", marginBottom: 12 }} />
          <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "15px" }}>Nenhum ticket pendente. Tudo em dia!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tickets.map((t) => {
            const statusInfo   = TICKET_STATUS_MAP[t.status as TicketStatus];
            const priorityInfo = TICKET_PRIORITY_MAP[t.priority as TicketPriority];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const clientName   = (t.profiles as any)?.name ?? "—";
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const projectName  = (t.projects as any)?.name;
            return (
              <div
                key={t.id}
                style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}
              >
                {/* Status + prioridade */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: `${statusInfo.color}18`, color: statusInfo.color, border: `1px solid ${statusInfo.color}30`, textAlign: "center" }}>
                    {statusInfo.label}
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: `${priorityInfo.color}15`, color: priorityInfo.color, border: `1px solid ${priorityInfo.color}25`, textAlign: "center" }}>
                    {priorityInfo.label}
                  </span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>{t.subject}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--text-faint)" }}>
                    {clientName} · {t.category}
                    {projectName && ` · ${projectName}`}
                  </p>
                </div>

                {/* Ações */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                  {t.status === "aberto" && (
                    <form action={async () => { "use server"; await updateTicketStatus(t.id, "em_andamento"); }}>
                      <button type="submit" style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)", color: "#22c55e", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        <i className="ti ti-play" /> Iniciar
                      </button>
                    </form>
                  )}
                  {t.status === "em_andamento" && (
                    <form action={async () => { "use server"; await updateTicketStatus(t.id, "resolvido"); }}>
                      <button type="submit" style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(91,87,232,0.3)", background: "rgba(91,87,232,0.08)", color: "var(--primary)", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        <i className="ti ti-check" /> Resolver
                      </button>
                    </form>
                  )}
                  <Link
                    href={`/dev/tasks/${t.id}`}
                    style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", fontSize: "12px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}
                  >
                    <i className="ti ti-message-circle" /> Responder
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contador de resolvidos */}
      <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
        <Link href="/dev/tasks?status=resolvido" style={{ fontSize: "13px", color: "var(--text-faint)", textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
          <i className="ti ti-history" /> Ver tickets resolvidos
        </Link>
      </div>
    </div>
  );
}
