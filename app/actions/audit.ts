"use server";

import { requireRole } from "@/app/lib/auth/require-role";
import { queryAuditLogs, type AuditFilters } from "@/app/lib/db/audit";
import { auditActionInfo, formatAuditMeta } from "@/app/lib/constants/audit";

function csvCell(value: string): string {
  // Escapa aspas e envolve em aspas se necessário
  const needsQuote = /[",\n;]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
}

export async function exportAuditCsv(filters: AuditFilters): Promise<{ csv: string }> {
  await requireRole("admin");

  const { rows } = await queryAuditLogs(filters, { paginate: false });

  const header = ["Data", "Ação", "Severidade", "Admin", "Alvo", "Detalhes"];
  const lines = rows.map((r) => {
    const info = auditActionInfo(r.action);
    const date = new Date(r.created_at ?? "").toLocaleString("pt-BR");
    const meta = formatAuditMeta(r.metadata).map((m) => `${m.label}: ${m.value}`).join(" | ");
    return [
      date,
      info.label,
      info.severity,
      r.adminName,
      r.targetName ?? "—",
      meta,
    ].map(csvCell).join(",");
  });

  // BOM para Excel reconhecer UTF-8
  const csv = "﻿" + [header.join(","), ...lines].join("\n");
  return { csv };
}
