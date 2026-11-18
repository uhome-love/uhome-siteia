CREATE OR REPLACE FUNCTION public.site_append_whatsapp_pedido() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE lid uuid; p jsonb;
BEGIN
IF NEW.tipo<>'whatsapp_tocado' OR NEW.is_bot IS DISTINCT FROM false THEN RETURN NEW; END IF;
SELECT lead_id INTO lid FROM public.site_visitors WHERE id=NEW.visitor_id::uuid;
IF lid IS NOT NULL THEN
 p:=jsonb_build_object('id',NEW.id,'tipo','whatsapp','dia',NULL,'periodo',NULL,'planta',NULL,'assunto',NULL,'empreendimento',NEW.imovel_titulo,'pagina',NEW.pagina,'horario',NEW.created_at);
 UPDATE public.public_leads SET contexto=public.site_merge_pedidos(contexto,jsonb_build_object('pedido',p)) WHERE id=lid;
END IF;
RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.site_append_whatsapp_pedido() FROM PUBLIC;
CREATE TRIGGER trg_site_append_whatsapp_pedido AFTER INSERT ON public.lead_events FOR EACH ROW EXECUTE FUNCTION public.site_append_whatsapp_pedido();