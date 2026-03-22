CREATE INDEX IF NOT EXISTS idx_imoveis_listing ON imoveis (status, cidade, publicado_em DESC) WHERE status = 'disponivel';
CREATE INDEX IF NOT EXISTS idx_imoveis_tipo ON imoveis (status, tipo) WHERE status = 'disponivel';
CREATE INDEX IF NOT EXISTS idx_imoveis_quartos ON imoveis (status, quartos) WHERE status = 'disponivel';
CREATE INDEX IF NOT EXISTS idx_imoveis_preco ON imoveis (status, preco) WHERE status = 'disponivel';
CREATE INDEX IF NOT EXISTS idx_imoveis_bounds ON imoveis (latitude, longitude) WHERE status = 'disponivel' AND latitude IS NOT NULL AND longitude IS NOT NULL;