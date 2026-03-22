-- Partial index for quartos filtered by status (matches common query pattern)
CREATE INDEX IF NOT EXISTS idx_imoveis_quartos_partial
  ON imoveis (status, quartos)
  WHERE status = 'disponivel';

-- Partial index for preco filtered by status
CREATE INDEX IF NOT EXISTS idx_imoveis_preco_partial
  ON imoveis (status, preco)
  WHERE status = 'disponivel';

-- Index for listing ordered by created_at DESC (pagination)
CREATE INDEX IF NOT EXISTS idx_imoveis_status_created
  ON imoveis (status, created_at DESC);

-- Drop redundant non-partial indexes now superseded by partial ones
DROP INDEX IF EXISTS idx_imoveis_preco;
DROP INDEX IF EXISTS idx_imoveis_quartos;