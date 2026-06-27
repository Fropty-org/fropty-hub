import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, DollarSign, Download, FolderKanban, User } from "lucide-react";
import { getContract, updateContractStatus } from "@/app/actions/contracts";
import { CONTRACT_STATUS_MAP, CONTRACT_TYPE_MAP } from "@/app/lib/constants/projects";
import type { ContractStatus } from "@/app/lib/types/projects";

export const metadata: Metadata = { title: "Admin — Contrato" };

function formatDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(v?: number | null) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function AdminContratoDetailPage({ params }: { params: Promise<{ contractId: string }> }) {
  const { contractId } = await params;
  const contract = await getContract(contractId);

  if (!contract) notFound();

  const st = CONTRACT_STATUS_MAP[contract.status] ?? { label: contract.status, color: "#94a3b8" };
  const typeLabel = CONTRACT_TYPE_MAP[contract.type] ?? contract.type;

  async function handleStatusUpdate(formData: FormData) {
    "use server";
    const newStatus = formData.get("status") as ContractStatus;
    await updateContractStatus(contractId, newStatus);
  }

  const inputStyle = {
    width: "100%", padding: "9px 12px",
    background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 9,
    fontSize: "13px", color: "var(--text)", fontFamily: "inherit",
    boxSizing: "border-box" as const,
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 860, margin: "0 auto" }}>
      <Link
        href="/admin/contratos"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "13px", color: "var(--text-muted)", textDecoration: "none", marginBottom: 20 }}
      >
        <ArrowLeft size={14} /> Contratos
      </Link>

      {/* Header */}
      <div style={{ padding: "20px 24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: `${st.color}18`, border: `1px solid ${st.color}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Download size={20} style={{ color: st.color }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: "0 0 8px", fontSize: "1.2rem", fontWeight: 800, color: "var(--text)" }}>
              {contract.title}
            </h1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: `${st.color}18`, color: st.color }}>{st.label}</span>
              <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: "var(--surface-2)", color: "var(--text-faint)" }}>{typeLabel}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "12px", color: "var(--text-faint)" }}>
                <User size={11} /> {contract.client_name ?? "—"}
              </span>
            </div>
          </div>
        </div>

        {contract.description && (
          <p style={{ margin: "0 0 16px", fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.65 }}>
            {contract.description}
          </p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
          {[
            { Icon: Calendar,   label: "Início",  value: formatDate(contract.start_date) },
            { Icon: Calendar,   label: "Término", value: formatDate(contract.end_date) },
            { Icon: DollarSign, label: "Valor",   value: formatCurrency(contract.value) },
            { Icon: Calendar,   label: "Assinado", value: formatDate(contract.signed_at) },
          ].map(({ Icon, label, value }) => (
            <div key={label} style={{ padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                <Icon size={11} style={{ color: "var(--text-faint)" }} />
                <span style={{ fontSize: "10px", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
              </div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{value}</span>
            </div>
          ))}
        </div>

        {contract.project_title && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginTop: 16,
            padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10,
          }}>
            <FolderKanban size={14} style={{ color: "var(--text-faint)" }} />
            <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>Projeto vinculado:</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)" }}>{contract.project_title}</span>
          </div>
        )}

        {contract.file_url && (
          <a
            href={contract.file_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16,
              padding: "9px 16px", background: "var(--primary)", color: "#fff",
              fontWeight: 700, fontSize: "13px", borderRadius: 9, textDecoration: "none",
            }}
          >
            <Download size={13} /> Ver arquivo
          </a>
        )}
      </div>

      {/* Atualizar status */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px", maxWidth: 340 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "0.9rem", fontWeight: 700, color: "var(--text)" }}>
          Atualizar status
        </h3>
        <form action={handleStatusUpdate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <select name="status" defaultValue={contract.status} style={inputStyle}>
            {Object.entries(CONTRACT_STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button
            type="submit"
            style={{
              padding: "9px 16px", background: "#EF9F27", color: "#fff",
              fontWeight: 700, fontSize: "13px", borderRadius: 9,
              border: "none", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}
