-- Fix: profiles_plan_check só aceita 'basico'|'pro'. Convites sem plano definido
-- devem passar NULL, não 'sem_plano'.
CREATE OR REPLACE FUNCTION public.fn_on_auth_user_created()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  is_invited boolean := NEW.invited_at IS NOT NULL;
  v_role          text;
  v_token_balance int;
  v_plan          text;
BEGIN
  IF is_invited THEN
    v_role          := COALESCE(NEW.raw_user_meta_data->>'role', 'cliente');
    v_token_balance := COALESCE((NEW.raw_user_meta_data->>'token_balance')::int, 0);
    -- Só define plano se for valor válido; caso contrário NULL
    v_plan := CASE
      WHEN NEW.raw_user_meta_data->>'plan' IN ('basico', 'pro')
      THEN NEW.raw_user_meta_data->>'plan'
      ELSE NULL
    END;
  ELSE
    v_role          := 'cliente';
    v_token_balance := 0;
    v_plan          := NULL;
  END IF;

  IF v_role NOT IN ('cliente', 'admin') THEN
    v_role := 'cliente';
  END IF;

  INSERT INTO public.profiles (id, name, role, email, token_balance, plan)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    v_role,
    NEW.email,
    v_token_balance,
    v_plan
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email;
  RETURN NEW;
END;
$function$;
