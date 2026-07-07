-- Corrige relacionamentos PostgREST ausentes entre projects/contracts/project_updates e profiles.
--
-- Bug: projects.client_id, contracts.client_id e project_updates.author_id referenciam
-- auth.users(id), mas NAO public.profiles(id). O codigo da aplicacao faz embeds do
-- PostgREST como `.select("*, profiles:client_id(name)")` (app/actions/projects.ts,
-- app/actions/contracts.ts), que exigem uma foreign key DIRETA entre as duas tabelas
-- do select. Sem ela, o PostgREST retorna erro "Could not find a relationship between
-- 'projects' and 'profiles'" e a query inteira falha — silenciosamente capturada pelo
-- codigo, que retorna [] (lista vazia). Isso faz o Kanban, o Calendario e a lista de
-- Projetos do admin aparecerem sempre vazios, mesmo com projetos cadastrados.
--
-- tickets.client_id ja aponta corretamente para profiles.id (padrao correto, replicado
-- aqui). profiles.id e 1:1 com auth.users.id (profiles_id_fkey), entao adicionar estas
-- FKs extras aponta para o mesmo dado sem duplicidade — apenas habilita o PostgREST a
-- resolver o relacionamento. As FKs existentes para auth.users sao mantidas.

alter table public.projects
  add constraint projects_client_id_profiles_fkey
  foreign key (client_id) references public.profiles(id) on delete cascade;

alter table public.contracts
  add constraint contracts_client_id_profiles_fkey
  foreign key (client_id) references public.profiles(id) on delete cascade;

alter table public.project_updates
  add constraint project_updates_author_id_profiles_fkey
  foreign key (author_id) references public.profiles(id) on delete cascade;
