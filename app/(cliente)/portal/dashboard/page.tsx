import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/app/lib/auth/session";
import { createClient } from "@/app/lib/supabase/server";
import { CalendarDays, LayoutGrid, Coins, MessageCircle, MessagePlus, CreditCard } from "lucide-react";
import { OnboardingBanner } from "@/app/components/cliente/OnboardingBanner";
import { OnboardingChecklist } from "@/app/components/cliente/OnboardingChecklist";
import { WHATSAPP_URL } from "@/app/lib/config";
import { getService } from "@/app/lib/constants/services";
import { PlanRenewalBanner } from "@/app/components/cliente/PlanRenewalBanner";
import { getOnboardingSteps } from "@/app/lib/onboarding";

export const metadata: Metadata = {
  title: "Meu Painel",
};

export default async function PortalDashboardPage() {
  const profile  = await getProfile();
  if (profile?.role === "admin") redirect("/admin/overview");

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) console.error("[portal/dashboard] user is null after requireRole");

  const { count: openTickets } = user
    ? await supabase
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .eq("client_id", user.id)
        .in("status", ["aberto", "em_andamento"])
    : { count: 0 };

  const displayName    = profile?.name || user?.email?.split("@")[0] || "Cliente";
  const tokenBalance   = profile?.token_balance ?? 0;
  const services       = profile?.services ?? [];
  const contractStart  = profile?.contract_start ?? null;
  const hasServices    = services.length > 0;

  // Onboarding checklist
  const showOnboarding = profile && !profile.onboarding_completed;
  const onboardingSteps = showOnboarding ? await getOnboardingSteps(profile, supabase) : null;
  const hasIncompleteSteps = onboardingSteps ? onboardingSteps.some((s) => !s.completed) : false;

  return (
    <div style={{ padding: "40px 32px", maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ color: "var(--text-faint)", fontSize: "13px", margin: "0 0 4px" }}>
          Bem-vindo de volta,
        </p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, color: "var(--text)" }}>
          {displayName.split(" ")[0]}
        </h1>
      </div>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 36,
        }}
      >
        {[
          { Icon: LayoutGrid,    label: "Serviços ativos",    value: services.length,  color: "var(--primary)" },
          { Icon: Coins,         label: "Tokens disponíveis", value: tokenBalance,     color: "#EF9F27" },
          { Icon: MessageCircle, label: "Chamados abertos",   value: openTickets ?? 0, color: "#22c55e" },
        ].map(({ Icon, label, value, color }) => (
          <div
            key={label}
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
              borderRadius: 14,
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "rgba(91,87,232,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "var(--text)" }}>{value}</p>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--text-faint)" }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Onboarding checklist — exibido enquanto não for dispensado */}
      {showOnboarding && onboardingSteps && hasIncompleteSteps && (
        <OnboardingChecklist steps={onboardingSteps} />
      )}

      {/* Banner de renovação de plano */}
      {profile?.plan && profile.plan !== "sem_plano" && profile.plan_renewal && (
        <PlanRenewalBanner
          plan={profile.plan as "basico" | "pro"}
          renewalDate={profile.plan_renewal}
        />
      )}

      {/* Onboarding — quando o cliente ainda não tem serviços contratados */}
      {!hasServices && (
        <OnboardingBanner name={displayName} tokenBalance={tokenBalance} />
      )}

      {/* Serviços contratados */}
      {hasServices && (
        <>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16, color: "var(--text)" }}>
            Meus serviços
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 14,
              marginBottom: 36,
            }}
          >
            {services.map((id) => {
              const svc = getService(id);
              const label   = svc?.label ?? id;
              const SvcIcon = svc?.Icon;
              const color   = svc?.color ?? "var(--primary)";
              return (
                <div
                  key={id}
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    borderRadius: 14,
                    padding: "16px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}1f`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {SvcIcon && <SvcIcon size={19} style={{ color }} />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#22c55e", fontWeight: 600 }}>Ativo</p>
                  </div>
                </div>
              );
            })}
          </div>

          {contractStart && (
            <p style={{ margin: "-20px 0 36px", fontSize: "12px", color: "var(--text-faint)" }}>
              <CalendarDays size={14} style={{ marginRight: 6 }} />
              Contrato iniciado em {new Date(contractStart).toLocaleDateString("pt-BR")}
            </p>
          )}
        </>
      )}

      {/* Ações rápidas */}
      <div style={{ marginTop: 8 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16, color: "var(--text)" }}>
          Ações rápidas
        </h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { href: "/portal/suporte/novo", Icon: MessagePlus,    color: "var(--primary)", label: "Abrir chamado" },
            { href: "/portal/financeiro",   Icon: CreditCard,     color: "#EF9F27",        label: "Financeiro" },
            { href: WHATSAPP_URL,           Icon: MessageCircle,  color: "#22c55e",        label: "Falar no WhatsApp", external: true },
          ].map(({ href, Icon, color, label, external }) => (
            <Link
              key={href}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "10px 18px",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text)",
                textDecoration: "none",
                transition: "border-color 0.15s",
              }}
            >
              <Icon size={16} style={{ color }} /> {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
