import type { Metadata } from "next";
import { getClientProjects } from "@/app/actions/projects";
import { ProjectsCalendar } from "@/app/components/projetos/ProjectsCalendar";
import { HubEmptyState } from "@/app/components/ui/HubEmptyState";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { MessageSquarePlus, CalendarPlus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Calendário" };

export default async function CalendarioPage() {
  const projects = await getClientProjects();

  return (
    <div className="hub-page" style={{ maxWidth: "none" }}>

      <PageHeader
        title="Calendário"
        subtitle="Prazos e entregas dos seus projetos"
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <a
              href="/api/calendar"
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "var(--surface)", border: "1px solid var(--border)",
                color: "var(--text-muted)", borderRadius: 9, padding: "8px 14px",
                fontSize: "12.5px", fontWeight: 700, textDecoration: "none",
              }}
            >
              <CalendarPlus size={13} /> Exportar (.ics)
            </a>
            <Link
              href="/portal/suporte/novo"
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "var(--grad-brand)",
                color: "#fff", borderRadius: 9, padding: "8px 16px",
                fontSize: "12.5px", fontWeight: 700, textDecoration: "none",
              }}
            >
              <MessageSquarePlus size={13} /> Solicitar projeto
            </Link>
          </div>
        }
      />

      {projects.length === 0 ? (
        <div className="hub-card">
          <HubEmptyState variant="projetos" />
        </div>
      ) : (
        <ProjectsCalendar projects={projects} />
      )}
    </div>
  );
}
