ALTER TABLE public.lead_events ADD COLUMN IF NOT EXISTS dados jsonb NOT NULL DEFAULT '{}', ADD COLUMN IF NOT EXISTS is_bot boolean, ADD COLUMN IF NOT EXISTS bot_reason text, ADD COLUMN IF NOT EXISTS event_key uuid, ADD COLUMN IF NOT EXISTS canonical_tipo text;
ALTER TABLE public.public_leads ADD COLUMN IF NOT EXISTS visitor_id uuid, ADD COLUMN IF NOT EXISTS is_bot boolean NOT NULL DEFAULT false;
ALTER TABLE public.whatsapp_clicks ADD COLUMN IF NOT EXISTS is_bot boolean, ADD COLUMN IF NOT EXISTS bot_reason text, ADD COLUMN IF NOT EXISTS button_key text;
CREATE UNIQUE INDEX IF NOT EXISTS lead_events_event_key_unique ON public.lead_events(event_key) WHERE event_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS lead_events_visitor_time ON public.lead_events(visitor_id,created_at,id);
CREATE INDEX IF NOT EXISTS public_leads_phone_normalized ON public.public_leads((regexp_replace(telefone,'\D','','g')));
CREATE TABLE public.site_visitors (id uuid PRIMARY KEY, capability_hash text NOT NULL, primeira_origem jsonb NOT NULL DEFAULT '{}', ultima_origem jsonb NOT NULL DEFAULT '{}', primeira_visita timestamptz NOT NULL DEFAULT now(), lead_id uuid REFERENCES public.public_leads(id), analytics_allowed boolean NOT NULL DEFAULT true, updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.site_visitors TO service_role; GRANT SELECT ON public.site_visitors TO authenticated;
ALTER TABLE public.site_visitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY site_visitors_admin_read ON public.site_visitors FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE TABLE public.site_sessions (id uuid PRIMARY KEY, visitor_id uuid NOT NULL REFERENCES public.site_visitors(id), started_at timestamptz NOT NULL DEFAULT now(), last_active_at timestamptz NOT NULL DEFAULT now(), interacted_at timestamptz, is_bot boolean NOT NULL DEFAULT true, bot_reason text DEFAULT 'sem_interacao', user_agent text);
GRANT ALL ON public.site_sessions TO service_role; GRANT SELECT ON public.site_sessions TO authenticated;
ALTER TABLE public.site_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY site_sessions_admin_read ON public.site_sessions FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE INDEX site_sessions_visitor ON public.site_sessions(visitor_id,started_at);
CREATE TABLE public.site_journey_deliveries (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), visitor_id uuid NOT NULL REFERENCES public.site_visitors(id), lead_id uuid REFERENCES public.public_leads(id), event_id uuid REFERENCES public.lead_events(id), status text NOT NULL DEFAULT 'pending', attempts integer NOT NULL DEFAULT 0, event_count integer, crm_lead_id uuid, http_status integer, error text, sent_at timestamptz, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.site_journey_deliveries TO service_role; GRANT SELECT ON public.site_journey_deliveries TO authenticated;
ALTER TABLE public.site_journey_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY site_journey_deliveries_admin_read ON public.site_journey_deliveries FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE UNIQUE INDEX site_journey_delivery_event ON public.site_journey_deliveries(event_id) WHERE event_id IS NOT NULL;
CREATE OR REPLACE FUNCTION public.journey_strip_identity() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN NEW.identidade := NULL; RETURN NEW; END $$;
CREATE TRIGGER journey_strip_identity BEFORE INSERT OR UPDATE ON public.lead_events FOR EACH ROW EXECUTE FUNCTION public.journey_strip_identity();
COMMENT ON COLUMN public.lead_events.identidade IS 'DEPRECATED: identity is kept only on public_leads; events never store contact data.';
CREATE TRIGGER trg_journey_to_crm AFTER INSERT ON public.lead_events FOR EACH ROW WHEN (NEW.event_key IS NOT NULL AND NEW.tipo = NEW.canonical_tipo AND NEW.is_bot = false) EXECUTE FUNCTION public.trigger_sync_action_to_crm('journey');
CREATE TRIGGER trg_lead_update_to_crm AFTER UPDATE ON public.public_leads FOR EACH ROW WHEN (NEW.contexto IS DISTINCT FROM OLD.contexto OR NEW.visitor_id IS DISTINCT FROM OLD.visitor_id) EXECUTE FUNCTION public.trigger_sync_action_to_crm('lead');
CREATE OR REPLACE FUNCTION public.journey_upsert_lead(p_payload jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_id uuid; v_phone text := regexp_replace(p_payload->>'telefone','\D','','g'); v_context jsonb := coalesce(p_payload->'contexto','{}'::jsonb);
BEGIN
IF length(v_phone)=13 AND left(v_phone,2)='55' THEN v_phone := substring(v_phone from 3); END IF;
IF length(v_phone) NOT IN (10,11) THEN RAISE EXCEPTION 'telefone inválido'; END IF;
PERFORM pg_advisory_xact_lock(hashtextextended(v_phone,0));
SELECT id INTO v_id FROM public.public_leads WHERE regexp_replace(telefone,'\D','','g') IN(v_phone,'55'||v_phone) ORDER BY created_at LIMIT 1;
IF v_id IS NULL THEN
INSERT INTO public.public_leads(nome,telefone,email,tipo_interesse,imovel_id,imovel_slug,imovel_titulo,imovel_bairro,imovel_preco,origem_pagina,origem_componente,session_id,visitor_id,is_bot,contexto,corretor_ref_id,corretor_ref_slug,origem_ref,pagina_url,formulario,device,utm_source,utm_medium,utm_campaign,utm_content,utm_term,gclid,gbraid,wbraid,fbclid,referrer,landing_url)
VALUES(p_payload->>'nome',v_phone,p_payload->>'email',p_payload->>'tipo_interesse',p_payload->>'imovel_id',p_payload->>'imovel_slug',p_payload->>'imovel_titulo',p_payload->>'imovel_bairro',(p_payload->>'imovel_preco')::numeric,p_payload->>'origem_pagina',p_payload->>'origem_componente',p_payload->>'session_id',(p_payload->>'visitor_id')::uuid,coalesce((p_payload->>'is_bot')::boolean,false),v_context,(p_payload->>'corretor_ref_id')::uuid,p_payload->>'corretor_ref_slug',p_payload->>'origem_ref',p_payload->>'pagina_url',p_payload->>'formulario',p_payload->>'device',p_payload->>'utm_source',p_payload->>'utm_medium',p_payload->>'utm_campaign',p_payload->>'utm_content',p_payload->>'utm_term',p_payload->>'gclid',p_payload->>'gbraid',p_payload->>'wbraid',p_payload->>'fbclid',p_payload->>'referrer',p_payload->>'landing_url') RETURNING id INTO v_id;
ELSE
UPDATE public.public_leads SET visitor_id=coalesce((p_payload->>'visitor_id')::uuid,visitor_id), nome=p_payload->>'nome', email=coalesce(p_payload->>'email',email), imovel_slug=coalesce(p_payload->>'imovel_slug',imovel_slug), imovel_titulo=coalesce(p_payload->>'imovel_titulo',imovel_titulo), origem_componente=p_payload->>'origem_componente',contexto=coalesce(contexto,'{}')||v_context,session_id=p_payload->>'session_id',gclid=coalesce(p_payload->>'gclid',gclid),gbraid=coalesce(p_payload->>'gbraid',gbraid),wbraid=coalesce(p_payload->>'wbraid',wbraid),fbclid=coalesce(p_payload->>'fbclid',fbclid) WHERE id=v_id;
END IF;
UPDATE public.site_visitors SET lead_id=v_id,updated_at=now() WHERE id=(p_payload->>'visitor_id')::uuid;
RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION public.journey_upsert_lead(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.journey_upsert_lead(jsonb) TO service_role;