import type { Metadata } from "next";
import { createClient } from "@/app/lib/supabase/server";
import { updateProjectStatus } from "@/app/actions/dev";
import type { ProjectStatus } from "@/app/lib/types/cliente";

export const metadata: Metadata = { title: "Projetos — Dev" };

const COLUMNS: { status: ProjectStatus; label: string; color: string }[] = [
  { status: "aguardando",       label: "Aguardando",       color: "#94a3b8" },
  { status: "em_desenvolvimento", label: "Em Dev",         color: "#EF9F27" },
  { status: "revisao",          label: "Revisão",          color: "#3b82f6" },
  { status: "entregue",         label: "Entregue",         color: "#22c55e" },
  { status: "manutencao",       label: "Manutenção",       color: "var(--primary)" },
];

export default async function DevProjetosPage() {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("projects")
    .select("*, profiles:client_id(name)")
    .order("created_at", { ascending: false });

  const projects = rows ?? [];

  const byStatus = COLUMNS.reduce<Record<string, typeof projects>>((acc, c) => {
    acc[c.status] = projects.filter((p) => p.status === c.status);
    return acc;
  }, {});

  return (
    <div style={{ padding: "32px", overflow: "auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)" }}>Projetos</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>{projects.length} projeto{projects.length !== 1 ? "s" : ""} total</p>
      </div>

      {/* Kanban */}
      <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16, minHeight: "calc(100vh - 180px)" }}>
        {COLUMNS.map((col) => {
          const cards = byStatus[col.status] ?? [];
          return (
            <div key={col.status} style={{ minWidth: 280, maxWidth: 300, flexShrink: 0 }}>
              {/* Cabeçalho da coluna */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "10px 14px", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: col.color, flexShrink: 0 }} />
                <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--text)", flex: 1 }}>{col.label}</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: col.color, background: `${col.color}15`, border: `1px solid ${col.color}30`, borderRadius: 999, padding: "2px 7px" }}>{cards.length}</span>
              </div>

              {/* Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {cards.map((p) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const clientName = (p.profiles as any)?.name ?? "—";
                  return (
                    <div key={p.id} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: "14px" }}>
                      <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "13px", color: "var(--text)" }}>{p.name}</p>
                      <p style={{ margin: "0 0 10px", fontSize: "11px", color: "var(--text-faint)" }}>{clientName}</p>

                      {/* Progress */}
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-faint)", marginBottom: 4 }}>
                          <span>Progresso</span><span>{p.progress}%</span>
                        </div>
                        <div style={{ height: 4, background: "var(--surface)", borderRadius: 99 }}>
                          <div style={{ height: "100%", width: `${p.progress}%`, background: col.color, borderRadius: 99, transition: "width 0.3s" }} />
                        </div>
                      </div>

                      {/* Avançar status */}
                      {col.status !== "manutencao" && col.status !== "entregue" && (
                        <form action={async () => {
                          "use server";
                          const nextIndex = COLUMNS.findIndex((c) => c.status === p.status) + 1;
                          const next = COLUMNS[nextIndex];
                          if (next) await updateProjectStatus(p.id, next.status, next.status === "entregue" ? 100 : undefined);
                        }}>
                          <button type="submit" style={{ width: "100%", padding: "6px", borderRadius: 7, border: `1px solid ${col.color}40`, background: `${col.color}10`, color: col.color, fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                            Avançar → {COLUMNS[COLUMNS.findIndex((c) => c.status === p.status) + 1]?.label}
                          </button>
                        </form>
                      )}
                    </div>
                  );
                })}

                {cards.length === 0 && (
                  <div style={{ padding: "20px", textAlign: "center", color: "var(--text-faint)", fontSize: "12px", border: "1px dashed var(--border)", borderRadius: 10 }}>
                    Vazio
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
