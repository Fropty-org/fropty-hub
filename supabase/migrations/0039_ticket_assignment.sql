-- 0039_ticket_assignment.sql
-- Atribuição de analista a chamados de suporte.
-- Coluna aditiva e reversível: assigned_to referencia profiles(id) (analista,
-- role=admin). ON DELETE SET NULL para não travar a exclusão de um analista.
-- A escrita ocorre via server action com service role (updateTicket/assignTicket),
-- então não há mudança de RLS; o SELECT admin já retorna a nova coluna.

alter table public.tickets
  add column if not exists assigned_to uuid references public.profiles(id) on delete set null;

create index if not exists idx_tickets_assigned_to on public.tickets(assigned_to);

comment on column public.tickets.assigned_to is 'Analista (profiles.id, role=admin) responsavel pelo chamado. NULL = nao atribuido.';
