export type UserRole = "cliente" | "dev" | "admin";

/** URL de destino após login para cada role. */
export const ROLE_HOME: Record<UserRole, string> = {
  cliente: "/portal/dashboard",
  dev:     "/dev/tasks",
  admin:   "/admin/overview",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  cliente: "Cliente",
  dev:     "Desenvolvedor",
  admin:   "Administrador",
};

export const DEFAULT_ROLE: UserRole = "cliente";
