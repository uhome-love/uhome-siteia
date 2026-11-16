ALTER TABLE public.lead_events ADD COLUMN IF NOT EXISTS origem jsonb;
CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_session_created ON public.whatsapp_clicks (session_id, created_at DESC);
CREATE OR REPLACE FUNCTION public.whatsapp_clicks_limite_sessao()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.session_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.whatsapp_clicks
    WHERE session_id = NEW.session_id AND created_at > now() - interval '5 seconds'
  ) THEN
    RETURN NULL;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_whatsapp_clicks_limite ON public.whatsapp_clicks;
CREATE TRIGGER trg_whatsapp_clicks_limite BEFORE INSERT ON public.whatsapp_clicks
FOR EACH ROW EXECUTE FUNCTION public.whatsapp_clicks_limite_sessao();