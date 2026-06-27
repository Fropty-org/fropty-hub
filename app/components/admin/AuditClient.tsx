"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Loader2, Search, X, ClipboardX, ChevronLeft, ChevronRight } from "lucide-react";
import { AUDIT_ACTIONS, auditActionInfo, formatAuditMeta } from "@/app/lib/constants/audit";
import type { ResolvedAuditLog } from "@/app/lib/db/audit";

const SEV_DOT: Record<string, string> = {
  critical: "#ef4444",
  high:     "#EF9F27",
  normal:   "transparent",
};

interface Props {
  rows:     ResolvedAuditLog[];
  total:    number;
  page:     number;
  pageSize: number;
  admins:   { id: string; name: string }[];
  filters:  { action: string; adminId: string; from: string; to: string; q: string };
}

export function AuditClient({ rows, total, page, pageSize, admins, filters }: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(filters.q);
  const [pending, startTransition] = useTransition();
  const [exporting, setExporting]  = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function applyFilter(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else   params.delete(k);
    }
    // Qualquer mudança de filtro volta para a primeira página
    if (!("page" in updates)) params.delete("page");
    startTransition(() => router.push(`/admin/audit?${params.toString()}`));
  }

  function clearFilters() {
    setSearch("");
    startTransition(() => router.push("/admin/audit"));
  }

  async function handleExport() {
    setExporting(true);
    try {
      const { exportAuditCsv } = await import("@/app/actions/audit");
      const { csv } = await exportAuditCsv({
        action:  filters.action || undefined,
        adminId: filters.adminId || undefined,
        from:    filters.from || undefined,
        to:      filters.to || undefined,
        q:       filters.q || undefined,
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  const hasActiveFilters = !!(filters.action || filters.adminId || filters.from || filters.to || filters.q);

  return (
    <div style={{ padding: "40px 32px", maxWidth: 1040, margin: "0 auto" }}>
      <style>{`
        @media (max-width: 760px) {
          .audit-row, .audit-head { grid-template-columns: 1fr !important; gap: 4px !important; }
          .audit-head { display: none !important; }
          .audit-filters { flex-direction: column !important; align-items: stretch !important; }
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)" }}>Auditoria</h1>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>
            {total} {total === 1 ? "ação registrada" : "ações registradas"}
            {hasActiveFilters && " (filtrado)"}
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || rows.length === 0}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 9, padding: "9px 16px", fontSize: "13px", fontWeight: 700,
            color: "var(--text)", cursor: (exporting || rows.length === 0) ? "not-allowed" : "pointer",
            fontFamily: "inherit", opacity: (exporting || rows.length === 0) ? 0.6 : 1,
          }}
        >
          {exporting ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Download size={15} />}
          {exporting ? "Exportando…" : "Exportar CSV"}
        </button>
      </div>

      {/* Filtros */}
      <div className="audit-filters" style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <form
          onSubmit={(e) => { e.preventDefault(); applyFilter({ q: search }); }}
          style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8, background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "8px 14px" }}
        >
          <Search size={15} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por admin, alvo ou detalhe…"
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: "13px", fontFamily: "inherit" }}
          />
        </form>

        <select
          value={filters.action}
          onChange={(e) => applyFilter({ action: e.target.value })}
          style={selectStyle}
        >
          <option value="">Todas as ações</option>
          {Object.entries(AUDIT_ACTIONS).map(([key, info]) => (
            <option key={key} value={key}>{info.label}</option>
          ))}
        </select>

        <select
          value={filters.adminId}
          onChange={(e) => applyFilter({ admin: e.target.value })}
          style={selectStyle}
        >
          <option value="">Todos os admins</option>
          {admins.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>

        <input type="date" value={filters.from} onChange={(e) => applyFilter({ from: e.target.value })} style={selectStyle} title="De" />
        <input type="date" value={filters.to}   onChange={(e) => applyFilter({ to: e.target.value })}   style={selectStyle} title="Até" />

        {hasActiveFilters && (
          <button onClick={clearFilters} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 9, padding: "8px 12px", fontSize: "12px", fontWeight: 600, color: "var(--text-faint)", cursor: "pointer", fontFamily: "inherit" }}>
            <X size={14} style={{ marginRight: 4 }} /> Limpar
          </button>
        )}
      </div>

      {/* Tabela */}
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden", opacity: pending ? 0.6 : 1, transition: "opacity 0.15s" }}>
        <div className="audit-head" style={{ display: "grid", gridTemplateColumns: "150px 1fr 130px", padding: "12px 20px", borderBottom: "1px solid var(--border)", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <span>Data</span>
          <span>Ação</span>
          <span>Admin</span>
        </div>

        {rows.map((log, i) => {
          const info = auditActionInfo(log.action);
          const date = new Date(log.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
          const meta = formatAuditMeta(log.metadata);
          return (
            <div key={log.id} className="audit-row" style={{ display: "grid", gridTemplateColumns: "150px 1fr 130px", padding: "14px 20px", borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none", alignItems: "flex-start", fontSize: "13px", gap: 8 }}>
              <span style={{ color: "var(--text-faint)", fontSize: "12px", fontVariantNumeric: "tabular-nums", paddingTop: 4 }}>{date}</span>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: `${info.color}18`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <info.Icon size={16} style={{ color: info.color }} />
                  {SEV_DOT[info.severity] !== "transparent" && (
                    <span style={{ position: "absolute", top: -3, right: -3, width: 9, height: 9, borderRadius: "50%", background: SEV_DOT[info.severity], border: "2px solid var(--card-bg)" }} />
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: "0 0 2px", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {info.label}
                    {log.targetName && (
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 999, padding: "1px 9px" }}>
                        {log.targetName}
                      </span>
                    )}
                  </p>
                  {meta.length > 0 && (
                    <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)", lineHeight: 1.6 }}>
                      {meta.map((m, idx) => (
                        <span key={m.label}>
                          {idx > 0 && " · "}
                          <span style={{ fontWeight: 600 }}>{m.label}:</span> {m.value}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              </div>

              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, paddingTop: 4 }}>{log.adminName}</span>
            </div>
          );
        })}

        {rows.length === 0 && (
          <p style={{ padding: "48px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px", margin: 0 }}>
            <ClipboardX size={26} style={{ display: "block", marginBottom: 10 }} />
            {hasActiveFilters ? "Nenhuma ação encontrada com esses filtros." : "Nenhuma ação registrada ainda."}
          </p>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 20 }}>
          <button
            disabled={page <= 0}
            onClick={() => applyFilter({ page: String(page - 1) })}
            style={pagerStyle(page <= 0)}
          >
            <ChevronLeft size={14} /> Anterior
          </button>
          <span style={{ fontSize: "12px", color: "var(--text-faint)", fontWeight: 600 }}>
            Página {page + 1} de {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => applyFilter({ page: String(page + 1) })}
            style={pagerStyle(page >= totalPages - 1)}
          >
            Próxima <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  background: "var(--card-bg)",
  border: "1px solid var(--card-border)",
  borderRadius: 10,
  color: "var(--text)",
  padding: "8px 12px",
  fontSize: "12px",
  fontFamily: "inherit",
  cursor: "pointer",
  outline: "none",
};

function pagerStyle(disabled: boolean): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", gap: 5,
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 9, padding: "8px 14px", fontSize: "12px", fontWeight: 700,
    color: disabled ? "var(--text-faint)" : "var(--text)",
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
    fontFamily: "inherit",
  };
}
