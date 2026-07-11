-- Módulo "Kanban pessoal": quadro de tarefas privado por dono.
-- scope = 'client'      -> board individual de um cliente (owner_id = cliente)
-- scope = 'admin_team'  -> quadro único e compartilhado da equipe Fropty (owner_id null)
create table public.kanban_tasks (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('client','admin_team')),
  owner_id uuid references public.profiles(id) on delete cascade,
  column_key text not null default 'todo' check (column_key in ('todo','doing','done')),
  title text not null,
  description text,
  position int not null default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  -- garante coerência: client exige dono; admin_team não tem dono
  constraint kanban_scope_owner check (
    (scope = 'client' and owner_id is not null) or
    (scope = 'admin_team' and owner_id is null)
  )
);

create index kanban_tasks_owner_idx on public.kanban_tasks (owner_id);
create index kanban_tasks_scope_col_idx on public.kanban_tasks (scope, column_key, position);

alter table public.kanban_tasks enable row level security;

-- Cliente: acesso total apenas às próprias tarefas (nenhum admin, nenhum outro cliente).
create policy "kanban_client_owner" on public.kanban_tasks
  for all
  using  (scope = 'client' and owner_id = auth.uid())
  with check (scope = 'client' and owner_id = auth.uid());

-- Admin: acesso total ao quadro único da equipe (clientes nunca veem).
create policy "kanban_admin_team" on public.kanban_tasks
  for all
  using  (scope = 'admin_team' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (scope = 'admin_team' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create trigger kanban_tasks_updated_at before update on public.kanban_tasks
  for each row execute function public.set_updated_at();
