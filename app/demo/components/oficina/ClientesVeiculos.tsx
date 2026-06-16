"use client";

import { useState, useEffect, useCallback } from "react";
import { CLIENTES_OFICINA, VEICULOS, ORDENS, OS_STATUS_MAP } from "./data";
import type { ClienteOficina, Veiculo } from "./data";

export default function ClientesVeiculos({ addToast }: { addToast: (type: "success"|"error"|"warning"|"info", msg: string) => void }) {
  const [clientes] = useState<ClienteOficina[]>(CLIENTES_OFICINA);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ClienteOficina | null>(null);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgCopy, setMsgCopy] = useState(false);

  const closeModal = useCallback(() => { setSelected(null); setShowMsgModal(false); }, []);

  useEffect(() => {
    if (!selected) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showMsgModal) setShowMsgModal(false);
        else closeModal();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, showMsgModal, closeModal]);

  const filtered = clientes.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.cidade.toLowerCase().includes(search.toLowerCase())
  );

  const getVeiculoInfo = (veiculoId: number) => VEICULOS.find(v => v.id === veiculoId);

  const buildWhatsAppMsg = (cliente: ClienteOficina) => {
    const veiculo = cliente.veiculosIds.length > 0 ? getVeiculoInfo(cliente.veiculosIds[0]) : null;
    if (veiculo) {
      return `Olá ${cliente.nome}! Seu ${veiculo.marca} ${veiculo.modelo} (placa ${veiculo.placa}) está pronto para retirada na nossa oficina. Qualquer dúvida, é só chamar!`;
    }
    return `Olá ${cliente.nome}! Seu veículo está pronto para retirada na nossa oficina. Qualquer dúvida, é só chamar!`;
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text)" }}>Clientes e Veículos</h2>
        <span style={{ background: "var(--surface-2)", color: "var(--text-muted)", borderRadius: 20, padding: "2px 10px", fontSize: 13, fontWeight: 600 }}>
          {clientes.length}
        </span>
      </div>

      <div style={{ position: "relative", marginBottom: 20 }}>
        <i className="ti ti-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 16 }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou cidade..."
          style={{ width: "100%", background: "var(--input-bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px 10px 36px", fontSize: 14, color: "var(--text)", outline: "none", boxSizing: "border-box" }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(c => (
          <div key={c.id} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: 16, display: "flex", alignItems: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#5B57E8,#9b59b6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{c.nome.charAt(0)}</span>
            </div>

            <div style={{ flex: 1, marginLeft: 16, marginRight: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{c.nome}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{c.telefone} · {c.cidade}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#EF9F27", marginTop: 2 }}>
                Total gasto: {c.totalGasto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
              <span style={{ background: "var(--surface-2)", color: "var(--text-muted)", borderRadius: 12, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
                {c.veiculosIds.length} veículo{c.veiculosIds.length !== 1 ? "s" : ""}
              </span>
              <button
                onClick={() => setSelected(c)}
                style={{ background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                Ver ficha
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>Nenhum cliente encontrado.</div>
        )}
      </div>

      {selected && (
        <div
          onClick={closeModal}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "var(--surface)", borderRadius: 16, padding: 28, maxWidth: 560, width: "100%", maxHeight: "85vh", overflowY: "auto", position: "relative" }}
          >
            <button
              onClick={closeModal}
              style={{ position: "absolute", top: 16, right: 16, background: "var(--surface-2)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <i className="ti ti-x" />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#5B57E8,#9b59b6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 22 }}>{selected.nome.charAt(0)}</span>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>{selected.nome}</div>
                <div style={{ fontSize: 14, color: "var(--text-muted)" }}>{selected.cidade} · {selected.telefone}</div>
              </div>
            </div>

            <div style={{ marginBottom: 20, padding: "12px 16px", background: "var(--surface-2)", borderRadius: 10 }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Total gasto: </span>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#EF9F27" }}>
                {selected.totalGasto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Veículos cadastrados</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {selected.veiculosIds.map(vid => {
                const v = getVeiculoInfo(vid);
                if (!v) return null;
                return (
                  <div key={vid} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 8 }}>
                    <span style={{ background: "rgba(239,159,39,0.2)", color: "#EF9F27", borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>{v.placa}</span>
                    <span style={{ flex: 1, fontSize: 13, color: "var(--text)" }}>{v.marca} {v.modelo} {v.ano}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{v.km.toLocaleString("pt-BR")} km</span>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: v.corHex, border: "2px solid var(--border)", flexShrink: 0 }} />
                  </div>
                );
              })}
              {selected.veiculosIds.length === 0 && (
                <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Nenhum veículo cadastrado.</div>
              )}
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Histórico de OS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {ORDENS.filter(o => o.clienteNome === selected.nome).length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Nenhuma OS encontrada.</div>
              ) : (
                ORDENS.filter(o => o.clienteNome === selected.nome).map(o => {
                  const st = OS_STATUS_MAP[o.status];
                  return (
                    <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 13, minWidth: 50 }}>OS #{o.id}</span>
                      <span style={{ flex: 1, fontSize: 13, color: "var(--text-muted)", minWidth: 100 }}>
                        {o.defeitoRelatado.length > 50 ? o.defeitoRelatado.slice(0, 50) + "…" : o.defeitoRelatado}
                      </span>
                      <span style={{ background: st.bg, color: st.color, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{st.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{o.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                      <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{o.dataEntrada}</span>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setShowMsgModal(true)}
              style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 10, padding: "12px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <i className="ti ti-brand-whatsapp" />
              Avisar cliente que o carro ficou pronto 🚗
            </button>
          </div>

          {showMsgModal && (
            <div
              onClick={e => e.stopPropagation()}
              style={{ position: "fixed", inset: 0, zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            >
              <div
                onClick={e => e.stopPropagation()}
                style={{ background: "var(--surface)", borderRadius: 14, padding: 24, maxWidth: 400, width: "100%", position: "relative", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}
              >
                <button
                  onClick={() => setShowMsgModal(false)}
                  style={{ position: "absolute", top: 12, right: 12, background: "var(--surface-2)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: 14, color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <i className="ti ti-x" />
                </button>

                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>Mensagem WhatsApp</div>
                <textarea
                  readOnly
                  value={buildWhatsAppMsg(selected)}
                  style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 12, fontSize: 14, color: "var(--text)", resize: "none", minHeight: 100, boxSizing: "border-box", lineHeight: 1.5 }}
                />

                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => {
                      setMsgCopy(true);
                      addToast("success", "Mensagem copiada!");
                      setTimeout(() => setMsgCopy(false), 2000);
                    }}
                    style={{ background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
                  >
                    Copiar mensagem
                  </button>
                  {msgCopy && <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 600 }}>✓ Copiado!</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
