import type { Metadata } from "next";
import Link from "next/link";
import { Plus, FileSignature, User, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { getAllContracts } from "@/app/actions/contracts";
import { CONTRACT_STATUS_MAP, CONTRACT_TYPE_MAP } from "@/app/lib/constants/projects";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
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
    <div className="hub-page">

      {/* ── Page header ── */}
      <div className="hub-page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="hub-page-title">Contratos</h1>
          <p className="hub-page-sub">{total} contrato{total !== 1 ? "s" : ""} no total</p>
        </div>
        <Link href="/admin/contratos/novo" className="hub-btn" style={{ background: "var(--cta-bg)", color: "var(--cta-text)" }}>
          <Plus size={14} /> Novo Contrato
        </Link>
      </div>

      {/* ── KPI strip ── */}
      <div className="hub-grid-4" style={{ marginBottom: 24 }}>
        {kpis.map((k) => (
          <div key={k.label} className="hub-stat-card">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="hub-stat-icon" style={{ background: `${k.color}18`, color: k.color }}>
                <k.Icon size={16} />
              </div>
              <span className="hub-stat-label" style={{ margin: 0 }}>{k.label}</span>
            </div>
            <p className="hub-stat-value" style={{ fontSize: "2rem" }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filter strip ── */}
      <div className="hub-filter-strip" style={{ marginBottom: 20 }}>
        {[{ key: "todos", label: "Todos" }, ...ALL_STATUSES.map((s) => ({ key: s, label: CONTRACT_STATUS_MAP[s].label }))].map(({ key, label }) => {
          const active = (filterStatus ?? "todos") === key;
          return (
            <Link key={key} href={`/admin/contratos?status=${key}`}
              className={`hub-filter-chip${active ? " active" : ""}`}>
              {label}
            </Link>
          );
        })}
      </div>

      {/* ── Tabela ── */}
      {contracts.length === 0 ? (
        <div className="hub-card hub-empty">
          <div className="hub-empty-icon"><FileSignature size={22} /></div>
          <p className="hub-empty-title">Nenhum contrato encontrado</p>
          <p className="hub-empty-desc">Crie o primeiro contrato para começar.</p>
        </div>
      ) : (
        <div className="hub-card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="hub-table-wrap">
            <table className="hub-table">
              <thead>
                <tr>
                  <th>Contrato / Cliente</th>
                  <th>Status</th>
                  <th>Tipo</th>
                  <th>Valor/Mês</th>
                  <th>Vigência</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => {
                  return (
                    <tr key={contract.id}>
                      <td className="hub-td-primary">
                        <p style={{ margin: "0 0 3px", fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>
                          {contract.title}
                        </p>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "11px", color: "var(--text-faint)", fontWeight: 400 }}>
                          <User size={10} /> {contract.client_name ?? "—"}
                        </span>
                      </td>
                      <td>
                        <StatusBadge kind="contract" status={contract.status} size="sm" />
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>{CONTRACT_TYPE_MAP[contract.type] ?? contract.type}</td>
                      <td className="hub-td-primary" style={{ whiteSpace: "nowrap" }}>{formatCurrency(contract.value)}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {(contract.start_date || contract.end_date) ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "12px", color: "var(--text-faint)" }}>
                            <Calendar size={11} />
                            {formatDate(contract.start_date)} – {formatDate(contract.end_date)}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="hub-td-action">
                        <Link href={`/admin/contratos/${contract.id}`} className="hub-btn hub-btn-sm hub-btn-ghost">
                          Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="hub-table-footer">
            <span className="hub-table-info">{contracts.length} contrato{contracts.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      )}
    </div>
  );
}

