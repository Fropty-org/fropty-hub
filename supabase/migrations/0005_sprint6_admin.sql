-- Sprint 6: Admin Panel — visibilidade total + funções de gestão

-- Admin pode inserir projetos
DROP POLICY IF EXISTS "projects: admin insert" ON public.projects;
CREATE POLICY "projects: admin insert"
  ON public.projects FOR INSERT
  WITH CHECK (auth_role() = 'admin');

-- Admin pode inserir token_transactions manualmente
DROP POLICY IF EXISTS "tokens: admin insert" ON public.token_transactions;
CREATE POLICY "tokens: admin insert"
  ON public.token_transactions FOR INSERT
  WITH CHECK (auth_role() = 'admin');

-- Função: resumo financeiro (MRR)
CREATE OR REPLACE FUNCTION admin_mrr()
RETURNS NUMERIC LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(SUM(
    CASE plan
      WHEN 'basico' THEN 49.90
      WHEN 'pro'    THEN 89.90
      ELSE 0
    END
  ), 0)
  FROM profiles
  WHERE plan IN ('basico', 'pro');
$$;
