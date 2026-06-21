-- HIGH: o trigger confiava em role/token_balance/plan vindos do metadata do usuário,
-- permitindo que um self-signup (anon key) se provisionasse como admin com tokens.
-- Convites legítimos (adminInviteClient -> inviteUserByEmail, service role) populam
-- auth.users.invited_at; self-signup não. Só confiamos no metadata para convidados.
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
    -- Convite criado pelo admin via service role: metadata é confiável.
    v_role          := COALESCE(NEW.raw_user_meta_data->>'role', 'cliente');
    v_token_balance := COALESCE((NEW.raw_user_meta_data->>'token_balance')::int, 0);
    v_plan          := COALESCE(NEW.raw_user_meta_data->>'plan', 'sem_plano');
  ELSE
    -- Self-signup (anon): nunca confiar no metadata para privilégios.
    v_role          := 'cliente';
    v_token_balance := 0;
    v_plan          := 'sem_plano';
  END IF;

  -- Trava de segurança: role só pode ser 'cliente' ou 'admin'.
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
