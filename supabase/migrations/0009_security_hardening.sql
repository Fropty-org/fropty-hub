-- Auditoria de segurança: correções de banco/infra.

-- 1) ALTO: admin_mrr() expunha o MRR do negócio publicamente via /rest/v1/rpc.
--    Só o service_role (ações admin no servidor) deve poder executar.
REVOKE EXECUTE ON FUNCTION public.admin_mrr() FROM anon, authenticated, public;

-- 2) MÉDIO: qualquer usuário podia inserir notificação para qualquer user_id.
--    Os triggers fn_notify_* são SECURITY DEFINER e continuam inserindo normalmente.
DROP POLICY IF EXISTS "Service role insere notificações" ON public.notifications;
CREATE POLICY "Service role insere notificações"
  ON public.notifications FOR INSERT TO service_role
  WITH CHECK (true);

-- 3) BAIXO: search_path mutável (risco de schema hijacking) nas funções restantes.
ALTER FUNCTION public.handle_new_user()         SET search_path = public;
ALTER FUNCTION public.set_updated_at()          SET search_path = public;
ALTER FUNCTION public.fn_set_updated_at()       SET search_path = public;
ALTER FUNCTION public.trigger_low_token_alert() SET search_path = public;
ALTER FUNCTION public.fn_notify_new_ticket()    SET search_path = public;
ALTER FUNCTION public.fn_notify_ticket_status() SET search_path = public;
ALTER FUNCTION public.fn_notify_ticket_message() SET search_path = public;
ALTER FUNCTION public.fn_notify_new_client()    SET search_path = public;

-- 4) BAIXO: bucket público 'avatars' permitia listar todos os arquivos.
--    Buckets públicos servem objetos por URL sem precisar de policy de SELECT.
DROP POLICY IF EXISTS "avatar_public_read" ON storage.objects;
