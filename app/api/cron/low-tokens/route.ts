import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/app/lib/supabase/service";
import { sendLowTokenAlert } from "@/app/lib/email/send";
import crypto from "crypto";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const expected = Buffer.from(`Bearer ${process.env.CRON_SECRET ?? ""}`);
  const received = Buffer.from(auth);
  if (
    expected.length !== received.length ||
    !crypto.timingSafeEqual(expected, received)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

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
