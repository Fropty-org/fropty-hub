import type { Metadata } from "next";
import { createClient } from "@/app/lib/supabase/server";
import { TrendingUp, Users, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = { title: "Financeiro "” Admin" };

export default async function AdminFinanceiroPage() {
  const supabase = await createClient();

  const [
    { data: mrrData },
    { data: profiles },
    { data: recentTx },
  ] = await Promise.all([
    supabase.rpc("admin_mrr"),
    supabase.from("profiles").select("id, name, plan, token_balance").in("plan", ["basico", "pro"]).order("plan"),
    supabase.from("token_transactions").select("*, profiles:client_id(name)").order("created_at", { ascending: false }).limit(30),
  ]);

  const mrr = (mrrData as unknown as number) ?? 0;
  const assinantes = profiles ?? [];
  const txs = recentTx ?? [];

  const totalCredits = txs.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalDebits  = txs.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);

  const kpis: { label: string; value: string | number; sub?: string; Icon: LucideIcon; color: string }[] = [
    { label: "MRR",                           value: `R$${mrr.toFixed(2).replace(".", ",")}`, sub: "receita recorrente mensal", Icon: TrendingUp,    color: "#22c55e" },
    { label: "Assinantes",                    value: assinantes.length,  sub: "planos ativos",                              Icon: Users,           color: "var(--primary)" },
    { label: "Tokens emitidos",               value: totalCredits,       sub: "últimas 30 transações",                      Icon: ArrowDownLeft,   color: "#EF9F27" },
    { label: "Tokens consumidos",             value: totalDebits,        sub: "últimas 30 transações",                      Icon: ArrowUpRight,    color: "#ef4444" },
  ];

  return (
    <div style={{ padding: "40px 32px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)", letterSpacing: "-0.02em" }}>Financeiro</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>Receita, assinantes e movimentação de tokens</p>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${k.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <k.Icon size={17} style={{ color: k.color }} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>{k.label}</span>
            </div>
            <p style={{ margin: "0 0 2px", fontSize: "1.9rem", fontWeight: 900, color: "var(--text)", lineHeight: 1, letterSpacing: "-0.02em" }}>{k.value}</p>
            {k.sub && <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>{k.sub}</p>}
          </div>
        ))}
      </div>

      {/* 2-col layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Assinantes */}
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 14px", color: "var(--text)" }}>Assinantes</h2>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Nome", "Plano", "Tokens"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assinantes.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: i < assinantes.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td style={{ padding: "11px 16px", fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{u.name}</td>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: u.plan === "pro" ? "rgba(91,87,232,0.12)" : "rgba(34,197,94,0.12)", color: u.plan === "pro" ? "var(--primary)" : "#22c55e" }}>
                        {u.plan === "pro" ? "Pro" : "Básico"}
                      </span>
                    </td>
                    <td style={{ padding: "11px 16px", fontSize: "12px", fontWeight: 700, color: "#EF9F27" }}>{u.token_balance}</td>
                  </tr>
                ))}
                {assinantes.length === 0 && (
                  <tr><td colSpan={3} style={{ padding: "28px 16px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px" }}>Nenhum assinante ainda.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Últimas movimentações */}
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 14px", color: "var(--text)" }}>Últimas movimentações</h2>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Descrição", "Tipo", "Tokens", "Data"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {txs.map((tx, i) => (
                  <tr key={tx.id} style={{ borderBottom: i < txs.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td style={{ padding: "11px 16px" }}>
                      <p style={{ margin: "0 0 2px", fontSize: "12px", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>{tx.description}</p>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>{(tx.profiles as any)?.name ?? ""”"}</p>
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: tx.type === "credit" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: tx.type === "credit" ? "#22c55e" : "#ef4444" }}>
                        {tx.type === "credit" ? "Crédito" : "Débito"}
                      </span>
                    </td>
                    <td style={{ padding: "11px 16px", fontSize: "13px", fontWeight: 700, color: tx.type === "credit" ? "#22c55e" : "#ef4444" }}>
                      {tx.type === "credit" ? "+" : "-"}{tx.amount}
                    </td>
                    <td style={{ padding: "11px 16px", fontSize: "11px", color: "var(--text-faint)", whiteSpace: "nowrap" }}>
                      {new Date(tx.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
                {txs.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: "28px 16px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px" }}>Nenhuma movimentação.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

