import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProfile } from "@/app/lib/auth/session";
import { createClient } from "@/app/lib/supabase/server";
import { buyTokens, subscribePlan } from "@/app/actions/financeiro";
import { CheckCircle, Coins, CalendarDays, Badge, BarChart2, FileText, Sparkles, CreditCard, Receipt, Package } from "lucide-react";
import { TokenChart } from "@/app/components/cliente/TokenChart";
import { getService } from "@/app/lib/constants/services";
import type { TokenTransaction } from "@/app/lib/types/cliente";
import type { Database } from "@/app/lib/supabase/types";

type TxRow = Database["public"]["Tables"]["token_transactions"]["Row"];

export const metadata: Metadata = { title: "Financeiro" };

const PLAN_INFO = {
  basico: { label: "Básico", tokens: 4, price: "R$49,90/mês", color: "#3b82f6" },
  pro:    { label: "Pro",    tokens: 8, price: "R$89,90/mês", color: "var(--primary)" },
};

interface Props {
  searchParams: Promise<{ sucesso?: string }>;
}

export default async function FinanceiroPage({ searchParams }: Props) {
  const profile      = await getProfile();
  if (profile?.role === "admin") redirect("/admin/financeiro");

  const { sucesso }  = await searchParams;
  const supabase     = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: txRows } = await supabase
    .from("token_transactions")
    .select("*")
    .eq("client_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const transactions: TokenTransaction[] = ((txRows ?? []) as TxRow[]).map((t) => ({
    id:          t.id,
    date:        t.created_at,
    description: t.description,
    type:        t.type as "credit" | "debit",
    amount:      t.amount,
    balance:     t.balance,
  }));

  const plan          = profile?.plan ?? "sem_plano";
  const planRenewal   = profile?.plan_renewal ?? null;
  const tokenBalance  = profile?.token_balance ?? 0;
  const services      = profile?.services ?? [];
  const contractStart = profile?.contract_start ?? null;
  const planInfo     = plan !== "sem_plano" ? PLAN_INFO[plan as keyof typeof PLAN_INFO] : null;
  const hasPlan      = plan === "basico" || plan === "pro";
  // Token extra: R$150 para quem tem plano (50% off); R$300 sem plano.
  const avulsoUnit   = hasPlan ? 150 : 300;

  // Próximo pagamento: mesmo dia do início do contrato, na primeira ocorrência
  // futura (mês seguinte). Faz clamp para meses com menos dias (ex.: dia 31).
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

  const totalCredits = transactions.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalDebits  = transactions.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ padding: "40px 32px", maxWidth: 900, margin: "0 auto" }}>

      {/* Banner de sucesso */}
      {sucesso && (
        <div
          style={{
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: 12,
            padding: "14px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: "14px",
            color: "#22c55e",
            fontWeight: 600,
          }}
        >
          <CheckCircle size={20} />
          {sucesso === "tokens"
            ? "Tokens adquiridos com sucesso! O saldo será atualizado em instantes."
            : "Assinatura ativada! Seus tokens do mês já estão disponíveis."}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)" }}>
          Financeiro
        </h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>
          Tokens, plano e extrato de movimentações
        </p>
      </div>

      {/* Cards topo */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>

        {/* Saldo */}
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16, padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(239,159,39,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Coins size={22} style={{ color: "#EF9F27" }} />
            </div>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>Saldo de tokens</p>
          </div>
          <p style={{ margin: "0 0 4px", fontSize: "2.5rem", fontWeight: 900, color: "var(--text)", lineHeight: 1 }}>
            {tokenBalance}
          </p>
          {nextPaymentLabel && (
            <p style={{ margin: "8px 0 0", fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
              <CalendarDays size={14} style={{ marginRight: 5, color: "var(--primary)" }} />
              Renova em: {nextPaymentLabel}
            </p>
          )}
          <p style={{ margin: "6px 0 0", fontSize: "12px", color: "var(--text-faint)" }}>
            1 token = R$150 de suporte
          </p>
        </div>

        {/* Plano */}
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16, padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(91,87,232,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Badge size={22} style={{ color: "var(--primary)" }} />
            </div>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>Plano ativo</p>
          </div>
          {planInfo ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 900, color: planInfo.color }}>
                  Plano {planInfo.label}
                </span>
                <span style={{ fontSize: "11px", fontWeight: 700, background: `${planInfo.color}15`, color: planInfo.color, border: `1px solid ${planInfo.color}30`, borderRadius: 999, padding: "2px 8px" }}>
                  {planInfo.tokens} tokens/mês
                </span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text-faint)" }}>
                {planInfo.price}
                {planRenewal && ` · renova em ${new Date(planRenewal).toLocaleDateString("pt-BR")}`}
              </p>
            </>
          ) : (
            <p style={{ margin: "0 0 0", fontSize: "14px", color: "var(--text-muted)" }}>
              Sem plano ativo
            </p>
          )}
        </div>

        {/* Resumo */}
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16, padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BarChart2 size={22} style={{ color: "#22c55e" }} />
            </div>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>Resumo</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "var(--text-faint)" }}>Total recebido</span>
              <span style={{ fontWeight: 700, color: "#22c55e" }}>+{totalCredits} tokens</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "var(--text-faint)" }}>Total utilizado</span>
              <span style={{ fontWeight: 700, color: "#ef4444" }}>-{totalDebits} tokens</span>
            </div>
            <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "var(--text-faint)" }}>Saldo atual</span>
              <span style={{ fontWeight: 800, color: "var(--text)" }}>{tokenBalance} tokens</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contrato — serviços contratados e data de início */}
      {(services.length > 0 || contractStart) && (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16, padding: "24px", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: services.length > 0 ? 18 : 0 }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={14} style={{ color: "var(--primary)" }} />
              Meu contrato
            </h2>
            {contractStart && (
              <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>
                <CalendarDays size={13} style={{ marginRight: 6 }} />
                Início em {new Date(`${contractStart}T00:00:00`).toLocaleDateString("pt-BR")}
                {nextPaymentLabel && ` · próximo pagamento ${nextPaymentLabel}`}
              </span>
            )}
          </div>
          {services.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {services.map((id) => {
                const svc = getService(id);
                const label = svc?.label ?? id;
                const color = svc?.color ?? "var(--primary)";
                return (
                  <span
                    key={id}
                    style={{ display: "inline-flex", alignItems: "center", gap: 7, background: `${color}14`, border: `1px solid ${color}33`, borderRadius: 999, padding: "6px 12px", fontSize: "12px", fontWeight: 700, color }}
                  >
                    {svc?.Icon ? <svc.Icon size={14} /> : <Package size={14} />}
                    {label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Planos: sem plano → assinar Básico/Pro; no Básico → migrar para Pro; no Pro → nada a oferecer */}
      {plan !== "pro" && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={14} style={{ color: "var(--primary)" }} />
            {plan === "basico" ? "Migrar para o Plano Pro" : "Assinar plano mensal"}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            {(plan === "basico" ? (["pro"] as const) : (["basico", "pro"] as const)).map((p) => {
              const info = PLAN_INFO[p];
              const isUpgrade = plan === "basico" && p === "pro";
              return (
                <form key={p} action={subscribePlan}>
                  <input type="hidden" name="plan" value={p} />
                  <div
                    style={{
                      background: "var(--card-bg)",
                      border: `1px solid ${p === "pro" ? "rgba(91,87,232,0.4)" : "var(--card-border)"}`,
                      borderRadius: 14,
                      padding: "20px",
                      position: "relative",
                    }}
                  >
                    {p === "pro" && (
                      <span
                        style={{
                          position: "absolute",
                          top: -10,
                          left: 20,
                          fontSize: "10px",
                          fontWeight: 800,
                          background: "var(--primary)",
                          color: "#fff",
                          padding: "3px 10px",
                          borderRadius: 999,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {isUpgrade ? "Upgrade" : "Popular"}
                      </span>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <p style={{ margin: "0 0 2px", fontWeight: 800, fontSize: "15px", color: "var(--text)" }}>
                          Plano {info.label}
                        </p>
                        <p style={{ margin: 0, fontSize: "12px", color: "var(--text-faint)" }}>
                          {info.tokens} tokens/mês
                        </p>
                      </div>
                      <p style={{ margin: 0, fontWeight: 900, fontSize: "1.2rem", color: info.color }}>
                        {info.price.split("/")[0]}
                        <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-faint)" }}>/mês</span>
                      </p>
                    </div>
                    <p style={{ margin: "0 0 16px", fontSize: "12px", color: "var(--text-faint)", lineHeight: 1.5 }}>
                      Token a R$150 (50% off) · Fidelidade mínima 3 meses
                    </p>
                    <button
                      type="submit"
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: 9,
                        border: "none",
                        background: p === "pro" ? "var(--primary)" : "var(--surface)",
                        color: p === "pro" ? "#fff" : "var(--text)",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {isUpgrade ? "Migrar para o Pro" : `Assinar Plano ${info.label}`}
                    </button>
                  </div>
                </form>
              );
            })}
          </div>
        </div>
      )}

      {/* Compra avulsa */}
      <div
        style={{
          marginBottom: 32,
          background: "linear-gradient(135deg, rgba(91,87,232,0.1), rgba(91,87,232,0.04))",
          border: "1px solid rgba(91,87,232,0.2)",
          borderRadius: 14,
          padding: "20px 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>
              Comprar tokens avulsos
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--text-faint)" }}>
              R${avulsoUnit}/token{hasPlan ? " (preço de assinante)" : ""} · sem fidelidade · entregue imediatamente
            </p>
          </div>
          <form action={buyTokens} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select
              name="qty"
              defaultValue="1"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text)",
                padding: "8px 12px",
                fontSize: "13px",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              {[1, 2, 3, 5, 10].map((n) => (
                <option key={n} value={n}>
                  {n} token{n > 1 ? "s" : ""} — R${(n * avulsoUnit).toLocaleString("pt-BR")}
                </option>
              ))}
            </select>
            <button
              type="submit"
              style={{
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                padding: "9px 18px",
                borderRadius: 9,
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <CreditCard size={14} /> Comprar
            </button>
          </form>
        </div>
      </div>

      {/* Gráfico de consumo */}
      {transactions.length > 0 && <TokenChart transactions={transactions} />}

      {/* Extrato */}
      <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14, color: "var(--text)" }}>
        Extrato de tokens
      </h2>

      {transactions.length === 0 ? (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "40px 24px", textAlign: "center" }}>
          <Receipt size={36} style={{ color: "var(--text-faint)", display: "block", marginBottom: 10 }} />
          <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "14px" }}>Nenhuma movimentação ainda.</p>
        </div>
      ) : (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 100px 90px 90px",
              padding: "12px 20px",
              borderBottom: "1px solid var(--border)",
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--text-faint)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <span>Descrição</span>
            <span style={{ textAlign: "right" }}>Data</span>
            <span style={{ textAlign: "right" }}>Tokens</span>
            <span style={{ textAlign: "right" }}>Saldo</span>
          </div>
          {transactions.map((tx, i) => (
            <div
              key={tx.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 100px 90px 90px",
                padding: "14px 20px",
                borderBottom: i < transactions.length - 1 ? "1px solid var(--border)" : "none",
                fontSize: "13px",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: tx.type === "credit" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <i
                    className={`ti ${tx.type === "credit" ? "ti-arrow-down-left" : "ti-arrow-up-right"}`}
                    style={{ fontSize: 13, color: tx.type === "credit" ? "#22c55e" : "#ef4444" }}
                  />
                </div>
                <span style={{ color: "var(--text)" }}>{tx.description}</span>
              </div>
              <span style={{ textAlign: "right", color: "var(--text-faint)", fontSize: "12px" }}>
                {new Date(tx.date).toLocaleDateString("pt-BR")}
              </span>
              <span style={{ textAlign: "right", fontWeight: 700, color: tx.type === "credit" ? "#22c55e" : "#ef4444" }}>
                {tx.type === "credit" ? "+" : "-"}{tx.amount}
              </span>
              <span style={{ textAlign: "right", fontWeight: 700, color: "var(--text)" }}>
                {tx.balance}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
