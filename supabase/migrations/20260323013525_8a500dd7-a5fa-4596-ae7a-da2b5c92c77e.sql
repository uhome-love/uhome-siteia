-- Composite index for the main listing query
CREATE INDEX IF NOT EXISTS idx_imoveis_listing_main
ON public.imoveis (status, finalidade, cidade, publicado_em DESC);

-- Composite index for price-sorted queries
CREATE INDEX IF NOT EXISTS idx_imoveis_listing_preco
ON public.imoveis (status, finalidade, cidade, preco);

-- Composite index for area-sorted queries
CREATE INDEX IF NOT EXISTS idx_imoveis_listing_area
ON public.imoveis (status, finalidade, cidade, area_total DESC);