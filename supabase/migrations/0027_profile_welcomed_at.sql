-- Marca quando o e-mail de boas-vindas já foi enviado (após o cliente definir
-- a senha pela 1ª vez). Evita disparar no aceite do convite (antes da senha) e
-- evita reenviar num reset de senha de cliente já ativo.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS welcomed_at timestamptz;
