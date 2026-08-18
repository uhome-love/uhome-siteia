ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS iptu_periodicidade text;

UPDATE public.imoveis
SET iptu_periodicidade = CASE
  WHEN lower(jetimob_raw->>'periodicidade_iptu') LIKE 'anual%' THEN 'anual'
  WHEN lower(jetimob_raw->>'periodicidade_iptu') LIKE 'mensal%' THEN 'mensal'
  ELSE NULL
END
WHERE jetimob_raw ? 'periodicidade_iptu';