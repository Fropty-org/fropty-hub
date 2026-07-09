import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/app/lib/auth/require-role";
import { createServiceClient } from "@/app/lib/supabase/service";
import { EditUsuarioForm } from "@/app/components/admin/EditUsuarioForm";

export const metadata: Metadata = { title: "Editar usuário — Admin" };

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function EditarUsuarioPage({ params }: Props) {
  await requireRole("admin");
  const { userId } = await params;

  const service = createServiceClient();
  const { data: user } = await service
    .from("profiles")
    .select("id,name,email,company,phone_number,role,plan,token_balance,services,contract_start")
    .eq("id", userId)
    .single();

  if (!user) notFound();

  return (
    <EditUsuarioForm
      user={{
        id:             user.id,
        name:           user.name ?? "",
        email:          user.email ?? "",
        company:        user.company ?? "",
        phone:          user.phone_number ?? "",
        role:           (user.role as "cliente" | "admin"),
        plan:           ((user.plan ?? "sem_plano") as "sem_plano" | "basico" | "pro"),
        token_balance:  user.token_balance ?? 0,
        services:       (user.services ?? []) as string[],
        contract_start: user.contract_start ?? "",
      }}
    />
  );
}
