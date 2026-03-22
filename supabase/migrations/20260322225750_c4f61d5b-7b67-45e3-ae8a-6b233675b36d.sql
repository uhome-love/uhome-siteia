-- FIX 1: Add foto_principal column
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS foto_principal text;

-- Populate from fotos JSONB - prefer foto with principal=true, fallback to first
UPDATE imoveis
SET foto_principal = (
  CASE
    WHEN fotos IS NULL THEN NULL
    WHEN jsonb_typeof(fotos) = 'array' AND jsonb_array_length(fotos) > 0 THEN
      COALESCE(
        (SELECT elem->>'url' FROM jsonb_array_elements(fotos) AS elem WHERE (elem->>'principal')::boolean = true LIMIT 1),
        fotos->0->>'url'
      )
    ELSE NULL
  END
)
WHERE foto_principal IS NULL;

-- Trigger to keep foto_principal in sync
CREATE OR REPLACE FUNCTION sync_foto_principal()
RETURNS trigger AS $$
BEGIN
  IF NEW.fotos IS NOT NULL
     AND jsonb_typeof(NEW.fotos) = 'array'
     AND jsonb_array_length(NEW.fotos) > 0
  THEN
    NEW.foto_principal := COALESCE(
      (SELECT elem->>'url' FROM jsonb_array_elements(NEW.fotos) AS elem WHERE (elem->>'principal')::boolean = true LIMIT 1),
      NEW.fotos->0->>'url'
    );
  ELSE
    NEW.foto_principal := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_foto_principal
BEFORE INSERT OR UPDATE OF fotos ON imoveis
FOR EACH ROW EXECUTE FUNCTION sync_foto_principal();

-- Performance indexes for map bounds queries
CREATE INDEX IF NOT EXISTS idx_imoveis_bounds
  ON imoveis (latitude, longitude)
  WHERE status = 'disponivel'
    AND latitude IS NOT NULL
    AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_imoveis_status_bairro
  ON imoveis (status, bairro);

CREATE INDEX IF NOT EXISTS idx_imoveis_status_tipo
  ON imoveis (status, tipo);