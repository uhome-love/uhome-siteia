ALTER TABLE captacao_imoveis
ADD COLUMN IF NOT EXISTS area integer,
ADD COLUMN IF NOT EXISTS quartos integer,
ADD COLUMN IF NOT EXISTS dados_imovel jsonb,
ADD COLUMN IF NOT EXISTS origem text DEFAULT 'formulario';