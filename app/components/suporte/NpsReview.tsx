"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitTicketNps } from "@/app/actions/suporte";
import { AlertCircle, Loader2, Send, CheckCircle2 } from "lucide-react";

const RATINGS: { label: string }[] = [
  { label: "Péssimo" },
  { label: "Ruim" },
  { label: "Ok" },
  { label: "Bom" },
  { label: "Ótimo" },
];

interface Props {
  ticketId: string;
}

export function NpsReview({ ticketId }: Props) {
  const router = useRouter();
  const [rating,   setRating]   = useState<number | null>(null);
  const [hovered,  setHovered]  = useState<number | null>(null);
  const [comment,  setComment]  = useState("");
  const [error,    setError]    = useState("");
  const [done,     setDone]     = useState(false);
  const [pending,  startTransition] = useTransition();

  function submit() {
    if (rating === null) { setError("Selecione uma avaliação antes de enviar."); return; }
    setError("");
    startTransition(async () => {
      const res = await submitTicketNps(ticketId, rating, comment);
      if (res?.error) { setError(res.error); return; }
      setDone(true);
      setTimeout(() => {
        router.push(`/portal/suporte/${ticketId}`);
        router.refresh();
      }, 1800);
    });
  }

  if (done) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "24px 0",
        color: "var(--c-success)", textAlign: "center",
      }}>
        <CheckCircle2 size={44} />
        <p style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: "var(--text)" }}>
          Avaliação enviada. Obrigado pelo feedback!
        </p>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>
          Redirecionando para o chamado…
        </p>
      </div>
    );
  }

  const activeRating = hovered ?? rating;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Emoji picker */}
      <div>
        <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: 700, color: "var(--text-muted)" }}>
          Como você avalia o atendimento recebido?
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {RATINGS.map((item, idx) => {
            const value = idx + 1;
            const isActive = activeRating !== null && value <= activeRating;
            const isSelected = rating === value;
            return (
              <button
                key={value}
                type="button"
                title={item.label}
                onClick={() => setRating(value)}
                onMouseEnter={() => setHovered(value)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
                  background: "transparent", border: "none",
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "transform 0.1s", transform: isActive ? "scale(1.06)" : "scale(1)",
                  minWidth: 60,
                }}
              >
                <span style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 42, height: 42, borderRadius: "50%",
                  fontSize: "16px", fontWeight: 800, fontVariantNumeric: "tabular-nums",
                  background: isActive ? "var(--primary)" : "var(--surface-2)",
                  color: isActive ? "#fff" : "var(--text-muted)",
                  border: isSelected ? "2px solid var(--primary)" : "2px solid transparent",
                  boxShadow: isSelected ? "0 0 0 3px color-mix(in srgb, var(--primary) 20%, transparent)" : "none",
                  transition: "background 0.15s, color 0.15s, border-color 0.15s",
                }}>
                  {value}
                </span>
                <span style={{ fontSize: "10px", fontWeight: 700, color: isSelected ? "var(--primary)" : "var(--text-faint)", letterSpacing: "0.03em" }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        {rating !== null && (
          <p style={{ margin: "10px 0 0", textAlign: "center", fontSize: "12px", color: "var(--text-faint)" }}>
            {RATINGS[rating - 1].label} — {rating}/5
          </p>
        )}
      </div>

      {/* Comment */}
      <div>
        <label style={{ display: "block", marginBottom: 8, fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>
          Comentário <span style={{ fontWeight: 400, color: "var(--text-faint)" }}>(opcional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Conte o que achou do atendimento, o que poderia ser melhor…"
          style={{
            width: "100%", background: "var(--input-bg)", color: "var(--text)",
            border: "1px solid var(--border)", borderRadius: 12, padding: "11px 14px",
            fontSize: "13.5px", fontFamily: "inherit", outline: "none",
            resize: "vertical", minHeight: 80, boxSizing: "border-box",
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <p style={{ margin: 0, fontSize: "13px", color: "var(--c-danger)", display: "flex", alignItems: "center", gap: 6 }}>
          <AlertCircle size={14} /> {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={submit}
        disabled={pending || rating === null}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "14px 20px", borderRadius: 14, border: "none",
          background: rating !== null ? "var(--primary)" : "var(--surface-2)",
          color: rating !== null ? "#fff" : "var(--text-faint)",
          fontSize: "14px", fontWeight: 700, cursor: rating !== null ? "pointer" : "not-allowed",
          fontFamily: "inherit", transition: "background 0.15s",
        }}
      >
        {pending
          ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
          : <Send size={16} />
        }
        Enviar avaliação
      </button>
    </div>
  );
}
