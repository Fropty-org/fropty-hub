import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/app/lib/auth/session";
import { createClient } from "@/app/lib/supabase/server";
import {
  CalendarDays, Coins, MessageCircle, MessageSquarePlus,
  CreditCard, ArrowRight, Zap, FolderKanban, ChevronRight,
  Clock, CheckCircle2, AlertCircle, CircleDot, Heart, ShieldAlert,
} from "lucide-react";
import { OnboardingBanner } from "@/app/components/cliente/OnboardingBanner";
import { OnboardingChecklist } from "@/app/components/cliente/OnboardingChecklist";
import { WHATSAPP_URL } from "@/app/lib/config";
import { getService } from "@/app/lib/constants/services";
import { PlanRenewalBanner } from "@/app/components/cliente/PlanRenewalBanner";
import { getOnboardingSteps } from "@/app/lib/onboarding";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { PROJECT_STATUSES, ACTIVE_PROJECT_STATUSES } from "@/app/lib/constants/projects";
import { ActivityFeed, type ActivityItem } from "@/app/components/cliente/ActivityFeed";

export const metadata: Metadata = { title: "Meu Painel" };

function TicketPriorityIcon({ priority }: { priority: string }) {
  if (priority === "critica" || priority === "alta")
    return <AlertCircle size={13} style={{ color: "var(--c-danger)", flexShrink: 0 }} />;
  if (priority === "media")
    return <Clock size={13} style={{ color: "var(--c-warning)", flexShrink: 0 }} />;
  return <CircleDot size={13} style={{ color: "var(--text-faint)", flexShrink: 0 }} />;
}

export default async function PortalDashboardPage() {
  const profile = await getProfile();
  if (profile?.role === "admin") redirect("/admin/overview");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [
    ticketsRes,
    projectsRes,
    recentTicketsRes,
    recentProjectsRes,
    healthRes,
    notifsRes,
    tokenTxRes,
    awaitingReviewRes,
    renewalRes,
  ] = await Promise.all([
    user
      ? supabase.from("tickets").select("id", { count: "exact", head: true })
          .eq("client_id", user.id).in("status", ["aberto", "em_andamento", "reaberto"])
      : Promise.resolve({ count: 0 }),
    user
      ? supabase.from("projects").select("id", { count: "exact", head: true })
          .eq("client_id", user.id).in("status", ACTIVE_PROJECT_STATUSES)
      : Promise.resolve({ count: 0 }),
    user
      ? supabase.from("tickets")
          .select("id, subject, status, priority, created_at, updated_at")
          .eq("client_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(4)
      : Promise.resolve({ data: [] }),
    user
      ? supabase.from("projects")
          .select("id, title, status, progress, updated_at")
          .eq("client_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(3)
      : Promise.resolve({ data: [] }),
    user
      ? supabase.from("health_scores").select("risk_level, score_total").eq("client_id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase.from("notifications")
          .select("id, type, title, body, link, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(8)
      : Promise.resolve({ data: [] }),
    user
      ? supabase.from("token_transactions")
          .select("id, description, type, amount, created_at")
          .eq("client_id", user.id)
          .order("created_at", { ascending: false })
          .limit(4)
      : Promise.resolve({ data: [] }),
    // Chamados resolvidos aguardando a avaliação do cliente
    user
      ? supabase.from("tickets")
          .select("id, subject, ticket_number")
          .eq("client_id", user.id)
          .eq("status", "resolvido")
          .order("updated_at", { ascending: false })
          .limit(2)
      : Promise.resolve({ data: [] }),
    // Próximo contrato assinado a vencer (para alerta de renovação)
    user
      ? supabase.from("contracts")
          .select("id, title, end_date")
          .eq("client_id", user.id)
          .eq("status", "assinado")
          .not("end_date", "is", null)
          .gte("end_date", new Date().toISOString().slice(0, 10))
          .order("end_date", { ascending: true })
          .limit(1)
      : Promise.resolve({ data: [] }),
  ]);

  const openTickets    = ticketsRes.count    ?? 0;
  const activeProjects = projectsRes.count   ?? 0;
  const recentTickets  = (recentTicketsRes as { data: Record<string, unknown>[] | null }).data ?? [];
  const recentProjects = (recentProjectsRes as { data: Record<string, unknown>[] | null }).data ?? [];
  const healthData     = (healthRes as { data: { risk_level: string; score_total: number } | null }).data;

  const firstName     = (profile?.name || user?.email?.split("@")[0] || "Cliente").split(" ")[0];
  const tokenBalance  = profile?.token_balance ?? 0;
  const services      = profile?.services ?? [];
  const contractStart = profile?.contract_start ?? null;
  const hasServices   = services.length > 0;

  const showOnboarding     = profile && !profile.onboarding_completed;
  const onboardingSteps    = showOnboarding ? await getOnboardingSteps(profile, supabase) : null;
  const hasIncompleteSteps = onboardingSteps ? onboardingSteps.some((s) => !s.completed) : false;

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const hasRecentTickets  = recentTickets.length > 0;
  const hasRecentProjects = recentProjects.length > 0;

  // Feed unificado: notificações + movimentações de tokens, mais recentes primeiro
  const notifs  = notifsRes.data  ?? [];
  const tokenTx = tokenTxRes.data ?? [];
  const activity: ActivityItem[] = [
    ...notifs.map((n) => ({
      id:        `n-${n.id}`,
      kind:      n.type,
      title:     n.title,
      body:      n.body,
      link:      n.link,
      createdAt: n.created_at,
    })),
    ...tokenTx.map((t) => ({
      id:        `t-${t.id}`,
      kind:      t.type === "credit" ? "token_credit" : "token_debit",
      title:     t.type === "credit"
        ? `${t.amount} token${t.amount !== 1 ? "s" : ""} creditado${t.amount !== 1 ? "s" : ""}`
        : `${t.amount} token${t.amount !== 1 ? "s" : ""} utilizado${t.amount !== 1 ? "s" : ""}`,
      body:      t.description,
      link:      "/portal/financeiro",
      createdAt: t.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  // Ações contextuais: o que o cliente precisa fazer agora
  const awaitingReview = awaitingReviewRes.data ?? [];
  const nextRenewal    = (renewalRes.data ?? [])[0] ?? null;
  const renewalDays    = nextRenewal?.end_date
    ? Math.ceil((new Date(nextRenewal.end_date).getTime() - Date.now()) / 86_400_000)
    : null;

  const contextualActions: {
    href: string; label: string; description: string; tone: "warning" | "danger" | "info";
  }[] = [
    ...awaitingReview.map((t) => ({
      href:        `/portal/suporte/${t.id}/avaliar`,
      label:       `Avaliar chamado UFT${String(t.ticket_number).padStart(4, "0")}`,
      description: "Resolvido — aguardando sua validação",
      tone:        "warning" as const,
    })),
    ...(hasServices && tokenBalance === 0
      ? [{
          href:        "/portal/financeiro",
          label:       "Recarregar tokens",
          description: "Sem tokens, não é possível abrir chamados",
          tone:        "danger" as const,
        }]
      : []),
    ...(nextRenewal && renewalDays !== null && renewalDays <= 45
      ? [{
          href:        `/portal/contratos/${nextRenewal.id}`,
          label:       `Contrato renova em ${renewalDays}d`,
          description: nextRenewal.title,
          tone:        "info" as const,
        }]
      : []),
  ].slice(0, 3);

  return (
    <div style={{ padding: "24px 24px", maxWidth: 1060, margin: "0 auto" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 32, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <p style={{ color: "var(--text-faint)", fontSize: "13px", margin: "0 0 3px", fontWeight: 500 }}>
            {greeting},
          </p>
          <h1 style={{ fontSize: "1.65rem", fontWeight: 800, margin: 0, color: "var(--text)", letterSpacing: "-0.03em" }}>
            {firstName} 👋
          </h1>
          {contractStart && (
            <p style={{ margin: "6px 0 0", fontSize: "12px", color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 5 }}>
              <CalendarDays size={12} />
              Cliente desde {new Date(contractStart).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </p>
          )}
        </div>

        <Link
          href="/portal/suporte/novo"
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "var(--cta-bg)", color: "var(--cta-text)",
            borderRadius: "var(--r-md)", padding: "9px 18px",
            fontSize: "13px", fontWeight: 700, textDecoration: "none",
            boxShadow: "var(--shadow-brand)", flexShrink: 0,
            transition: "opacity 0.15s",
          }}
        >
          <MessageSquarePlus size={14} /> Abrir chamado
        </Link>
      </div>

      {/* ── KPI cards ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 14, marginBottom: 32,
      }}>
        {[
          {
            icon: <FolderKanban size={18} />,
            label: "Projetos ativos",
            value: activeProjects,
            accent: "var(--primary)",
            bg: "rgba(91,87,232,0.10)",
            href: "/portal/projetos",
            hint: undefined as string | undefined,
          },
          {
            icon: <Coins size={18} />,
            label: "Tokens disponíveis",
            value: tokenBalance,
            accent: "var(--brand-accent)",
            bg: "rgba(239,159,39,0.10)",
            href: null,
            hint: "1 token é consumido ao abrir um chamado de suporte. Tokens vêm no seu plano ou podem ser adquiridos avulsos.",
          },
          {
            icon: <MessageCircle size={18} />,
            label: "Chamados abertos",
            value: openTickets,
            accent: openTickets > 0 ? "var(--c-warning)" : "var(--c-success)",
            bg: openTickets > 0 ? "rgba(245,158,11,0.10)" : "var(--c-success-bg)",
            href: "/portal/suporte",
            hint: undefined as string | undefined,
          },
          {
            icon: <CheckCircle2 size={18} />,
            label: "Serviços ativos",
            value: services.length,
            accent: "var(--c-success)",
            bg: "var(--c-success-bg)",
            href: null,
            hint: undefined as string | undefined,
          },
        ].map(({ icon, label, value, accent, bg, href, hint }) => {
          const inner = (
            <>
              <div style={{
                width: 38, height: 38, borderRadius: "var(--r-md)", background: bg,
                display: "flex", alignItems: "center", justifyContent: "center", color: accent,
              }}>
                {icon}
              </div>
              <p style={{ margin: "10px 0 0", fontSize: "26px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                {value}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: "11.5px", color: "var(--text-faint)", fontWeight: 500 }}>
                {label}
              </p>
            </>
          );
          return href ? (
            <Link
              key={label}
              href={href}
              title={hint}
              className="hub-stat-card hub-card-hover"
              style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}
            >
              {inner}
            </Link>
          ) : (
            <div key={label} className="hub-stat-card" title={hint} style={hint ? { cursor: "help" } : undefined}>{inner}</div>
          );
        })}
      </div>

      {/* ── Health score banner ── */}
      {healthData && healthData.risk_level !== "saudavel" && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 14, flexWrap: "wrap", marginBottom: 20,
          background: healthData.risk_level === "risco" ? "rgba(239,68,68,0.07)" : "rgba(245,158,11,0.07)",
          border: `1px solid ${healthData.risk_level === "risco" ? "rgba(239,68,68,0.25)" : "rgba(245,158,11,0.25)"}`,
          borderRadius: 14, padding: "14px 18px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: healthData.risk_level === "risco" ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ShieldAlert size={17} style={{ color: healthData.risk_level === "risco" ? "#ef4444" : "var(--c-warning)" }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>
                {healthData.risk_level === "risco" ? "Sua conta precisa de atenção" : "Sua conta está em atenção"}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                {healthData.risk_level === "risco"
                  ? "Nosso time irá entrar em contato. Abra um chamado se precisar de ajuda imediata."
                  : "Identificamos alguns pontos de melhoria. Fale conosco se tiver dúvidas."}
              </p>
            </div>
          </div>
          <Link href="/portal/suporte/novo" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "12px", fontWeight: 700, color: healthData.risk_level === "risco" ? "#ef4444" : "var(--c-warning)", textDecoration: "none", whiteSpace: "nowrap" }}>
            Abrir chamado <ChevronRight size={13} />
          </Link>
        </div>
      )}
      {healthData && healthData.risk_level === "saudavel" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 14, padding: "12px 18px" }}>
          <Heart size={15} style={{ color: "var(--c-success)", flexShrink: 0 }} />
          <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-muted)" }}>
            Sua conta está <strong style={{ color: "var(--c-success)" }}>saudável</strong> — pontuação {healthData.score_total}/100
          </span>
        </div>
      )}

      {/* ── Onboarding ── */}
      {showOnboarding && onboardingSteps && hasIncompleteSteps && (
        <div style={{ marginBottom: 28 }}>
          <OnboardingChecklist steps={onboardingSteps} />
        </div>
      )}

      {/* ── Renovação de plano ── */}
      {profile?.plan && profile.plan !== "sem_plano" && profile.plan_renewal && (
        <div style={{ marginBottom: 28 }}>
          <PlanRenewalBanner plan={profile.plan as "basico" | "pro"} renewalDate={profile.plan_renewal} />
        </div>
      )}

      {/* ── Sem serviços ── */}
      {!hasServices && (
        <div style={{ marginBottom: 28 }}>
          <OnboardingBanner name={firstName} tokenBalance={tokenBalance} />
        </div>
      )}

      {/* ── Grid principal: tickets recentes + projetos + ações ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: hasRecentTickets ? "1fr 340px" : "1fr",
        gap: 20,
        marginBottom: 28,
        alignItems: "start",
      }}>

        {/* Tickets recentes */}
        {hasRecentTickets && (
          <div className="hub-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px", borderBottom: "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MessageCircle size={15} style={{ color: "var(--primary)" }} />
                <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text)" }}>Chamados recentes</span>
              </div>
              <Link href="/portal/suporte" style={{
                fontSize: "12px", fontWeight: 600, color: "var(--primary)",
                textDecoration: "none", display: "flex", alignItems: "center", gap: 3,
              }}>
                Ver todos <ChevronRight size={13} />
              </Link>
            </div>
            <div>
              {recentTickets.map((ticket) => (
                <Link
                  key={ticket.id as string}
                  href={`/portal/suporte/${ticket.id}`}
                  className="hub-recent-item"
                  style={{ display: "flex", padding: "12px 20px", borderBottom: "1px solid var(--border)", textDecoration: "none", color: "inherit" }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <TicketPriorityIcon priority={ticket.priority as string} />
                      <span style={{
                        fontSize: "13px", fontWeight: 600, color: "var(--text)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {ticket.subject as string}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <StatusBadge kind="ticket" status={ticket.status as string} size="sm" />
                      <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>
                        {new Date(ticket.updated_at as string).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={14} style={{ color: "var(--text-faint)", flexShrink: 0, alignSelf: "center" }} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Coluna direita: projetos + ações rápidas */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Ações contextuais: pendências que dependem do cliente */}
          {contextualActions.length > 0 && (
            <div>
              <p style={{
                fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.08em", color: "var(--text-faint)", margin: "0 0 10px",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <AlertCircle size={12} style={{ color: "var(--c-warning)" }} /> Para você
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {contextualActions.map(({ href, label, description, tone }) => {
                  const toneColor =
                    tone === "danger" ? "var(--c-danger)" :
                    tone === "warning" ? "var(--c-warning)" : "var(--c-info)";
                  return (
                    <Link
                      key={href}
                      href={href}
                      className="hub-action-link"
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 14px",
                        background: `color-mix(in srgb, ${toneColor} 6%, var(--surface))`,
                        border: `1px solid color-mix(in srgb, ${toneColor} 22%, transparent)`,
                        borderLeft: `3px solid ${toneColor}`,
                        borderRadius: "var(--r-md)", textDecoration: "none",
                        transition: "border-color 0.15s, background 0.15s",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {label}
                        </p>
                        <p style={{ margin: "1px 0 0", fontSize: "11.5px", color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {description}
                        </p>
                      </div>
                      <ArrowRight size={13} style={{ color: toneColor, flexShrink: 0 }} />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Projetos recentes */}
          {hasRecentProjects && (
            <div className="hub-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 18px", borderBottom: "1px solid var(--border)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <FolderKanban size={14} style={{ color: "var(--primary)" }} />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>Projetos</span>
                </div>
                <Link href="/portal/projetos" style={{
                  fontSize: "11.5px", fontWeight: 600, color: "var(--primary)",
                  textDecoration: "none", display: "flex", alignItems: "center", gap: 2,
                }}>
                  Ver todos <ChevronRight size={12} />
                </Link>
              </div>
              <div style={{ padding: "8px 0" }}>
                {recentProjects.map((proj) => (
                  <Link
                    key={proj.id as string}
                    href={`/portal/projetos/${proj.id}`}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 18px", textDecoration: "none", color: "inherit",
                      transition: "background 0.12s",
                    }}
                    className="hub-row-link"
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                      background: (PROJECT_STATUSES[proj.status as keyof typeof PROJECT_STATUSES] ?? {}).color ?? "var(--border-2)",
                    }} />
                    <span style={{
                      flex: 1, fontSize: "13px", fontWeight: 500, color: "var(--text)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {proj.title as string}
                    </span>
                    {proj.progress != null && (
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)" }}>
                        {String(proj.progress)}%
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Ações rápidas */}
          <div>
            <p style={{
              fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.08em", color: "var(--text-faint)", margin: "0 0 10px",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <Zap size={12} style={{ color: "var(--brand-accent)" }} /> Ações rápidas
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { href: "/portal/suporte/novo", icon: <MessageSquarePlus size={15} />, label: "Abrir chamado", accent: "var(--primary)" },
                { href: "/portal/financeiro",   icon: <CreditCard size={15} />,        label: "Ver financeiro", accent: "var(--brand-accent)" },
                { href: WHATSAPP_URL,           icon: <MessageCircle size={15} />,     label: "Falar no WhatsApp", accent: "var(--c-success)", external: true },
              ].map(({ href, icon, label, accent, external }) => (
                <Link
                  key={label}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px",
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: "var(--r-md)", textDecoration: "none",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  className="hub-action-link"
                >
                  <span style={{ color: accent, flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", flex: 1 }}>{label}</span>
                  <ArrowRight size={13} style={{ color: "var(--text-faint)" }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Atividade recente ── */}
      <ActivityFeed items={activity} />

      {/* ── Serviços contratados ── */}
      {hasServices && (
        <div>
          <p style={{
            fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.08em", color: "var(--text-faint)", margin: "0 0 12px",
          }}>
            Meus serviços ({services.length})
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 10,
          }}>
            {services.map((id) => {
              const svc     = getService(id);
              const label   = svc?.label ?? id;
              const SvcIcon = svc?.Icon;
              const color   = svc?.color ?? "var(--primary)";
              return (
                <div key={id} className="hub-card-sm" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "var(--r-sm)", flexShrink: 0,
                    background: `${color}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {SvcIcon && <SvcIcon size={17} style={{ color }} />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {label}
                    </p>
                    <span className="hub-badge hub-badge-success" style={{ fontSize: "10px", padding: "1px 8px", marginTop: 3, display: "inline-flex" }}>
                      Ativo
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
