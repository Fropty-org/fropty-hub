"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitNps } from "@/app/actions/nps";

export function NpsForm() {
  const [score, setScore]     = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");
  const [pending, start]      = useTransition();

  function submit() {
    if (score === null) return;
    setError("");
    start(async () => {
      const res = await submitNps(score, comment);
      if (res.error) { setError(res.error); return; }
      setDone(true);
    });
  }

  if (done) {
    return (
      <div className="hub-card" style={{ padding: "40px 24px", textAlign: "center" }}>
        <CheckCircle2 size={40} style={{ color: "var(--c-success)", margin: "0 auto 14px", display: "block" }} />
        <h2 style={{ margin: "0 0 8px", fontSize: "1.15rem", fontWeight: 800, color: "var(--text)" }}>Obrigado pelo seu feedback!</h2>
        <p style={{ margin: 0, fontSize: "13.5px", color: "var(--text-muted)" }}>
          Sua avaliação nos ajuda a melhorar o ecossistema Fropty.
        </p>
      </div>
    );
  }

  return (
    <div className="hub-card" style={{ padding: "24px 22px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>
          De 0 a 10, quanto você recomendaria a Fropty a um colega?
        </p>
        <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-faint)" }}>
          0 = nada provável · 10 = muito provável
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(11, 1fr)", gap: 6 }}>
        {Array.from({ length: 11 }).map((_, n) => {
          const active = score === n;
          const tone = n <= 6 ? "var(--c-danger)" : n <= 8 ? "var(--c-warning)" : "var(--c-success)";
          return (
            <button
              key={n}
              type="button"
              onClick={() => setScore(n)}
              style={{
                aspectRatio: "1", borderRadius: 8, cursor: "pointer", fontFamily: "inherit",
                fontSize: "14px", fontWeight: 700,
                border: `1px solid ${active ? tone : "var(--border)"}`,
                background: active ? tone : "var(--surface-2)",
                color: active ? "#fff" : "var(--text-muted)",
                transition: "all 0.12s",
              }}
            >
              {n}
            </button>
          );
        })}
      </div>

      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Comentário (opcional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="O que mais pesou na sua nota?"
          style={{ width: "100%", boxSizing: "border-box", background: "var(--input-bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: "13px", color: "var(--text)", fontFamily: "inherit", outline: "none", resize: "vertical" }}
        />
      </div>

      {error && <p style={{ margin: 0, fontSize: "13px", color: "var(--c-danger)", fontWeight: 600 }}>{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={score === null || pending}
        className="hub-btn hub-btn-primary"
        style={{ alignSelf: "flex-start", opacity: score === null || pending ? 0.6 : 1 }}
      >
        {pending ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : null}
        {pending ? "Enviando…" : "Enviar avaliação"}
      </button>
    </div>
  );
}
