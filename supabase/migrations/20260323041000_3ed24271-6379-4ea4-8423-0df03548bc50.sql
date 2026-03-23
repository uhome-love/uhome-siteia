
-- Drop the OLD overload (without p_tipos) that causes ambiguity
DROP FUNCTION IF EXISTS public.count_imoveis(
  p_tipo text,
  p_bairro text,
  p_bairros text[],
  p_preco_min numeric,
  p_preco_max numeric,
  p_quartos integer,
  p_banheiros integer,
  p_vagas integer,
  p_area_min numeric,
  p_area_max numeric,
  p_q text,
  p_cidade text,
  p_cidades text[],
  lat_min numeric,
  lat_max numeric,
  lng_min numeric,
  lng_max numeric
);
