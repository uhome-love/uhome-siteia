
CREATE INDEX IF NOT EXISTS idx_public_leads_created
ON public.public_leads (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_public_leads_telefone
ON public.public_leads (telefone);
