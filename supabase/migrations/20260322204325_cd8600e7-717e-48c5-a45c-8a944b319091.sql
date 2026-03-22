
-- Add corretor_ref columns to agendamentos
ALTER TABLE public.agendamentos 
  ADD COLUMN IF NOT EXISTS corretor_ref_id uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS corretor_ref_slug text,
  ADD COLUMN IF NOT EXISTS origem_ref text DEFAULT 'organico';

-- Add corretor_ref columns to captacao_imoveis
ALTER TABLE public.captacao_imoveis 
  ADD COLUMN IF NOT EXISTS corretor_ref_id uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS corretor_ref_slug text,
  ADD COLUMN IF NOT EXISTS origem_ref text DEFAULT 'organico';

-- Create WhatsApp clicks tracking table
CREATE TABLE IF NOT EXISTS public.whatsapp_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  session_id text,
  imovel_id text,
  imovel_titulo text,
  imovel_slug text,
  origem_pagina text,
  corretor_ref_id uuid REFERENCES public.profiles(id),
  corretor_ref_slug text,
  origem_ref text DEFAULT 'organico'
);

ALTER TABLE public.whatsapp_clicks ENABLE ROW LEVEL SECURITY;

-- RLS: anyone can insert, admins can read
CREATE POLICY "Anyone can insert whatsapp clicks" ON public.whatsapp_clicks
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can read whatsapp clicks" ON public.whatsapp_clicks
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Corretores can see their own clicks
CREATE POLICY "Corretores can see own clicks" ON public.whatsapp_clicks
  FOR SELECT TO authenticated USING (corretor_ref_id = auth.uid());

-- Trigger function to sync all corretor-related actions to CRM
CREATE OR REPLACE FUNCTION public.trigger_sync_action_to_crm()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://huigglwvvzuwwyqvpmec.supabase.co/functions/v1/sync-to-crm',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1aWdnbHd2dnp1d3d5cXZwbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTMzNzcsImV4cCI6MjA4OTYyOTM3N30.mi8RveT9gYhxP-sfq0GIN1jog-vU3Sxq511LCq5hhw4'
    ),
    body := jsonb_build_object(
      'tipo', TG_ARGV[0],
      'record', row_to_json(NEW)
    )
  );
  RETURN NEW;
END;
$$;

-- Trigger on agendamentos (only when has corretor ref)
CREATE TRIGGER on_agendamento_with_corretor
  AFTER INSERT ON public.agendamentos
  FOR EACH ROW
  WHEN (NEW.corretor_ref_id IS NOT NULL)
  EXECUTE FUNCTION public.trigger_sync_action_to_crm('agendamento');

-- Trigger on captacao_imoveis (only when has corretor ref)
CREATE TRIGGER on_captacao_with_corretor
  AFTER INSERT ON public.captacao_imoveis
  FOR EACH ROW
  WHEN (NEW.corretor_ref_id IS NOT NULL)
  EXECUTE FUNCTION public.trigger_sync_action_to_crm('captacao');

-- Trigger on whatsapp_clicks (only when has corretor ref)
CREATE TRIGGER on_whatsapp_click_with_corretor
  AFTER INSERT ON public.whatsapp_clicks
  FOR EACH ROW
  WHEN (NEW.corretor_ref_id IS NOT NULL)
  EXECUTE FUNCTION public.trigger_sync_action_to_crm('whatsapp_click');
