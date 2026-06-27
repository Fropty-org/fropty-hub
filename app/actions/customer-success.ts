"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/app/lib/supabase/service";
import { requireRole } from "@/app/lib/auth/require-role";
import type { ClientWithHealth, HealthScore, RiskLevel } from "@/app/lib/types/customer-success";

function calcScore(uso: number, tickets: number, receita: number, engajamento: number, satisfacao: number): number {
  return Math.round(uso * 0.25 + tickets * 0.20 + receita * 0.25 + engajamento * 0.15 + satisfacao * 0.15);
}

function calcRisk(score: number): RiskLevel {
  if (score >= 75) return 'saudavel';
  if (score >= 50) return 'atencao';
  if (score >= 25) return 'risco';
  return 'critico';
}

export async function getClientsWithHealth(): Promise<ClientWithHealth[]> {
  await requireRole("admin");
  const supabase = createServiceClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, email, plan, token_balance")
    .eq("role", "cliente")
    .eq("is_active", true)
    .order("name");

  if (!profiles?.length) return [];

  const ids = profiles.map((p) => p.id);
  const { data: scores } = await supabase
    .from("health_scores")
    .select("*")
    .in("client_id", ids);

  const scoreMap = new Map<string, HealthScore>();
  for (const s of (scores ?? []) as HealthScore[]) {
    scoreMap.set(s.client_id, s);
  }

  const clients: ClientWithHealth[] = profiles.map((p) => ({
    id: p.id,
    email: p.email ?? "",
    full_name: p.name,
    plan: p.plan ?? "sem_plano",
    token_balance: p.token_balance,
    health: scoreMap.get(p.id) ?? null,
  }));

  return clients.sort((a, b) => {
    const sa = a.health?.score_total ?? -1;
    const sb = b.health?.score_total ?? -1;
    return sa - sb;
  });
}

export async function getClientHealth(clientId: string): Promise<ClientWithHealth | null> {
  await requireRole("admin");
  const supabase = createServiceClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, email, plan, token_balance")
    .eq("id", clientId)
    .single();

  if (!profile) return null;

  const { data: score } = await supabase
    .from("health_scores")
    .select("*")
    .eq("client_id", clientId)
    .maybeSingle();

  return {
    id: profile.id,
    email: profile.email ?? "",
    full_name: profile.name,
    plan: profile.plan ?? "sem_plano",
    token_balance: profile.token_balance,
    health: (score as HealthScore | null) ?? null,
  };
}

export async function upsertHealthScore(data: {
  client_id: string;
  score_uso: number;
  score_tickets: number;
  score_receita: number;
  score_engajamento: number;
  score_satisfacao: number;
  cs_notes?: string;
}): Promise<{ error?: string }> {
  await requireRole("admin");
  const supabase = createServiceClient();

  const score_total = calcScore(data.score_uso, data.score_tickets, data.score_receita, data.score_engajamento, data.score_satisfacao);
  const risk_level = calcRisk(score_total);

  const { error } = await supabase
    .from("health_scores")
    .upsert({
      client_id: data.client_id,
      score_uso: data.score_uso,
      score_tickets: data.score_tickets,
      score_receita: data.score_receita,
      score_engajamento: data.score_engajamento,
      score_satisfacao: data.score_satisfacao,
      score_total,
      risk_level,
      cs_notes: data.cs_notes ?? null,
      last_interaction_at: new Date().toISOString(),
    }, { onConflict: "client_id" });

  if (error) return { error: error.message };

  revalidatePath("/admin/customer-success");
  revalidatePath(`/admin/customer-success/${data.client_id}`);
  return {};
}

export async function getCSMetrics(): Promise<{
  total_clients: number;
  saudavel: number;
  atencao: number;
  risco: number;
  critico: number;
  avg_score: number;
  sem_avaliacao: number;
}> {
  await requireRole("admin");
  const supabase = createServiceClient();

  const { count: total_clients } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "cliente")
    .eq("is_active", true);

  const { data: scores } = await supabase
    .from("health_scores")
    .select("risk_level, score_total");

  const list = (scores ?? []) as { risk_level: RiskLevel; score_total: number }[];
  const counted = { saudavel: 0, atencao: 0, risco: 0, critico: 0 };
  let sum = 0;
  for (const s of list) {
    counted[s.risk_level] = (counted[s.risk_level] ?? 0) + 1;
    sum += s.score_total;
  }

  const total = total_clients ?? 0;
  const avaliados = list.length;

  return {
    total_clients: total,
    ...counted,
    avg_score: avaliados > 0 ? Math.round(sum / avaliados) : 0,
    sem_avaliacao: total - avaliados,
  };
}

export async function getClientsWithoutHealth(): Promise<ClientWithHealth[]> {
  await requireRole("admin");
  const supabase = createServiceClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, email, plan, token_balance")
    .eq("role", "cliente")
    .eq("is_active", true)
    .order("name");

  if (!profiles?.length) return [];

  const ids = profiles.map((p) => p.id);
  const { data: scores } = await supabase
    .from("health_scores")
    .select("client_id")
    .in("client_id", ids);

  const evaluated = new Set((scores ?? []).map((s: { client_id: string }) => s.client_id));

  return profiles
    .filter((p) => !evaluated.has(p.id))
    .map((p) => ({
      id: p.id,
      email: p.email ?? "",
      full_name: p.name,
      plan: p.plan ?? "sem_plano",
      token_balance: p.token_balance,
      health: null,
    }));
}
