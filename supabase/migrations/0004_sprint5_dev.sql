-- Sprint 5: Portal do Dev — permissões extras

-- Dev pode atualizar status/prioridade de tickets
DROP POLICY IF EXISTS "tickets_update_dev" ON public.tickets;
CREATE POLICY "tickets_update_dev" ON public.tickets
  FOR UPDATE USING (auth_role() IN ('dev', 'admin'));

-- Dev pode inserir mensagens nos tickets
-- (já coberto pelo ticket_msgs_insert via auth_role)

-- Dev pode atualizar projetos (status, progress)
DROP POLICY IF EXISTS "projects: dev update assigned" ON public.projects;
CREATE POLICY "projects: dev update assigned"
  ON public.projects FOR UPDATE
  USING (auth_role() IN ('dev', 'admin'));
