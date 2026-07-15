"use client";

import { ClipboardCheck } from "lucide-react";
import { useT } from "@/app/lib/i18n/I18nProvider";

/** Banner "avaliar solução" (cliente + status resolvido) — i18n. */
export function ReviewBanner({ ticketId }: { ticketId: string }) {
  const t = useT();
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 16, flexWrap: "wrap",
      background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.25)",
      borderRadius: 14, padding: "16px 20px", marginBottom: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ClipboardCheck size={19} style={{ color: "var(--c-success)" }} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>
            {t("serviceDesk.detail.reviewBanner.title")}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
            {t("serviceDesk.detail.reviewBanner.desc")}
          </p>
        </div>
      </div>
      <a
        href={`/portal/suporte/${ticketId}/avaliar`}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0,
          background: "var(--c-success)", color: "#fff",
          borderRadius: 10, padding: "9px 18px",
          fontSize: "13px", fontWeight: 700, textDecoration: "none",
          boxShadow: "0 4px 14px rgba(34,197,94,0.3)",
        }}
      >
        <ClipboardCheck size={14} /> {t("serviceDesk.detail.reviewBanner.cta")}
      </a>
    </div>
  );
}
