import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-05-27.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

// Alias para manter compatibilidade com código que usa `stripe.xxx`
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// Preços em centavos (BRL)
export const STRIPE_PRICES = {
  token_avulso: {
    unit_amount: 30000, // R$300,00 — token avulso para quem NÃO tem plano
    currency: "brl",
    name: "Token Fropty (avulso)",
  },
  token_avulso_assinante: {
    unit_amount: 15000, // R$150,00 — token extra para quem TEM plano (50% off)
    currency: "brl",
    name: "Token Fropty extra (assinante)",
  },
  basico: {
    unit_amount: 4990, // R$49,90/mês
    currency: "brl",
    name: "Plano Básico — 4 tokens/mês",
  },
  pro: {
    unit_amount: 8990, // R$89,90/mês
    currency: "brl",
    name: "Plano Pro — 8 tokens/mês",
  },
} as const;

export type StripePriceKey = keyof typeof STRIPE_PRICES;

// Tokens concedidos por evento de pagamento
export const TOKENS_PER_PURCHASE: Record<StripePriceKey, number> = {
  token_avulso:           1,
  token_avulso_assinante: 1,
  basico:                 4,
  pro:                    8,
};
