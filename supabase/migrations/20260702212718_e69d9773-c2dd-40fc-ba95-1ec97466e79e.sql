
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS product_file_path text;

DROP POLICY IF EXISTS "Admins podem ler produtos" ON storage.objects;
CREATE POLICY "Admins podem ler produtos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'produtos' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins podem enviar produtos" ON storage.objects;
CREATE POLICY "Admins podem enviar produtos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'produtos' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins podem atualizar produtos" ON storage.objects;
CREATE POLICY "Admins podem atualizar produtos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'produtos' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'produtos' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins podem excluir produtos" ON storage.objects;
CREATE POLICY "Admins podem excluir produtos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'produtos' AND public.has_role(auth.uid(), 'admin'));
