CREATE TABLE IF NOT EXISTS public.bairro_descricoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bairro_nome text NOT NULL UNIQUE,
  bairro_slug text NOT NULL UNIQUE,
  descricao_curta text,
  descricao_seo text NOT NULL,
  por_que_investir text,
  infraestrutura text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.bairro_descricoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read bairro descriptions" ON public.bairro_descricoes
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage bairro descriptions" ON public.bairro_descricoes
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));