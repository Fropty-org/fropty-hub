import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProfile } from "@/app/lib/auth/session";
import { createClient } from "@/app/lib/supabase/server";
import { buyTokens, subscribePlan } from "@/app/actions/financeiro";
import {
  CheckCircle, Coins, CalendarDays, BadgeCheck, BarChart2,
  FileText, Sparkles, CreditCard, Receipt, Package,
  TrendingUp, TrendingDown,
} from "lucide-react";
import { TokenChart } from "@/app/components/cliente/TokenChart";
import { HubEmptyState } from "@/app/components/ui/HubEmptyState";
import { getService } from "@/app/lib/constants/services";
import type { TokenTransaction } from "@/app/lib/types/cliente";
import type { Database } from "@/app/lib/supabase/types";

type TxRow = Database["public"]["Tables"]["token_transactions"]["Row"];

export const metadata: Metadata = { title: "Financeiro" };

const PLAN_INFO = {
  basico: { label: "Básico", tokens: 4, price: "R$49,90/mês", color: "#3b82f6" },
  pro:    { label: "Pro",    tokens: 8, price: "R$89,90/mês", color: "var(--primary)" },
};

interface Props { searchParams: Promise<{ sucesso?: string }> }

export default async function FinanceiroPage({ searchParams }: Props) {
  const profile = await getProfile();
  if (profile?.role === "admin") redirect("/admin/financeiro");

  const { sucesso }  = await searchParams;
  const supabase     = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: txRows } = await supabase
    .from("token_transactions").select("*")
    .eq("client_id", user!.id)
    .order("created_at", { ascending: false }).limit(50);

  const transactions: TokenTransaction[] = ((txRows ?? []) as TxRow[]).map((t) => ({
    id: t.id, date: t.created_at, description: t.description,
    type: t.type as "credit" | "debit", amount: t.amount, balance: t.balance,
  }));

  const plan         = profile?.plan ?? "sem_plano";
  const planRenewal  = profile?.plan_renewal ?? null;
  const tokenBalance = profile?.token_balance ?? 0;
  const services     = profile?.services ?? [];
  const contractStart = profile?.contract_start ?? null;
  const planInfo     = plan !== "sem_plano" ? PLAN_INFO[plan as keyof typeof PLAN_INFO] : null;
  const hasPlan      = plan === "basico" || plan === "pro";
  const avulsoUnit   = hasPlan ? 150 : 300;

  const nextPayment = (() => {
    if (!contractStart) return null;
    const start = new Date(`${contractStart}T00:00:00`);
    const day = start.getDate();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const build = (y: number, m: number) => new Date(y, m, Math.min(day, new Date(y, m + 1, 0).getDate()));
    let d = build(today.getFullYear(), today.getMonth());
    while (d <= today || d < start) d = build(d.getFullYear(), d.getMonth() + 1);
    return d;
  })();
  const nextPaymentLabel = nextPayment?.toLocaleDateString("pt-BR");

  const totalCredits = transactions.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalDebits  = transactions.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ padding: "24px 24px", maxWidth: 1020, margin: "0 auto" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>
          Financeiro
        </h1>
        <p style={{ margin: "5px 0 0", fontSize: "13px", color: "var(--text-faint)" }}>
          Tokens, plano e extrato de movimentações
        </p>
      </div>

      {/* ── Banner sucesso ── */}
      {sucesso && (
        <div style={{
          background: "var(--c-success-bg)", border: "1px solid var(--c-success-border)",
          borderRadius: "var(--r-md)", padding: "13px 18px", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 10,
          fontSize: "13.5px", color: "var(--c-success)", fontWeight: 600,
        }}>
          <CheckCircle size={18} />
          {sucesso === "tokens"
            ? "Tokens adquiridos com sucesso! O saldo será atualizado em instantes."
            : "Assinatura ativada! Seus tokens do mês já estão disponíveis."}
        </div>
      )}

      {/* ── KPI cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 28 }}>

        {/* Saldo */}
        <div className="hub-stat-card">
          <div style={{
            width: 38, height: 38, borderRadius: "var(--r-md)",
            background: "rgba(239,159,39,0.15)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Coins size={18} style={{ color: "var(--brand-accent)" }} />
          </div>
          <p style={{ margin: "10px 0 0", fontSize: "28px", fontWeight: 900, color: "var(--text)", letterSpacing: "-0.04em", lineHeight: 1 }}>
            {tokenBalance}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "11.5px", color: "var(--text-faint)", fontWeight: 500 }}>
            Saldo de tokens
          </p>
          {nextPaymentLabel && (
            <p style={{ margin: "6px 0 0", fontSize: "11px", color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 4 }}>
              <CalendarDays size={11} /> Renova em {nextPaymentLabel}
            </p>
          )}
        </div>

        {/* Plano */}
        <div className="hub-stat-card">
          <div style={{
            width: 38, height: 38, borderRadius: "var(--r-md)",
            background: "rgba(91,87,232,0.12)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BadgeCheck size={18} style={{ color: "var(--primary)" }} />
          </div>
          {planInfo ? (
            <>
              <p style={{ margin: "10px 0 0", fontSize: "20px", fontWeight: 900, color: planInfo.color, letterSpacing: "-0.03em", lineHeight: 1 }}>
                Plano {planInfo.label}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: "11.5px", color: "var(--text-faint)" }}>
                {planInfo.tokens} tokens/mês · {planInfo.price.split("/")[0]}
              </p>
              {planRenewal && (
                <p style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--text-faint)" }}>
                  Renova em {new Date(planRenewal).toLocaleDateString("pt-BR")}
                </p>
              )}
            </>
          ) : (
            <>
              <p style={{ margin: "10px 0 0", fontSize: "16px", fontWeight: 700, color: "var(--text-faint)", lineHeight: 1 }}>Sem plano</p>
              <p style={{ margin: "4px 0 0", fontSize: "11.5px", color: "var(--text-faint)" }}>Assine para economizar 50%</p>
            </>
          )}
        </div>

        {/* Créditos */}
        <div className="hub-stat-card">
          <div style={{
            width: 38, height: 38, borderRadius: "var(--r-md)",
            background: "var(--c-success-bg)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <TrendingUp size={18} style={{ color: "var(--c-success)" }} />
          </div>
          <p style={{ margin: "10px 0 0", fontSize: "26px", fontWeight: 900, color: "var(--text)", letterSpacing: "-0.04em", lineHeight: 1 }}>
            +{totalCredits}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "11.5px", color: "var(--text-faint)" }}>Tokens recebidos</p>
        </div>

        {/* Débitos */}
        <div className="hub-stat-card">
          <div style={{
            width: 38, height: 38, borderRadius: "var(--r-md)",
            background: "rgba(220,38,38,0.10)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <TrendingDown size={18} style={{ color: "var(--c-danger)" }} />
          </div>
          <p style={{ margin: "10px 0 0", fontSize: "26px", fontWeight: 900, color: "var(--text)", letterSpacing: "-0.04em", lineHeight: 1 }}>
            -{totalDebits}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "11.5px", color: "var(--text-faint)" }}>Tokens utilizados</p>
        </div>
      </div>

      {/* ── Saldo de Tokens — card detalhado ── */}
      {(() => {
        const planLimits: Record<string, number> = { sem_plano: 100, basico: 500, pro: 2000 };
        const limit = planLimits[plan] ?? 100;
        const pct   = Math.min(100, Math.round((tokenBalance / limit) * 100));
        const recentTx = transactions.slice(0, 5);

        return (
          <div className="hub-card" style={{ marginBottom: 24, padding: "20px 24px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
                <Coins size={14} style={{ color: "var(--brand-accent)" }} /> Saldo de Tokens
              </h2>
              <span style={{ fontSize: "11px", color: "var(--text-faint)", fontWeight: 500 }}>
                {pct}% do limite do plano
              </span>
            </div>

            {/* Balance + bar */}
            <div style={{ marginBottom: 18 }}>
              <p style={{ margin: "0 0 10px", fontSize: "36px", fontWeight: 900, color: "var(--text)", letterSpacing: "-0.05em", lineHeight: 1 }}>
                {tokenBalance}
                <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-faint)", marginLeft: 6 }}>tokens</span>
              </p>
              {/* Progress bar */}
              <div style={{ height: 8, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden", position: "relative" }}>
                <div style={{
                  height: "100%", borderRadius: 99,
                  width: `${pct}%`,
                  background: pct > 80
                    ? "var(--c-success)"
                    : pct > 40
                    ? "var(--primary)"
                    : "var(--c-danger)",
                  transition: "width 0.4s ease",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: "11px", color: "var(--text-faint)" }}>
                <span>0</span>
                <span>Limite do plano: {limit}</span>
              </div>
            </div>

            {/* Recent transactions mini-list */}
            {recentTx.length > 0 && (
              <>
                <p style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-faint)" }}>
                  Últimas movimentações
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {recentTx.map((tx) => (
                    <div key={tx.id} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 0", borderBottom: "1px solid var(--border)",
                    }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: "var(--r-sm)", flexShrink: 0,
                        background: tx.type === "credit" ? "var(--c-success-bg)" : "rgba(220,38,38,0.10)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {tx.type === "credit"
                          ? <TrendingUp  size={12} style={{ color: "var(--c-success)" }} />
                          : <TrendingDown size={12} style={{ color: "var(--c-danger)" }} />
                        }
                      </div>
                      <span style={{ flex: 1, fontSize: "12.5px", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {tx.description}
                      </span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: tx.type === "credit" ? "var(--c-success)" : "var(--c-danger)", flexShrink: 0 }}>
                        {tx.type === "credit" ? "+" : "-"}{tx.amount}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-faint)", flexShrink: 0, minWidth: 72, textAlign: "right" }}>
                        {new Date(tx.date).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })()}

      {/* ── Serviços contratados ── */}
      {(services.length > 0 || contractStart) && (
        <div className="hub-card" style={{ marginBottom: 24, padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: services.length > 0 ? 16 : 0 }}>
            <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={14} style={{ color: "var(--primary)" }} /> Meu contrato
            </h2>
            {contractStart && (
              <span style={{ fontSize: "12px", color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 5 }}>
                <CalendarDays size={12} />
                Início em {new Date(`${contractStart}T00:00:00`).toLocaleDateString("pt-BR")}
                {nextPaymentLabel && ` · próximo pagamento ${nextPaymentLabel}`}
              </span>
            )}
          </div>
          {services.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {services.map((id) => {
                const svc = getService(id);
                const color = svc?.color ?? "var(--primary)";
                return (
                  <span key={id} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: `${color}12`, border: `1px solid ${color}30`,
                    borderRadius: "var(--r-full)", padding: "6px 12px",
                    fontSize: "12px", fontWeight: 700, color,
                  }}>
                    {svc?.Icon ? <svc.Icon size={13} /> : <Package size={13} />}
                    {svc?.label ?? id}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Planos ── */}
      {plan !== "pro" && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-faint)", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={12} style={{ color: "var(--brand-accent)" }} />
            {plan === "basico" ? "Migrar para o Plano Pro" : "Assinar plano mensal"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            {(plan === "basico" ? (["pro"] as const) : (["basico", "pro"] as const)).map((p) => {
              const info = PLAN_INFO[p];
              const isUpgrade = plan === "basico" && p === "pro";
              return (
                <form key={p} action={subscribePlan}>
                  <input type="hidden" name="plan" value={p} />
                  <div className="hub-card" style={{
                    padding: "20px",
                    border: p === "pro" ? "1px solid rgba(91,87,232,0.4)" : "1px solid var(--border)",
                    position: "relative",
                  }}>
                    {p === "pro" && (
                      <span style={{
                        position: "absolute", top: -10, left: 20,
                        fontSize: "10px", fontWeight: 800,
                        background: "var(--cta-bg)", color: "var(--cta-text)",
                        padding: "3px 10px", borderRadius: "var(--r-full)",
                        textTransform: "uppercase", letterSpacing: "0.06em",
                      }}>
                        {isUpgrade ? "Upgrade" : "Popular"}
                      </span>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: "15px", color: "var(--text)" }}>Plano {info.label}</p>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-faint)" }}>{info.tokens} tokens/mês</p>
                      </div>
                      <p style={{ margin: 0, fontWeight: 900, fontSize: "1.15rem", color: info.color }}>
                        {info.price.split("/")[0]}<span style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-faint)" }}>/mês</span>
                      </p>
                    </div>
                    <p style={{ margin: "0 0 14px", fontSize: "12px", color: "var(--text-faint)", lineHeight: 1.5 }}>
                      Token a R$150 (50% off) · Fidelidade mínima 3 meses
                    </p>
                    <button type="submit" style={{
                      width: "100%", padding: "9px",
                      borderRadius: "var(--r-md)", border: "none",
                      background: p === "pro" ? "var(--primary)" : "var(--surface-2)",
                      color: p === "pro" ? "#fff" : "var(--text)",
                      fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
                    }}>
                      {isUpgrade ? "Migrar para o Pro" : `Assinar Plano ${info.label}`}
                    </button>
                  </div>
                </form>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Compra avulsa ── */}
      <div className="hub-card" style={{
        marginBottom: 28, padding: "18px 22px",
        background: "linear-gradient(135deg, rgba(91,87,232,0.06), rgba(91,87,232,0.02))",
        borderColor: "rgba(91,87,232,0.22)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>Comprar tokens avulsos</p>
            <p style={{ margin: "3px 0 0", fontSize: "12px", color: "var(--text-faint)" }}>
              R${avulsoUnit}/token{hasPlan ? " (preço de assinante)" : ""} · sem fidelidade · entregue imediatamente
            </p>
          </div>
          <form action={buyTokens} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select name="qty" defaultValue="1" style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--r-md)", color: "var(--text)",
              padding: "8px 12px", fontSize: "13px", fontFamily: "inherit", cursor: "pointer",
            }}>
              {[1, 2, 3, 5, 10].map((n) => (
                <option key={n} value={n}>
                  {n} token{n > 1 ? "s" : ""} — R${(n * avulsoUnit).toLocaleString("pt-BR")}
                </option>
              ))}
            </select>
            <button type="submit" style={{
              background: "var(--cta-bg)", color: "var(--cta-text)", border: "none",
              padding: "9px 18px", borderRadius: "var(--r-md)",
              fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <CreditCard size={14} /> Comprar
            </button>
          </form>
        </div>
      </div>

      {/* ── Gráfico ── */}
      {transactions.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <TokenChart transactions={transactions} />
        </div>
      )}

      {/* ── Extrato ── */}
      <div className="hub-card" style={{ overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 7 }}>
            <Receipt size={14} style={{ color: "var(--text-faint)" }} /> Extrato de tokens
          </span>
          {transactions.length > 0 && (
            <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>{transactions.length} movimentações</span>
          )}
        </div>

        {transactions.length === 0 ? (
          <HubEmptyState variant="financeiro" />
        ) : (
          <>
            {/* Column headers */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 110px 80px 80px",
              padding: "9px 20px", background: "var(--surface-2)",
              borderBottom: "1px solid var(--border)",
              fontSize: "11px", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-faint)",
            }}>
              <span>Descrição</span>
              <span style={{ textAlign: "right" }}>Data</span>
              <span style={{ textAlign: "right" }}>Tokens</span>
              <span style={{ textAlign: "right" }}>Saldo</span>
            </div>

            {transactions.map((tx, i) => (
              <div key={tx.id} style={{
                display: "grid", gridTemplateColumns: "1fr 110px 80px 80px",
                padding: "12px 20px", alignItems: "center",
                borderBottom: i < transactions.length - 1 ? "1px solid var(--border)" : "none",
                fontSize: "13px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "var(--r-sm)", flexShrink: 0,
                    background: tx.type === "credit" ? "var(--c-success-bg)" : "rgba(220,38,38,0.10)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {tx.type === "credit"
                      ? <TrendingUp  size={13} style={{ color: "var(--c-success)" }} />
                      : <TrendingDown size={13} style={{ color: "var(--c-danger)" }} />
                    }
                  </div>
                  <span style={{ color: "var(--text)" }}>{tx.description}</span>
                </div>
                <span style={{ textAlign: "right", color: "var(--text-faint)", fontSize: "12px" }}>
                  {new Date(tx.date).toLocaleDateString("pt-BR")}
                </span>
                <span style={{ textAlign: "right", fontWeight: 700, color: tx.type === "credit" ? "var(--c-success)" : "var(--c-danger)" }}>
                  {tx.type === "credit" ? "+" : "-"}{tx.amount}
                </span>
                <span style={{ textAlign: "right", fontWeight: 700, color: "var(--text)" }}>
                  {tx.balance}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
