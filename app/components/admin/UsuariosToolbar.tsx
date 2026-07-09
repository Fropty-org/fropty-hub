"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Upload, Download, SlidersHorizontal, Loader2, X, FileUp, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/app/components/ui/Toast";
import { adminExportUsers, adminBulkInviteClients, type BulkInviteRow } from "@/app/actions/admin";

interface Props {
  tab: string;
  q: string;
  role: string;  // "" | cliente | admin
  plan: string;  // "" | sem_plano | basico | pro
}

const EXPORT_COLUMNS = [
  { key: "nome", label: "Nome" },
  { key: "email", label: "Email" },
  { key: "empresa", label: "Empresa" },
  { key: "telefone", label: "Telefone" },
  { key: "papel", label: "Papel" },
  { key: "plano", label: "Plano" },
  { key: "tokens", label: "Tokens" },
  { key: "status", label: "Status" },
  { key: "inicio_contrato", label: "Início do contrato" },
  { key: "criado_em", label: "Criado em" },
];

function csvCell(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Parser CSV simples com suporte a aspas e vírgula dentro de campo.
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); if (row.some((f) => f.trim() !== "")) rows.push(row); }
  return rows;
}

export function UsuariosToolbar({ tab, q, role, plan }: Props) {
  const router = useRouter();
  const { show, ToastComponent } = useToast();

  const [exporting, setExporting] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function openFilter() {
    const r = triggerRef.current?.getBoundingClientRect();
    if (r) setMenuPos({ top: r.bottom + 6, right: Math.max(8, window.innerWidth - r.right) });
    setFilterOpen(true);
  }

  useEffect(() => {
    if (!filterOpen) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !panelRef.current?.contains(t)) setFilterOpen(false);
    }
    function onScrollOrResize() { setFilterOpen(false); }
    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [filterOpen]);

  async function handleExport() {
    setExporting(true);
    try {
      const { rows, error } = await adminExportUsers();
      if (error) { show(error, "error"); return; }
      const header = EXPORT_COLUMNS.map((c) => csvCell(c.label)).join(",");
      const body = rows.map((r) => EXPORT_COLUMNS.map((c) => csvCell(r[c.key])).join(","));
      const csv = "﻿" + [header, ...body].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `usuarios-fropty-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      show(`${rows.length} usuário${rows.length !== 1 ? "s" : ""} exportado${rows.length !== 1 ? "s" : ""}.`, "success");
    } catch {
      show("Não foi possível exportar. Tente novamente.", "error");
    } finally {
      setExporting(false);
    }
  }

  const activeFilters = (role ? 1 : 0) + (plan ? 1 : 0);

  function applyFilter(nextRole: string, nextPlan: string) {
    const p = new URLSearchParams();
    if (tab !== "todos") p.set("tab", tab);
    if (q) p.set("q", q);
    if (nextRole) p.set("role", nextRole);
    if (nextPlan) p.set("plan", nextPlan);
    const s = p.toString();
    router.push(`/admin/usuarios${s ? `?${s}` : ""}`);
    setFilterOpen(false);
  }

  return (
    <>
      {/* Import / Export split button */}
      <div style={{ display: "inline-flex", borderRadius: 7, border: "1px solid var(--border)", overflow: "hidden" }}>
        <button type="button" onClick={() => setImportOpen(true)} style={actionBtn}><Upload size={12} /><span>Importar</span></button>
        <div style={{ width: 1, background: "var(--border)" }} />
        <button type="button" onClick={handleExport} disabled={exporting} style={actionBtn}>
          {exporting ? <Loader2 size={12} style={{ animation: "spin 0.8s linear infinite" }} /> : <Download size={12} />}<span>Exportar</span>
        </button>
      </div>

      {/* Filter */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (filterOpen ? setFilterOpen(false) : openFilter())}
        style={{ ...actionBtn, border: "1px solid var(--border)", borderRadius: 7, padding: "5px 10px", gap: 5, color: activeFilters ? "var(--primary)" : "var(--text-muted)", borderColor: activeFilters ? "var(--primary)" : "var(--border)" }}
      >
        <SlidersHorizontal size={12} />
        <span>Filtrar</span>
        {activeFilters > 0 && (
          <span style={{ fontSize: "10px", background: "var(--primary)", color: "#fff", borderRadius: 999, padding: "0 5px", fontWeight: 800 }}>{activeFilters}</span>
        )}
      </button>

      {filterOpen && menuPos && typeof document !== "undefined" && createPortal(
        <div
          ref={panelRef}
          style={{ position: "fixed", top: menuPos.top, right: menuPos.right, zIndex: 1000, width: 240, background: "var(--surface-elevated, var(--card-bg))", border: "1px solid var(--border)", borderRadius: 10, boxShadow: "var(--shadow-dropdown, 0 8px 24px rgba(0,0,0,0.18))", padding: 14 }}
        >
          <FilterBody role={role} plan={plan} onApply={applyFilter} />
        </div>,
        document.body,
      )}

      {importOpen && (
        <ImportModal
          onClose={() => setImportOpen(false)}
          onDone={(n) => { setImportOpen(false); if (n > 0) { show(`${n} convite${n !== 1 ? "s" : ""} enviado${n !== 1 ? "s" : ""}.`, "success"); router.refresh(); } }}
          parse={parseCSV}
        />
      )}

      {ToastComponent}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

function FilterBody({ role, plan, onApply }: { role: string; plan: string; onApply: (r: string, p: string) => void }) {
  const [r, setR] = useState(role);
  const [p, setP] = useState(plan);
  return (
    <>
      <p style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: 800, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Filtrar por</p>
      <label style={fieldLabel}>Papel</label>
      <select value={r} onChange={(e) => setR(e.target.value)} style={selectStyle}>
        <option value="">Todos</option>
        <option value="cliente">Cliente</option>
        <option value="admin">Admin</option>
      </select>
      <label style={{ ...fieldLabel, marginTop: 10 }}>Plano</label>
      <select value={p} onChange={(e) => setP(e.target.value)} style={selectStyle}>
        <option value="">Todos</option>
        <option value="sem_plano">Sem plano</option>
        <option value="basico">Básico</option>
        <option value="pro">Pro</option>
      </select>
      <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
        <button type="button" onClick={() => onApply("", "")} style={{ flex: 1, padding: "7px 0", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Limpar</button>
        <button type="button" onClick={() => onApply(r, p)} style={{ flex: 1, padding: "7px 0", borderRadius: 7, border: "none", background: "var(--primary)", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Aplicar</button>
      </div>
    </>
  );
}

function ImportModal({ onClose, onDone, parse }: { onClose: () => void; onDone: (n: number) => void; parse: (t: string) => string[][] }) {
  const [rows, setRows] = useState<BulkInviteRow[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [result, setResult] = useState<{ invited: number; failed: { email: string; error: string }[] } | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError("");
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      const grid = parse(String(reader.result ?? ""));
      if (grid.length < 2) { setParseError("Arquivo vazio ou sem linhas de dados."); setRows(null); return; }
      const headers = grid[0].map((h) => h.trim().toLowerCase());
      const idx = (names: string[]) => headers.findIndex((h) => names.includes(h));
      const iEmail = idx(["email", "e-mail"]);
      const iName = idx(["nome", "name"]);
      const iCompany = idx(["empresa", "company"]);
      const iPlan = idx(["plano", "plan"]);
      const iTokens = idx(["tokens", "token_balance", "saldo"]);
      if (iEmail === -1) { setParseError('O CSV precisa de uma coluna "email".'); setRows(null); return; }
      const parsed: BulkInviteRow[] = grid.slice(1).map((r) => ({
        email: r[iEmail]?.trim() ?? "",
        name: iName > -1 ? r[iName]?.trim() : undefined,
        company: iCompany > -1 ? r[iCompany]?.trim() : undefined,
        plan: iPlan > -1 ? r[iPlan]?.trim() : undefined,
        token_balance: iTokens > -1 ? Number(r[iTokens]) || 0 : 0,
      })).filter((r) => r.email);
      if (!parsed.length) { setParseError("Nenhuma linha com e-mail encontrada."); setRows(null); return; }
      setRows(parsed);
    };
    reader.readAsText(file, "utf-8");
  }

  function confirmImport() {
    if (!rows) return;
    startTransition(async () => {
      const res = await adminBulkInviteClients(rows);
      setResult(res);
      if (res.failed.length === 0) onDone(res.invited);
    });
  }

  const templateHref =
    "data:text/csv;charset=utf-8," + encodeURIComponent("email,nome,empresa,plano,tokens\njoao@empresa.com,João Silva,Empresa X,basico,10\n");

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} className="hub-card" style={{ width: "100%", maxWidth: 440, padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "var(--text)" }}>Importar usuários (CSV)</h3>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", display: "flex" }}><X size={16} /></button>
        </div>

        <div style={{ padding: 20 }}>
          {!result && (
            <>
              <p style={{ margin: "0 0 12px", fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                Envie um CSV com uma coluna <strong>email</strong> (obrigatória) e, opcionalmente, <strong>nome</strong>, <strong>empresa</strong>, <strong>plano</strong> e <strong>tokens</strong>. Cada linha vira um convite por e-mail.
              </p>
              <a href={templateHref} download="modelo-usuarios.csv" style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)", textDecoration: "none" }}>Baixar modelo CSV</a>

              <div
                onClick={() => fileRef.current?.click()}
                style={{ marginTop: 14, border: "1.5px dashed var(--border)", borderRadius: 10, padding: "22px 16px", textAlign: "center", cursor: "pointer", background: "var(--surface)" }}
              >
                <FileUp size={22} style={{ color: "var(--text-faint)", marginBottom: 6 }} />
                <p style={{ margin: 0, fontSize: "12.5px", fontWeight: 600, color: "var(--text)" }}>{fileName || "Escolher arquivo .csv"}</p>
                {rows && <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--c-success)", fontWeight: 700 }}>{rows.length} usuário(s) prontos para convidar</p>}
              </div>
              <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={handleFile} />

              {parseError && (
                <p style={{ margin: "12px 0 0", fontSize: "12px", color: "var(--c-danger)", display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertTriangle size={13} /> {parseError}
                </p>
              )}
            </>
          )}

          {result && (
            <div>
              <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 700, color: "var(--c-success)", display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle size={15} /> {result.invited} convite(s) enviado(s).
              </p>
              {result.failed.length > 0 && (
                <>
                  <p style={{ margin: "10px 0 6px", fontSize: "12px", fontWeight: 700, color: "var(--c-danger)" }}>{result.failed.length} falha(s):</p>
                  <div style={{ maxHeight: 140, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 8 }}>
                    {result.failed.map((f, i) => (
                      <div key={i} style={{ padding: "6px 10px", fontSize: "11.5px", borderBottom: i < result.failed.length - 1 ? "1px solid var(--border)" : "none", display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.email}</span>
                        <span style={{ color: "var(--text-faint)", flexShrink: 0 }}>{f.error}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "14px 20px", borderTop: "1px solid var(--border)" }}>
          <button type="button" onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", fontSize: "12.5px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {result ? "Fechar" : "Cancelar"}
          </button>
          {!result && (
            <button type="button" onClick={confirmImport} disabled={!rows || pending} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: !rows || pending ? "var(--surface-2)" : "var(--cta-bg)", color: !rows || pending ? "var(--text-muted)" : "var(--cta-text)", fontSize: "12.5px", fontWeight: 700, cursor: !rows || pending ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {pending ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <Upload size={13} />}
              {pending ? "Enviando…" : `Convidar${rows ? ` ${rows.length}` : ""}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "5px 10px", background: "var(--surface)", color: "var(--text-muted)",
  border: "none", fontSize: "12px", fontWeight: 600, cursor: "pointer",
  fontFamily: "inherit", whiteSpace: "nowrap",
};
const fieldLabel: React.CSSProperties = { display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" };
const selectStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", appearance: "none", padding: "7px 10px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: "12.5px", fontFamily: "inherit", cursor: "pointer" };
