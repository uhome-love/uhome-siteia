ALTER TABLE public.whatsapp_clicks ADD COLUMN IF NOT EXISTS pagina_url text;
NOTIFY pgrst, 'reload schema';