"use client";

import Link from "next/link";
import { AlertTriangle, Clock, CheckCircle, CreditCard, type LucideIcon } from "lucide-react";

interface Props {
  plan: "basico" | "pro";
  renewalDate: string; // ISO date string
}

const PLAN_LABEL = { basico: "Básico", pro: "Pro" };
const PLAN_DAYS  = 30; // ciclo mensal

export function PlanRenewalBanner({ plan, renewalDate }: Props) {
  const renewal    = new Date(renewalDate);
  const now        = new Date();
  const daysLeft   = Math.max(0, Math.ceil((renewal.getTime() - now.getTime()) / 86400000));
  const progress   = Math.min(100, Math.max(0, Math.round(((PLAN_DAYS - daysLeft) / PLAN_DAYS) * 100)));

  const isUrgent   = daysLeft <= 7;
  const isWarning  = daysLeft <= 14;

  const color = isUrgent ? "#ef4444" : isWarning ? "#EF9F27" : "#22c55e";
  const bg    = isUrgent ? "rgba(239,68,68,0.08)"   : isWarning ? "rgba(239,159,39,0.08)" : "rgba(34,197,94,0.06)";
  const border= isUrgent ? "rgba(239,68,68,0.25)"   : isWarning ? "rgba(239,159,39,0.25)" : "rgba(34,197,94,0.2)";
  const StatusIcon: LucideIcon = isUrgent ? AlertTriangle : isWarning ? Clock : CheckCircle;

  const renewalStr = renewal.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 14,
      padding: "18px 20px",
      marginBottom: 28,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusIcon size={20} style={{ color }} />
          <div>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>
              Plano {PLAN_LABEL[plan]} — renovação em {daysLeft === 0 ? "hoje" : `${daysLeft} dia${daysLeft !== 1 ? "s" : ""}`}
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>
              Vence em {renewalStr}
            </p>
          </div>
        </div>
        <Link
          href="/portal/financeiro"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 8,
            background: color, color: "#fff",
            fontSize: "12px", fontWeight: 700, textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <CreditCard size={13} />
          {daysLeft <= 3 ? "Renovar agora" : "Ver plano"}
        </Link>
      </div>

      {/* Barra de progresso do ciclo */}
      <div style={{ background: "var(--border)", borderRadius: 999, height: 5, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: color,
          borderRadius: 999,
          transition: "width 0.3s ease",
        }} />
      </div>
      <p style={{ margin: "6px 0 0", fontSize: "10px", color: "var(--text-faint)" }}>
        {progress}% do ciclo concluído
      </p>
    </div>
  );
}
