-- Rollback emergencial: reativar imóveis desativados pela sync vazia de 23/04 06:00 UTC
-- A função sync-jetimob desativou 25.256 imóveis quando a Jetimob retornou 0 itens.
UPDATE public.imoveis
SET status = 'disponivel', updated_at = now()
WHERE status = 'inativo'
  AND origem = 'jetimob'
  AND updated_at = '2026-04-23 06:00:10.992919+00';