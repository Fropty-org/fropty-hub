-- 0040_nps_responses.sql
-- Respostas de NPS (Net Promoter Score) dos clientes.
-- Coletadas via /portal/nps (link enviado por e-mail pelo cron nps-survey).
-- RLS: o cliente vê/insere apenas o próprio; admin lê tudo (para a métrica).

create table if not exists public.nps_responses (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references public.profiles(id) on delete cascade,
  score      smallint not null check (score between 0 and 10),
  comment    text,
  created_at timestamptz not null default now()
);

create index if not exists idx_nps_responses_client  on public.nps_responses(client_id);
create index if not exists idx_nps_responses_created on public.nps_responses(created_at);

alter table public.nps_responses enable row level security;

drop policy if exists "nps_insert_own" on public.nps_responses;
create policy "nps_insert_own" on public.nps_responses
  for insert to authenticated
  with check (auth.uid() = client_id);

drop policy if exists "nps_select_own_or_admin" on public.nps_responses;
create policy "nps_select_own_or_admin" on public.nps_responses
  for select to authenticated
  using (auth.uid() = client_id or public.auth_role() = 'admin');

comment on table public.nps_responses is 'Respostas de NPS (0-10) dos clientes. RLS: cliente ve/insere o proprio; admin le tudo.';
