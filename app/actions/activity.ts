"use server";

import { createClient } from "@/app/lib/supabase/server";

export interface ActivityItem {
  id:        string;
  title:     string;
  body:      string | null;
  link:      string | null;
  type:      string;
  createdAt: string;
}

/**
 * Feed de atividade do usuário atual. Reaproveita a tabela `notifications`
 * (populada por triggers — chamados, mensagens, mudanças de status, projetos,
 * feedback, contratos), que já é uma linha do tempo consolidada. Diferente do
 * sino (que mostra não lidas), o feed mostra a atividade recente independente
 * de leitura.
 */
export async function getActivityFeed(limit = 8): Promise<ActivityItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, body, link, type, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getActivityFeed]", error.message);
    return [];
  }

  return (data ?? []).map((n) => ({
    id:        n.id,
    title:     n.title,
    body:      n.body,
    link:      n.link,
    type:      n.type,
    createdAt: n.created_at,
  }));
}
