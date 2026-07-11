import type { Metadata } from "next";
import { getKanbanTasks } from "@/app/actions/kanban";
import { PersonalKanban } from "@/app/components/kanban/PersonalKanban";
import { PageHeader } from "@/app/components/ui/PageHeader";

export const metadata: Metadata = { title: "Kanban" };

export default async function AdminKanbanPage() {
  const tasks = await getKanbanTasks();

  return (
    <div className="hub-page" style={{ margin: "0 auto", maxWidth: "none" }}>
      <PageHeader
        title="Kanban da equipe"
        subtitle="Quadro compartilhado da equipe Fropty — organize as atividades internas"
      />
      <PersonalKanban initialTasks={tasks} />
    </div>
  );
}
