
-- Trigger: sync leads to CRM on insert
CREATE TRIGGER trg_sync_lead_to_crm
  AFTER INSERT ON public.public_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_sync_lead_to_crm();

-- Trigger: sync agendamentos to CRM on insert
CREATE TRIGGER trg_sync_agendamento_to_crm
  AFTER INSERT ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_sync_action_to_crm('agendamento');

-- Trigger: sync captacao to CRM on insert
CREATE TRIGGER trg_sync_captacao_to_crm
  AFTER INSERT ON public.captacao_imoveis
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_sync_action_to_crm('captacao');

-- Trigger: sync whatsapp clicks to CRM on insert
CREATE TRIGGER trg_sync_whatsapp_to_crm
  AFTER INSERT ON public.whatsapp_clicks
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_sync_action_to_crm('whatsapp_click');
