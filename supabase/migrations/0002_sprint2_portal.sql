-- Sprint 2: Portal do Cliente
-- Tabelas: tickets, ticket_messages

-- ─── tickets ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id  UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  subject     TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'Geral',
  status      TEXT NOT NULL DEFAULT 'aberto'
              CHECK (status IN ('aberto','em_andamento','resolvido','fechado')),
  priority    TEXT NOT NULL DEFAULT 'media'
              CHECK (priority IN ('baixa','media','alta')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── ticket_messages ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('cliente','dev','admin')),
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Índices ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tickets_client_id  ON public.tickets(client_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status      ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_msgs_ticket  ON public.ticket_messages(ticket_id);

-- ─── updated_at automático ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tickets_updated_at ON public.tickets;
CREATE TRIGGER trg_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.tickets         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- tickets: cliente vê e cria os seus; dev/admin veem todos
DROP POLICY IF EXISTS "tickets_select_own"   ON public.tickets;
DROP POLICY IF EXISTS "tickets_insert_own"   ON public.tickets;
DROP POLICY IF EXISTS "tickets_update_staff" ON public.tickets;

CREATE POLICY "tickets_select_own" ON public.tickets
  FOR SELECT USING (
    client_id = auth.uid()
    OR auth_role() IN ('dev','admin')
  );

CREATE POLICY "tickets_insert_own" ON public.tickets
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "tickets_update_staff" ON public.tickets
  FOR UPDATE USING (auth_role() IN ('dev','admin'));

-- ticket_messages: participantes do ticket podem ler e inserir
DROP POLICY IF EXISTS "ticket_msgs_select" ON public.ticket_messages;
DROP POLICY IF EXISTS "ticket_msgs_insert" ON public.ticket_messages;

CREATE POLICY "ticket_msgs_select" ON public.ticket_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id
        AND (t.client_id = auth.uid() OR auth_role() IN ('dev','admin'))
    )
  );

CREATE POLICY "ticket_msgs_insert" ON public.ticket_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id
        AND (t.client_id = auth.uid() OR auth_role() IN ('dev','admin'))
    )
  );
