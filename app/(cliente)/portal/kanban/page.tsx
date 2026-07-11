import type { Metadata } from "next";
import { getProfile } from "@/app/lib/auth/session";
import { getKanbanTasks } from "@/app/actions/kanban";
import { PersonalKanban } from "@/app/components/kanban/PersonalKanban";
import { KanbanUpsell } from "@/app/components/kanban/KanbanUpsell";
import { PageHeader } from "@/app/components/ui/PageHeader";

export const metadata: Metadata = { title: "Kanban" };

export default async function KanbanPage() {
  const profile = await getProfile();
  const services = (profile?.services ?? []) as string[];
  const hasKanban = services.includes("kanban");

  return (
    <div className="hub-page" style={{ margin: "0 auto", maxWidth: "none" }}>
      <PageHeader
        title="Kanban"
        subtitle="Seu quadro de tarefas — organize as atividades do seu negócio"
      />

      {hasKanban ? (
        <PersonalKanban initialTasks={await getKanbanTasks()} />
      ) : (
        <KanbanUpsell />
      )}
    </div>
  );
}
