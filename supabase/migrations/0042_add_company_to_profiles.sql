-- Adiciona o campo "Empresa" ao perfil do cliente, exibido na lista de
-- usuários do admin e preenchido no convite de novo usuário.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company text;

-- Atualiza o trigger de provisionamento para persistir "company" do metadata
-- do convite (mesmo padrão de services/contract_start em 0017).
CREATE OR REPLACE FUNCTION public.fn_on_auth_user_created()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  is_invited boolean := (meta ? 'role') OR (meta ? 'token_balance') OR (meta ? 'plan');
  v_role           text;
  v_token_balance  int;
  v_plan           text;
  v_services       text[];
  v_contract_start date;
  v_company        text;
BEGIN
  IF is_invited THEN
    v_role          := COALESCE(meta->>'role', 'cliente');
    v_token_balance := COALESCE((meta->>'token_balance')::int, 0);
    v_plan := CASE
      WHEN meta->>'plan' IN ('sem_plano', 'basico', 'pro')
      THEN meta->>'plan'
      ELSE 'sem_plano'
    END;
    v_services := CASE
      WHEN jsonb_typeof(meta->'services') = 'array'
      THEN ARRAY(SELECT jsonb_array_elements_text(meta->'services'))
      ELSE '{}'::text[]
    END;
    v_contract_start := CASE
      WHEN meta->>'contract_start' ~ '^\d{4}-\d{2}-\d{2}$'
      THEN (meta->>'contract_start')::date
      ELSE NULL
    END;
    v_company := NULLIF(trim(meta->>'company'), '');
  ELSE
    v_role           := 'cliente';
    v_token_balance  := 0;
    v_plan           := 'sem_plano';
    v_services       := '{}'::text[];
    v_contract_start := NULL;
    v_company        := NULL;
  END IF;

  IF v_role NOT IN ('cliente', 'admin') THEN
    v_role := 'cliente';
  END IF;

  INSERT INTO public.profiles (id, name, role, email, token_balance, plan, services, contract_start, company)
  VALUES (
    NEW.id,
    COALESCE(meta->>'name', split_part(NEW.email, '@', 1)),
    v_role,
    NEW.email,
    v_token_balance,
    v_plan,
    v_services,
    v_contract_start,
    v_company
  )
  ON CONFLICT (id) DO UPDATE SET
    email          = EXCLUDED.email,
    token_balance  = CASE WHEN is_invited THEN EXCLUDED.token_balance  ELSE profiles.token_balance  END,
    plan           = CASE WHEN is_invited THEN EXCLUDED.plan           ELSE profiles.plan           END,
    services       = CASE WHEN is_invited THEN EXCLUDED.services       ELSE profiles.services       END,
    contract_start = CASE WHEN is_invited THEN EXCLUDED.contract_start ELSE profiles.contract_start END,
    company        = CASE WHEN is_invited THEN EXCLUDED.company        ELSE profiles.company        END;
  RETURN NEW;
END;
$function$;
