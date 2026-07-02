
CREATE TABLE public.trabalhos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  storage_path text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.trabalhos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trabalhos TO authenticated;
GRANT ALL ON public.trabalhos TO service_role;
ALTER TABLE public.trabalhos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read trabalhos" ON public.trabalhos FOR SELECT USING (true);
CREATE POLICY "Admins can insert trabalhos" ON public.trabalhos FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update trabalhos" ON public.trabalhos FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete trabalhos" ON public.trabalhos FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
