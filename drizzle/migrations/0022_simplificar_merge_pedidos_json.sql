CREATE OR REPLACE FUNCTION public.site_merge_pedidos(old_context jsonb,incoming jsonb) RETURNS jsonb LANGUAGE plpgsql SET search_path=public AS $$
DECLARE c jsonb; p jsonb; arr jsonb; t text;
BEGIN
 c:=coalesce(old_context,'{}'::jsonb)||coalesce(incoming,'{}'::jsonb);
 p:=incoming->'pedido'; arr:=coalesce(old_context->'pedidos','[]'::jsonb);
 IF jsonb_typeof(p)='object' THEN
 t:=CASE WHEN coalesce(p->>'tipo','') LIKE '%visita%' THEN 'visita' WHEN coalesce(p->>'tipo','') LIKE '%whatsapp%' THEN 'whatsapp' WHEN coalesce(p->>'tipo','') LIKE '%informa%' THEN 'informacoes' END;
 IF t IS NOT NULL THEN
 p:=jsonb_build_object('id',coalesce(p->>'id',gen_random_uuid()::text),'tipo',t,'dia',p->'dia','periodo',p->'periodo','planta',p->'planta','assunto',p->'assunto','empreendimento',coalesce(p->'empreendimento',incoming->'produto'),'pagina',p->'pagina','horario',coalesce(p->'horario',to_jsonb(now())),'financiamento',p->'financiamento');
 IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(arr) x WHERE (x->>'id')=(p->>'id')) THEN arr:=arr||jsonb_build_array(p); END IF;
 c:=jsonb_set(c,ARRAY['pedido'],p);
 END IF;
 END IF;
 c:=jsonb_set(c,ARRAY['pedidos'],arr);
 IF old_context ? 'primeira_origem' THEN c:=jsonb_set(c,ARRAY['primeira_origem'],old_context->'primeira_origem'); END IF;
 RETURN c;
END $$;
REVOKE ALL ON FUNCTION public.site_merge_pedidos(jsonb,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.site_merge_pedidos(jsonb,jsonb) TO service_role;