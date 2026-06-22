"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { stripe, STRIPE_PRICES, type StripePriceKey } from "@/app/lib/stripe";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://fropty.com";

async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name: string,
): Promise<string> {
  const supabase = await createClient();

  // Verifica se já tem customer_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  if (profile?.stripe_customer_id) return profile.stripe_customer_id;

  // Cria no Stripe
  const customer = await stripe.customers.create({ email, name, metadata: { supabase_user_id: userId } });

  // Persiste
  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  return customer.id;
}

// Compra avulsa de tokens (1 ou mais)
export async function buyTokens(formData: FormData): Promise<void> {
  const qty = Math.max(1, parseInt((formData.get("qty") as string) ?? "1", 10));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`${BASE_URL}/area-cliente`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, plan, stripe_customer_id")
    .eq("id", user.id)
    .single();

  const customerId = await getOrCreateStripeCustomer(
    user.id,
    user.email!,
    profile?.name ?? user.email!,
  );

  // Quem tem plano paga R$150/token extra (50% off); sem plano, R$300.
  const hasPlan = profile?.plan === "basico" || profile?.plan === "pro";
  const price = hasPlan ? STRIPE_PRICES.token_avulso_assinante : STRIPE_PRICES.token_avulso;

  const session = await stripe.checkout.sessions.create({
    customer:   customerId,
    mode:       "payment",
    line_items: [
      {
        price_data: {
          currency:     price.currency,
          product_data: { name: price.name },
          unit_amount:  price.unit_amount,
        },
        quantity: qty,
      },
    ],
    metadata: {
      type:            "token_avulso",
      supabase_user_id: user.id,
      qty:             String(qty),
    },
    success_url: `${BASE_URL}/portal/financeiro?sucesso=tokens`,
    cancel_url:  `${BASE_URL}/portal/financeiro`,
  });

  redirect(session.url!);
}

// Assinar plano mensal (basico | pro)
export async function subscribePlan(formData: FormData): Promise<void> {
  const plan = (formData.get("plan") as StripePriceKey | null);
  if (plan !== "basico" && plan !== "pro") redirect(`${BASE_URL}/portal/financeiro`);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`${BASE_URL}/area-cliente`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, stripe_customer_id, stripe_subscription_id")
    .eq("id", user.id)
    .single();

  if (profile?.stripe_subscription_id) {
    redirect(`${BASE_URL}/portal/financeiro?erro=ja_assinante`);
  }

  const customerId = await getOrCreateStripeCustomer(
    user.id,
    user.email!,
    profile?.name ?? user.email!,
  );

  const price = STRIPE_PRICES[plan];

  const session = await stripe.checkout.sessions.create({
    customer:   customerId,
    mode:       "subscription",
    line_items: [
      {
        price_data: {
          currency:    price.currency,
          product_data: { name: price.name },
          unit_amount: price.unit_amount,
          recurring:   { interval: "month" },
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: {
        supabase_user_id: user.id,
        plan,
      },
    },
    metadata: {
      type:            "subscription",
      supabase_user_id: user.id,
      plan,
    },
    success_url: `${BASE_URL}/portal/financeiro?sucesso=plano`,
    cancel_url:  `${BASE_URL}/portal/financeiro`,
  });

  redirect(session.url!);
}
