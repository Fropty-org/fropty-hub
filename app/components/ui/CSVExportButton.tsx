"use client";

import { Download } from "lucide-react";

interface Column {
  key: string;
  label: string;
}

interface Props {
  data: Record<string, unknown>[];
  columns: Column[];
  filename?: string;
}

function escapeCSV(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function CSVExportButton({ data, columns, filename = "export.csv" }: Props) {
  function download() {
    const header = columns.map((c) => escapeCSV(c.label)).join(",");
    const rows   = data.map((row) => columns.map((c) => escapeCSV(row[c.key])).join(","));
    const csv    = [header, ...rows].join("\n");
    const blob   = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement("a");
    a.href       = url;
    a.download   = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={download}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "var(--card-bg)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "8px 14px",
        fontSize: "12px", fontWeight: 600, color: "var(--text-muted)",
        cursor: "pointer", fontFamily: "inherit",
        transition: "border-color 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
    >
      <Download size={13} /> Exportar CSV
    </button>
  );
}
