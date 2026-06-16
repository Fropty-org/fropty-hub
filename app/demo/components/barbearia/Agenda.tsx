"use client";

import { useState } from "react";
import { AGENDAMENTOS, SERVICOS, BARBEIROS } from "./data";
import type { Agendamento, AgendStatus } from "./data";

const DAY_NAMES = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const DAY_DATES = ["16/06", "17/06", "18/06", "19/06", "20/06", "21/06", "22/06"];
const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

function statusBg(status: AgendStatus): string {
  const map: Record<AgendStatus, string> = {
    confirmado: "rgba(91,87,232,0.3)",
    chegou: "rgba(16,185,129,0.3)",
    pendente: "rgba(239,159,39,0.3)",
    cancelado: "rgba(128,128,128,0.2)",
  };
  return map[status];
}

function statusColor(status: AgendStatus): string {
  const map: Record<AgendStatus, string> = {
    confirmado: "#a0a0ff",
    chegou: "#6ee7b7",
    pendente: "#fbd38d",
    cancelado: "#aaa",
  };
  return map[status];
}

function statusLabel(status: AgendStatus): string {
  const map: Record<AgendStatus, string> = {
    confirmado: "Confirmado",
    chegou: "Chegou",
    pendente: "Pendente",
    cancelado: "Cancelado",
  };
  return map[status];
}

export default function Agenda({
  addToast,
}: {
  addToast: (type: "success" | "error" | "warning" | "info", msg: string) => void;
}) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([...AGENDAMENTOS]);
  const [selectedSlot, setSelectedSlot] = useState<{ dia: number; hora: string } | null>(null);
  const [selectedAgend, setSelectedAgend] = useState<Agendamento | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // New appointment form state
  const [formCliente, setFormCliente] = useState("");
  const [formServico, setFormServico] = useState("");
  const [formBarbeiro, setFormBarbeiro] = useState("");
  const [formObs, setFormObs] = useState("");

  function openNewModal(slot?: { dia: number; hora: string }) {
    setSelectedSlot(slot ?? null);
    setFormCliente("");
    setFormServico("");
    setFormBarbeiro("");
    setFormObs("");
    setShowNewModal(true);
  }

  function closeNewModal() {
    setShowNewModal(false);
    setSelectedSlot(null);
  }

  function closeDetailModal() {
    setSelectedAgend(null);
  }

  function confirmNew() {
    if (!formCliente.trim() || !formServico || !formBarbeiro) {
      addToast("warning", "Preencha todos os campos obrigatórios.");
      return;
    }
    const servico = SERVICOS.find((s) => s.nome === formServico);
    const barbeiro = BARBEIROS.find((b) => b.name === formBarbeiro);
    const newAgend: Agendamento = {
      id: Date.now(),
      clienteNome: formCliente.trim(),
      telefone: "",
      servico: formServico,
      barbeiro: formBarbeiro,
      barbeiroId: barbeiro?.id ?? 0,
      hora: selectedSlot?.hora ?? "09:00",
      dia: selectedSlot?.dia ?? 0,
      duracao: servico?.duracao ?? 30,
      status: "confirmado",
      observacoes: formObs.trim() || undefined,
      valor: servico?.preco ?? 0,
    };
    setAgendamentos((prev) => [...prev, newAgend]);
    addToast("success", "✂️ Agendamento confirmado!");
    closeNewModal();
  }

  function updateStatus(id: number, status: AgendStatus) {
    setAgendamentos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    setSelectedAgend((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
  }

  const activeServicos = SERVICOS.filter((s) => s.ativo);
  const activeBarbeiros = BARBEIROS.filter((b) => b.status !== "folga");

  // Build lookup: dia+hora -> agendamento
  const agendMap: Record<string, Agendamento> = {};
  agendamentos.forEach((a) => {
    // Only show one per cell (first by insertion order)
    const key = `${a.dia}-${a.hora}`;
    if (!agendMap[key]) agendMap[key] = a;
  });

  const slotLabel = selectedSlot
    ? `${DAY_NAMES[selectedSlot.dia]} ${DAY_DATES[selectedSlot.dia]} às ${selectedSlot.hora}`
    : null;

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text, #f0f0f0)" }}>
            <i className="ti ti-calendar-week" style={{ marginRight: "8px", color: "#c9a84c" }} />
            Agenda da Semana
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-muted, #888)", marginTop: "2px" }}>
            16–22 de junho de 2026
          </div>
        </div>
        <button
          onClick={() => openNewModal()}
          style={{
            background: "#c9a84c",
            color: "#1a1200",
            border: "none",
            borderRadius: "9px",
            padding: "9px 18px",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "7px",
          }}
        >
          <i className="ti ti-plus" />
          Novo agendamento
        </button>
      </div>

      {/* Calendar grid */}
      <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid var(--border, rgba(255,255,255,0.1))" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px repeat(7, minmax(120px, 1fr))",
            minWidth: "920px",
          }}
        >
          {/* Header row */}
          <div
            style={{
              padding: "10px 8px",
              fontSize: "11px",
              color: "var(--text-muted, #888)",
              background: "var(--surface, rgba(255,255,255,0.04))",
              borderBottom: "1px solid var(--border, rgba(255,255,255,0.1))",
              borderRight: "1px solid var(--border, rgba(255,255,255,0.07))",
              textAlign: "center",
            }}
          />
          {DAY_NAMES.map((d, i) => (
            <div
              key={d}
              style={{
                padding: "10px 8px",
                fontSize: "12px",
                fontWeight: 600,
                color: i === 0 ? "#c9a84c" : "var(--text, #f0f0f0)",
                background: "var(--surface, rgba(255,255,255,0.04))",
                borderBottom: "1px solid var(--border, rgba(255,255,255,0.1))",
                borderRight: i < 6 ? "1px solid var(--border, rgba(255,255,255,0.07))" : undefined,
                textAlign: "center",
              }}
            >
              <div>{d}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted, #888)", fontWeight: 400 }}>{DAY_DATES[i]}</div>
            </div>
          ))}

          {/* Hour rows */}
          {HOURS.map((hora, hi) => (
            <>
              {/* Hour label */}
              <div
                key={`h-${hora}`}
                style={{
                  padding: "6px 4px",
                  fontSize: "11px",
                  color: "var(--text-muted, #888)",
                  borderBottom: hi < HOURS.length - 1 ? "1px solid var(--border, rgba(255,255,255,0.06))" : undefined,
                  borderRight: "1px solid var(--border, rgba(255,255,255,0.07))",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  paddingTop: "10px",
                  background: "var(--surface, rgba(255,255,255,0.02))",
                }}
              >
                {hora}
              </div>

              {/* Day cells */}
              {DAY_NAMES.map((_, di) => {
                const key = `${di}-${hora}`;
                const agend = agendMap[key];
                return (
                  <div
                    key={key}
                    onClick={() => {
                      if (agend) {
                        setSelectedAgend(agend);
                      } else {
                        openNewModal({ dia: di, hora });
                      }
                    }}
                    style={{
                      minHeight: "52px",
                      borderBottom: hi < HOURS.length - 1 ? "1px solid var(--border, rgba(255,255,255,0.06))" : undefined,
                      borderRight: di < 6 ? "1px solid var(--border, rgba(255,255,255,0.07))" : undefined,
                      padding: "4px",
                      cursor: "pointer",
                      position: "relative",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!agend) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
                    }}
                    onMouseLeave={(e) => {
                      if (!agend) (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    }}
                  >
                    {agend && (
                      <div
                        style={{
                          background: statusBg(agend.status),
                          borderRadius: "6px",
                          padding: "5px 7px",
                          height: "100%",
                          minHeight: "44px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: statusColor(agend.status),
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {agend.clienteNome.split(" ")[0]}
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: "rgba(255,255,255,0.6)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {agend.servico.length > 14 ? agend.servico.slice(0, 14) + "…" : agend.servico}
                        </div>
                        <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>
                          {agend.barbeiro.split(" ")[0]}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* New appointment modal */}
      {showNewModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeNewModal(); }}
        >
          <div
            style={{
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "16px",
              padding: "28px",
              width: "100%",
              maxWidth: "480px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#f0f0f0" }}>
              <i className="ti ti-calendar-plus" style={{ marginRight: "8px", color: "#c9a84c" }} />
              {slotLabel ? `Novo Agendamento — ${slotLabel}` : "Novo Agendamento"}
            </div>

            {/* Cliente */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", color: "#aaa", fontWeight: 500 }}>
                Cliente <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                value={formCliente}
                onChange={(e) => setFormCliente(e.target.value)}
                placeholder="Nome do cliente"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: "#f0f0f0",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            {/* Serviço */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", color: "#aaa", fontWeight: 500 }}>
                Serviço <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <select
                value={formServico}
                onChange={(e) => setFormServico(e.target.value)}
                style={{
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: formServico ? "#f0f0f0" : "#888",
                  fontSize: "14px",
                  outline: "none",
                }}
              >
                <option value="">Selecione o serviço</option>
                {activeServicos.map((s) => (
                  <option key={s.id} value={s.nome}>
                    {s.nome} — R$ {s.preco}
                  </option>
                ))}
              </select>
            </div>

            {/* Barbeiro */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", color: "#aaa", fontWeight: 500 }}>
                Barbeiro <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <select
                value={formBarbeiro}
                onChange={(e) => setFormBarbeiro(e.target.value)}
                style={{
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: formBarbeiro ? "#f0f0f0" : "#888",
                  fontSize: "14px",
                  outline: "none",
                }}
              >
                <option value="">Selecione o barbeiro</option>
                {activeBarbeiros.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Observações */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", color: "#aaa", fontWeight: 500 }}>Observações</label>
              <textarea
                value={formObs}
                onChange={(e) => setFormObs(e.target.value)}
                placeholder="Alguma observação? (opcional)"
                rows={3}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: "#f0f0f0",
                  fontSize: "14px",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={closeNewModal}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  color: "#aaa",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmNew}
                style={{
                  background: "#c9a84c",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  color: "#1a1200",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                <i className="ti ti-check" style={{ marginRight: "6px" }} />
                Confirmar agendamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedAgend && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeDetailModal(); }}
        >
          <div
            style={{
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "16px",
              padding: "28px",
              width: "100%",
              maxWidth: "480px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Title */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#f0f0f0" }}>
                <i className="ti ti-calendar-event" style={{ marginRight: "8px", color: "#5B57E8" }} />
                Agendamento
              </div>
              <span
                style={{
                  background: statusBg(selectedAgend.status),
                  color: statusColor(selectedAgend.status),
                  borderRadius: "7px",
                  padding: "4px 12px",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                {statusLabel(selectedAgend.status)}
              </span>
            </div>

            {/* Info rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { icon: "ti-user", label: "Cliente", value: selectedAgend.clienteNome },
                { icon: "ti-scissors", label: "Serviço", value: selectedAgend.servico },
                { icon: "ti-cut", label: "Barbeiro", value: selectedAgend.barbeiro },
                { icon: "ti-clock", label: "Horário", value: `${DAY_NAMES[selectedAgend.dia]} ${DAY_DATES[selectedAgend.dia]} às ${selectedAgend.hora}` },
                ...(selectedAgend.observacoes ? [{ icon: "ti-note", label: "Observações", value: selectedAgend.observacoes }] : []),
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span style={{ color: "#c9a84c", fontSize: "16px", marginTop: "1px", minWidth: "20px" }}>
                    <i className={`ti ${row.icon}`} />
                  </span>
                  <div>
                    <div style={{ fontSize: "11px", color: "#888", fontWeight: 500 }}>{row.label}</div>
                    <div style={{ fontSize: "14px", color: "#f0f0f0", fontWeight: 500 }}>{row.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    updateStatus(selectedAgend.id, "confirmado");
                    addToast("success", "Agendamento confirmado!");
                  }}
                  style={{
                    background: "#5B57E8",
                    border: "none",
                    borderRadius: "8px",
                    padding: "9px 16px",
                    color: "#fff",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontWeight: 600,
                    flex: 1,
                  }}
                >
                  <i className="ti ti-check" style={{ marginRight: "5px" }} />
                  Confirmar
                </button>
                <button
                  onClick={() => {
                    updateStatus(selectedAgend.id, "chegou");
                    addToast("success", "✅ Cliente marcado como presente!");
                  }}
                  style={{
                    background: "#10B981",
                    border: "none",
                    borderRadius: "8px",
                    padding: "9px 16px",
                    color: "#fff",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontWeight: 600,
                    flex: 1,
                  }}
                >
                  Cliente chegou ✅
                </button>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    updateStatus(selectedAgend.id, "cancelado");
                    addToast("warning", "Agendamento cancelado.");
                  }}
                  style={{
                    background: "transparent",
                    border: "1.5px solid #EF4444",
                    borderRadius: "8px",
                    padding: "9px 16px",
                    color: "#EF4444",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontWeight: 600,
                    flex: 1,
                  }}
                >
                  <i className="ti ti-x" style={{ marginRight: "5px" }} />
                  Cancelar agendamento
                </button>
                <button
                  onClick={closeDetailModal}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    padding: "9px 16px",
                    color: "#aaa",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontWeight: 500,
                    flex: 1,
                  }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
