-- Revoga EXECUTE de funções SECURITY DEFINER de quem não deveria chamá-las.
-- Continuação da 0023: aquelas funções não existiam ainda (KB 0028, roadmap 0031,
-- auditoria 0044). Advisor do Supabase: 0028/0029 (anon/authenticated definer).
--
-- fn_audit_append_only(): função de TRIGGER (bloqueia UPDATE/DELETE no audit log).
-- Triggers executam independente de EXECUTE, então revoga de todos — não deve ser
-- chamável via /rest/v1/rpc por ninguém.
REVOKE EXECUTE ON FUNCTION public.fn_audit_append_only() FROM PUBLIC, anon, authenticated;

-- RPCs legítimas do app, mas só para usuário logado (chamadas com o user client).
-- anon nunca precisa: KB e roadmap ficam atrás de login. Mantém authenticated +
-- service_role; revoga PUBLIC (default do Postgres) e anon.
REVOKE EXECUTE ON FUNCTION public.increment_article_views(uuid)      FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rate_article(uuid, boolean)        FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.toggle_roadmap_vote(uuid)          FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.increment_article_views(uuid)      TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.rate_article(uuid, boolean)        TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.toggle_roadmap_vote(uuid)          TO authenticated, service_role;

-- auth_role() é usada dentro das policies de RLS (para o papel authenticated) e
-- não faz sentido para anon. Revoga anon; mantém authenticated + service_role.
REVOKE EXECUTE ON FUNCTION public.auth_role() FROM anon;
GRANT  EXECUTE ON FUNCTION public.auth_role() TO authenticated, service_role;
