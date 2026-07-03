import { NextResponse } from "next/server";
import { getClientProjects } from "@/app/actions/projects";
import { PROJECT_STATUSES } from "@/app/lib/constants/projects";

export const runtime = "nodejs";

// Escapa texto conforme RFC 5545 (vírgula, ponto-e-vírgula, barra, quebra de linha).
function icsText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}
function icsDate(d: string): string {
  return d.slice(0, 10).replace(/-/g, ""); // YYYY-MM-DD → YYYYMMDD
}

/**
 * Exporta os prazos dos projetos do cliente autenticado como um arquivo .ics,
 * importável no Google Calendar / Apple Calendar / Outlook. Eventos de dia
 * inteiro na data de entrega (due_date) de cada projeto.
 */
export async function GET() {
  const projects = await getClientProjects();
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fropty Hub//PT-BR//",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Fropty — Projetos",
  ];

  for (const p of projects) {
    if (!p.due_date) continue;
    const statusLabel = PROJECT_STATUSES[p.status]?.label ?? p.status;
    lines.push(
      "BEGIN:VEVENT",
      `UID:project-${p.id}@fropty.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(p.due_date)}`,
      `SUMMARY:${icsText(`Prazo — ${p.title}`)}`,
      `DESCRIPTION:${icsText(`Projeto Fropty · Status: ${statusLabel}`)}`,
      "STATUS:CONFIRMED",
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="fropty-projetos.ics"',
      "Cache-Control": "no-store",
    },
  });
}
