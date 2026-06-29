import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ChevronRight, Download, MessageSquarePlus, AlertTriangle } from "lucide-react";
import { getClientContracts } from "@/app/actions/contracts";
import { CONTRACT_STATUS_MAP, CONTRACT_TYPE_MAP } from "@/app/lib/constants/projects";
import { HubEmptyState } from "@/app/components/ui/HubEmptyState";

export const metadata: Metadata = { title: "Contratos" };

function daysUntil(d?: string | null): number | null {
  if (!d) return null;
  const diff = new Date(d).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function fDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
function fCurrency(v?: number | null) {
  if (v == null) return null;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ContratosPage() {
  const contracts = await getClientContracts();

  return (
    <div style={{ padding: "24px 24px", maxWidth: 1020, margin: "0 auto" }}>

      {/* ── Page header ── */}
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        gap: 16, marginBottom: 28, flexWrap: "wrap",
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>
            Contratos
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: "13px", color: "var(--text-faint)" }}>
            Contratos e propostas firmados com a Fropty
          </p>
        </div>
        <Link
          href="/portal/suporte/novo"
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "var(--cta-bg)", color: "var(--cta-text)",
            borderRadius: "var(--r-md)", padding: "9px 18px",
            fontSize: "13px", fontWeight: 700, textDecoration: "none",
            boxShadow: "var(--shadow-brand)",
          }}
        >
          <MessageSquarePlus size={14} /> Solicitar contrato
        </Link>
      </div>

      {contracts.length === 0 ? (
        <div className="hub-card">
          <HubEmptyState variant="contratos" />
        </div>
      ) : (
        <div className="hub-card" style={{ overflow: "hidden" }}>
          {/* Toolbar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 20px", borderBottom: "1px solid var(--border)",
          }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>
              {contracts.length} contrato{contracts.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 110px 100px 150px 110px 32px",
            padding: "9px 20px",
            background: "var(--surface-2)",
            borderBottom: "1px solid var(--border)",
            fontSize: "11px", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.07em",
            color: "var(--text-faint)",
          }}>
            <span>Contrato</span>
            <span>Status</span>
            <span>Tipo</span>
            <span>Período</span>
            <span style={{ textAlign: "right" }}>Valor</span>
            <span />
          </div>

          {/* Rows */}
          {contracts.map((c, i) => {
            const st        = CONTRACT_STATUS_MAP[c.status] ?? { label: c.status,   color: "#94a3b8" };
            const typeLabel = CONTRACT_TYPE_MAP[c.type]     ?? c.type;
            const days      = c.status === "assinado" ? daysUntil(c.end_date) : null;
            const renewalUrgent = days !== null && days <= 30;
            const renewalWarn   = days !== null && days > 30 && days <= 60;

            return (
              <Link
                key={c.id}
                href={`/portal/contratos/${c.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 110px 100px 150px 110px 32px",
                  padding: "13px 20px", alignItems: "center",
                  borderBottom: i < contracts.length - 1 ? "1px solid var(--border)" : "none",
                  textDecoration: "none", color: "inherit",
                  transition: "background 0.1s",
                }}
                className="hub-row-link"
              >
                {/* Title */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  {c.file_url && (
                    <Download size={13} style={{ color: "var(--primary)", flexShrink: 0 }} />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <span style={{
                      fontSize: "13.5px", fontWeight: 600, color: "var(--text)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block",
                    }}>
                      {c.title}
                    </span>
                    {(renewalUrgent || renewalWarn) && days !== null && (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        fontSize: "10.5px", fontWeight: 700,
                        color: renewalUrgent ? "#ef4444" : "#EF9F27",
                        marginTop: 2,
                      }}>
                        <AlertTriangle size={10} />
                        {days <= 0 ? "Vencido" : `Renova em ${days}d`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <span style={{
                  fontSize: "11px", fontWeight: 700, color: st.color,
                  background: `${st.color}15`, border: `1px solid ${st.color}28`,
                  borderRadius: "var(--r-full)", padding: "3px 10px",
                  whiteSpace: "nowrap", display: "inline-block",
                }}>
                  {st.label}
                </span>

                {/* Tipo */}
                <span style={{
                  fontSize: "11px", fontWeight: 600, color: "var(--text-muted)",
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                  borderRadius: "var(--r-full)", padding: "3px 10px",
                  whiteSpace: "nowrap", display: "inline-block",
                }}>
                  {typeLabel}
                </span>

                {/* Período */}
                <span style={{ fontSize: "12px", color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 5 }}>
                  <Calendar size={11} style={{ flexShrink: 0 }} />
                  {c.start_date ? (
                    <>
                      {fDate(c.start_date)}
                      {c.end_date && <span style={{ opacity: 0.6 }}> → {fDate(c.end_date)}</span>}
                    </>
                  ) : "—"}
                </span>

                {/* Valor */}
                <span style={{ fontSize: "12px", color: "var(--text-faint)", textAlign: "right" }}>
                  {fCurrency(c.value) ?? "—"}
                </span>

                <ChevronRight size={14} style={{ color: "var(--text-faint)" }} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
