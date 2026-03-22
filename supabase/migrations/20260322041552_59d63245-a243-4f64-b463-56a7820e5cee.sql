
CREATE TABLE public.condominio_descricoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_nome text NOT NULL UNIQUE,
  descricao text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.condominio_descricoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read condominio descriptions"
  ON public.condominio_descricoes
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role can manage descriptions"
  ON public.condominio_descricoes
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
