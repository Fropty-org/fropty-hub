import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { Users, MessageCircle, DollarSign, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = { title: "Visão Geral — Admin" };

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [
    { count: totalClients },
    { count: openTickets },
    { data: mrrData },
    { data: urgentTickets },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "cliente"),
    supabase.from("tickets").select("*", { count: "exact", head: true }).in("status", ["aberto", "em_andamento", "reaberto"]),
    supabase.rpc("admin_mrr"),
    supabase
      .from("tickets")
      .select("id, subject, status, priority, ticket_number, profiles:client_id(name)")
      .eq("priority", "alta")
      .in("status", ["aberto", "em_andamento", "reaberto"])
      .order("created_at", { ascending: true })
      .limit(8),
  ]);

  const mrr = (mrrData as unknown as number) ?? 0;

  const kpis: { label: string; value: string | number; Icon: LucideIcon; color: string }[] = [
    { label: "Clientes",        value: totalClients ?? 0, Icon: Users,          color: "#3b82f6"  },
    { label: "Tickets abertos", value: openTickets ?? 0,  Icon: MessageCircle,  color: "#EF9F27"  },
    { label: "MRR",             value: `R$${mrr.toFixed(2).replace(".", ",")}`, Icon: DollarSign, color: "#22c55e" },
  ];

  return (
    <div style={{ padding: "40px 32px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)" }}>Visão Geral</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>Resumo operacional da Fropty</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 36 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16, padding: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${k.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <k.Icon size={20} style={{ color: k.color }} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>{k.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: "2rem", fontWeight: 900, color: "var(--text)", lineHeight: 1 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tickets urgentes (prioridade alta, em aberto) */}
      <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14, color: "var(--text)" }}>Tickets urgentes</h2>
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>
        {(urgentTickets ?? []).map((t, i, arr) => {
          const ref = t.ticket_number ? `UFT${String(t.ticket_number).padStart(4, "0")}` : null;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const clientName = (t.profiles as any)?.name;
          return (
            <Link
              key={t.id}
              href={`/portal/suporte/${t.id}`}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                padding: "13px 18px", textDecoration: "none",
                borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 7 }}>
                  {ref && <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-faint)", fontFamily: "monospace", flexShrink: 0 }}>{ref}</span>}
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.subject}</span>
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>{clientName}</p>
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid #ef444430" }}>
                  alta
                </span>
                <ChevronRight size={14} style={{ color: "var(--text-faint)" }} />
              </span>
            </Link>
          );
        })}
        {!urgentTickets?.length && <p style={{ padding: "24px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px", margin: 0 }}>Nenhum ticket urgente no momento.</p>}
      </div>
    </div>
  );
}
