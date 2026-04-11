-- Drop duplicate triggers that cause double-firing of sync-to-crm
DROP TRIGGER IF EXISTS on_lead_created ON public.public_leads;
DROP TRIGGER IF EXISTS on_agendamento_with_corretor ON public.agendamentos;
DROP TRIGGER IF EXISTS on_captacao_with_corretor ON public.captacao_imoveis;
DROP TRIGGER IF EXISTS on_whatsapp_click_with_corretor ON public.whatsapp_clicks;