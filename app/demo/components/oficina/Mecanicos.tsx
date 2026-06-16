"use client";

import { useState, useEffect, useCallback } from "react";
import { MECANICOS, ORDENS, OS_STATUS_MAP } from "./data";
import type { Mecanico } from "./data";

export default function Mecanicos({ addToast }: { addToast: (type: "success"|"error"|"warning"|"info", msg: string) => void }) {
  const [mecanicos, setMecanicos] = useState<Mecanico[]>(MECANICOS);
  const [selected, setSelected] = useState<Mecanico | null>(null);

  const closeModal = useCallback(() => setSelected(null), []);

  useEffect(() => {
    if (!selected) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, closeModal]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text)" }}>Mecânicos</h2>
        <span style={{ background: "var(--surface-2)", color: "var(--text-muted)", borderRadius: 20, padding: "2px 10px", fontSize: 13, fontWeight: 600 }}>
          {mecanicos.length}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {mecanicos.map(m => {
          const osAtualData = m.osAtual !== null ? ORDENS.find(o => o.id === m.osAtual) : null;
          return (
            <div key={m.id} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#fff", fontSize: 28, fontWeight: 700 }}>{m.nome.charAt(0)}</span>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{m.nome}</div>
                  <div style={{ fontSize: 14, color: "var(--text-muted)" }}>{m.especialidade}</div>
                </div>
              </div>

              {m.osAtual !== null ? (
                <div style={{ background: "rgba(239,159,39,0.15)", color: "#EF9F27", borderRadius: 8, padding: "6px 10px", fontSize: 13, fontWeight: 600 }}>
                  🟡 Em atendimento — OS #{m.osAtual}
                </div>
              ) : (
                <div style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", borderRadius: 8, padding: "6px 10px", fontSize: 13, fontWeight: 600 }}>
                  🟢 Disponível
                </div>
              )}

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, color: "var(--text-muted)" }}>
                  <span>Atendimentos este mês</span>
                  <span style={{ fontWeight: 700, color: "var(--text)" }}>{m.osMes}</span>
                </div>
                <div style={{ background: "var(--surface-2)", borderRadius: 3, height: 6, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min((m.osMes / 20) * 100, 100)}%`, height: "100%", background: m.color, borderRadius: 3 }} />
                </div>
              </div>

              {osAtualData && (
                <div style={{ background: "var(--surface-2)", borderRadius: 8, padding: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>OS #{osAtualData.id}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>
                    {osAtualData.defeitoRelatado.length > 40 ? osAtualData.defeitoRelatado.slice(0, 40) + "…" : osAtualData.defeitoRelatado}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-faint)" }}>{osAtualData.clienteNome}</div>
                </div>
              )}

              <button
                onClick={() => { setSelected(m); addToast("info", `Detalhes de ${m.nome}`); }}
                style={{ background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%" }}
              >
                Ver detalhes
              </button>
            </div>
          );
        })}
      </div>

      {selected && (
        <div
          onClick={closeModal}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "var(--surface)", borderRadius: 16, padding: 28, maxWidth: 480, width: "100%", maxHeight: "80vh", overflowY: "auto", position: "relative" }}
          >
            <button
              onClick={closeModal}
              style={{ position: "absolute", top: 16, right: 16, background: "var(--surface-2)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <i className="ti ti-x" />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: selected.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: "#fff", fontSize: 32, fontWeight: 700 }}>{selected.nome.charAt(0)}</span>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>{selected.nome}</div>
                <div style={{ fontSize: 15, color: "var(--text-muted)" }}>{selected.especialidade}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 24, padding: "14px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>{selected.osMes}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Atendimentos</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>4.8 ⭐</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Avaliação</div>
              </div>
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Histórico de OS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ORDENS.filter(o => o.mecanicoId === selected.id).length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Nenhuma OS encontrada.</div>
              ) : (
                ORDENS.filter(o => o.mecanicoId === selected.id).map(o => {
                  const st = OS_STATUS_MAP[o.status];
                  return (
                    <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 8 }}>
                      <span style={{ fontWeight: 700, color: "var(--text)", minWidth: 50, fontSize: 13 }}>OS #{o.id}</span>
                      <span style={{ flex: 1, fontSize: 13, color: "var(--text-muted)" }}>{o.clienteNome}</span>
                      <span style={{ background: st.bg, color: st.color, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{st.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap" }}>{o.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
