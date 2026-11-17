CREATE TABLE public.site_whatsapp_dedup (session_id uuid NOT NULL, button_key text NOT NULL, accepted_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(session_id,button_key));
GRANT ALL ON public.site_whatsapp_dedup TO service_role;
ALTER TABLE public.site_whatsapp_dedup ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.journey_accept_whatsapp(p_session uuid,p_button text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE accepted uuid;
BEGIN
INSERT INTO public.site_whatsapp_dedup(session_id,button_key) VALUES(p_session,left(p_button,300)) ON CONFLICT(session_id,button_key) DO UPDATE SET accepted_at=now() WHERE site_whatsapp_dedup.accepted_at<=now()-interval '2 seconds' RETURNING session_id INTO accepted;
RETURN accepted IS NOT NULL;
END $$;
REVOKE ALL ON FUNCTION public.journey_accept_whatsapp(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.journey_accept_whatsapp(uuid,text) TO service_role;