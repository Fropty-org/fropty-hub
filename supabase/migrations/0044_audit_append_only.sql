-- Auditoria imutável: o admin_audit_log é somente-anexar (append-only).
-- Nenhuma ação (nem admin, nem service role) pode UPDATE/DELETE nas linhas.

-- 1) Remove a FK cascade de admin_id: o log deve sobreviver à exclusão de um
--    admin (integridade de auditoria) e a cascade conflitaria com o append-only.
--    O nome do admin continua sendo resolvido por lookup em profiles (com
--    fallback), então não perdemos legibilidade.
alter table public.admin_audit_log drop constraint if exists admin_audit_log_admin_id_fkey;

-- 2) Bloqueia UPDATE e DELETE via trigger (o log só cresce).
create or replace function public.fn_audit_append_only()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  raise exception 'admin_audit_log é somente-anexar: % não é permitido', tg_op;
end;
$$;

drop trigger if exists admin_audit_no_update on public.admin_audit_log;
drop trigger if exists admin_audit_no_delete on public.admin_audit_log;

create trigger admin_audit_no_update before update on public.admin_audit_log
  for each row execute function public.fn_audit_append_only();

create trigger admin_audit_no_delete before delete on public.admin_audit_log
  for each row execute function public.fn_audit_append_only();
