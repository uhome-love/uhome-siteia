
-- Drop old get_map_pins (17 params, without p_fase)
DROP FUNCTION IF EXISTS public.get_map_pins(
  numeric, numeric, numeric, numeric,
  text, text, text[],
  numeric, numeric, integer, integer, integer,
  numeric, numeric, text, text[], integer
);

-- Drop old count_imoveis (18 params, without p_fase)
DROP FUNCTION IF EXISTS public.count_imoveis(
  text, text[], text, text[],
  numeric, numeric, integer, integer, integer,
  numeric, numeric, text, text, text[],
  numeric, numeric, numeric, numeric
);
