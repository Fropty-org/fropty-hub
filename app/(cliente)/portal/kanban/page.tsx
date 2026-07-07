import type { Metadata } from "next";
import { getClientProjects } from "@/app/actions/projects";
import { ProjectsKanban } from "@/app/components/projetos/ProjectsKanban";
import { HubEmptyState } from "@/app/components/ui/HubEmptyState";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { MessageSquarePlus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Kanban" };

export default async function KanbanPage() {
  const projects = await getClientProjects();

  return (
    <div className="hub-page" style={{ margin: "0 auto", maxWidth: "none" }}>

      <PageHeader
        title="Kanban"
        subtitle="Visão por status de todos os projetos ativos"
        badge={
          <span className="hub-tag" title="Este quadro reflete o andamento dos seus projetos. A gestão é feita pela equipe Fropty.">
            Somente leitura
          </span>
        }
        action={
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
        }
      />

      {projects.length === 0 ? (
        <div className="hub-card">
          <HubEmptyState variant="projetos" />
        </div>
      ) : (
        <ProjectsKanban projects={projects} />
      )}
    </div>
  );
}
