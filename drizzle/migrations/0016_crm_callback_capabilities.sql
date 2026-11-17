CREATE TABLE public.site_crm_callbacks (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), record_id uuid NOT NULL, tipo text NOT NULL, token_hash text NOT NULL, expires_at timestamptz NOT NULL DEFAULT now()+interval '5 minutes', consumed_at timestamptz);
GRANT ALL ON public.site_crm_callbacks TO service_role;
ALTER TABLE public.site_crm_callbacks ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.trigger_sync_action_to_crm() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,extensions AS $$
DECLARE callback_id uuid; token text:=encode(gen_random_bytes(32),'hex');
BEGIN
INSERT INTO public.site_crm_callbacks(record_id,tipo,token_hash) VALUES(NEW.id,TG_ARGV[0],encode(digest(token,'sha256'),'hex')) RETURNING id INTO callback_id;
PERFORM net.http_post(url:='https://huigglwvvzuwwyqvpmec.supabase.co/functions/v1/sync-to-crm',headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||token,'x-callback-id',callback_id::text),body:=jsonb_build_object('tipo',TG_ARGV[0],'record',jsonb_build_object('id',NEW.id)));
RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION public.trigger_sync_lead_to_crm() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,extensions AS $$
DECLARE callback_id uuid; token text:=encode(gen_random_bytes(32),'hex');
BEGIN
INSERT INTO public.site_crm_callbacks(record_id,tipo,token_hash) VALUES(NEW.id,'lead',encode(digest(token,'sha256'),'hex')) RETURNING id INTO callback_id;
PERFORM net.http_post(url:='https://huigglwvvzuwwyqvpmec.supabase.co/functions/v1/sync-to-crm',headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||token,'x-callback-id',callback_id::text),body:=jsonb_build_object('tipo','lead','record',jsonb_build_object('id',NEW.id)));
RETURN NEW;
END $$;