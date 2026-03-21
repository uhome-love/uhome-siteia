-- Efficient function to get distinct bairros with counts (replaces 10+ paginated queries)
CREATE OR REPLACE FUNCTION public.get_bairros_disponiveis()
RETURNS TABLE(bairro text, count bigint)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT i.bairro, COUNT(*) as count
  FROM public.imoveis i
  WHERE i.status = 'disponivel'
  GROUP BY i.bairro
  ORDER BY i.bairro;
$$;