create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'lead'
    check (status in ('lead','briefing','escopo','proposta','contrato','execucao','entrega','suporte','encerrado')),
  priority text not null default 'media'
    check (priority in ('critica','alta','media','baixa')),
  estimated_hours int,
  estimated_cost numeric(10,2),
  start_date date,
  due_date date,
  delivered_at timestamptz,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid not null references auth.users(id),
  content text not null,
  status_from text,
  status_to text,
  created_at timestamptz default now() not null
);

alter table public.projects enable row level security;
alter table public.project_updates enable row level security;

create policy "clients_own_projects" on public.projects
  for select using (client_id = auth.uid());

create policy "admins_all_projects" on public.projects
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "clients_own_project_updates" on public.project_updates
  for select using (
    exists (select 1 from public.projects where id = project_id and client_id = auth.uid())
  );

create policy "admins_all_project_updates" on public.project_updates
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
