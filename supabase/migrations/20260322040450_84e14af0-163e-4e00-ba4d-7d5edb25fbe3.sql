-- Fix double-encoded fotos: extract string content and re-parse as jsonb array
UPDATE public.imoveis
SET fotos = (fotos #>> '{}')::jsonb
WHERE jsonb_typeof(fotos) = 'string' AND fotos IS NOT NULL;