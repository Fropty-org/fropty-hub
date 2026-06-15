-- Sprint 4: Token System + Stripe
-- Adiciona campos Stripe em profiles e índices auxiliares

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id      TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id  TEXT,
  ADD COLUMN IF NOT EXISTS plan                    TEXT NOT NULL DEFAULT 'sem_plano'
    CHECK (plan IN ('sem_plano', 'basico', 'pro'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_stripe_customer
  ON public.profiles(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_stripe_subscription
  ON public.profiles(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
