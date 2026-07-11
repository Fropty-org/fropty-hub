import type { Metadata } from "next";
import { getProfile } from "@/app/lib/auth/session";
import { PlanosClient } from "@/app/components/cliente/PlanosClient";

export const metadata: Metadata = { title: "Planos — Fropty Hub" };

type PlanKey = "sem_plano" | "basico" | "pro" | "enterprise";

export default async function PlanosPage() {
  const profile = await getProfile();
  const plan = (profile?.plan ?? "sem_plano") as PlanKey;
  return <PlanosClient currentPlan={plan} />;
}
