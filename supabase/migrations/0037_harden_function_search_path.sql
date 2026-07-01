-- Hardening de segurança: fixa search_path nas funções que ainda estavam com
-- search_path mutável (advisor "function_search_path_mutable"). Alinha com o
-- padrão já aplicado às demais funções (migration 0023).
--
-- Usa ALTER FUNCTION ... SET search_path (não altera o corpo → zero mudança
-- de comportamento).

ALTER FUNCTION public.increment_article_views(article_id uuid) SET search_path = public;
ALTER FUNCTION public.rate_article(article_id uuid, helpful boolean) SET search_path = public;
ALTER FUNCTION public.toggle_roadmap_vote(p_item_id uuid) SET search_path = public;
ALTER FUNCTION public.calculate_health_score(p_uso integer, p_tickets integer, p_receita integer, p_engajamento integer, p_satisfacao integer) SET search_path = public;
ALTER FUNCTION public.get_risk_level(p_score integer) SET search_path = public;
