"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { updateTicket } from "@/app/actions/suporte";
import { TICKET_STATUS_MAP, TICKET_PRIORITY_MAP } from "@/app/lib/constants/status";
import type { TicketStatus, TicketPriority } from "@/app/lib/constants/status";

const STATUSES: TicketStatus[]  = ["aberto", "em_andamento", "resolvido", "fechado"];
const PRIORITIES: TicketPriority[] = ["baixa", "media", "alta"];

interface Props {
  ticketId: string;
  currentStatus: TicketStatus;
  currentPriority: TicketPriority;
}

export function AdminTicketActions({ ticketId, currentStatus, currentPriority }: Props) {
  const [status,   setStatus]   = useState<TicketStatus>(currentStatus);
  const [priority, setPriority] = useState<TicketPriority>(currentPriority);
  const [error,    setError]    = useState("");
  const [saved,    setSaved]    = useState(false);
  const [pending,  startTransition] = useTransition();
  const router = useRouter();

  const isDirty = status !== currentStatus || priority !== currentPriority;

  function handleSave() {
    setError("");
    setSaved(false);
    const fd = new FormData();
    fd.append("ticket_id", ticketId);
    fd.append("status", status);
    fd.append("priority", priority);
    startTransition(async () => {
      const res = await updateTicket(fd);
      if (res?.error) {
        setError(res.error);
      } else {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  return (
    <div
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: 14,
        padding: "16px 20px",
        marginBottom: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        <i className="ti ti-settings" style={{ marginRight: 6 }} />
        Ações do chamado
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {/* Status */}
        <div style={{ flex: 1, minWidth: 130 }}>
          <p style={{ margin: "0 0 5px", fontSize: "11px", color: "var(--text-faint)", fontWeight: 600 }}>Status</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {STATUSES.map((s) => {
              const info = TICKET_STATUS_MAP[s];
              const active = status === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: "11px", fontWeight: 700,
                    padding: "5px 10px", borderRadius: 999,
                    border: `1px solid ${active ? info.color : "var(--border)"}`,
                    background: active ? `${info.color}18` : "var(--surface)",
                    color: active ? info.color : "var(--text-faint)",
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  <i className={`ti ${info.icon}`} style={{ fontSize: 11 }} />
                  {info.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Prioridade */}
        <div style={{ flex: 1, minWidth: 130 }}>
          <p style={{ margin: "0 0 5px", fontSize: "11px", color: "var(--text-faint)", fontWeight: 600 }}>Prioridade</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {PRIORITIES.map((p) => {
              const info = TICKET_PRIORITY_MAP[p];
              const active = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: "11px", fontWeight: 700,
                    padding: "5px 10px", borderRadius: 999,
                    border: `1px solid ${active ? info.color : "var(--border)"}`,
                    background: active ? `${info.color}18` : "var(--surface)",
                    color: active ? info.color : "var(--text-faint)",
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  {info.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <p style={{ margin: 0, fontSize: "12px", color: "#ef4444", display: "flex", alignItems: "center", gap: 5 }}>
          <i className="ti ti-alert-circle" /> {error}
        </p>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || pending}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: saved ? "#22c55e" : isDirty && !pending ? "var(--primary)" : "var(--surface-2)",
            color: saved || (isDirty && !pending) ? "#fff" : "var(--text-faint)",
            border: "none",
            borderRadius: 10,
            padding: "9px 18px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: isDirty && !pending ? "pointer" : "not-allowed",
            fontFamily: "inherit",
            transition: "background 0.2s",
          }}
        >
          <i className={`ti ${pending ? "ti-loader-2" : saved ? "ti-check" : "ti-device-floppy"}`}
            style={{ fontSize: 14, animation: pending ? "spin 1s linear infinite" : "none" }}
          />
          {pending ? "Salvando…" : saved ? "Salvo!" : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}
