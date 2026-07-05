"use server";

import { createClient } from "@/app/lib/supabase/server";
import { createServiceClient } from "@/app/lib/supabase/service";
import { requireAuth, requireRole } from "@/app/lib/auth/require-role";

/** Registra a resposta de NPS (0–10) do cliente autenticado. */
export async function submitNps(score: number, comment?: string): Promise<{ error?: string }> {
  const userId = await requireAuth();
  if (!Number.isInteger(score) || score < 0 || score > 10) return { error: "Nota inválida." };

  const supabase = await createClient();
  const { error } = await supabase.from("nps_responses").insert({
    client_id: userId,
    score,
    comment: comment?.trim().slice(0, 1000) || null,
  });

  if (error) {
    console.error("[nps] submitNps:", error.message);
    return { error: "Não foi possível registrar sua avaliação." };
  }
  return {};
}

export interface NpsSummary {
  count:      number;
  nps:        number | null;   // -100..100
  promoters:  number;
  passives:   number;
  detractors: number;
}

/** Calcula o NPS agregado dos últimos `days` dias (visão admin). */
export async function getNpsSummary(days = 90): Promise<NpsSummary> {
  await requireRole("admin");
  const supabase = createServiceClient();
  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  const { data } = await supabase
    .from("nps_responses")
    .select("score")
    .gte("created_at", since);

  const rows = data ?? [];
  const count = rows.length;
  if (count === 0) return { count: 0, nps: null, promoters: 0, passives: 0, detractors: 0 };

  const promoters  = rows.filter((r) => r.score >= 9).length;
  const detractors = rows.filter((r) => r.score <= 6).length;
  const passives   = count - promoters - detractors;
  const nps = Math.round(((promoters - detractors) / count) * 100);

  return { count, nps, promoters, passives, detractors };
}
