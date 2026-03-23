-- FIX 1: RPC function to bypass PostgREST 1000 row limit for map pins
CREATE OR REPLACE FUNCTION public.get_map_pins(
  lat_min numeric DEFAULT NULL,
  lat_max numeric DEFAULT NULL,
  lng_min numeric DEFAULT NULL,
  lng_max numeric DEFAULT NULL,
  p_tipo text DEFAULT NULL,
  p_bairro text DEFAULT NULL,
  p_bairros text[] DEFAULT NULL,
  p_preco_min numeric DEFAULT NULL,
  p_preco_max numeric DEFAULT NULL,
  p_quartos integer DEFAULT NULL,
  p_banheiros integer DEFAULT NULL,
  p_vagas integer DEFAULT NULL,
  p_area_min numeric DEFAULT NULL,
  p_area_max numeric DEFAULT NULL,
  p_cidade text DEFAULT NULL,
  p_cidades text[] DEFAULT '{Porto Alegre,Canoas,Cachoeirinha,Gravataí,Guaíba}'::text[],
  p_limite integer DEFAULT 2000
)
RETURNS TABLE(
  id uuid,
  slug text,
  preco numeric,
  latitude numeric,
  longitude numeric,
  bairro text,
  tipo text,
  quartos integer,
  area_total numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = 'public'
AS $$
  SELECT i.id, i.slug, i.preco, i.latitude, i.longitude, i.bairro, i.tipo, i.quartos, i.area_total
  FROM public.imoveis i
  WHERE i.status = 'disponivel'
    AND i.finalidade = 'venda'
    AND i.latitude IS NOT NULL
    AND i.longitude IS NOT NULL
    AND (p_cidade IS NULL OR i.cidade = p_cidade)
    AND (p_cidade IS NOT NULL OR i.cidade = ANY(p_cidades))
    AND (lat_min IS NULL OR i.latitude >= lat_min)
    AND (lat_max IS NULL OR i.latitude <= lat_max)
    AND (lng_min IS NULL OR i.longitude >= lng_min)
    AND (lng_max IS NULL OR i.longitude <= lng_max)
    AND (p_tipo IS NULL OR i.tipo = p_tipo)
    AND (p_bairro IS NULL OR i.bairro ILIKE '%' || p_bairro || '%')
    AND (p_bairros IS NULL OR EXISTS (SELECT 1 FROM unnest(p_bairros) b WHERE i.bairro ILIKE '%' || b || '%'))
    AND (p_preco_min IS NULL OR i.preco >= p_preco_min)
    AND (p_preco_max IS NULL OR i.preco <= p_preco_max)
    AND (p_quartos IS NULL OR i.quartos >= p_quartos)
    AND (p_banheiros IS NULL OR i.banheiros >= p_banheiros)
    AND (p_vagas IS NULL OR i.vagas >= p_vagas)
    AND (p_area_min IS NULL OR i.area_total >= p_area_min)
    AND (p_area_max IS NULL OR i.area_total <= p_area_max)
  LIMIT p_limite;
$$;

-- FIX 3: Performance indexes for listing queries
CREATE INDEX IF NOT EXISTS idx_imoveis_status_publicado
  ON imoveis (status, publicado_em DESC)
  WHERE status = 'disponivel';

CREATE INDEX IF NOT EXISTS idx_imoveis_status_cidade
  ON imoveis (status, cidade)
  WHERE status = 'disponivel';

CREATE INDEX IF NOT EXISTS idx_imoveis_status_preco_asc
  ON imoveis (status, preco ASC)
  WHERE status = 'disponivel';

CREATE INDEX IF NOT EXISTS idx_imoveis_status_preco_desc
  ON imoveis (status, preco DESC)
  WHERE status = 'disponivel';