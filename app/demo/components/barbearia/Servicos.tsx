"use client";
import { useState } from "react";
import { SERVICOS, type Servico } from "./data";

export default function Servicos({ addToast }: { addToast: (type: "success"|"error"|"warning"|"info", msg: string) => void }) {
  const [servicos, setServicos] = useState<Servico[]>(SERVICOS);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState("");

  function toggleAtivo(id: number) {
    setServicos(prev => prev.map(s => s.id === id ? { ...s, ativo: !s.ativo } : s));
  }

  function startEdit(s: Servico) {
    setEditingId(s.id);
    setEditPrice(String(s.preco));
  }

  function confirmEdit(s: Servico) {
    const val = parseFloat(editPrice.replace(",", "."));
    if (!isNaN(val) && val > 0) {
      setServicos(prev => prev.map(x => x.id === s.id ? { ...x, preco: val } : x));
      addToast("success", `Preço de "${s.nome}" atualizado!`);
    }
    setEditingId(null);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ color: "var(--text)", fontSize: 22, fontWeight: 700, margin: 0 }}>Serviços</h2>
        <button
          onClick={() => addToast("info", "Cadastro de serviços em breve!")}
          style={{
            background: "transparent", border: "1.5px solid #c9a84c", color: "#c9a84c",
            borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: 14,
            display: "flex", alignItems: "center", gap: 6
          }}
        >
          <i className="ti ti-plus" /> + Novo serviço
        </button>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {servicos.map(s => (
          <div key={s.id} style={{
            background: "var(--card-bg)", border: "1px solid var(--card-border)",
            borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 10
          }}>
            {/* Top row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{s.nome}</span>
              {/* Toggle */}
              <div
                onClick={() => toggleAtivo(s.id)}
                style={{
                  width: 40, height: 22, borderRadius: 11, cursor: "pointer",
                  background: s.ativo ? "#10B981" : "#6b7280",
                  position: "relative", transition: "background 0.2s"
                }}
              >
                <div style={{
                  position: "absolute", top: 3, left: s.ativo ? 20 : 3,
                  width: 16, height: 16, borderRadius: "50%", background: "#fff",
                  transition: "left 0.2s"
                }} />
              </div>
            </div>

            {/* Duração */}
            <div style={{ color: "var(--text-faint)", fontSize: 13 }}>
              ⏱ {s.duracao} min
            </div>

            {/* Preço */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {editingId === s.id ? (
                <>
                  <input
                    value={editPrice}
                    onChange={e => setEditPrice(e.target.value)}
                    style={{
                      background: "var(--input-bg)", border: "1px solid var(--border)",
                      borderRadius: 6, padding: "4px 8px", color: "var(--text)", fontSize: 18,
                      width: 90
                    }}
                    autoFocus
                    onKeyDown={e => e.key === "Enter" && confirmEdit(s)}
                  />
                  <button
                    onClick={() => confirmEdit(s)}
                    style={{
                      background: "#10B981", border: "none", borderRadius: 6,
                      padding: "4px 10px", cursor: "pointer", color: "#fff"
                    }}
                  >
                    <i className="ti ti-check" />
                  </button>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 24, fontWeight: 700, color: "#c9a84c" }}>
                    R$ {s.preco.toFixed(2).replace(".", ",")}
                  </span>
                  <button
                    onClick={() => startEdit(s)}
                    style={{
                      background: "transparent", border: "none", cursor: "pointer",
                      color: "var(--text-muted)", padding: 4
                    }}
                  >
                    <i className="ti ti-pencil" style={{ fontSize: 16 }} />
                  </button>
                </>
              )}
            </div>

            {/* Descrição */}
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>{s.descricao}</p>

            {/* Badge indisponível */}
            {!s.ativo && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: "#ef444420", color: "#ef4444",
                borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600, width: "fit-content"
              }}>
                Indisponível
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
