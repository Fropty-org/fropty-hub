import { redirect } from "next/navigation";

// O contexto de "projetos" foi removido do produto. A rota apenas redireciona.
export default function AdminProjetosPage() {
  redirect("/admin/overview");
}
