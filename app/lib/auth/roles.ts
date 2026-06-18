export type UserRole = "cliente" | "admin";

/** URL de destino após login para cada role. */
export const ROLE_HOME: Record<UserRole, string> = {
  cliente: "/area-cliente/dashboard",
  admin:   "/admin/overview",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  cliente: "Cliente",
  admin:   "Administrador",
};

export const DEFAULT_ROLE: UserRole = "cliente";
