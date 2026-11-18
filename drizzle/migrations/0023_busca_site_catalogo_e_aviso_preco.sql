CREATE OR REPLACE FUNCTION public.busca_site(p jsonb DEFAULT '{}'::jsonb) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
WITH catalogo AS (
 SELECT i.id::text id,i.slug,i.tipo,i.fase,i.preco,i.bairro,i.cidade,i.quartos,i.banheiros,i.vagas,i.area_util,i.area_total,i.latitude,i.longitude,i.foto_principal,i.publicado_em,i.titulo,i.endereco_completo,'imovel'::text fonte,i.preco_condominio FROM public.imoveis i WHERE i.status='disponivel' AND i.finalidade='venda' AND i.fotos IS NOT NULL AND i.fotos<>'[]'::jsonb AND nullif(i.foto_principal,'') IS NOT NULL
 UNION ALL
 SELECT f.id::text,f.slug,CASE WHEN f.tipo ILIKE '%lote%' THEN 'terreno' WHEN f.tipo ILIKE '%sobrado%' OR f.segmento ILIKE '%casas%' THEN 'casa_condominio' WHEN f.tipo ILIKE '%studio%' OR f.tipo ILIKE '%loft%' THEN 'studio' WHEN f.tipo ILIKE '%cobertura%' THEN 'cobertura' ELSE 'apartamento' END,CASE WHEN f.status_obra ILIKE '%pronto%' THEN 'novo' WHEN f.status_obra ILIKE '%lançamento%' THEN 'na_planta' ELSE 'em_construcao' END,coalesce(f.preco_a_partir,0),f.bairro,f.cidade,coalesce((SELECT max((t->>'dorm')::int) FROM jsonb_array_elements(coalesce(f.ficha->'tipologias','[]'::jsonb)) t WHERE t->>'dorm' ~ '^\d+$'),0),NULL::int,NULL::int,NULL::numeric,NULL::numeric,CASE WHEN f.ficha->>'latitude' ~ '^-?[0-9.]+$' THEN (f.ficha->>'latitude')::numeric END,CASE WHEN f.ficha->>'longitude' ~ '^-?[0-9.]+$' THEN (f.ficha->>'longitude')::numeric END,coalesce(f.galeria->0->>'url_mobile',f.galeria->0->>'url',f.capa_url),f.created_at,f.nome,f.endereco,'produto',NULL::numeric FROM public.produtos_foco f WHERE f.ativo=true AND nullif(coalesce(f.galeria->0->>'url',f.capa_url),'') IS NOT NULL
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
 (nullif(p->>'q','') IS NULL OR concat_ws(' ',c.titulo,c.bairro,c.endereco_completo,c.slug) ILIKE '%'||(p->>'q')||'%') AND
 (nullif(p->>'codigo','') IS NULL OR c.slug ILIKE '%'||(p->>'codigo')||'%') AND
 (p->'bounds' IS NULL OR p->'bounds'='null'::jsonb OR (c.latitude BETWEEN (p->'bounds'->>'lat_min')::numeric AND (p->'bounds'->>'lat_max')::numeric AND c.longitude BETWEEN (p->'bounds'->>'lng_min')::numeric AND (p->'bounds'->>'lng_max')::numeric)) AND
 (nullif(p->>'condominio','') IS NULL OR EXISTS(SELECT 1 FROM imoveis i WHERE i.id::text=c.id AND i.condominio_nome ILIKE '%'||(p->>'condominio')||'%')) AND
 (coalesce((p->>'andarMin')::int,0)=0 OR EXISTS(SELECT 1 FROM imoveis i WHERE i.id::text=c.id AND i.andar >= (p->>'andarMin')::int)) AND
 (coalesce((p->>'condominioMax')::numeric,0)=0 OR c.preco_condominio <= (p->>'condominioMax')::numeric)
), filtrados AS (SELECT * FROM filtrados_sem_tipo c WHERE nullif(p->>'tipo','') IS NULL OR c.tipo=ANY(string_to_array(lower(p->>'tipo'),','))), pagina AS (
 SELECT * FROM filtrados ORDER BY
 CASE WHEN p->>'ordem'='preco_asc' THEN preco END ASC,
 CASE WHEN p->>'ordem'='preco_desc' THEN preco END DESC,
 CASE WHEN p->>'ordem'='area_desc' THEN coalesce(area_util,area_total) END DESC NULLS LAST,
 publicado_em DESC NULLS LAST,id
 LIMIT least(greatest(coalesce((p->>'limit')::int,40),0),2000) OFFSET greatest(coalesce((p->>'offset')::int,0),0)
)
SELECT jsonb_build_object('count',(SELECT count(*) FROM filtrados),'rows',coalesce((SELECT jsonb_agg(to_jsonb(c)||jsonb_build_object('fotos','[]'::jsonb,'finalidade','venda','status','disponivel')) FROM pagina c),'[]'::jsonb),'tipos',coalesce((SELECT jsonb_object_agg(tipo,n) FROM (SELECT tipo,count(*) n FROM filtrados_sem_tipo GROUP BY tipo) x),'{}'::jsonb),'categorias',jsonb_build_object('apartamentos',(SELECT count(*) FROM secao WHERE tipo='apartamento'),'casas_condominio',(SELECT count(*) FROM secao WHERE tipo='casa_condominio'),'studios',(SELECT count(*) FROM secao WHERE tipo IN ('studio','loft')),'terrenos',(SELECT count(*) FROM secao WHERE tipo='terreno'),'prontos',(SELECT count(*) FROM secao WHERE fase IN ('novo','usado')),'ate400',(SELECT count(*) FROM secao WHERE preco<=400000),'canoas',(SELECT count(*) FROM secao WHERE cidade='Canoas')));
$$;
REVOKE ALL ON FUNCTION public.busca_site(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.busca_site(jsonb) TO anon,authenticated,service_role;
CREATE OR REPLACE FUNCTION public.site_merge_pedidos(old_context jsonb,incoming jsonb) RETURNS jsonb LANGUAGE plpgsql SET search_path=public AS $$
DECLARE c jsonb; p jsonb; arr jsonb; t text;
BEGIN
 c:=coalesce(old_context,'{}'::jsonb)||coalesce(incoming,'{}'::jsonb); p:=incoming->'pedido'; arr:=coalesce(old_context->'pedidos','[]'::jsonb);
 IF jsonb_typeof(p)='object' THEN
 t:=CASE WHEN coalesce(p->>'tipo','') LIKE '%visita%' THEN 'visita' WHEN coalesce(p->>'tipo','') LIKE '%whatsapp%' THEN 'whatsapp' WHEN coalesce(p->>'tipo','') LIKE '%informa%' THEN 'informacoes' WHEN coalesce(p->>'tipo','') LIKE '%aviso_preco%' THEN 'aviso_preco' END;
 IF t IS NOT NULL THEN
 p:=jsonb_build_object('id',coalesce(p->>'id',gen_random_uuid()::text),'tipo',t,'dia',p->'dia','periodo',p->'periodo','planta',p->'planta','assunto',p->'assunto','empreendimento',coalesce(p->'empreendimento',incoming->'produto'),'pagina',p->'pagina','horario',coalesce(p->'horario',to_jsonb(now())),'financiamento',p->'financiamento') || CASE WHEN t='aviso_preco' THEN jsonb_build_object('imoveis',coalesce(incoming->'pedido'->'imoveis','[]'::jsonb)) ELSE '{}'::jsonb END;
 IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(arr) x WHERE x->>'id'=p->>'id') THEN arr:=arr||jsonb_build_array(p); END IF;
 c:=jsonb_set(c,ARRAY['pedido'],p);
 END IF; END IF;
 c:=jsonb_set(c,ARRAY['pedidos'],arr); IF old_context ? 'primeira_origem' THEN c:=jsonb_set(c,ARRAY['primeira_origem'],old_context->'primeira_origem'); END IF;
 RETURN c;
END $$;
REVOKE ALL ON FUNCTION public.site_merge_pedidos(jsonb,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.site_merge_pedidos(jsonb,jsonb) TO service_role;