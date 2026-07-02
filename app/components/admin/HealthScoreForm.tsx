"use client";

import { useState, useTransition } from "react";
import { upsertHealthScore } from "@/app/actions/customer-success";
import { RISK_CONFIG, SCORE_DIMENSIONS } from "@/app/lib/constants/customer-success";
import type { HealthScore, RiskLevel } from "@/app/lib/types/customer-success";

interface Props {
  clientId: string;
  initial?: HealthScore;
  clientName: string;
}

function calcScore(vals: Record<string, number>) {
  return Math.round(
    vals.score_uso * 0.25 +
    vals.score_tickets * 0.20 +
    vals.score_receita * 0.25 +
    vals.score_engajamento * 0.15 +
    vals.score_satisfacao * 0.15
  );
}

function calcRisk(score: number): RiskLevel {
  if (score >= 75) return 'saudavel';
  if (score >= 50) return 'atencao';
  if (score >= 25) return 'risco';
  return 'critico';
}

export function HealthScoreForm({ clientId, initial, clientName }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [vals, setVals] = useState<Record<string, number>>({
    score_uso:         initial?.score_uso ?? 0,
    score_tickets:     initial?.score_tickets ?? 0,
    score_receita:     initial?.score_receita ?? 0,
    score_engajamento: initial?.score_engajamento ?? 0,
    score_satisfacao:  initial?.score_satisfacao ?? 0,
  });

  const [notes, setNotes] = useState(initial?.cs_notes ?? "");

  const score_total = calcScore(vals);
  const risk = calcRisk(score_total);
  const cfg = RISK_CONFIG[risk];
  const { Icon } = cfg;

  function handleSlider(key: string, value: number) {
    setVals((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  function handleSubmit() {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await upsertHealthScore({
        client_id: clientId,
        score_uso: vals.score_uso,
        score_tickets: vals.score_tickets,
        score_receita: vals.score_receita,
        score_engajamento: vals.score_engajamento,
        score_satisfacao: vals.score_satisfacao,
        cs_notes: notes || undefined,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{
        background: "var(--card-bg)", border: "1px solid var(--card-border)",
        borderRadius: 16, padding: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>Editar Health Score</p>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--text-faint)" }}>{clientName}</p>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 16px", borderRadius: 12,
            background: cfg.bg, border: `1px solid ${cfg.color}40`,
          }}>
            <Icon size={18} style={{ color: cfg.color }} />
            <span style={{ fontSize: "1.5rem", fontWeight: 900, color: cfg.color, lineHeight: 1 }}>{score_total}</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {SCORE_DIMENSIONS.map(({ key, label, weight }) => (
            <div key={key}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{label}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-faint)", padding: "2px 7px", borderRadius: 999, background: "var(--surface-2)" }}>{weight}</span>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text)", minWidth: 32, textAlign: "right" }}>{vals[key]}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={vals[key]}
                onChange={(e) => handleSlider(key, parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "var(--brand-accent)", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                <span style={{ fontSize: "10px", color: "var(--text-faint)" }}>0</span>
                <span style={{ fontSize: "10px", color: "var(--text-faint)" }}>100</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: "var(--card-bg)", border: "1px solid var(--card-border)",
        borderRadius: 16, padding: 24,
      }}>
        <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 10 }}>
          Notas internas CS
        </label>
        <textarea
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setSuccess(false); }}
          placeholder="Observações sobre o cliente, histórico de conversas, ações planejadas..."
          rows={4}
          style={{
            width: "100%", boxSizing: "border-box",
            background: "var(--surface-2)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "10px 14px",
            fontSize: "13px", color: "var(--text)",
            resize: "vertical", fontFamily: "inherit",
            outline: "none",
          }}
        />
      </div>

      {error && (
        <p style={{ margin: 0, fontSize: "13px", color: "#ef4444", padding: "10px 14px", background: "rgba(239,68,68,0.08)", borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)" }}>
          {error}
        </p>
      )}
      {success && (
        <p style={{ margin: 0, fontSize: "13px", color: "var(--c-success)", padding: "10px 14px", background: "rgba(34,197,94,0.08)", borderRadius: 10, border: "1px solid rgba(34,197,94,0.2)" }}>
          Score salvo com sucesso.
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={pending}
        style={{
          padding: "12px 24px", borderRadius: 10,
          background: "var(--brand-accent)", border: "none",
          color: "#fff", fontSize: "13px", fontWeight: 700,
          cursor: pending ? "not-allowed" : "pointer",
          opacity: pending ? 0.7 : 1, fontFamily: "inherit",
          alignSelf: "flex-start",
        }}
      >
        {pending ? "Salvando..." : "Salvar Score"}
      </button>
    </div>
  );
}
