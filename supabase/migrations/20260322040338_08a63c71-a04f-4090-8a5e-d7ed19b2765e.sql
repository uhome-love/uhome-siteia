-- Fix double-encoded fotos: convert from jsonb string to jsonb array
UPDATE public.imoveis
SET fotos = fotos::text::jsonb
WHERE jsonb_typeof(fotos) = 'string';