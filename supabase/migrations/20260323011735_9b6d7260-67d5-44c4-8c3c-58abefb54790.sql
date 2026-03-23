CREATE OR REPLACE FUNCTION count_imoveis(
  p_tipo text DEFAULT NULL,
  p_bairro text DEFAULT NULL,
  p_bairros text[] DEFAULT NULL,
  p_preco_min numeric DEFAULT NULL,
  p_preco_max numeric DEFAULT NULL,
  p_quartos int DEFAULT NULL,
  p_banheiros int DEFAULT NULL,
  p_vagas int DEFAULT NULL,
  p_area_min numeric DEFAULT NULL,
  p_area_max numeric DEFAULT NULL,
  p_q text DEFAULT NULL,
  p_cidade text DEFAULT NULL,
  p_cidades text[] DEFAULT '{"Porto Alegre","Canoas","Cachoeirinha","Gravataí","Guaíba"}',
  lat_min numeric DEFAULT NULL,
  lat_max numeric DEFAULT NULL,
  lng_min numeric DEFAULT NULL,
  lng_max numeric DEFAULT NULL
)
RETURNS bigint
LANGUAGE sql STABLE PARALLEL SAFE
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
    AND (p_tipo IS NULL OR i.tipo ILIKE '%' || p_tipo || '%')
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