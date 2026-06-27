import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, DollarSign, Download, FolderKanban, CheckCircle2, Circle } from "lucide-react";
import { getContract } from "@/app/actions/contracts";
import { CONTRACT_STATUS_MAP, CONTRACT_TYPE_MAP } from "@/app/lib/constants/projects";
import type { ContractStatus } from "@/app/lib/types/projects";

export const metadata: Metadata = { title: "Contrato" };

function formatDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(v?: number | null) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const STATUS_TIMELINE: ContractStatus[] = ["rascunho", "enviado", "assinado", "encerrado"];

export default async function ContratoDetailPage({ params }: { params: Promise<{ contractId: string }> }) {
  const { contractId } = await params;
  const contract = await getContract(contractId);

  if (!contract) notFound();

  const st = CONTRACT_STATUS_MAP[contract.status] ?? { label: contract.status, color: "#94a3b8" };
  const typeLabel = CONTRACT_TYPE_MAP[contract.type] ?? contract.type;
  const currentIdx = STATUS_TIMELINE.indexOf(contract.status);

  return (
    <div style={{ padding: "32px 24px", maxWidth: 760, margin: "0 auto" }}>
      <Link
        href="/portal/contratos"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "13px", color: "var(--text-muted)", textDecoration: "none", marginBottom: 20 }}
      >
        <ArrowLeft size={14} /> Contratos
      </Link>

      {/* Header */}
      <div style={{
        padding: "20px 24px", background: "var(--surface)",
        border: "1px solid var(--border)", borderRadius: 16, marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: `${st.color}18`, border: `1px solid ${st.color}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ArrowLeft size={0} />
            {/* FileSignature inline */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={st.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 19.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.5L18 5.5" />
              <path d="M8 18h1" /><path d="M18.42 9.61a2.1 2.1 0 1 1 2.97 2.97L16.95 17 13 18l.99-3.95 4.43-4.44z" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: "0 0 8px", fontSize: "1.2rem", fontWeight: 800, color: "var(--text)" }}>
              {contract.title}
            </h1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{
                fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                background: `${st.color}18`, color: st.color,
              }}>{st.label}</span>
              <span style={{
                fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: 99,
                background: "var(--surface-2)", color: "var(--text-faint)",
              }}>{typeLabel}</span>
            </div>
          </div>
        </div>

        {contract.description && (
          <p style={{ margin: "0 0 16px", fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.65 }}>
            {contract.description}
          </p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          {[
            { Icon: Calendar,   label: "Início",  value: formatDate(contract.start_date) },
            { Icon: Calendar,   label: "Término", value: formatDate(contract.end_date) },
            { Icon: DollarSign, label: "Valor",   value: formatCurrency(contract.value) },
            { Icon: Calendar,   label: "Assinado", value: formatDate(contract.signed_at) },
          ].map(({ Icon, label, value }) => (
            <div key={label} style={{
              padding: "12px 14px", background: "var(--bg)",
              border: "1px solid var(--border)", borderRadius: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                <Icon size={12} style={{ color: "var(--text-faint)" }} />
                <span style={{ fontSize: "11px", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
              </div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{value}</span>
            </div>
          ))}
        </div>

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
            <Download size={13} /> Baixar arquivo
          </a>
        )}

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
      </div>

      {/* Status timeline — apenas para status normais (sem cancelado) */}
      {contract.status !== "cancelado" && (
        <div style={{
          padding: "20px 24px", background: "var(--surface)",
          border: "1px solid var(--border)", borderRadius: 16,
        }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "0.95rem", fontWeight: 700, color: "var(--text)" }}>
            Progresso do contrato
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {STATUS_TIMELINE.map((s, i) => {
              const done    = i <= currentIdx;
              const current = i === currentIdx;
              const info    = CONTRACT_STATUS_MAP[s];
              return (
                <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STATUS_TIMELINE.length - 1 ? 1 : undefined }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: done ? info.color : "var(--surface-2)",
                      border: `2px solid ${done ? info.color : "var(--border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s",
                    }}>
                      {done
                        ? <CheckCircle2 size={14} style={{ color: "#fff" }} />
                        : <Circle size={10} style={{ color: "var(--text-faint)" }} />
                      }
                    </div>
                    <span style={{
                      fontSize: "10px", fontWeight: current ? 700 : 500,
                      color: done ? info.color : "var(--text-faint)",
                      whiteSpace: "nowrap",
                    }}>{info.label}</span>
                  </div>
                  {i < STATUS_TIMELINE.length - 1 && (
                    <div style={{
                      flex: 1, height: 2, marginBottom: 18,
                      background: i < currentIdx ? CONTRACT_STATUS_MAP[STATUS_TIMELINE[i + 1]].color : "var(--border)",
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {contract.status === "cancelado" && (
        <div style={{
          padding: "16px 20px", background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12,
        }}>
          <p style={{ margin: 0, fontSize: "13px", color: "#ef4444", fontWeight: 600 }}>
            Este contrato foi cancelado.
          </p>
        </div>
      )}
    </div>
  );
}
