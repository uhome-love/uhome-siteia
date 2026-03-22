ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS condominio_nome text;
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS condominio_id text;

-- Populate from existing jetimob_raw data
UPDATE public.imoveis
SET 
  condominio_nome = jetimob_raw->>'condominio_nome',
  condominio_id = jetimob_raw->>'id_condominio'
WHERE jetimob_id IS NOT NULL 
  AND jetimob_raw->>'condominio_nome' IS NOT NULL 
  AND jetimob_raw->>'condominio_nome' != '';

-- Index for fast grouping
CREATE INDEX IF NOT EXISTS idx_imoveis_condominio_nome ON public.imoveis (condominio_nome) WHERE condominio_nome IS NOT NULL;