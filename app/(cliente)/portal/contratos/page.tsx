import type { Metadata } from "next";
import Link from "next/link";
import { FileSignature, ChevronRight, Calendar, DollarSign, Download } from "lucide-react";
import { getClientContracts } from "@/app/actions/contracts";
import { CONTRACT_STATUS_MAP, CONTRACT_TYPE_MAP } from "@/app/lib/constants/projects";

export const metadata: Metadata = { title: "Contratos" };

function formatDate(d?: string) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(v?: number) {
  if (v == null) return null;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ContratosPage() {
  const contracts = await getClientContracts();

  if (contracts.length === 0) {
    return (
      <div style={{ padding: "32px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "var(--text)" }}>Contratos</h1>
          <p style={{ margin: "6px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
            Seus contratos com a Fropty
          </p>
        </div>

        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "64px 24px", textAlign: "center",
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: "rgba(91,87,232,0.08)", border: "1px solid rgba(91,87,232,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
          }}>
            <FileSignature size={26} style={{ color: "var(--primary)" }} />
          </div>
          <h3 style={{ margin: "0 0 8px", fontSize: "1.05rem", fontWeight: 700, color: "var(--text)" }}>
            Nenhum contrato ainda
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", maxWidth: 320 }}>
            Os contratos firmados com a Fropty aparecerão aqui para consulta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "var(--text)" }}>Contratos</h1>
        <p style={{ margin: "6px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
          {contracts.length} contrato{contracts.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {contracts.map((contract) => {
          const st = CONTRACT_STATUS_MAP[contract.status] ?? { label: contract.status, color: "#94a3b8" };
          const typeLabel = CONTRACT_TYPE_MAP[contract.type] ?? contract.type;

          return (
            <Link
              key={contract.id}
              href={`/portal/contratos/${contract.id}`}
              style={{
                display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
                background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14,
                textDecoration: "none", transition: "border-color 0.15s",
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: `${st.color}18`, border: `1px solid ${st.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FileSignature size={18} style={{ color: st.color }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {contract.title}
                  </span>
                  <span style={{
                    fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                    background: `${st.color}18`, color: st.color, flexShrink: 0,
                  }}>{st.label}</span>
                  <span style={{
                    fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: 99,
                    background: "var(--surface-2)", color: "var(--text-faint)", flexShrink: 0,
                  }}>{typeLabel}</span>
                </div>

                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {contract.start_date && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "12px", color: "var(--text-faint)" }}>
                      <Calendar size={11} /> {formatDate(contract.start_date)}
                      {contract.end_date && ` → ${formatDate(contract.end_date)}`}
                    </span>
                  )}
                  {contract.value != null && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "12px", color: "var(--text-faint)" }}>
                      <DollarSign size={11} /> {formatCurrency(contract.value)}
                    </span>
                  )}
                  {contract.file_url && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "12px", color: "var(--primary)" }}>
                      <Download size={11} /> Arquivo disponível
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight size={16} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
