CREATE OR REPLACE FUNCTION public.count_imoveis(
  p_tipo text DEFAULT NULL::text,
  p_tipos text[] DEFAULT NULL::text[],
  p_bairro text DEFAULT NULL::text,
  p_bairros text[] DEFAULT NULL::text[],
  p_preco_min numeric DEFAULT NULL::numeric,
  p_preco_max numeric DEFAULT NULL::numeric,
  p_quartos integer DEFAULT NULL::integer,
  p_banheiros integer DEFAULT NULL::integer,
  p_vagas integer DEFAULT NULL::integer,
  p_area_min numeric DEFAULT NULL::numeric,
  p_area_max numeric DEFAULT NULL::numeric,
  p_q text DEFAULT NULL::text,
  p_cidade text DEFAULT NULL::text,
  p_cidades text[] DEFAULT '{"Porto Alegre",Canoas,Cachoeirinha,Gravataí,Guaíba}'::text[],
  lat_min numeric DEFAULT NULL::numeric,
  lat_max numeric DEFAULT NULL::numeric,
  lng_min numeric DEFAULT NULL::numeric,
  lng_max numeric DEFAULT NULL::numeric
)
RETURNS bigint
LANGUAGE sql
STABLE PARALLEL SAFE
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::bigint
  FROM public.imoveis i
  WHERE i.status = 'disponivel'
    AND i.finalidade = 'venda'
    AND (
      CASE
        WHEN p_cidade IS NOT NULL THEN i.cidade = p_cidade
        WHEN p_cidades IS NOT NULL THEN i.cidade = ANY(p_cidades)
        ELSE true
      END
    )
    AND (
      CASE
        WHEN p_tipos IS NOT NULL THEN i.tipo = ANY(p_tipos)
        WHEN p_tipo IS NOT NULL THEN i.tipo ILIKE '%' || p_tipo || '%'
        ELSE true
      END
    )
    AND (
      CASE
        WHEN p_bairros IS NOT NULL THEN
          EXISTS (
            SELECT 1 FROM unnest(p_bairros) b
            WHERE i.bairro ILIKE '%' || b || '%'
          )
        WHEN p_bairro IS NOT NULL THEN
          i.bairro ILIKE '%' || p_bairro || '%'
        ELSE true
      END
    )
    AND (p_preco_min IS NULL OR i.preco >= p_preco_min)
    AND (p_preco_max IS NULL OR i.preco <= p_preco_max)
    AND (p_quartos IS NULL OR i.quartos >= p_quartos)
    AND (p_banheiros IS NULL OR i.banheiros >= p_banheiros)
    AND (p_vagas IS NULL OR i.vagas >= p_vagas)
    AND (p_area_min IS NULL OR i.area_total >= p_area_min)
    AND (p_area_max IS NULL OR i.area_total <= p_area_max)
    AND (p_q IS NULL OR (
      i.titulo ILIKE '%' || p_q || '%'
      OR i.bairro ILIKE '%' || p_q || '%'
      OR i.tipo ILIKE '%' || p_q || '%'
    ))
    AND (lat_min IS NULL OR i.latitude >= lat_min)
    AND (lat_max IS NULL OR i.latitude <= lat_max)
    AND (lng_min IS NULL OR i.longitude >= lng_min)
    AND (lng_max IS NULL OR i.longitude <= lng_max);
$$;