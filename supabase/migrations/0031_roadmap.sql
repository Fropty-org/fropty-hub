create table public.roadmap_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'planejado'
    check (status in ('ideia','planejado','em_desenvolvimento','lancado','descartado')),
  category text not null default 'produto'
    check (category in ('produto','suporte','financeiro','integracao','seguranca','ux','performance','outro')),
  priority_score int not null default 0,
  votes int not null default 0,
  visibility text not null default 'publico'
    check (visibility in ('publico','privado')),
  target_version text,
  launched_at date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table public.roadmap_votes (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.roadmap_items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique(item_id, user_id)
);

alter table public.roadmap_items enable row level security;
alter table public.roadmap_votes enable row level security;

create policy "clients_see_public_roadmap" on public.roadmap_items
  for select using (visibility = 'publico');

create policy "admins_all_roadmap" on public.roadmap_items
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "users_see_own_votes" on public.roadmap_votes
  for select using (user_id = auth.uid());

create policy "users_vote" on public.roadmap_votes
  for insert with check (user_id = auth.uid());

create policy "users_unvote" on public.roadmap_votes
  for delete using (user_id = auth.uid());

create or replace function public.toggle_roadmap_vote(p_item_id uuid)
returns boolean language plpgsql security definer as $$
declare
  v_exists boolean;
begin
  select exists(
    select 1 from public.roadmap_votes
    where item_id = p_item_id and user_id = auth.uid()
  ) into v_exists;

  if v_exists then
    delete from public.roadmap_votes where item_id = p_item_id and user_id = auth.uid();
    update public.roadmap_items set votes = votes - 1 where id = p_item_id;
    return false;
  else
    insert into public.roadmap_votes (item_id, user_id) values (p_item_id, auth.uid());
    update public.roadmap_items set votes = votes + 1 where id = p_item_id;
    return true;
  end if;
end;
$$;

create trigger roadmap_updated_at before update on public.roadmap_items
  for each row execute function public.set_updated_at();

insert into public.roadmap_items (title, description, status, category, visibility) values
  ('Notificações por WhatsApp', 'Receber alertas de chamados e projetos diretamente no WhatsApp.', 'planejado', 'integracao', 'publico'),
  ('App mobile para clientes', 'Aplicativo nativo iOS/Android para acesso ao portal.', 'ideia', 'ux', 'publico'),
  ('Integração com Slack', 'Receber notificações de chamados no canal do Slack da sua empresa.', 'planejado', 'integracao', 'publico'),
  ('Dashboard de analytics do cliente', 'Métricas de uso, tempo de resposta e histórico de atendimento.', 'em_desenvolvimento', 'produto', 'publico'),
  ('Assinatura digital de contratos', 'Assinar contratos diretamente na plataforma com validade jurídica.', 'planejado', 'financeiro', 'publico');
