-- Add composite B-tree index for map pin queries (covers the most common filter pattern)
CREATE INDEX IF NOT EXISTS idx_imoveis_pins_composite
  ON imoveis (status, finalidade, cidade)
  WHERE status = 'disponivel' AND finalidade = 'venda' AND latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add index on lat/lng for bounding box queries
CREATE INDEX IF NOT EXISTS idx_imoveis_lat_lng
  ON imoveis (latitude, longitude)
  WHERE status = 'disponivel' AND latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add index for count queries (covers tipo + bairro + preco)
CREATE INDEX IF NOT EXISTS idx_imoveis_count_filters
  ON imoveis (status, finalidade, cidade, tipo, bairro, preco)
  WHERE status = 'disponivel' AND finalidade = 'venda';

-- Optimize the listing query with a covering index for common sort + filter
CREATE INDEX IF NOT EXISTS idx_imoveis_listing_recentes
  ON imoveis (publicado_em DESC)
  WHERE status = 'disponivel' AND finalidade = 'venda';