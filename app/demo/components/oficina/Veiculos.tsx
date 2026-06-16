"use client";
import { useEffect, useState } from "react";
import { VEICULOS, ORDENS, OS_STATUS_MAP } from "./data";
import type { Veiculo } from "./data";

interface Props {
  addToast: (type: "success" | "error" | "warning" | "info", msg: string) => void;
}

export default function Veiculos({ addToast }: Props) {
  const [veiculos] = useState<Veiculo[]>(VEICULOS);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Veiculo | null>(null);

  useEffect(() => {
    if (!selected) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selected]);

  const filtered = veiculos.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.placa.toLowerCase().includes(q) ||
      v.marca.toLowerCase().includes(q) ||
      v.modelo.toLowerCase().includes(q)
    );
  });

  const getOSCount = (placa: string) =>
    ORDENS.filter((o) => o.veiculo.placa === placa).length;

  const getRevisaoColor = (_v: Veiculo) => "#10B981";

  const formatKm = (n: number) => n.toLocaleString("pt-BR");

  const formatBRL = (n: number) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });


  const inputStyle: React.CSSProperties = {
    background: "var(--input-bg)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text)",
    padding: "10px 14px",
    fontSize: 14,
    width: "100%",
    maxWidth: 320,
    boxSizing: "border-box",
    outline: "none",
  };

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, color: "var(--text)", fontSize: 22, fontWeight: 700 }}>
          Veículos
        </h2>
        <span
          style={{
            background: "var(--surface-2)",
            color: "var(--text-muted)",
            borderRadius: 20,
            padding: "2px 10px",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {filtered.length}
        </span>
        <button
          onClick={() => addToast("info", "Cadastro em breve!")}
          style={{
            marginLeft: "auto",
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text)",
            borderRadius: 8,
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Cadastrar veículo
        </button>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por placa, marca..."
        style={inputStyle}
      />

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {filtered.map((v) => {
          const osCount = getOSCount(v.placa);
          const revisaoColor = getRevisaoColor(v);

          return (
            <div
              key={v.id}
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                borderRadius: 14,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Top image section */}
              <div style={{ position: "relative", height: 140, overflow: "hidden" }}>
                <img
                  src={v.image}
                  alt={`${v.marca} ${v.modelo}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  loading="lazy"
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }} />
                <span
                  style={{
                    position: "absolute",
                    bottom: 10,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontFamily: "monospace",
                    background: "#EF9F27",
                    color: "#080e1c",
                    borderRadius: 6,
                    padding: "4px 10px",
                    fontWeight: 700,
                    fontSize: 15,
                    letterSpacing: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {v.placa}
                </span>
              </div>

              {/* Info section */}
              <div style={{ padding: "14px 18px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
                  {v.marca} {v.modelo}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Ano: {v.ano} • Cor: {v.cor}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text)" }}>
                  <i className="ti ti-gauge" style={{ color: "var(--text-muted)" }} />
                  KM: {formatKm(v.km)}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: revisaoColor }}>
                  <i className="ti ti-calendar" />
                  Próxima revisão: {v.proximaRevisao}
                </div>
                <div>
                  <span
                    style={{
                      background: "var(--surface-2)",
                      color: "var(--text-muted)",
                      borderRadius: 20,
                      padding: "2px 10px",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Histórico de OS: {osCount} OS
                  </span>
                </div>
                <button
                  onClick={() => setSelected(v)}
                  style={{
                    width: "100%",
                    marginTop: 4,
                    background: "transparent",
                    border: "1px solid #EF9F27",
                    color: "#EF9F27",
                    borderRadius: 8,
                    padding: "8px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Ver histórico
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vehicle history modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 28,
              width: "100%",
              maxWidth: 560,
              maxHeight: "85vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      fontFamily: "monospace",
                      background: "#EF9F27",
                      color: "#080e1c",
                      borderRadius: 6,
                      padding: "3px 10px",
                      fontWeight: 700,
                      fontSize: 15,
                    }}
                  >
                    {selected.placa}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
                    {selected.marca} {selected.modelo}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {selected.ano} • {selected.cor}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                <i className="ti ti-x" />
              </button>
            </div>

            {/* KM info */}
            <div
              style={{
                background: "var(--surface-2)",
                borderRadius: 10,
                padding: "12px 16px",
                display: "flex",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 2 }}>KM atual</div>
                <div style={{ fontWeight: 700, color: "var(--text)" }}>{formatKm(selected.km)} km</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 2 }}>Próxima revisão</div>
                <div style={{ fontWeight: 700, color: getRevisaoColor(selected) }}>
                  {selected.proximaRevisao}
                </div>
              </div>
            </div>

            {/* OS list */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 10 }}>
                Histórico de Ordens de Serviço
              </div>
              {(() => {
                const osVeiculo = ORDENS.filter((o) => o.veiculo.placa === selected.placa);
                if (osVeiculo.length === 0) {
                  return (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "32px",
                        color: "var(--text-faint)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <i className="ti ti-files-off" style={{ fontSize: 36 }} />
                      <div>Nenhuma OS registrada</div>
                    </div>
                  );
                }
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {osVeiculo.map((os) => {
                      const sc = OS_STATUS_MAP[os.status];
                      const defeito = os.defeitoRelatado.length > 60 ? os.defeitoRelatado.slice(0, 60) + "..." : os.defeitoRelatado;
                      return (
                        <div
                          key={os.id}
                          style={{
                            background: "var(--surface-2)",
                            borderRadius: 10,
                            padding: "12px 14px",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              background: "rgba(239,159,39,0.15)",
                              color: "#EF9F27",
                              borderRadius: 20,
                              padding: "1px 8px",
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            {os.id}
                          </span>
                          <span style={{ flex: 1, fontSize: 13, color: "var(--text)" }}>{defeito}</span>
                          <span
                            style={{
                              background: sc.bg,
                              color: sc.color,
                              borderRadius: 20,
                              padding: "1px 8px",
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {sc.label}
                          </span>
                          <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 13 }}>
                            {formatBRL(os.valorTotal)}
                          </span>
                          <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
                            {os.dataEntrada}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
