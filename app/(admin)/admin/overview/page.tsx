import type { Metadata } from "next";
import { createClient } from "@/app/lib/supabase/server";

export const metadata: Metadata = { title: "Visão Geral — Admin" };

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [
    { count: totalClients },
    { count: totalProjects },
    { count: openTickets },
    { data: mrrData },
    { data: recentProjects },
    { data: recentTickets },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "cliente"),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("tickets").select("*", { count: "exact", head: true }).in("status", ["aberto", "em_andamento"]),
    supabase.rpc("admin_mrr"),
    supabase.from("projects").select("id, name, status, progress, profiles:client_id(name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("tickets").select("id, subject, status, priority, profiles:client_id(name)").in("status", ["aberto", "em_andamento"]).order("created_at", { ascending: true }).limit(5),
  ]);

  const mrr = (mrrData as unknown as number) ?? 0;

  const kpis = [
    { label: "Clientes",       value: totalClients ?? 0, icon: "ti-users",          color: "#3b82f6"  },
    { label: "Projetos",       value: totalProjects ?? 0, icon: "ti-folder",        color: "var(--primary)" },
    { label: "Tickets abertos",value: openTickets ?? 0,  icon: "ti-message-circle", color: "#EF9F27"  },
    { label: "MRR",            value: `R$${mrr.toFixed(2).replace(".", ",")}`, icon: "ti-currency-dollar", color: "#22c55e" },
  ];

  return (
    <div style={{ padding: "40px 32px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)" }}>Visão Geral</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>Resumo operacional da Fropty Apps</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 36 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16, padding: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${k.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className={`ti ${k.icon}`} style={{ fontSize: 20, color: k.color }} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>{k.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: "2rem", fontWeight: 900, color: "var(--text)", lineHeight: 1 }}>{k.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Projetos recentes */}
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14, color: "var(--text)" }}>Projetos recentes</h2>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>
            {(recentProjects ?? []).map((p, i, arr) => (
              <div key={p.id} style={{ padding: "13px 18px", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{p.name}</p>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>{(p.profiles as any)?.name}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)" }}>{p.progress}%</span>
                </div>
              </div>
            ))}
            {!recentProjects?.length && <p style={{ padding: "20px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px", margin: 0 }}>Nenhum projeto ainda.</p>}
          </div>
        </div>

        {/* Tickets abertos */}
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14, color: "var(--text)" }}>Tickets urgentes</h2>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>
            {(recentTickets ?? []).map((t, i, arr) => (
              <div key={t.id} style={{ padding: "13px 18px", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{t.subject}</p>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>{(t.profiles as any)?.name}</p>
                </div>
                <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: t.priority === "alta" ? "rgba(239,68,68,0.1)" : "rgba(239,159,39,0.1)", color: t.priority === "alta" ? "#ef4444" : "#EF9F27", border: `1px solid ${t.priority === "alta" ? "#ef444430" : "#EF9F2730"}` }}>
                  {t.priority}
                </span>
              </div>
            ))}
            {!recentTickets?.length && <p style={{ padding: "20px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px", margin: 0 }}>Nenhum ticket aberto.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
