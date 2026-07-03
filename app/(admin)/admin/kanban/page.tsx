import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllProjects } from "@/app/actions/projects";
import { ProjectsKanban } from "@/app/components/projetos/ProjectsKanban";
import { HubEmptyState } from "@/app/components/ui/HubEmptyState";
import { PageHeader } from "@/app/components/ui/PageHeader";

export const metadata: Metadata = { title: "Kanban" };

export default async function AdminKanbanPage() {
  const projects = await getAllProjects();

  return (
    <div style={{ padding: "24px 24px", margin: "0 auto", maxWidth: "none" }}>
      <PageHeader
        title="Kanban"
        subtitle="Projetos de todos os clientes por status"
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
          <HubEmptyState variant="projetos" title="Nenhum projeto cadastrado" description="Projetos criados para os clientes aparecerão aqui, organizados por status." />
        </div>
      ) : (
        <ProjectsKanban projects={projects} basePath="/admin/projetos" showClient />
      )}
    </div>
  );
}
