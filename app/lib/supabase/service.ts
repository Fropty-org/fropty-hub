import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Cliente com service role — bypassa RLS.
// Use APENAS em rotas de API server-side que não têm sessão de usuário
// (webhooks, cron jobs, scripts de admin).
// NUNCA exponha ao client-side.
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios");
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
