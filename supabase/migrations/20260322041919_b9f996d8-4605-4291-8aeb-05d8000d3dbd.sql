
-- Index for faster condominium lookups
CREATE INDEX IF NOT EXISTS idx_imoveis_condominio_nome ON public.imoveis (condominio_nome) WHERE condominio_nome IS NOT NULL;

-- Index for faster map pin queries (lat/lng)
CREATE INDEX IF NOT EXISTS idx_imoveis_lat_lng ON public.imoveis (latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Index for faster bairro lookups
CREATE INDEX IF NOT EXISTS idx_imoveis_bairro_status ON public.imoveis (bairro, status);

-- Composite index for common search pattern
CREATE INDEX IF NOT EXISTS idx_imoveis_status_cidade ON public.imoveis (status, cidade);
