-- Numeração sequencial de tickets no formato UFT0001 (sem reset)
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1;

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS ticket_number BIGINT NOT NULL DEFAULT nextval('ticket_number_seq');

CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_ticket_number ON public.tickets(ticket_number);
