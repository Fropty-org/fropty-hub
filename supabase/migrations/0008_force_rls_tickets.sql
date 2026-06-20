-- Defesa em profundidade no isolamento de chamados entre clientes.
--
-- As políticas RLS de SELECT já garantem que um cliente só enxerga os próprios
-- tickets (tickets.client_id = auth.uid()) e as mensagens dos próprios tickets.
-- FORCE ROW LEVEL SECURITY aplica o RLS inclusive ao owner da tabela, fechando
-- qualquer brecha de bypass acidental. O service_role (BYPASSRLS) continua
-- operando normalmente para ações administrativas no servidor.

ALTER TABLE public.tickets         FORCE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages FORCE ROW LEVEL SECURITY;
