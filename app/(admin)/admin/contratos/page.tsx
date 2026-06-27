import type { Metadata } from "next";
import Link from "next/link";
import { Plus, FileSignature, Calendar, User } from "lucide-react";
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

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "var(--text)" }}>Contratos</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
            {allContracts.length} contrato{allContracts.length !== 1 ? "s" : ""} no total
          </p>
        </div>
        <Link
          href="/admin/contratos/novo"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "9px 16px", background: "#EF9F27", color: "#fff",
            fontWeight: 700, fontSize: "13px", borderRadius: 9, textDecoration: "none",
          }}
        >
          <Plus size={14} /> Novo Contrato
        </Link>
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
                padding: "5px 12px", borderRadius: 99, fontSize: "12px", fontWeight: 600,
                textDecoration: "none",
                background: active ? `${color}20` : "var(--surface)",
                color: active ? color : "var(--text-muted)",
                border: `1px solid ${active ? color + "40" : "var(--border)"}`,
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {contracts.length === 0 ? (
        <div style={{ padding: "48px", textAlign: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14 }}>
          <FileSignature size={32} style={{ color: "var(--text-faint)", marginBottom: 12 }} />
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>Nenhum contrato encontrado.</p>
        </div>
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 110px 100px 120px 80px",
            padding: "10px 16px", borderBottom: "1px solid var(--border)",
            fontSize: "11px", fontWeight: 700, color: "var(--text-faint)",
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}>
            <span>Contrato / Cliente</span>
            <span>Status</span>
            <span>Tipo</span>
            <span>Valor</span>
            <span></span>
          </div>

          {contracts.map((contract, i) => {
            const st = CONTRACT_STATUS_MAP[contract.status] ?? { label: contract.status, color: "#94a3b8" };
            return (
              <div
                key={contract.id}
                style={{
                  display: "grid", gridTemplateColumns: "1fr 110px 100px 120px 80px",
                  padding: "12px 16px", alignItems: "center",
                  borderBottom: i < contracts.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {contract.title}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "11px", color: "var(--text-faint)", marginTop: 2 }}>
                    <User size={10} /> {contract.client_name ?? "—"}
                  </span>
                </div>

                <span style={{
                  fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: 99,
                  background: `${st.color}18`, color: st.color,
                }}>{st.label}</span>

                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {CONTRACT_TYPE_MAP[contract.type] ?? contract.type}
                </span>

                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>
                  {formatCurrency(contract.value)}
                </span>

                <Link
                  href={`/admin/contratos/${contract.id}`}
                  style={{
                    padding: "5px 10px", background: "var(--surface-2)",
                    border: "1px solid var(--border)", borderRadius: 7,
                    fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textDecoration: "none",
                  }}
                >
                  Ver
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
