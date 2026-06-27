"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { updateTicket } from "@/app/actions/suporte";
import { Settings, AlertCircle, Loader2, Check, Save, LucideIcon } from "lucide-react";
import { TICKET_STATUS_MAP, TICKET_PRIORITY_MAP } from "@/app/lib/constants/status";
import type { TicketStatus, TicketPriority } from "@/app/lib/constants/status";

const STATUSES: TicketStatus[]  = ["aberto", "em_andamento", "resolvido", "reaberto", "fechado"];
const PRIORITIES: TicketPriority[] = ["baixa", "media", "alta"];

interface Props {
  ticketId: string;
  currentStatus: TicketStatus;
  currentPriority: TicketPriority;
}

export function AdminTicketActions({ ticketId, currentStatus, currentPriority }: Props) {
  const [status,   setStatus]   = useState<TicketStatus>(currentStatus);
  const [priority, setPriority] = useState<TicketPriority>(currentPriority);
  const [comment,  setComment]  = useState("");
  const [error,    setError]    = useState("");
  const [saved,    setSaved]    = useState(false);
  const [pending,  startTransition] = useTransition();
  const router = useRouter();

  // Marcar como "Aguardando validação" exige comentário (vai junto na notificação)
  const requiresComment = status === "resolvido" && currentStatus !== "resolvido";
  const isDirty = status !== currentStatus || priority !== currentPriority;
  const canSave = isDirty && !(requiresComment && !comment.trim());

  function handleSave() {
    setError("");
    setSaved(false);
    const fd = new FormData();
    fd.append("ticket_id", ticketId);
    fd.append("status", status);
    fd.append("priority", priority);
    if (requiresComment) fd.append("comment", comment.trim());
    startTransition(async () => {
      const res = await updateTicket(fd);
      if (res?.error) {
        setError(res.error);
      } else {
        setSaved(true);
        setComment("");
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
        <Settings size={14} style={{ marginRight: 6 }} />
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
                  <info.Icon size={11} />
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

      {/* Comentário obrigatório ao marcar como Aguardando validação */}
      {requiresComment && (
        <div>
          <p style={{ margin: "0 0 5px", fontSize: "11px", color: "var(--text-faint)", fontWeight: 600 }}>
            Comentário da resolução <span style={{ color: "#ef4444" }}>*</span>
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Explique ao cliente o que foi feito para resolver. Esse texto vai junto com a notificação."
            style={{
              width: "100%", background: "var(--input-bg)", color: "var(--text)",
              border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px",
              fontSize: "13px", fontFamily: "inherit", outline: "none", resize: "vertical", minHeight: 72, boxSizing: "border-box",
            }}
          />
        </div>
      )}

      {error && (
        <p style={{ margin: 0, fontSize: "12px", color: "#ef4444", display: "flex", alignItems: "center", gap: 5 }}>
          <AlertCircle size={14} /> {error}
        </p>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave || pending}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: saved ? "#22c55e" : canSave && !pending ? "var(--primary)" : "var(--surface-2)",
            color: saved || (canSave && !pending) ? "#fff" : "var(--text-faint)",
            border: "none",
            borderRadius: 10,
            padding: "9px 18px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: canSave && !pending ? "pointer" : "not-allowed",
            fontFamily: "inherit",
            transition: "background 0.2s",
          }}
        >
          {pending ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : saved ? <Check size={13} /> : <Save size={13} />}
          {pending ? "Salvando…" : saved ? "Salvo!" : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}
