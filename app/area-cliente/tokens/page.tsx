import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { ClientSidebar } from "../../components/cliente/ClientSidebar";
import type { Database } from "../../lib/supabase/types";

type ProfileRow     = Database["public"]["Tables"]["profiles"]["Row"];
type TransactionRow = Database["public"]["Tables"]["token_transactions"]["Row"];

export const metadata: Metadata = {
  title: "Meus Tokens",
  robots: { index: false, follow: false },
};

export default async function TokensPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/area-cliente");

  const profileResult      = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const transactionsResult = await supabase.from("token_transactions").select("*").eq("client_id", user.id).order("created_at", { ascending: false });

  const profile      = profileResult.data as ProfileRow | null;
  const transactions = transactionsResult.data as TransactionRow[] | null;

  const tokenBalance  = profile?.token_balance ?? 0;
  const plan          = profile?.plan ?? null;
  const planRenewal   = profile?.plan_renewal ?? null;
  const displayName   = profile?.name || user.email?.split("@")[0] || "Cliente";
  const planLabel     = plan === "pro" ? "Pro (8 tokens/mês)" : plan === "basico" ? "Básico (4 tokens/mês)" : "Sem plano";
  const planPrice     = plan === "pro" ? "R$ 89,90" : plan === "basico" ? "R$ 49,90" : "—";

  const sidebarUser = {
    id: user.id,
    name: displayName,
    email: user.email ?? "",
    avatarInitials: displayName.slice(0, 2).toUpperCase(),
    plan: (plan ?? undefined) as "basico" | "pro" | undefined,
    planRenewal: planRenewal ?? undefined,
    tokenBalance,
    projects: [],
    tokenHistory: [],
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <ClientSidebar user={sidebarUser} active="tokens" />

      <main style={{ flex: 1, padding: "40px 32px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 6px" }}>Tokens</h1>
          <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.95rem" }}>
            Cada token equivale a uma hora de trabalho de desenvolvimento ou suporte.
          </p>
        </div>

        {/* Balance card */}
        <div style={{ background: "linear-gradient(135deg, var(--brand-800) 0%, var(--brand-600) 100%)", borderRadius: 18, padding: "28px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <p style={{ margin: "0 0 8px", fontSize: "13px", color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Saldo disponível</p>
            <p style={{ margin: 0, fontSize: "3rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
              {tokenBalance}<span style={{ fontSize: "1rem", fontWeight: 500, marginLeft: 8, opacity: 0.7 }}>tokens</span>
            </p>
          </div>
          {plan && (
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: "0 0 4px", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>Plano atual</p>
              <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: "#fff" }}>{planLabel}</p>
              <p style={{ margin: "0 0 12px", fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>{planPrice}/mês</p>
              {planRenewal && (
                <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                  Renovação: {new Date(planRenewal).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
          {[
            { title: "1 token equivale a", body: "1 hora de dev, correção de bug, nova feature pequena ou ajuste de layout" },
            { title: "Token avulso", body: "R$ 300,00 por token fora do plano. Assinante economiza 50% — R$ 150,00." },
          ].map(({ title, body }) => (
            <div key={title} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "18px 20px" }}>
              <p style={{ margin: "0 0 4px", fontSize: "12px", color: "var(--text-faint)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</p>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: body.replace("50%", "<span style='color:var(--primary);font-weight:600'>50%</span>") }} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px", marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "0.95rem" }}>Precisa de mais tokens?</p>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>Compre tokens avulsos por R$ 150,00 cada (preço de assinante).</p>
          </div>
          <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--cta-bg)", color: "var(--cta-text)", padding: "10px 20px", borderRadius: 10, fontSize: "13px", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
            <i className="ti ti-brand-whatsapp" /> Comprar via WhatsApp
          </a>
        </div>

        {/* History */}
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Histórico</h2>
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16, overflow: "hidden" }}>
          {!transactions || transactions.length === 0 ? (
            <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-faint)" }}>
              <i className="ti ti-receipt-off" style={{ fontSize: 36, display: "block", marginBottom: 10 }} />
              <p style={{ margin: 0 }}>Nenhuma transação ainda.</p>
            </div>
          ) : (
            transactions.map((tx, i) => (
              <div key={tx.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: i < transactions.length - 1 ? "1px solid var(--border)" : "none", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: tx.type === "credit" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={`ti ${tx.type === "credit" ? "ti-arrow-down" : "ti-arrow-up"}`} style={{ fontSize: 16, color: tx.type === "credit" ? "#22c55e" : "#ef4444" }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 600 }}>{tx.description}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--text-faint)" }}>{new Date(tx.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "14px", color: tx.type === "credit" ? "#22c55e" : "#ef4444" }}>
                    {tx.type === "credit" ? "+" : "-"}{tx.amount} token{tx.amount !== 1 ? "s" : ""}
                  </p>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>Saldo: {tx.balance}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
