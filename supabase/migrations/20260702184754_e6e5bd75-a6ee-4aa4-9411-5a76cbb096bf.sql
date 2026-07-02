
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url text,
  banner_1 text,
  banner_2 text,
  banner_3 text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  singleton boolean NOT NULL DEFAULT true UNIQUE
);

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update settings" ON public.site_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.site_settings (video_url, banner_1, banner_2, banner_3) VALUES (NULL, NULL, NULL, NULL);
