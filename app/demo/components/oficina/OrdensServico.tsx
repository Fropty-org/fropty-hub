"use client";
import { useState } from "react";
import { ORDENS, OS_STATUS_MAP, MECANICOS } from "./data";
import type { OrdemServico, OSStatus } from "./data";

interface Props {
  addToast: (type: "success" | "error" | "warning" | "info", msg: string) => void;
}

const STATUS_OPTIONS: OSStatus[] = ["diagnostico", "andamento", "aguardando_peca", "pronto", "entregue"];

const SERVICOS_OPTIONS = ["Diagnóstico elétrico", "Troca de óleo e filtro", "Revisão de freios", "Alinhamento e balanceamento", "Serviço geral"];

export default function OrdensServico({ addToast }: Props) {
  const [ordens, setOrdens] = useState<OrdemServico[]>(ORDENS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OSStatus>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newForm, setNewForm] = useState({
    clienteNome: "",
    telefone: "",
    placa: "",
    defeitoRelatado: "",
    mecanico: "",
    servicos: [] as string[],
  });

  const filtered = ordens.filter((os) => {
    const matchSearch =
      search === "" ||
      os.clienteNome.toLowerCase().includes(search.toLowerCase()) ||
      os.veiculo.placa.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || os.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatBRL = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleStatusChange = (id: string, newStatus: OSStatus) => {
    setOrdens((prev) =>
      prev.map((os) => (os.id === id ? { ...os, status: newStatus } : os))
    );
    addToast("success", `Status atualizado para "${OS_STATUS_MAP[newStatus].label}"`);
  };

  const handlePlacaBlur = () => {
    const placa = newForm.placa.trim().toUpperCase();
    if (placa === "ABC-1234") addToast("info", "Veículo encontrado: Chevrolet Onix");
    else if (placa === "DEF-5678") addToast("info", "Veículo encontrado: Toyota Corolla");
    else if (placa.length >= 7) addToast("info", "Veículo encontrado no sistema");
  };

  const handleSave = () => {
    if (!newForm.clienteNome || !newForm.placa || !newForm.defeitoRelatado) {
      addToast("error", "Preencha os campos obrigatórios");
      return;
    }
    const mec = MECANICOS.find((m) => m.nome === newForm.mecanico) ?? MECANICOS[0];
    const now = new Date();
    const newOS: OrdemServico = {
      id: `#${String(ordens.length + 43).padStart(4, "0")}`,
      clienteNome: newForm.clienteNome,
      telefone: newForm.telefone,
      veiculo: { placa: newForm.placa.toUpperCase(), marca: "—", modelo: "—", ano: 0, cor: "—", km: 0 },
      defeitoRelatado: newForm.defeitoRelatado,
      servicos: newForm.servicos,
      pecas: [],
      mecanico: mec.nome,
      mecanicoId: mec.id,
      status: "diagnostico",
      dataEntrada: now.toLocaleDateString("pt-BR"),
      previsaoEntrega: "—",
      valorTotal: 0,
      timeline: [{ hora: now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), descricao: "OS criada" }],
    };
    setOrdens((prev) => [newOS, ...prev]);
    addToast("success", `OS ${newOS.id} criada com sucesso!`);
    setShowModal(false);
    setNewForm({ clienteNome: "", telefone: "", placa: "", defeitoRelatado: "", mecanico: "", servicos: [] });
  };

  const toggleServico = (s: string) => {
    setNewForm((prev) => ({
      ...prev,
      servicos: prev.servicos.includes(s)
        ? prev.servicos.filter((x) => x !== s)
        : [...prev.servicos, s],
    }));
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--input-bg)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text)",
    padding: "10px 14px",
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, color: "var(--text)", fontSize: 22, fontWeight: 700 }}>
          Ordens de Serviço
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
          onClick={() => setShowModal(true)}
          style={{
            marginLeft: "auto",
            background: "#EF9F27",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "9px 18px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <i className="ti ti-plus" />
          Nova OS
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cliente, placa..."
          style={{ ...inputStyle, maxWidth: 280 }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <button
            onClick={() => setStatusFilter("all")}
            style={{
              background: statusFilter === "all" ? "#EF9F27" : "transparent",
              color: statusFilter === "all" ? "#fff" : "var(--text-muted)",
              border: "1px solid " + (statusFilter === "all" ? "#EF9F27" : "var(--border)"),
              borderRadius: 20,
              padding: "5px 14px",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Todas
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                background: statusFilter === s ? "#EF9F27" : "transparent",
                color: statusFilter === s ? "#fff" : "var(--text-muted)",
                border: "1px solid " + (statusFilter === s ? "#EF9F27" : "var(--border)"),
                borderRadius: 20,
                padding: "5px 14px",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {OS_STATUS_MAP[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* OS List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              color: "var(--text-faint)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <i className="ti ti-search-off" style={{ fontSize: 40 }} />
            <div>Nenhuma OS encontrada</div>
          </div>
        )}
        {filtered.map((os) => {
          const statusInfo = OS_STATUS_MAP[os.status];
          const isExpanded = expandedId === os.id;
          const initials = os.mecanico
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={os.id}
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {/* Collapsed row */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 16px",
                }}
              >
                <span
                  style={{
                    background: "rgba(239,159,39,0.15)",
                    color: "#EF9F27",
                    borderRadius: 20,
                    padding: "2px 10px",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {os.id}
                </span>
                <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 14 }}>
                  {os.clienteNome}
                </span>
                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                  {os.veiculo.marca} {os.veiculo.modelo} • {os.veiculo.placa}
                </span>
                <span
                  style={{
                    background: statusInfo.bg,
                    color: statusInfo.color,
                    borderRadius: 20,
                    padding: "2px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {statusInfo.label}
                </span>
                <span style={{ color: "var(--text-faint)", fontSize: 12 }}>
                  {os.dataEntrada}
                </span>
                <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 14 }}>
                  {formatBRL(os.valorTotal)}
                </span>
                <span style={{ color: "var(--text-faint)", fontSize: 12 }}>
                  Mecânico: {os.mecanico}
                </span>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : os.id)}
                  style={{
                    marginLeft: "auto",
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: 18,
                    display: "flex",
                    alignItems: "center",
                    padding: 4,
                  }}
                >
                  <i className={`ti ${isExpanded ? "ti-chevron-up" : "ti-chevron-down"}`} />
                </button>
              </div>

              {/* Expanded section */}
              <div
                style={{
                  maxHeight: isExpanded ? 600 : 0,
                  overflow: "hidden",
                  transition: "max-height 0.3s ease",
                }}
              >
                <div
                  style={{
                    padding: "0 16px 16px",
                    borderTop: "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  {/* Defeito */}
                  <div style={{ paddingTop: 16 }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>
                      Defeito relatado:
                    </div>
                    <div
                      style={{
                        background: "var(--surface-2)",
                        borderRadius: 8,
                        padding: "10px 14px",
                        fontStyle: "italic",
                        color: "var(--text)",
                        fontSize: 14,
                      }}
                    >
                      {os.defeitoRelatado}
                    </div>
                  </div>

                  {/* Serviços */}
                  {os.servicos.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>
                        Serviços:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {os.servicos.map((srv, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--text)" }}>
                            <i className="ti ti-check-circle" style={{ color: "#EF9F27" }} />
                            {srv}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Peças */}
                  {os.pecas.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>
                        Peças:
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr>
                            {["Nome", "Código", "Qtd", "Unitário", "Subtotal"].map((h) => (
                              <th
                                key={h}
                                style={{
                                  textAlign: "left",
                                  padding: "6px 8px",
                                  color: "var(--text-muted)",
                                  fontWeight: 600,
                                  borderBottom: "1px solid var(--border)",
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {os.pecas.map((p, i) => (
                            <tr key={i}>
                              <td style={{ padding: "6px 8px", color: "var(--text)" }}>{p.nome}</td>
                              <td style={{ padding: "6px 8px", color: "var(--text-muted)" }}>{p.codigo}</td>
                              <td style={{ padding: "6px 8px", color: "var(--text)" }}>{p.quantidade}</td>
                              <td style={{ padding: "6px 8px", color: "var(--text)" }}>{formatBRL(p.precoUnit)}</td>
                              <td style={{ padding: "6px 8px", color: "var(--text)", fontWeight: 700 }}>
                                {formatBRL(p.quantidade * p.precoUnit)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Mecânico */}
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>
                      Mecânico responsável:
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: "rgba(239,159,39,0.2)",
                          color: "#EF9F27",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {initials}
                      </div>
                      <span style={{ color: "var(--text)", fontSize: 14 }}>{os.mecanico}</span>
                    </div>
                  </div>

                  {/* Timeline */}
                  {os.timeline.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>
                        Timeline:
                      </div>
                      <div
                        style={{
                          borderLeft: "2px solid rgba(239,159,39,0.3)",
                          paddingLeft: 16,
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        {os.timeline.map((t, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, position: "relative" }}>
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: "#EF9F27",
                                marginTop: 5,
                                flexShrink: 0,
                                marginLeft: -20,
                              }}
                            />
                            <span
                              style={{
                                background: "rgba(239,159,39,0.15)",
                                color: "#EF9F27",
                                borderRadius: 6,
                                padding: "1px 8px",
                                fontSize: 11,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {t.hora}
                            </span>
                            <span style={{ color: "var(--text)", fontSize: 13 }}>{t.descricao}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alterar status */}
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>
                      Alterar status:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(os.id, s)}
                          style={{
                            background: os.status === s ? "#EF9F27" : "transparent",
                            color: os.status === s ? "#fff" : "var(--text-muted)",
                            border: "1px solid " + (os.status === s ? "#EF9F27" : "var(--border)"),
                            borderRadius: 8,
                            padding: "5px 12px",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {OS_STATUS_MAP[s].label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nova OS Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "28px",
              width: "100%",
              maxWidth: 480,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, color: "var(--text)", fontWeight: 700, fontSize: 18 }}>
                Nova Ordem de Serviço
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}
              >
                <i className="ti ti-x" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
                  Nome do cliente *
                </label>
                <input
                  value={newForm.clienteNome}
                  onChange={(e) => setNewForm((p) => ({ ...p, clienteNome: e.target.value }))}
                  style={inputStyle}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
                  Telefone
                </label>
                <input
                  value={newForm.telefone}
                  onChange={(e) => setNewForm((p) => ({ ...p, telefone: e.target.value }))}
                  style={inputStyle}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
                  Placa *
                </label>
                <input
                  value={newForm.placa}
                  onChange={(e) => setNewForm((p) => ({ ...p, placa: e.target.value }))}
                  onBlur={handlePlacaBlur}
                  style={inputStyle}
                  placeholder="ABC-1234"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
                  Defeito relatado *
                </label>
                <textarea
                  value={newForm.defeitoRelatado}
                  onChange={(e) => setNewForm((p) => ({ ...p, defeitoRelatado: e.target.value }))}
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="Descreva o problema..."
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
                  Mecânico
                </label>
                <select
                  value={newForm.mecanico}
                  onChange={(e) => setNewForm((p) => ({ ...p, mecanico: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Selecionar mecânico</option>
                  {MECANICOS.map((m) => (
                    <option key={m.id} value={m.nome}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
                  Serviços
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {SERVICOS_OPTIONS.map((s) => (
                    <label
                      key={s}
                      style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "var(--text)", fontSize: 14 }}
                    >
                      <input
                        type="checkbox"
                        checked={newForm.servicos.includes(s)}
                        onChange={() => toggleServico(s)}
                        style={{ accentColor: "#EF9F27" }}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                  borderRadius: 8,
                  padding: "9px 18px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                style={{
                  background: "#EF9F27",
                  border: "none",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "9px 18px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Salvar OS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
