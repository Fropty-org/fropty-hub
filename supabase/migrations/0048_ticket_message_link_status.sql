-- Estado de verificação de segurança de URL por mensagem (FroptySentinel).
-- null    = sem link na mensagem
-- pending = link detectado, verificação de reputação em andamento
-- clean    = URL(s) com reputação limpa → link liberado/clicável
-- blocked = URL(s) reprovada(s) → conteúdo permanece esmaecido, sem link
alter table public.ticket_messages
  add column if not exists link_status text
    check (link_status in ('pending','clean','blocked'));

comment on column public.ticket_messages.link_status is
  'Verificacao de reputacao de URL (FroptySentinel): null|pending|clean|blocked';
