"use client";
import { useState } from "react";
import { FILA, type FilaItem } from "./data";

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}h${String(total % 60).padStart(2, "0")}`;
}

export default function FilaEspera({ addToast }: { addToast: (type: "success"|"error"|"warning"|"info", msg: string) => void }) {
  const [fila, setFila] = useState<FilaItem[]>(FILA);
  const [emAtendimento, setEmAtendimento] = useState<FilaItem | null>(null);

  function chamarProximo() {
    if (fila.length === 0 || emAtendimento) return;
    const [proximo, ...resto] = fila;
    setEmAtendimento(proximo);
    setFila(resto);
    addToast("success", `${proximo.nome} foi chamado! ✂️`);
  }

  function finalizar() {
    addToast("success", "Atendimento finalizado! Chamando próximo...");
    setEmAtendimento(null);
  }

  function remover(item: FilaItem) {
    setFila(prev => prev.filter(f => f.id !== item.id));
    addToast("warning", `${item.nome} removido da fila.`);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <h2 style={{ color: "var(--text)", fontSize: 22, fontWeight: 700, margin: 0 }}>Fila de Espera</h2>
        {fila.length > 0 && (
          <span style={{
            background: "#ef444420", color: "#ef4444",
            borderRadius: 20, padding: "2px 12px", fontSize: 13, fontWeight: 700
          }}>
            {fila.length} aguardando
          </span>
        )}
      </div>

      {/* Em atendimento */}
      {emAtendimento && (
        <div style={{
          background: "#10B98110", border: "2px solid #10B981",
          borderRadius: 14, padding: 20, marginBottom: 20,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12
        }}>
          <div>
            <div style={{ fontSize: 13, color: "#10B981", fontWeight: 700, marginBottom: 6 }}>✂️ Em atendimento agora</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "var(--text)" }}>{emAtendimento.nome}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 14 }}>{emAtendimento.servico}</div>
            <div style={{ color: "var(--text-faint)", fontSize: 13, marginTop: 4 }}>
              Previsão de término: {addMinutes(emAtendimento.entrada, emAtendimento.espera)}
            </div>
          </div>
          <button
            onClick={finalizar}
            style={{
              background: "#10B981", border: "none", borderRadius: 10,
              padding: "10px 20px", cursor: "pointer", color: "#fff",
              fontWeight: 700, fontSize: 14
            }}
          >
            Finalizar atendimento
          </button>
        </div>
      )}

      {/* Chamar próximo */}
      <button
        onClick={chamarProximo}
        disabled={fila.length === 0 || !!emAtendimento}
        style={{
          width: "100%", background: fila.length === 0 || emAtendimento ? "var(--surface-2)" : "#c9a84c",
          border: "none", borderRadius: 12, padding: "14px 0", cursor: fila.length === 0 || emAtendimento ? "not-allowed" : "pointer",
          color: fila.length === 0 || emAtendimento ? "var(--text-faint)" : "#111",
          fontWeight: 700, fontSize: 16, marginBottom: 20,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          opacity: fila.length === 0 || emAtendimento ? 0.6 : 1
        }}
      >
        <i className="ti ti-user-check" /> Chamar próximo
      </button>

      {/* Lista da fila */}
      {fila.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 20px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12
        }}>
          <i className="ti ti-clock" style={{ fontSize: 48, color: "var(--text-faint)" }} />
          <div style={{ fontWeight: 600, fontSize: 16, color: "var(--text-muted)" }}>Nenhum cliente aguardando</div>
          <div style={{ color: "var(--text-faint)", fontSize: 14 }}>A fila está vazia no momento.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {fila.map((item, index) => (
            <div key={item.id} style={{
              background: "var(--card-bg)", border: "1px solid var(--card-border)",
              borderRadius: 12, padding: 16,
              display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap"
            }}>
              {/* Position */}
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: index === 0 ? "#c9a84c" : "var(--surface-2)",
                color: index === 0 ? "#111" : "var(--text-muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 16, flexShrink: 0
              }}>
                {index + 1}
              </div>

              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{item.nome}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{item.servico}</div>
                <div style={{ color: "var(--text-faint)", fontSize: 12, marginTop: 2 }}>
                  Entrou às {item.entrada} · Espera: {item.espera} min · Previsão: {addMinutes(item.entrada, item.espera)}
                </div>
              </div>

              <button
                onClick={() => remover(item)}
                style={{
                  background: "transparent", border: "1.5px solid #ef4444",
                  borderRadius: 8, padding: "6px 14px", cursor: "pointer",
                  color: "#ef4444", fontWeight: 600, fontSize: 12
                }}
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
