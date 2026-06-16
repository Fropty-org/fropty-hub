"use client";
import { useState, useEffect, useCallback } from "react";
import { CLIENTES, type ClienteBarb } from "./data";

const FAKE_HISTORICO = [
  { data: "10/06/2025", servico: "Combo (Corte + Barba)", barbeiro: "Rafael Costa", valor: 70, status: "Concluído" },
  { data: "22/05/2025", servico: "Corte Masculino", barbeiro: "Lucas Mendes", valor: 45, status: "Concluído" },
  { data: "05/05/2025", servico: "Barba", barbeiro: "Rafael Costa", valor: 35, status: "Concluído" },
  { data: "18/04/2025", servico: "Corte + Hidratação", barbeiro: "Diego Alves", valor: 80, status: "Concluído" },
];

function getStatusColor(status: ClienteBarb["status"]) {
  if (status === "vip") return "#c9a84c";
  if (status === "regular") return "#5B57E8";
  return "#10B981";
}

function StatusPill({ status }: { status: ClienteBarb["status"] }) {
  const map = {
    vip: { label: "VIP 👑", bg: "#c9a84c20", color: "#c9a84c" },
    regular: { label: "Regular", bg: "#5B57E820", color: "#5B57E8" },
    novo: { label: "Novo ✨", bg: "#10B98120", color: "#10B981" },
  };
  const cfg = map[status];
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700
    }}>
      {cfg.label}
    </span>
  );
}

export default function Clientes({ addToast }: { addToast: (type: "success"|"error"|"warning"|"info", msg: string) => void }) {
  const [clientes] = useState<ClienteBarb[]>(CLIENTES);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ClienteBarb | null>(null);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setSelected(null);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const filtered = clientes.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.telefone.includes(search)
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <h2 style={{ color: "var(--text)", fontSize: 22, fontWeight: 700, margin: 0 }}>Clientes</h2>
        <span style={{
          background: "var(--surface-2)", color: "var(--text-muted)",
          borderRadius: 20, padding: "2px 12px", fontSize: 13, fontWeight: 700
        }}>
          {clientes.length} cadastrados
        </span>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20, maxWidth: 360 }}>
        <i className="ti ti-search" style={{
          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          color: "var(--text-faint)", fontSize: 16
        }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou telefone..."
          style={{
            width: "100%", background: "var(--input-bg)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "10px 12px 10px 38px", color: "var(--text)",
            fontSize: 14, outline: "none", boxSizing: "border-box"
          }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "var(--surface-2)" }}>
              {["Cliente", "Telefone", "Visitas", "Total gasto", "Última visita", "Status", "Ações"].map(col => (
                <th key={col} style={{
                  padding: "10px 14px", textAlign: "left",
                  color: "var(--text-faint)", fontWeight: 600, fontSize: 12,
                  textTransform: "uppercase", letterSpacing: 0.5,
                  borderBottom: "1px solid var(--border)"
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}
                onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "var(--surface-2)"}
                onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
              >
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: getStatusColor(c.status),
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0
                    }}>
                      {c.nome[0]}
                    </div>
                    <span style={{ fontWeight: 600, color: "var(--text)" }}>{c.nome}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 14px", color: "var(--text-muted)" }}>{c.telefone}</td>
                <td style={{ padding: "12px 14px", color: "var(--text)", fontWeight: 600, textAlign: "center" }}>{c.visitas}</td>
                <td style={{ padding: "12px 14px", color: "#c9a84c", fontWeight: 700 }}>
                  R$ {c.totalGasto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td style={{ padding: "12px 14px", color: "var(--text-muted)" }}>{c.ultimaVisita}</td>
                <td style={{ padding: "12px 14px" }}><StatusPill status={c.status} /></td>
                <td style={{ padding: "12px 14px" }}>
                  <button
                    onClick={() => setSelected(c)}
                    style={{
                      background: "transparent", border: "1.5px solid var(--border)",
                      borderRadius: 8, padding: "6px 14px", cursor: "pointer",
                      color: "var(--text-muted)", fontWeight: 600, fontSize: 12
                    }}
                  >
                    Ver ficha
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-faint)" }}>
            Nenhum cliente encontrado.
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed", inset: 0, background: "#00000080",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 16, padding: 28, width: "100%", maxWidth: 520, maxHeight: "85vh", overflowY: "auto"
            }}
          >
            {/* Top */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: getStatusColor(selected.status),
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 22, flexShrink: 0
              }}>
                {selected.nome[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, color: "var(--text)" }}>{selected.nome}</div>
                <div style={{ marginTop: 4 }}><StatusPill status={selected.status} /></div>
              </div>
            </div>

            {/* Info grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Telefone", value: selected.telefone },
                { label: "Visitas", value: String(selected.visitas) },
                { label: "Total gasto", value: `R$ ${selected.totalGasto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
                { label: "Última visita", value: selected.ultimaVisita },
              ].map(f => (
                <div key={f.label} style={{ background: "var(--surface-2)", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{f.label}</div>
                  <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 15 }}>{f.value}</div>
                </div>
              ))}
            </div>

            {/* Observações */}
            {selected.observacoes && (
              <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Observações</div>
                <div style={{ color: "var(--text-muted)", fontSize: 14 }}>{selected.observacoes}</div>
              </div>
            )}

            {/* Serviços favoritos */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Serviços favoritos
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {selected.servicosFavoritos.map(s => (
                  <span key={s} style={{
                    background: "#c9a84c20", color: "#c9a84c",
                    borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Histórico */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Histórico de visitas
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {FAKE_HISTORICO.map((h, i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr auto auto",
                    gap: 8, alignItems: "center",
                    borderBottom: "1px solid var(--border)", paddingBottom: 8, fontSize: 13
                  }}>
                    <div>
                      <div style={{ color: "var(--text)", fontWeight: 600 }}>{h.servico}</div>
                      <div style={{ color: "var(--text-faint)", fontSize: 12 }}>{h.data}</div>
                    </div>
                    <div style={{ color: "var(--text-muted)" }}>{h.barbeiro}</div>
                    <div style={{ color: "#c9a84c", fontWeight: 700 }}>R$ {h.valor}</div>
                    <span style={{ background: "#10B98120", color: "#10B981", borderRadius: 20, padding: "2px 8px", fontSize: 11 }}>
                      {h.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelected(null)}
              style={{
                width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "10px 0", cursor: "pointer", color: "var(--text-muted)",
                fontWeight: 600, fontSize: 14
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
