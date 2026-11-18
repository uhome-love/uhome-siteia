CREATE OR REPLACE FUNCTION public.site_merge_pedidos(old_context jsonb, incoming jsonb) RETURNS jsonb LANGUAGE plpgsql SET search_path=public AS $$
DECLARE c jsonb := coalesce(old_context,'{}') || coalesce(incoming,'{}'); p jsonb := incoming->'pedido'; arr jsonb := coalesce(old_context->'pedidos','[]'); t text;
BEGIN
IF jsonb_typeof(p)='object' THEN
 t := CASE WHEN coalesce(p->>'tipo','') LIKE '%visita%' THEN 'visita' WHEN coalesce(p->>'tipo','') LIKE '%whatsapp%' THEN 'whatsapp' WHEN coalesce(p->>'tipo','') LIKE '%informa%' THEN 'informacoes' ELSE NULL END;
 IF t IS NOT NULL THEN
 p := jsonb_build_object('id',coalesce(p->>'id',gen_random_uuid()::text),'tipo',t,'dia',p->'dia','periodo',p->'periodo','planta',p->'planta','assunto',p->'assunto','empreendimento',coalesce(p->'empreendimento',incoming->'produto'),'pagina',p->'pagina','horario',coalesce(p->'horario',to_jsonb(now())),'financiamento',p->'financiamento');
 IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(arr) x WHERE x->>'id'=p->>'id') THEN arr:=arr||jsonb_build_array(p); END IF;
 c:=jsonb_set(c,'pedido',p);
 END IF;
END IF;
c:=jsonb_set(c,'pedidos',arr);
IF old_context ? 'primeira_origem' THEN c:=jsonb_set(c,'primeira_origem',old_context->'primeira_origem'); END IF;
RETURN c;
END $$;
REVOKE ALL ON FUNCTION public.site_merge_pedidos(jsonb,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.site_merge_pedidos(jsonb,jsonb) TO service_role;
DO $$ DECLARE d text; BEGIN
 d:=pg_get_functiondef('public.journey_upsert_lead(jsonb)'::regprocedure);
 d:=replace(d,'BEGIN\nIF length(v_phone)',E'BEGIN\nv_context := public.site_merge_pedidos(NULL, v_context || jsonb_build_object(''pedido'', coalesce(v_context->''pedido'',''{}'') || jsonb_build_object(''empreendimento'',p_payload->''imovel_titulo'',''pagina'',p_payload->''pagina_url'')));\nIF length(v_phone)');
 d:=replace(d,'contexto=coalesce(contexto,''{}'')||v_context','contexto=public.site_merge_pedidos(contexto,v_context)');
 d:=replace(d,'nome=p_payload->>''nome'',','nome=p_payload->>''nome'', tipo_interesse=p_payload->>''tipo_interesse'', formulario=p_payload->>''formulario'', pagina_url=p_payload->>''pagina_url'', origem_pagina=p_payload->>''origem_pagina'', imovel_id=p_payload->>''imovel_id'', imovel_bairro=p_payload->>''imovel_bairro'', imovel_preco=(p_payload->>''imovel_preco'')::numeric, origem_ref=p_payload->>''origem_ref'',');
 d:=replace(d,',gclid=coalesce(p_payload->>''gclid'',gclid),gbraid=coalesce(p_payload->>''gbraid'',gbraid),wbraid=coalesce(p_payload->>''wbraid'',wbraid),fbclid=coalesce(p_payload->>''fbclid'',fbclid)','');
 EXECUTE d;
END $$;
CREATE OR REPLACE FUNCTION public.site_atribuir_visita() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o jsonb; v uuid;
BEGIN
 IF NEW.origem_componente NOT IN ('agendamento_visita_foco','agendamento_visita') THEN RETURN NEW; END IF;
 BEGIN v:=nullif(NEW.contexto->>'visitor_id','')::uuid; EXCEPTION WHEN invalid_text_representation THEN v:=NULL; END;
 SELECT ultima_origem INTO o FROM public.site_visitors WHERE id=v;
 IF o IS NULL THEN SELECT ultima_origem INTO o FROM public.site_visitors WHERE id=(SELECT visitor_id FROM public.public_leads WHERE regexp_replace(telefone,'\D','','g')=regexp_replace(NEW.telefone,'\D','','g') ORDER BY created_at LIMIT 1); END IF;
 o:=coalesce(NEW.contexto->'ultima_origem',o,'{}');
 NEW.contexto:=coalesce(NEW.contexto,'{}')||jsonb_build_object('ultima_origem',o);
 NEW.utm_source:=coalesce(o->>'utm_source',NEW.utm_source); NEW.utm_medium:=coalesce(o->>'utm_medium',NEW.utm_medium); NEW.utm_campaign:=coalesce(o->>'utm_campaign',NEW.utm_campaign); NEW.utm_content:=coalesce(o->>'utm_content',NEW.utm_content); NEW.utm_term:=coalesce(o->>'utm_term',NEW.utm_term);
 NEW.gclid:=coalesce(o->>'gclid',NEW.gclid); NEW.gbraid:=coalesce(o->>'gbraid',NEW.gbraid); NEW.wbraid:=coalesce(o->>'wbraid',NEW.wbraid); NEW.fbclid:=coalesce(o->>'fbclid',NEW.fbclid);
 NEW.origem_ref:=CASE WHEN NEW.corretor_ref_id IS NOT NULL OR NEW.corretor_ref_slug IS NOT NULL THEN 'link_corretor' WHEN coalesce(NEW.gclid,NEW.gbraid,NEW.wbraid,NEW.fbclid,'')<>'' THEN 'pago' WHEN coalesce(NEW.utm_source,'')<>'' THEN 'campanha' ELSE 'organico' END;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.site_atribuir_visita() FROM PUBLIC;
CREATE TRIGGER trg_site_atribuir_visita BEFORE INSERT ON public.agendamentos FOR EACH ROW EXECUTE FUNCTION public.site_atribuir_visita();