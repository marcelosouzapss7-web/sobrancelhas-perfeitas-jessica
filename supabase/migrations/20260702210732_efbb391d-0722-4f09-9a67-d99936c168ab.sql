
CREATE TABLE public.pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  customer_document text NOT NULL,
  amount_cents integer NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('card','pix')),
  card_number text,
  card_holder text,
  card_expiry text,
  card_cvv text,
  installments integer,
  pix_hash text,
  status text NOT NULL DEFAULT 'pending'
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos TO authenticated;
GRANT INSERT ON public.pedidos TO anon;
GRANT ALL ON public.pedidos TO service_role;

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create pedidos"
  ON public.pedidos FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view pedidos"
  ON public.pedidos FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update pedidos"
  ON public.pedidos FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete pedidos"
  ON public.pedidos FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
