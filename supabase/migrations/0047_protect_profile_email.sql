-- Adiciona `email` à lista de colunas protegidas do perfil (complementa a 0021).
--
-- A policy "profiles_update" é row-level e permite o cliente atualizar o próprio
-- registro. O trigger fn_protect_profile_columns bloqueia os campos sensíveis,
-- mas `email` tinha ficado de fora: um cliente podia, via PostgREST, dessincronizar
-- o email do perfil do email real de auth (usado em telas/e-mails do admin).
-- O app nunca altera profiles.email pelo cliente (a troca de email é via Supabase
-- Auth), então protegê-lo não afeta nenhum fluxo legítimo. Admin e service_role
-- continuam liberados (early-return no topo da função).
CREATE OR REPLACE FUNCTION public.fn_protect_profile_columns()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' THEN
    RETURN NEW;
  END IF;
  IF NEW.email          IS DISTINCT FROM OLD.email
     OR NEW.role                   IS DISTINCT FROM OLD.role
     OR NEW.token_balance          IS DISTINCT FROM OLD.token_balance
     OR NEW.plan                   IS DISTINCT FROM OLD.plan
     OR NEW.plan_renewal           IS DISTINCT FROM OLD.plan_renewal
     OR NEW.services               IS DISTINCT FROM OLD.services
     OR NEW.contract_start         IS DISTINCT FROM OLD.contract_start
     OR NEW.is_active              IS DISTINCT FROM OLD.is_active
     OR NEW.stripe_customer_id     IS DISTINCT FROM OLD.stripe_customer_id
     OR NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id
  THEN
    RAISE EXCEPTION 'Alteração não permitida em campos protegidos do perfil';
  END IF;
  RETURN NEW;
END;
$function$;
