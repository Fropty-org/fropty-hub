"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { respondResolution } from "@/app/actions/suporte";
import { AlertCircle, Loader2, CheckCircle, XCircle, Send } from "lucide-react";

interface Props {
  ticketId: string;
}

export function ResolutionReview({ ticketId }: Props) {
  const router = useRouter();
  const [mode,   setMode]   = useState<"idle" | "rejecting">("idle");
  const [reason, setReason] = useState("");
  const [error,  setError]  = useState("");
  const [pending, startTransition] = useTransition();

  function submit(decision: "aprovar" | "reprovar") {
    setError("");
    const fd = new FormData();
    fd.set("ticket_id", ticketId);
    fd.set("decision", decision);
    fd.set("reason", reason);
    startTransition(async () => {
      const res = await respondResolution(fd);
      if (res?.error) { setError(res.error); return; }
      router.push(`/portal/suporte/${ticketId}`);
      router.refresh();
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {error && (
        <p style={{ margin: 0, fontSize: "13px", color: "#ef4444", display: "flex", alignItems: "center", gap: 6 }}>
          <AlertCircle size={14} /> {error}
        </p>
      )}

      {mode === "idle" ? (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => submit("aprovar")}
            disabled={pending}
            style={{
              flex: "1 1 220px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "16px 20px", borderRadius: 14, border: "1px solid rgba(34,197,94,0.4)",
              background: "rgba(34,197,94,0.1)", color: "#22c55e", fontSize: "14px", fontWeight: 800,
              cursor: pending ? "wait" : "pointer", fontFamily: "inherit",
            }}
          >
            {pending ? <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle size={20} />}
            Sim, problema resolvido
          </button>
          <button
            type="button"
            onClick={() => setMode("rejecting")}
            disabled={pending}
            style={{
              flex: "1 1 220px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "16px 20px", borderRadius: 14, border: "1px solid rgba(239,68,68,0.4)",
              background: "rgba(239,68,68,0.08)", color: "#ef4444", fontSize: "14px", fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <XCircle size={20} />
            Não, ainda não resolveu
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>
            Conta pra gente o que ainda não está certo <span style={{ fontWeight: 400, color: "var(--text-faint)" }}>(opcional, mas ajuda muito)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Ex: o problema continua acontecendo quando eu tento cadastrar um cliente novo…"
            style={{
              width: "100%", background: "var(--input-bg)", color: "var(--text)",
              border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px",
              fontSize: "14px", fontFamily: "inherit", outline: "none", resize: "vertical", minHeight: 96, boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => { setMode("idle"); setReason(""); }}
              disabled={pending}
              style={{ padding: "11px 18px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={() => submit("reprovar")}
              disabled={pending}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 20px", borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: pending ? "wait" : "pointer", fontFamily: "inherit" }}
            >
              {pending ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={14} />}
              Reabrir chamado
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
