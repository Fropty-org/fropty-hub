import type { Metadata } from "next";
import Link from "next/link";
import { Plus, FileSignature, User, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { getAllContracts } from "@/app/actions/contracts";
import { CONTRACT_STATUS_MAP, CONTRACT_TYPE_MAP } from "@/app/lib/constants/projects";
import type { ContractStatus } from "@/app/lib/types/projects";

export const metadata: Metadata = { title: "Admin — Contratos" };

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(v?: number) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const ALL_STATUSES = Object.keys(CONTRACT_STATUS_MAP) as ContractStatus[];

export default async function AdminContratosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filterStatus } = await searchParams;
  const allContracts = await getAllContracts();

  const contracts = filterStatus && filterStatus !== "todos"
    ? allContracts.filter((c) => c.status === filterStatus)
    : allContracts;

  // KPI counts
  const total     = allContracts.length;
  const assinados = allContracts.filter((c) => c.status === "assinado").length;
  const enviados  = allContracts.filter((c) => c.status === "enviado").length;
  const cancelados = allContracts.filter((c) => c.status === "cancelado").length;

  const kpis = [
    { label: "Total",      value: total,      color: "var(--primary)",  Icon: FileSignature },
    { label: "Assinados",  value: assinados,  color: "#22c55e",         Icon: CheckCircle },
    { label: "Enviados",   value: enviados,   color: "#3b82f6",         Icon: Clock },
    { label: "Cancelados", value: cancelados, color: "#ef4444",         Icon: XCircle },
  ];

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>Contratos</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-faint)" }}>
            {total} contrato{total !== 1 ? "s" : ""} no total
          </p>
        </div>
        <Link
          href="/admin/contratos/novo"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "var(--cta-bg)", color: "var(--cta-text)", borderRadius: 10, fontSize: "13px", fontWeight: 700, textDecoration: "none" }}
        >
          <Plus size={14} /> Novo Contrato
        </Link>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `${k.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <k.Icon size={16} style={{ color: k.color }} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>{k.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: "1.8rem", fontWeight: 900, color: "var(--text)", lineHeight: 1, letterSpacing: "-0.02em" }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {[{ key: "todos", label: "Todos", color: "var(--text-muted)" }, ...ALL_STATUSES.map((s) => ({ key: s, label: CONTRACT_STATUS_MAP[s].label, color: CONTRACT_STATUS_MAP[s].color }))].map(({ key, label, color }) => {
          const active = (filterStatus ?? "todos") === key;
          return (
            <Link
              key={key}
              href={`/admin/contratos?status=${key}`}
              style={{
                padding: "6px 14px", borderRadius: 8, fontSize: "12px", fontWeight: 600,
                textDecoration: "none",
                background: active ? `${color}20` : "transparent",
                color: active ? color : "var(--text-muted)",
                border: `1px solid ${active ? color + "40" : "var(--border)"}`,
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Tabela */}
      {contracts.length === 0 ? (
        <div style={{ padding: "56px", textAlign: "center", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14 }}>
          <FileSignature size={32} style={{ color: "var(--text-faint)", marginBottom: 12, display: "block", margin: "0 auto 12px" }} />
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>Nenhum contrato encontrado</p>
          <p style={{ margin: "6px 0 0", fontSize: "13px", color: "var(--text-faint)" }}>Crie o primeiro contrato para começar.</p>
        </div>
      ) : (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Contrato / Cliente", "Status", "Tipo", "Valor/Mês", "Vigência", ""].map((h) => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract, i) => {
                const st = CONTRACT_STATUS_MAP[contract.status] ?? { label: contract.status, color: "#94a3b8" };
                return (
                  <tr key={contract.id} style={{ borderBottom: i < contracts.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td style={{ padding: "13px 16px" }}>
                      <p style={{ margin: "0 0 3px", fontSize: "13px", fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>
                        {contract.title}
                      </p>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "11px", color: "var(--text-faint)" }}>
                        <User size={10} /> {contract.client_name ?? "—"}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: `${st.color}18`, color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {CONTRACT_TYPE_MAP[contract.type] ?? contract.type}
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: "13px", fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap" }}>
                      {formatCurrency(contract.value)}
                    </td>
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      {(contract.start_date || contract.end_date) ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "12px", color: "var(--text-faint)" }}>
                          <Calendar size={11} />
                          {formatDate(contract.start_date)} – {formatDate(contract.end_date)}
                        </span>
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <Link
                        href={`/admin/contratos/${contract.id}`}
                        style={{ padding: "5px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 7, fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textDecoration: "none", whiteSpace: "nowrap" }}
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
