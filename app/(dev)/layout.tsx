import { requireRole } from "@/app/lib/auth/session";

/**
 * Guard para o grupo (dev).
 * Redireciona para /area-cliente se não autenticado ou role !== 'dev'.
 * As páginas do portal do desenvolvedor são implementadas no Sprint 5.
 */
export default async function DevGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("dev");
  return <>{children}</>;
}
