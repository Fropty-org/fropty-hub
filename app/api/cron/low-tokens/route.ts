import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/app/lib/supabase/service";
import { sendLowTokenAlert } from "@/app/lib/email/send";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Verifica secret para proteger o endpoint
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Busca alertas pendentes criados nas últimas 48h
  const { data: alerts } = await supabase
    .from("low_token_alerts")
    .select("id, client_id, token_balance")
    .is("sent_at", null)
    .gt("created_at", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());

  if (!alerts || alerts.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  let processed = 0;

  for (const alert of alerts) {
    try {
      // Busca email do usuário
      const { data: authUser } = await supabase.auth.admin.getUserById(alert.client_id);
      const { data: profile }  = await supabase
        .from("profiles")
        .select("name")
        .eq("id", alert.client_id)
        .single();

      const email = authUser?.user?.email;
      if (!email) continue;

      await sendLowTokenAlert({
        toEmail:  email,
        toName:   profile?.name ?? "Cliente",
        balance:  alert.token_balance,
      });

      // Marca como enviado
      await supabase
        .from("low_token_alerts")
        .update({ sent_at: new Date().toISOString() })
        .eq("id", alert.id);

      processed++;
    } catch (err) {
      console.error("[cron/low-tokens] error for alert", alert.id, err);
    }
  }

  return NextResponse.json({ processed, total: alerts.length });
}
