import { requireRole } from "@/app/lib/auth/session";

/**
 * Guard para o grupo (admin).
 * Redireciona para /area-cliente se não autenticado ou role !== 'admin'.
 * As páginas do painel administrativo são implementadas no Sprint 6.
 */
export default async function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("admin");
  return <>{children}</>;
}
