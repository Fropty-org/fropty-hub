import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface OnboardingStep {
  label:     string;
  completed: boolean;
  href?:     string;
}

export async function getOnboardingSteps(
  profile: Profile,
  supabase: SupabaseClient<Database>
): Promise<OnboardingStep[]> {
  const steps: OnboardingStep[] = [];

  // Step 1: conta criada — sempre true
  steps.push({
    label:     "Conta criada com sucesso",
    completed: true,
  });

  // Step 2: perfil preenchido — tem nome e serviços configurados
  const profileFilled = !!(profile.name && profile.name.trim().length > 0);
  steps.push({
    label:     "Perfil configurado",
    completed: profileFilled,
    href:      "/portal/perfil",
  });

  // Step 3: primeira vitória — tem ao menos 1 ticket ou acessou a base de conhecimento
  const { count: ticketCount } = await supabase
    .from("tickets")
    .select("id", { count: "exact", head: true })
    .eq("client_id", profile.id);

  const hasTicket = (ticketCount ?? 0) > 0;
  steps.push({
    label:     "Abrir o primeiro chamado",
    completed: hasTicket,
    href:      "/portal/suporte/novo",
  });

  // Step 4: ativação — tem serviços contratados ativos
  const hasServices = Array.isArray(profile.services) && profile.services.length > 0;
  steps.push({
    label:     "Serviço ativo na sua conta",
    completed: hasServices,
    href:      undefined, // configurado pelo admin
  });

  // Step 5: acompanhamento — marcado pelo welcomed_at (proxy de primeiro acesso completo)
  const hasAccessed = !!profile.welcomed_at;
  steps.push({
    label:     "Acompanhar métricas no painel",
    completed: hasAccessed,
    href:      "/portal/dashboard",
  });

  return steps;
}
