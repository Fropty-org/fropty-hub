import { requireRole } from "@/app/lib/auth/session";

/**
 * Guard para o grupo (cliente) — acessível por clientes e admins.
 * Admins precisam acessar /portal/perfil e outras páginas do portal.
 */
export default async function ClienteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["cliente", "admin"]);
  return <>{children}</>;
}
