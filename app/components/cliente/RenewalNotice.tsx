"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock, X } from "lucide-react";

interface Props {
  daysLeft: number;   // 0..10
  renewalStr: string;
}

/**
 * Aviso informativo de fim de vigência do mês corrente (janela de 10 dias).
 * Tom neutro — apenas deixa o cliente ciente do acesso, sem apelar para venda.
 * Dispensável na sessão (some ao fechar; reaparece no próximo carregamento).
 */
export function RenewalNotice({ daysLeft, renewalStr }: Props) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  const quando = daysLeft <= 0 ? "hoje" : daysLeft === 1 ? "amanhã" : `em ${daysLeft} dias`;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 16px",
      background: "color-mix(in srgb, var(--c-warning) 8%, var(--surface))",
      borderBottom: "1px solid color-mix(in srgb, var(--c-warning) 22%, transparent)",
    }}>
      <CalendarClock size={16} style={{ color: "var(--c-warning)", flexShrink: 0 }} />
      <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text)", flex: 1, lineHeight: 1.4 }}>
        A vigência do seu acesso encerra <strong>{quando}</strong> ({renewalStr}). Renove para manter o portal disponível.
      </p>
      <Link href="/portal/financeiro" style={{ fontSize: "12px", fontWeight: 700, color: "var(--c-warning)", textDecoration: "none", whiteSpace: "nowrap" }}>
        Ver renovação
      </Link>
      <button type="button" onClick={() => setHidden(true)} aria-label="Dispensar" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", display: "flex", flexShrink: 0 }}>
        <X size={15} />
      </button>
    </div>
  );
}
