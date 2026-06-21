-- A constraint só permitia 'basico'|'pro', mas 'sem_plano' é um estado válido do negócio.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IS NULL OR plan = ANY (ARRAY['sem_plano', 'basico', 'pro']));
