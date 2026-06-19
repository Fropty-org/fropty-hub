import { redirect } from "next/navigation";

// Rota legada — redireciona para o novo portal
export default function LegacyDashboardPage() {
  redirect("/portal/dashboard");
}
