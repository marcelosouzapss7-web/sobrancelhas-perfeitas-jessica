
CREATE TABLE public.referencias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  username TEXT,
  subtitle TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.referencias TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.referencias TO authenticated;
GRANT ALL ON public.referencias TO service_role;

ALTER TABLE public.referencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read referencias" ON public.referencias FOR SELECT USING (true);
CREATE POLICY "Admins can insert referencias" ON public.referencias FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update referencias" ON public.referencias FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete referencias" ON public.referencias FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Auth can view references files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'references');
CREATE POLICY "Admins can upload references files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'references' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update references files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'references' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete references files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'references' AND has_role(auth.uid(), 'admin'::app_role));
