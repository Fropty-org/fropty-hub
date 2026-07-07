import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllProjects } from "@/app/actions/projects";
import { ProjectsCalendar } from "@/app/components/projetos/ProjectsCalendar";
import { HubEmptyState } from "@/app/components/ui/HubEmptyState";
import { PageHeader } from "@/app/components/ui/PageHeader";

export const metadata: Metadata = { title: "Calendário" };

export default async function AdminCalendarioPage() {
  const projects = await getAllProjects();

  return (
    <div className="hub-page" style={{ maxWidth: "none" }}>
      <PageHeader
        title="Calendário"
        subtitle="Prazos e entregas de todos os projetos"
        action={
          <Link
            href="/admin/projetos/novo"
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "var(--grad-brand)", color: "#fff",
              borderRadius: 9, padding: "8px 16px",
              fontSize: "12.5px", fontWeight: 700, textDecoration: "none",
            }}
          >
            <Plus size={13} /> Novo projeto
          </Link>
        }
      />

      {projects.length === 0 ? (
        <div className="hub-card">
          <HubEmptyState variant="projetos" title="Nenhum projeto cadastrado" description="Os prazos e entregas dos projetos dos clientes aparecerão aqui." />
        </div>
      ) : (
        <ProjectsCalendar projects={projects} basePath="/admin/projetos" />
      )}
    </div>
  );
}
