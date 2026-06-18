// Thin wrappers que delegam para session.ts (com React.cache) mantendo
// a API existente (retorno de string userId) para os importadores atuais.
import { requireRole as _rr, requireAuth as _ra } from "./session";
import type { UserRole } from "./roles";

export async function requireRole(requiredRole: UserRole): Promise<string> {
  const profile = await _rr(requiredRole);
  return profile.id;
}

export async function requireAuth(): Promise<string> {
  const user = await _ra();
  return user.id;
}
