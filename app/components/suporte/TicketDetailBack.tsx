"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

interface Props {
  subject: string;
  ticketLabel: string | null;
}

export function TicketDetailBack({ subject, ticketLabel }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: "12px" }}>
      <Link
        href="/portal/suporte"
        style={{
          color: "var(--text-faint)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "5px 10px 5px 8px",
          borderRadius: 8,
          border: "1px solid var(--card-border)",
          background: "var(--card-bg)",
          fontWeight: 600,
          transition: "border-color 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLAnchorElement;
          el.style.borderColor = "var(--border)";
          el.style.color = "var(--text-muted)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLAnchorElement;
          el.style.borderColor = "var(--card-border)";
          el.style.color = "var(--text-faint)";
        }}
      >
        <ArrowLeft size={13} />
        Suporte
      </Link>
      <ChevronRight size={12} style={{ color: "var(--text-faint)" }} />
      {ticketLabel && (
        <>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", letterSpacing: "0.04em" }}>{ticketLabel}</span>
          <ChevronRight size={12} style={{ color: "var(--text-faint)" }} />
        </>
      )}
      <span
        className="breadcrumb-title"
        style={{ color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 300 }}
      >
        {subject}
      </span>
    </div>
  );
}
