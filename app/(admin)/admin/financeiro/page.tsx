import type { Metadata } from "next";
import { createClient } from "@/app/lib/supabase/server";
import { TrendingUp, Users, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getServerI18n } from "@/app/lib/i18n/server";

export const metadata: Metadata = { title: "Financeiro — Admin" };

export default async function AdminFinanceiroPage() {
  const supabase = await createClient();
  const { t } = await getServerI18n();

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
    { label: t("admin.finance.kpiMrr"), value: `R$${mrr.toFixed(2).replace(".", ",")}`, sub: t("admin.finance.kpiMrrSub"), Icon: TrendingUp,    color: "var(--c-success)" },
    { label: t("admin.finance.kpiSubscribers"), value: assinantes.length,  sub: t("admin.finance.kpiSubscribersSub"), Icon: Users,           color: "var(--primary)" },
    { label: t("admin.finance.kpiIssued"), value: totalCredits,       sub: t("admin.finance.last30"), Icon: ArrowDownLeft,   color: "#EF9F27" },
    { label: t("admin.finance.kpiConsumed"), value: totalDebits,        sub: t("admin.finance.last30"), Icon: ArrowUpRight,    color: "var(--c-danger)" },
  ];

  return (
    <div className="hub-page" style={{ maxWidth: "none" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)", letterSpacing: "-0.02em" }}>{t("admin.finance.title")}</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>{t("admin.finance.subtitle")}</p>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        {kpis.map((k) => (
          <div key={k.label} className="hub-card" style={{ padding: "20px" }}>
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
          <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 14px", color: "var(--text)" }}>{t("admin.finance.subscribers")}</h2>
          <div className="hub-card" style={{ padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {[t("admin.finance.colName"), t("admin.finance.colPlan"), t("admin.finance.colTokens")].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assinantes.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: i < assinantes.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td style={{ padding: "11px 16px", fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{u.name}</td>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: u.plan === "pro" ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "rgba(34,197,94,0.12)", color: u.plan === "pro" ? "var(--primary)" : "var(--c-success)" }}>
                        {u.plan === "pro" ? t("admin.plans.pro") : t("admin.plans.basico")}
                      </span>
                    </td>
                    <td style={{ padding: "11px 16px", fontSize: "12px", fontWeight: 700, color: "#EF9F27" }}>{u.token_balance}</td>
                  </tr>
                ))}
                {assinantes.length === 0 && (
                  <tr><td colSpan={3} style={{ padding: "28px 16px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px" }}>{t("admin.finance.noSubscribers")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Últimas movimentações */}
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 14px", color: "var(--text)" }}>{t("admin.finance.movements")}</h2>
          <div className="hub-card" style={{ padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {[t("admin.finance.colDescription"), t("admin.finance.colType"), t("admin.finance.colTokens"), t("admin.finance.colDate")].map((h) => (
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
                      <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>{(tx.profiles as any)?.name ?? ""}</p>
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: tx.type === "credit" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: tx.type === "credit" ? "var(--c-success)" : "var(--c-danger)" }}>
                        {tx.type === "credit" ? t("admin.finance.credit") : t("admin.finance.debit")}
                      </span>
                    </td>
                    <td style={{ padding: "11px 16px", fontSize: "13px", fontWeight: 700, color: tx.type === "credit" ? "var(--c-success)" : "var(--c-danger)" }}>
                      {tx.type === "credit" ? "+" : "-"}{tx.amount}
                    </td>
                    <td style={{ padding: "11px 16px", fontSize: "11px", color: "var(--text-faint)", whiteSpace: "nowrap" }}>
                      {new Date(tx.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
                {txs.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: "28px 16px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px" }}>{t("admin.finance.noMovements")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

