CREATE OR REPLACE FUNCTION public.busca_normalizar(t text) RETURNS text LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $f$
 SELECT trim(regexp_replace(regexp_replace(' '||translate(lower(coalesce(t,'')),'áàâãäéèêëíìîïóòôõöúùûüçñ','aaaaaeeeeiiiiooooouuuucn')||' ','[.,;/-]',' ','g'),'\s(rua|r|avenida|av|travessa|tv|estrada|estr|rodovia|alameda|al|praca|pc|de|da|do|das|dos)(?=\s)',' ','g'))
$f$;
CREATE OR REPLACE FUNCTION public.busca_site(p jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
WITH catalogo AS (
 SELECT i.id::text id,i.slug,i.tipo,i.fase,i.preco,i.bairro,i.cidade,i.quartos,i.banheiros,i.vagas,i.area_util,i.area_total,i.latitude,i.longitude,i.foto_principal,i.publicado_em,i.titulo,i.endereco_completo,'imovel'::text fonte,i.preco_condominio,i.comodidades FROM public.imoveis i WHERE i.status='disponivel' AND i.finalidade='venda' AND i.fotos IS NOT NULL AND i.fotos<>'[]'::jsonb AND nullif(i.foto_principal,'') IS NOT NULL
 UNION ALL
 SELECT f.id::text,f.slug,CASE WHEN f.tipo ILIKE '%lote%' THEN 'terreno' WHEN f.tipo ILIKE '%sobrado%' OR f.segmento ILIKE '%casas%' THEN 'casa_condominio' WHEN f.tipo ILIKE '%studio%' OR f.tipo ILIKE '%loft%' THEN 'studio' WHEN f.tipo ILIKE '%cobertura%' THEN 'cobertura' ELSE 'apartamento' END,CASE WHEN f.status_obra ILIKE '%pronto%' THEN 'novo' WHEN f.status_obra ILIKE '%lançamento%' THEN 'na_planta' ELSE 'em_construcao' END,coalesce(f.preco_a_partir,0),f.bairro,f.cidade,coalesce((SELECT max((t->>'dorm')::int) FROM jsonb_array_elements(coalesce(f.ficha->'tipologias','[]'::jsonb)) t WHERE t->>'dorm' ~ '^\d+$'),0),NULL::int,NULL::int,NULL::numeric,NULL::numeric,CASE WHEN f.ficha->>'latitude' ~ '^-?[0-9.]+$' THEN (f.ficha->>'latitude')::numeric END,CASE WHEN f.ficha->>'longitude' ~ '^-?[0-9.]+$' THEN (f.ficha->>'longitude')::numeric END,coalesce(f.galeria->0->>'url_mobile',f.galeria->0->>'url',f.capa_url),f.created_at,f.nome,f.endereco,'produto',NULL::numeric,'{}'::text[] FROM public.produtos_foco f WHERE f.ativo=true AND nullif(coalesce(f.galeria->0->>'url',f.capa_url),'') IS NOT NULL
), secao AS (
 SELECT * FROM catalogo c WHERE (coalesce(p->>'secao','imoveis')='imoveis' OR (p->>'secao'='lancamentos' AND c.fase IN ('na_planta','em_construcao')) OR (p->>'secao'='investir' AND (c.tipo IN ('studio','loft') OR (c.fonte='produto' AND EXISTS(SELECT 1 FROM produtos_foco f WHERE f.slug=c.slug AND (f.segmento ILIKE '%invest%' OR f.ficha->>'investimento'='true'))))))
), filtrados_sem_tipo AS (
 SELECT * FROM secao c WHERE
 (nullif(p->>'cidade','') IS NULL OR c.cidade=p->>'cidade') AND
 (nullif(p->>'bairro','') IS NULL OR EXISTS(SELECT 1 FROM unnest(string_to_array(p->>'bairro',',')) b WHERE c.bairro ILIKE '%'||trim(b)||'%')) AND
 (coalesce((p->>'precoMin')::numeric,0)=0 OR c.preco >= (p->>'precoMin')::numeric) AND
 (coalesce((p->>'precoMax')::numeric,0)=0 OR c.preco <= (p->>'precoMax')::numeric) AND
 (coalesce((p->>'quartos')::int,0)=0 OR c.quartos >= (p->>'quartos')::int) AND
 (coalesce((p->>'banheiros')::int,0)=0 OR c.banheiros >= (p->>'banheiros')::int) AND
 (coalesce((p->>'vagas')::int,0)=0 OR c.vagas >= (p->>'vagas')::int) AND
 (nullif(p->>'fase','') IS NULL OR c.fase=ANY(string_to_array(p->>'fase',','))) AND
 (coalesce((p->>'areaUtilMin')::numeric,0)=0 OR c.area_util >= (p->>'areaUtilMin')::numeric) AND
 (coalesce((p->>'areaUtilMax')::numeric,0)=0 OR c.area_util <= (p->>'areaUtilMax')::numeric) AND
 (coalesce((p->>'areaMin')::numeric,0)=0 OR c.area_total >= (p->>'areaMin')::numeric) AND
 (coalesce((p->>'areaMax')::numeric,0)=0 OR c.area_total <= (p->>'areaMax')::numeric) AND
 (nullif(trim(p->>'q'),'') IS NULL OR NOT EXISTS(SELECT 1 FROM unnest(string_to_array(public.busca_normalizar(p->>'q'),' ')) w WHERE w<>'' AND position(w IN public.busca_normalizar(concat_ws(' ',c.titulo,c.bairro,c.cidade,c.endereco_completo,c.slug)))=0)) AND
 (nullif(p->>'codigo','') IS NULL OR c.slug ILIKE '%'||(p->>'codigo')||'%') AND
 (p->'bounds' IS NULL OR p->'bounds'='null'::jsonb OR (c.latitude BETWEEN (p->'bounds'->>'lat_min')::numeric AND (p->'bounds'->>'lat_max')::numeric AND c.longitude BETWEEN (p->'bounds'->>'lng_min')::numeric AND (p->'bounds'->>'lng_max')::numeric)) AND
 (nullif(p->>'condominio','') IS NULL OR EXISTS(SELECT 1 FROM imoveis i WHERE i.id::text=c.id AND i.condominio_nome ILIKE '%'||(p->>'condominio')||'%')) AND
 (coalesce((p->>'andarMin')::int,0)=0 OR EXISTS(SELECT 1 FROM imoveis i WHERE i.id::text=c.id AND i.andar >= (p->>'andarMin')::int)) AND
 (nullif(p->>'comodidades','') IS NULL OR NOT EXISTS(SELECT 1 FROM unnest(string_to_array(p->>'comodidades',',')) r WHERE NOT (c.comodidades && CASE WHEN r='Pet friendly' THEN ARRAY['Pet friendly','Pet care'] ELSE ARRAY[r] END))) AND
 (coalesce((p->>'condominioMax')::numeric,0)=0 OR c.preco_condominio <= (p->>'condominioMax')::numeric)
), filtrados AS (SELECT * FROM filtrados_sem_tipo c WHERE nullif(p->>'tipo','') IS NULL OR c.tipo=ANY(string_to_array(lower(p->>'tipo'),',')) OR ('garden'=ANY(string_to_array(lower(p->>'tipo'),',')) AND c.tipo='apartamento' AND c.comodidades @> ARRAY['Pátio'])), pagina AS (
 SELECT * FROM filtrados ORDER BY
 CASE WHEN p->>'ordem'='preco_asc' THEN preco END ASC,
 CASE WHEN p->>'ordem'='preco_desc' THEN preco END DESC,
 CASE WHEN p->>'ordem'='area_desc' THEN coalesce(area_util,area_total) END DESC NULLS LAST,
 publicado_em DESC NULLS LAST,id
 LIMIT least(greatest(coalesce((p->>'limit')::int,40),0),2000) OFFSET greatest(coalesce((p->>'offset')::int,0),0)
)
SELECT jsonb_build_object('count',(SELECT count(*) FROM filtrados),'rows',coalesce((SELECT jsonb_agg((to_jsonb(c)-'comodidades')||jsonb_build_object('fotos','[]'::jsonb,'finalidade','venda','status','disponivel')) FROM pagina c),'[]'::jsonb),'tipos',coalesce((SELECT jsonb_object_agg(tipo,n) FROM (SELECT tipo,count(*) n FROM filtrados_sem_tipo GROUP BY tipo) x),'{}'::jsonb)||jsonb_build_object('garden',(SELECT count(*) FROM filtrados_sem_tipo WHERE tipo='garden' OR (tipo='apartamento' AND comodidades @> ARRAY['Pátio']))),'comodidades',coalesce((SELECT jsonb_object_agg(k,n) FROM (SELECT k,count(*) n FROM filtrados c, unnest(c.comodidades) k GROUP BY k) x),'{}'::jsonb)||jsonb_build_object('Pet friendly',(SELECT count(*) FROM filtrados WHERE comodidades && ARRAY['Pet friendly','Pet care'])),'precos',(SELECT jsonb_agg(coalesce(n,0) ORDER BY b) FROM generate_series(0,29) b LEFT JOIN (SELECT least(floor(preco/100000)::int,29) bk,count(*) n FROM filtrados WHERE preco>0 GROUP BY 1) h ON h.bk=b),'categorias',jsonb_build_object('apartamentos',(SELECT count(*) FROM secao WHERE tipo='apartamento'),'casas_condominio',(SELECT count(*) FROM secao WHERE tipo='casa_condominio'),'studios',(SELECT count(*) FROM secao WHERE tipo IN ('studio','loft')),'terrenos',(SELECT count(*) FROM secao WHERE tipo='terreno'),'prontos',(SELECT count(*) FROM secao WHERE fase IN ('novo','usado')),'ate400',(SELECT count(*) FROM secao WHERE preco<=400000),'canoas',(SELECT count(*) FROM secao WHERE cidade='Canoas'),'garden',(SELECT count(*) FROM secao WHERE tipo='garden' OR (tipo='apartamento' AND comodidades @> ARRAY['Pátio'])),'coberturas',(SELECT count(*) FROM secao WHERE tipo='cobertura')));
$function$;
GRANT EXECUTE ON FUNCTION public.busca_normalizar(text) TO anon, authenticated;