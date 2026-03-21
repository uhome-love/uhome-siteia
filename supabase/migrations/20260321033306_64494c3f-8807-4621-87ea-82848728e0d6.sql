-- Public leads table for all lead capture points
CREATE TABLE IF NOT EXISTS public.public_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  nome text NOT NULL,
  telefone text NOT NULL,
  email text,
  tipo_interesse text,
  imovel_id text,
  imovel_slug text,
  imovel_titulo text,
  imovel_bairro text,
  imovel_preco numeric,
  origem_pagina text,
  origem_componente text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  session_id text,
  status text DEFAULT 'novo'
);

ALTER TABLE public.public_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert leads"
  ON public.public_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can read leads"
  ON public.public_leads FOR SELECT
  TO authenticated
  USING (true);

-- Views counter for social proof
CREATE TABLE IF NOT EXISTS public.imovel_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id text NOT NULL,
  session_id text,
  viewed_at timestamptz DEFAULT now()
);

ALTER TABLE public.imovel_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert views"
  ON public.imovel_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read view counts"
  ON public.imovel_views FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_imovel_views_id_time ON public.imovel_views(imovel_id, viewed_at);