import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/app/lib/supabase/service";
import { sendNpsSurvey } from "@/app/lib/email/send";
import crypto from "crypto";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Pesquisa de NPS periódica (ver vercel.json). Envia o convite para clientes
 * ativos que NÃO responderam nos últimos 90 dias (evita fadiga de pesquisa).
 * Auth: Bearer CRON_SECRET (timing-safe).
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const expected = Buffer.from(`Bearer ${process.env.CRON_SECRET ?? ""}`);
  const received = Buffer.from(auth);
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: clients, error } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("role", "cliente")
    .eq("is_active", true);

  if (error) {
    console.error("[cron/nps-survey] clients:", error.message);
    return NextResponse.json({ error: "Failed to load clients" }, { status: 500 });
  }
  if (!clients || clients.length === 0) return NextResponse.json({ processed: 0 });

  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  let processed = 0;
  let skipped = 0;

  for (const c of clients) {
    try {
      const { count } = await supabase
        .from("nps_responses")
        .select("id", { count: "exact", head: true })
        .eq("client_id", c.id)
        .gte("created_at", since);

      if ((count ?? 0) > 0) { skipped++; continue; } // já respondeu recentemente

      const { data: authUser } = await supabase.auth.admin.getUserById(c.id);
      const email = authUser?.user?.email;
      if (!email) { skipped++; continue; }

      await sendNpsSurvey({ toEmail: email, toName: c.name ?? "Cliente" });
      processed++;
    } catch (err) {
      console.error("[cron/nps-survey] error for client", c.id, err);
    }
  }

  return NextResponse.json({ processed, skipped, total: clients.length });
}
