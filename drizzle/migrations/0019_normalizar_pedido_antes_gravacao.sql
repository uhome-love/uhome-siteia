DO $$ DECLARE d text; BEGIN
 d:=pg_get_functiondef('public.journey_upsert_lead(jsonb)'::regprocedure);
 d:=replace(d,E'BEGIN\nIF length(v_phone)',E'BEGIN\nv_context := public.site_merge_pedidos(NULL, v_context || jsonb_build_object(''pedido'', coalesce(v_context->''pedido'',''{}'') || jsonb_build_object(''empreendimento'',p_payload->''imovel_titulo'',''pagina'',p_payload->''pagina_url'')));\nIF length(v_phone)');
 EXECUTE d;
END $$;