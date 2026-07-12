-- Fecha o bypass do débito de token na abertura de chamados.
--
-- Problema: a policy "tickets_insert_own" permitia ao cliente autenticado
-- inserir em `tickets` direto no PostgREST (anon key + JWT), pulando a server
-- action que valida saldo e debita 1 token. Resultado: chamados de graça, com
-- status/prioridade arbitrários.
--
-- Correção (defesa em profundidade, SECURITY.md §7 e §9): remover o INSERT
-- direto do cliente. A criação passa a ser exclusivamente via server action, que
-- usa o service role (bypassa RLS), valida o saldo e debita o token. Sem policy
-- de INSERT, o RLS nega qualquer insert de `anon`/`authenticated` — o banco
-- vira a rede de segurança do débito, não só a aplicação.
--
-- Código correspondente: app/lib/db/tickets.ts (dbCreateTicket sempre service),
-- app/actions/profile.ts (requestPlanUpgrade sempre service).
DROP POLICY IF EXISTS "tickets_insert_own" ON public.tickets;

COMMENT ON TABLE public.tickets IS
  'Chamados (UFT). INSERT só via service role (server actions) — sem policy de INSERT para anon/authenticated de propósito: a abertura debita token e não pode ser feita direto no PostgREST.';
