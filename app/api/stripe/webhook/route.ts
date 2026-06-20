import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, TOKENS_PER_PURCHASE, type StripePriceKey } from "@/app/lib/stripe";
import { createServiceClient } from "@/app/lib/supabase/service";
import { sendPlanConfirmation } from "@/app/lib/email/send";

export const runtime = "nodejs";

async function creditTokens(userId: string, qty: number, description: string) {
  const supabase = createServiceClient();
  await supabase.from("token_transactions").insert({
    client_id:   userId,
    amount:      qty,
    type:        "credit" as const,
    description,
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id;
  if (!userId) return;

  const type = session.metadata?.type as StripePriceKey | "subscription" | undefined;

  if (type === "token_avulso") {
    const qty = parseInt(session.metadata?.qty ?? "1", 10);
    await creditTokens(userId, qty, `Compra avulsa de ${qty} token(s)`);
    return;
  }

  if (type === "subscription") {
    const plan = session.metadata?.plan as "basico" | "pro";
    if (!plan || !["basico", "pro"].includes(plan)) return;

    const tokens = TOKENS_PER_PURCHASE[plan];
    const subscriptionId = session.subscription as string;

    const supabase = createServiceClient();
    await supabase
      .from("profiles")
      .update({ stripe_subscription_id: subscriptionId, plan })
      .eq("id", userId);

    await creditTokens(userId, tokens, `Tokens do Plano ${plan === "basico" ? "Básico" : "Pro"} — mês 1`);

    // E-mail de confirmação — fire and forget
    const { data: profile } = await supabase.from("profiles").select("name").eq("id", userId).single();
    const clientEmail = session.customer_details?.email ?? session.customer_email ?? null;
    if (clientEmail) {
      sendPlanConfirmation({ toEmail: clientEmail, toName: profile?.name ?? "Cliente", plan, tokens });
    }
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionId = (invoice as any).subscription as string | undefined;
  if (!subscriptionId) return;

  // Ignora a primeira invoice (já tratada em checkout.session.completed)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((invoice as any).billing_reason === "subscription_create") return;

  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, plan")
    .eq("stripe_subscription_id", subscriptionId)
    .single();

  if (!profile) return;

  const plan = profile.plan;
  if (!plan || !["basico", "pro"].includes(plan)) return;

  const tokens = TOKENS_PER_PURCHASE[plan as "basico" | "pro"];
  const month  = new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" });

  await creditTokens(profile.id, tokens, `Renovação ${plan === "basico" ? "Básico" : "Pro"} — ${month}`);
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_subscription_id", sub.id)
    .single();

  if (!profile) return;

  await supabase
    .from("profiles")
    .update({ stripe_subscription_id: null, plan: "sem_plano" })
    .eq("id", profile.id);
}

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Replay protection — marca ANTES de processar (unique constraint em event_id).
  // Se já foi processado, insert retorna conflito → skipped.
  // Se o handler falhar após o insert, o Stripe vai retentar e o insert vai conflitar → skipped também.
  // Isso é intencional: preferimos perder uma retentativa a creditar tokens duplicados.
  const supabaseIdempotent = createServiceClient();
  const { error: dupError } = await supabaseIdempotent
    .from("processed_webhook_events")
    .insert({ event_id: event.id });

  if (dupError) {
    // código 23505 = unique_violation (já processado)
    if (dupError.code === "23505") {
      return NextResponse.json({ received: true, skipped: "duplicate" });
    }
    console.error("[stripe/webhook] idempotency insert failed:", dupError);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
    }
  } catch (err) {
    console.error("[stripe/webhook]", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
