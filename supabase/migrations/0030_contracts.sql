create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'rascunho'
    check (status in ('rascunho','enviado','assinado','encerrado','cancelado')),
  type text not null default 'projeto'
    check (type in ('projeto','retainer','manutencao','licenca','outro')),
  value numeric(10,2),
  start_date date,
  end_date date,
  file_url text,
  signed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.contracts enable row level security;

create policy "clients_own_contracts" on public.contracts
  for select using (client_id = auth.uid());

create policy "admins_all_contracts" on public.contracts
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create trigger contracts_updated_at before update on public.contracts
  for each row execute function public.set_updated_at();
