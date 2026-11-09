CREATE TABLE public.google_reviews_cache (
  id text PRIMARY KEY DEFAULT 'uhome',
  nota numeric,
  total integer,
  avaliacoes jsonb NOT NULL DEFAULT '[]'::jsonb,
  maps_url text,
  review_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.google_reviews_cache TO anon, authenticated;
GRANT ALL ON public.google_reviews_cache TO service_role;
ALTER TABLE public.google_reviews_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Avaliações do Google são públicas" ON public.google_reviews_cache FOR SELECT TO anon, authenticated USING (true);