-- Anexos de respostas ficam na pasta "<ticketId>/...". Permite que o DONO do
-- chamado e os admins leiam/escrevam esses anexos (cobre o caso analista→cliente,
-- que antes ficava preso na pasta do uid do uploader).

-- Cliente lê anexos de qualquer chamado que seja dele
DROP POLICY IF EXISTS "cliente read attachments of own ticket" ON storage.objects;
CREATE POLICY "cliente read attachments of own ticket"
ON storage.objects FOR SELECT TO public
USING (
  bucket_id = 'ticket-attachments'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.tickets t
    WHERE t.id::text = (storage.foldername(name))[1] AND t.client_id = auth.uid()
  )
);

-- Cliente envia anexo para um chamado que seja dele (pasta = id do ticket)
DROP POLICY IF EXISTS "cliente upload attachments to own ticket" ON storage.objects;
CREATE POLICY "cliente upload attachments to own ticket"
ON storage.objects FOR INSERT TO public
WITH CHECK (
  bucket_id = 'ticket-attachments'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.tickets t
    WHERE t.id::text = (storage.foldername(name))[1] AND t.client_id = auth.uid()
  )
);

-- Admin/equipe envia anexo em qualquer chamado (leitura já coberta por
-- "dev admin read all ticket attachments")
DROP POLICY IF EXISTS "admin upload ticket attachments" ON storage.objects;
CREATE POLICY "admin upload ticket attachments"
ON storage.objects FOR INSERT TO public
WITH CHECK (
  bucket_id = 'ticket-attachments'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = ANY (ARRAY['dev'::text, 'admin'::text])
  )
);
