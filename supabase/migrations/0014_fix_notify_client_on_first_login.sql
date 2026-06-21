-- Corrige: notificação "Novo cliente" deve disparar no primeiro login,
-- não quando o convite é enviado (INSERT em profiles).
--
-- Estratégia: trigger em auth.users no UPDATE, quando last_sign_in_at
-- passa de NULL para um valor (= primeiro login do usuário).

-- 1. Remove o trigger antigo (INSERT em profiles)
DROP TRIGGER IF EXISTS trg_notify_new_client ON public.profiles;

-- 2. Recria a função para rodar no contexto de auth.users
CREATE OR REPLACE FUNCTION public.fn_notify_new_client()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  r       RECORD;
  v_name  text;
BEGIN
  -- Só dispara no primeiro login (last_sign_in_at passa de NULL para not-null)
  IF OLD.last_sign_in_at IS NOT NULL OR NEW.last_sign_in_at IS NULL THEN
    RETURN NEW;
  END IF;

  -- Busca o nome no profiles
  SELECT name INTO v_name FROM public.profiles WHERE id = NEW.id;
  IF v_name IS NULL OR v_name = '' THEN
    v_name := split_part(NEW.email, '@', 1);
  END IF;

  -- Só notifica se for um cliente
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = NEW.id AND role = 'cliente'
  ) THEN
    RETURN NEW;
  END IF;

  -- Insere notificação para cada admin
  FOR r IN SELECT id FROM public.profiles WHERE role = 'admin' LOOP
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      r.id,
      'client_joined',
      'Novo cliente',
      v_name || ' entrou na plataforma pela primeira vez',
      '/admin/usuarios'
    );
  END LOOP;

  RETURN NEW;
END;
$function$;

-- 3. Cria o novo trigger em auth.users
CREATE TRIGGER trg_notify_new_client
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_new_client();
