UPDATE public.imoveis
SET tipo = 'garden',
    updated_at = now()
WHERE jetimob_raw->>'subtipo' ILIKE '%garden%'
  AND tipo <> 'garden';