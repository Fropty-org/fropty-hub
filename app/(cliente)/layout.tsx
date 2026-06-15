import { requireRole } from "@/app/lib/auth/session";

/**
 * Guard de autenticação para todo o grupo (cliente).
 * requireRole redireciona para /area-cliente se não autenticado
 * ou se o role for diferente de 'cliente'.
 * O getProfile() interno usa React cache(), portanto layouts filhos
 * que chamarem getProfile() novamente não geram uma segunda query.
 */
export default async function ClienteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("cliente");
  return <>{children}</>;
}
