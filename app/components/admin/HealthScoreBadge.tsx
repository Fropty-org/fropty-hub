"use client"

import { Minus } from "lucide-react"
import { RISK_CONFIG } from "@/app/lib/constants/customer-success"
import type { RiskLevel } from "@/app/lib/types/customer-success"
import { useT } from "@/app/lib/i18n/I18nProvider"

interface Props {
  score: number | null
  risk: RiskLevel | null
  showScore?: boolean
}

export function HealthScoreBadge({ score, risk, showScore = true }: Props) {
  const t = useT()
  if (score === null || risk === null) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 10px", borderRadius: 999,
        background: "var(--surface-2)", border: "1px solid var(--border)",
        fontSize: "11px", fontWeight: 600, color: "var(--text-faint)",
      }}>
        <Minus size={12} />
        {t("admin.riskLevels.noEval")}
      </span>
    )
  }

  const cfg = RISK_CONFIG[risk]
  const { Icon } = cfg

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999,
      background: cfg.bg,
      border: `1px solid ${cfg.color}40`,
      fontSize: "11px", fontWeight: 700, color: cfg.color,
    }}>
      <Icon size={12} />
      {t("admin.riskLevels." + risk)}
      {showScore && <span style={{ opacity: 0.8 }}>{score}</span>}
    </span>
  )
}
