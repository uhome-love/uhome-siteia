CREATE TABLE public.site_dobra_cache (
  chave text PRIMARY KEY,
  corpo jsonb NOT NULL,
  atualizado_em timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.site_dobra_cache TO service_role;
ALTER TABLE public.site_dobra_cache ENABLE ROW LEVEL SECURITY;