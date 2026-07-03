import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/app/lib/supabase/service";
import { sendMonthlyReport } from "@/app/lib/email/send";
import crypto from "crypto";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Relatório mensal automático. Agendado para o 1º dia do mês (ver vercel.json).
 * Para cada cliente ativo, calcula o resumo do MÊS ANTERIOR (chamados abertos e
 * resolvidos, tokens consumidos, atualizações de projeto) e envia por e-mail.
 * Clientes sem nenhuma atividade no mês são pulados (evita e-mail vazio/spam).
 *
 * Auth: Bearer CRON_SECRET (timing-safe), igual ao cron de low-tokens.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const expected = Buffer.from(`Bearer ${process.env.CRON_SECRET ?? ""}`);
  const received = Buffer.from(auth);
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Janela do mês anterior: [1º dia do mês passado, 1º dia deste mês).
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end   = new Date(now.getFullYear(), now.getMonth(), 1);
  const startIso = start.toISOString();
  const endIso   = end.toISOString();
  const monthLabel = start.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const { data: clients, error } = await supabase
    .from("profiles")
    .select("id, name, token_balance")
    .eq("role", "cliente")
    .eq("is_active", true);

  if (error) {
    console.error("[cron/monthly-report] clients:", error.message);
    return NextResponse.json({ error: "Failed to load clients" }, { status: 500 });
  }
  if (!clients || clients.length === 0) return NextResponse.json({ processed: 0 });

  let processed = 0;
  let skipped = 0;

  for (const c of clients) {
    try {
      // Projetos do cliente (para contar atualizações no período).
      const { data: projs } = await supabase.from("projects").select("id").eq("client_id", c.id);
      const projIds = (projs ?? []).map((p) => p.id);

      const [openedRes, resolvedRes, debitsRes, updatesRes] = await Promise.all([
        supabase.from("tickets").select("id", { count: "exact", head: true })
          .eq("client_id", c.id).gte("created_at", startIso).lt("created_at", endIso),
        supabase.from("tickets").select("id", { count: "exact", head: true })
          .eq("client_id", c.id).gte("resolved_at", startIso).lt("resolved_at", endIso),
        supabase.from("token_transactions").select("amount")
          .eq("client_id", c.id).eq("type", "debit").gte("created_at", startIso).lt("created_at", endIso),
        projIds.length
          ? supabase.from("project_updates").select("id", { count: "exact", head: true })
              .in("project_id", projIds).gte("created_at", startIso).lt("created_at", endIso)
          : Promise.resolve({ count: 0 }),
      ]);

      const ticketsOpened   = openedRes.count ?? 0;
      const ticketsResolved = resolvedRes.count ?? 0;
      const tokensConsumed  = (debitsRes.data ?? []).reduce((s, t) => s + (t.amount ?? 0), 0);
      const projectUpdates  = updatesRes.count ?? 0;

      // Sem atividade no mês → não envia.
      if (ticketsOpened + ticketsResolved + tokensConsumed + projectUpdates === 0) {
        skipped++;
        continue;
      }

      const { data: authUser } = await supabase.auth.admin.getUserById(c.id);
      const email = authUser?.user?.email;
      if (!email) { skipped++; continue; }

      await sendMonthlyReport({
        toEmail:         email,
        toName:          c.name ?? "Cliente",
        monthLabel,
        ticketsOpened,
        ticketsResolved,
        tokensConsumed,
        projectUpdates,
        tokenBalance:    c.token_balance ?? 0,
      });

      processed++;
    } catch (err) {
      console.error("[cron/monthly-report] error for client", c.id, err);
    }
  }

  return NextResponse.json({ processed, skipped, total: clients.length, month: monthLabel });
}
