import { requireRole } from "@/app/lib/auth/session";

/**
 * Guard para o grupo (dev) — agora restrito a admins.
 * Redireciona para /area-cliente se não autenticado ou role !== 'admin'.
 */
export default async function DevGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("admin");
  return <>{children}</>;
}
