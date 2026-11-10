ALTER TABLE public.public_leads ADD COLUMN IF NOT EXISTS contexto jsonb;
ALTER TABLE public.agendamentos ADD COLUMN IF NOT EXISTS contexto jsonb;
ALTER TABLE public.agendamentos ADD COLUMN IF NOT EXISTS turno text;

CREATE TABLE IF NOT EXISTS public.lia_conversas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  mensagens jsonb NOT NULL DEFAULT '[]'::jsonb,
  contexto jsonb,
  lead_id uuid,
  agendamento_id uuid,
  etapa text NOT NULL DEFAULT 'entrada',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.lia_conversas TO service_role;
ALTER TABLE public.lia_conversas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins leem conversas da LIA" ON public.lia_conversas FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
GRANT SELECT ON public.lia_conversas TO authenticated;
CREATE TRIGGER trg_lia_conversas_updated BEFORE UPDATE ON public.lia_conversas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();