-- Remove o contexto de "projetos" do produto: a área de projetos (cliente,
-- admin e dev) e o feed de eventos foram descontinuados.
ALTER TABLE public.tickets DROP COLUMN IF EXISTS project_id;
DROP TABLE IF EXISTS public.project_events;
DROP TABLE IF EXISTS public.projects CASCADE;
