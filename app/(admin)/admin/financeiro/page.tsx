import type { Metadata } from "next";
import { createClient } from "@/app/lib/supabase/server";
import { adminCreditTokens } from "@/app/actions/admin";

export const metadata: Metadata = { title: "Financeiro — Admin" };

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

  return (
    <div style={{ padding: "40px 32px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)" }}>Financeiro</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>Receita, assinantes e movimentação de tokens</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        {[
          { label: "MRR",         value: `R$${mrr.toFixed(2).replace(".", ",")}`, icon: "ti-trending-up", color: "#22c55e" },
          { label: "Assinantes",  value: assinantes.length,  icon: "ti-users",          color: "var(--primary)" },
          { label: "Tokens emitidos (últimos 30 tx)", value: totalCredits, icon: "ti-arrow-down-left", color: "#EF9F27" },
          { label: "Tokens gastos (últimos 30 tx)", value: totalDebits, icon: "ti-arrow-up-right", color: "#ef4444" },
        ].map((k) => (
          <div key={k.label} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16, padding: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${k.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className={`ti ${k.icon}`} style={{ fontSize: 20, color: k.color }} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>{k.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: "1.9rem", fontWeight: 900, color: "var(--text)", lineHeight: 1 }}>{k.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Assinantes */}
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14, color: "var(--text)" }}>Assinantes</h2>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>
            {assinantes.map((u, i) => (
              <div key={u.id} style={{ padding: "13px 18px", borderBottom: i < assinantes.length - 1 ? "1px solid var(--border)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{u.name}</p>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>Plano {u.plan === "pro" ? "Pro — R$89,90/mês" : "Básico — R$49,90/mês"}</p>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#EF9F27" }}>{u.token_balance} tokens</span>
              </div>
            ))}
            {assinantes.length === 0 && <p style={{ padding: "20px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px", margin: 0 }}>Nenhum assinante ainda.</p>}
          </div>
        </div>

        {/* Crédito manual */}
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14, color: "var(--text)" }}>Creditar tokens manualmente</h2>
          <form action={adminCreditTokens} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <select name="user_id" required style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", padding: "9px 12px", fontSize: "13px", fontFamily: "inherit" }}>
                <option value="">Selecionar cliente…</option>
                {assinantes.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <input name="amount" type="number" min="1" max="50" defaultValue="1" required style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", padding: "9px 12px", fontSize: "13px", fontFamily: "inherit" }} placeholder="Quantidade de tokens" />
              <input name="description" defaultValue="Crédito manual — Admin" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", padding: "9px 12px", fontSize: "13px", fontFamily: "inherit" }} placeholder="Descrição" />
              <button type="submit" style={{ padding: "10px", borderRadius: 9, border: "none", background: "#22c55e", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
                <i className="ti ti-coins" /> Creditar tokens
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Extrato recente */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14, color: "var(--text)" }}>Últimas movimentações</h2>
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 90px 90px 90px", padding: "12px 20px", borderBottom: "1px solid var(--border)", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <span>Descrição</span><span>Cliente</span><span>Data</span><span style={{ textAlign: "right" }}>Tokens</span><span style={{ textAlign: "right" }}>Saldo</span>
          </div>
          {txs.map((tx, i) => (
            <div key={tx.id} style={{ display: "grid", gridTemplateColumns: "1fr 140px 90px 90px 90px", padding: "12px 20px", borderBottom: i < txs.length - 1 ? "1px solid var(--border)" : "none", fontSize: "12px", alignItems: "center" }}>
              <span style={{ color: "var(--text)" }}>{tx.description}</span>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <span style={{ color: "var(--text-faint)" }}>{(tx.profiles as any)?.name ?? "—"}</span>
              <span style={{ color: "var(--text-faint)" }}>{new Date(tx.created_at).toLocaleDateString("pt-BR")}</span>
              <span style={{ textAlign: "right", fontWeight: 700, color: tx.type === "credit" ? "#22c55e" : "#ef4444" }}>{tx.type === "credit" ? "+" : "-"}{tx.amount}</span>
              <span style={{ textAlign: "right", fontWeight: 700, color: "var(--text)" }}>{tx.balance}</span>
            </div>
          ))}
          {txs.length === 0 && <p style={{ padding: "20px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px", margin: 0 }}>Nenhuma movimentação.</p>}
        </div>
      </div>
    </div>
  );
}
