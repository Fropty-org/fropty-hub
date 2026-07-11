"use client";

import { useState } from "react";

interface Props {
  labelStyle: React.CSSProperties;
  inputStyle: React.CSSProperties;
}

/**
 * Campos de data do contrato com validação de ordem: o término não pode ser
 * anterior ao início (min do input + mensagem inline). Mantém os names
 * start_date / end_date para o server action.
 */
export function ContractDateFields({ labelStyle, inputStyle }: Props) {
  const [start, setStart] = useState("");
  const [end, setEnd]     = useState("");
  const invalid = !!start && !!end && end < start;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div>
        <label style={labelStyle}>Data de início</label>
        <input name="start_date" type="date" value={start} onChange={(e) => setStart(e.target.value)} style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Data de término</label>
        <input
          name="end_date"
          type="date"
          value={end}
          min={start || undefined}
          onChange={(e) => setEnd(e.target.value)}
          style={{ ...inputStyle, borderColor: invalid ? "var(--c-danger)" : (inputStyle.borderColor ?? "var(--border)") }}
        />
        {invalid && (
          <p style={{ margin: "5px 0 0", fontSize: "11.5px", color: "var(--c-danger)" }}>
            O término não pode ser anterior ao início.
          </p>
        )}
      </div>
    </div>
  );
}
