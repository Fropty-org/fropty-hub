-- Sprint 7: project_events — timeline de webhooks GitHub/Vercel

CREATE TABLE IF NOT EXISTS public.project_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  source      TEXT NOT NULL CHECK (source IN ('github', 'vercel', 'fropty')),
  event_type  TEXT NOT NULL,  -- push, pull_request, deployment, etc.
  title       TEXT NOT NULL,
  body        TEXT,
  url         TEXT,
  actor       TEXT,           -- login/nome de quem disparou
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_events_project ON public.project_events(project_id);
CREATE INDEX IF NOT EXISTS idx_project_events_created ON public.project_events(created_at DESC);

ALTER TABLE public.project_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_select" ON public.project_events;
CREATE POLICY "events_select" ON public.project_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id
        AND (p.client_id = auth.uid() OR auth_role() IN ('dev','admin'))
    )
  );

DROP POLICY IF EXISTS "events_insert_staff" ON public.project_events;
CREATE POLICY "events_insert_staff" ON public.project_events
  FOR INSERT WITH CHECK (auth_role() IN ('dev','admin'));
