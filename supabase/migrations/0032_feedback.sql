create table public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  type text not null default 'sugestao'
    check (type in ('sugestao','bug','elogio','critica','outro')),
  product text,
  status text not null default 'recebido'
    check (status in ('recebido','em_analise','aprovado','descartado','implementado')),
  impact text check (impact in ('alto','medio','baixo')),
  admin_response text,
  responded_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.feedbacks enable row level security;

create policy "clients_own_feedbacks" on public.feedbacks
  for select using (client_id = auth.uid());

create policy "clients_insert_feedback" on public.feedbacks
  for insert with check (client_id = auth.uid());

create policy "admins_all_feedbacks" on public.feedbacks
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create trigger feedbacks_updated_at before update on public.feedbacks
  for each row execute function public.set_updated_at();
