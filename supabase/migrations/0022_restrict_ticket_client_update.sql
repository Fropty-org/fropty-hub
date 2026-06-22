-- Remove o UPDATE direto de chamados pelo cliente. Toda mudança de estado do
-- cliente passa por respondResolution (service role, validado). Admin continua
-- com tickets_update_admin. Também remove a policy morta de dev (sem role dev).
DROP POLICY IF EXISTS "tickets_update_own_client" ON public.tickets;
DROP POLICY IF EXISTS "tickets_update_assigned_dev" ON public.tickets;
