-- Funções SECURITY DEFINER usadas apenas como TRIGGER não precisam ser
-- chamáveis via API (/rest/v1/rpc). Revoga EXECUTE de PUBLIC/anon/authenticated.
-- Os triggers continuam funcionando (execução de trigger independe de EXECUTE).
-- auth_role() é mantida pois é usada dentro das policies de RLS.
REVOKE EXECUTE ON FUNCTION public.fn_notify_new_client()          FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_notify_new_ticket()          FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_notify_ticket_message()      FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_notify_ticket_status()       FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_on_auth_user_created()       FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_protect_profile_columns()    FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_token_transaction_balance()  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_low_token_alert()       FROM PUBLIC, anon, authenticated;

-- Função órfã do trigger legado (já removido). Não é mais usada.
DROP FUNCTION IF EXISTS public.handle_new_user();
