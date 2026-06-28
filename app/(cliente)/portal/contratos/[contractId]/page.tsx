import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContract } from "@/app/actions/contracts";
import { CONTRACT_STATUS_MAP, CONTRACT_TYPE_MAP } from "@/app/lib/constants/projects";
import { ArrowLeft, ChevronRight, Download, Calendar, DollarSign, Folder, User, FileText, Clock } from "lucide-react";

export const metadata: Metadata = { title: "Contrato" };

interface Props { params: Promise<{ contractId: string }> }

function fDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}
function fCurrency(v?: number | null) {
  if (v == null) return null;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ContractDetailPage({ params }: Props) {
  const { contractId } = await params;
  const contract = await getContract(contractId);
  if (!contract) notFound();

  const statusInfo = CONTRACT_STATUS_MAP[contract.status] ?? { label: contract.status, color: "#94a3b8" };
  const typeLabel  = CONTRACT_TYPE_MAP[contract.type]     ?? contract.type;

  const meta: { icon: React.ReactNode; label: string; value: string }[] = [
    { icon: <FileText size={13} />,   label: "Tipo",    value: typeLabel },
    { icon: <Calendar size={13} />,   label: "Início",  value: fDate(contract.start_date) },
    { icon: <Calendar size={13} />,   label: "Término", value: fDate(contract.end_date) },
    ...(contract.value != null
      ? [{ icon: <DollarSign size={13} />, label: "Valor", value: fCurrency(contract.value)! }]
      : []),
    ...(contract.project_title
      ? [{ icon: <Folder size={13} />, label: "Projeto", value: contract.project_title }]
      : []),
    ...(contract.client_name
      ? [{ icon: <User size={13} />, label: "Cliente", value: contract.client_name }]
      : []),
    ...(contract.signed_at
      ? [{ icon: <Clock size={13} />, label: "Assinado em", value: fDate(contract.signed_at) }]
      : []),
  ];

  return (
    <div style={{ padding: "36px 32px", maxWidth: 820, margin: "0 auto" }}>

      {/* ── Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: "12px" }}>
        <Link
          href="/portal/contratos"
          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px 5px 8px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-faint)", textDecoration: "none", fontWeight: 600 }}
        >
          <ArrowLeft size={13} /> Contratos
        </Link>
        <ChevronRight size={12} style={{ color: "var(--text-faint)" }} />
        <span style={{ color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>
          {contract.title}
        </span>
      </div>

      {/* ── Header card ── */}
      <div className="hub-card" style={{ padding: "24px 26px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "var(--r-full)", color: statusInfo.color, background: `${statusInfo.color}15`, border: `1px solid ${statusInfo.color}28` }}>
                {statusInfo.label}
              </span>
              <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "var(--r-full)", color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                {typeLabel}
              </span>
            </div>
            <h1 style={{ margin: "0 0 8px", fontSize: "1.2rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
              {contract.title}
            </h1>
            {contract.description && (
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                {contract.description}
              </p>
            )}
          </div>

          {contract.file_url && (
            <a
              href={contract.file_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", background: "var(--primary)", color: "#fff", borderRadius: "var(--r-md)", fontWeight: 700, fontSize: "13px", textDecoration: "none", flexShrink: 0 }}
            >
              <Download size={14} /> Baixar contrato
            </a>
          )}
        </div>
      </div>

      {/* ── Metadados ── */}
      <div className="hub-card" style={{ overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-faint)" }}>
            Detalhes
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {meta.map(({ icon, label, value }, i) => (
            <div key={label} style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, color: "var(--text-faint)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {icon} {label}
              </div>
              <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 600, color: "var(--text)" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA suporte ── */}
      <div className="hub-card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: "0 0 2px", fontSize: "13.5px", fontWeight: 700, color: "var(--text)" }}>Dúvidas sobre este contrato?</p>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--text-faint)" }}>Nossa equipe responde em até 24 horas.</p>
        </div>
        <Link
          href="/portal/suporte/novo"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "var(--primary)", color: "#fff", borderRadius: "var(--r-md)", fontWeight: 700, fontSize: "13px", textDecoration: "none", whiteSpace: "nowrap" }}
        >
          Abrir chamado
        </Link>
      </div>
    </div>
  );
}
