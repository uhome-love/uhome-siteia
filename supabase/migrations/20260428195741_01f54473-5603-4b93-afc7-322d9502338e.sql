-- 1. Ajustar tabela vitrines: novas colunas
ALTER TABLE public.vitrines
  ADD COLUMN IF NOT EXISTS subtitulo text,
  ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'property_selection',
  ADD COLUMN IF NOT EXISTS dados_custom jsonb,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS pipeline_lead_id uuid,
  ADD COLUMN IF NOT EXISTS mensagem_corretor text;

-- Garantir contadores como integer default 0 (idempotente — já existem)
ALTER TABLE public.vitrines
  ALTER COLUMN visualizacoes SET DEFAULT 0,
  ALTER COLUMN cliques_whatsapp SET DEFAULT 0;

UPDATE public.vitrines SET visualizacoes = 0 WHERE visualizacoes IS NULL;
UPDATE public.vitrines SET cliques_whatsapp = 0 WHERE cliques_whatsapp IS NULL;

ALTER TABLE public.vitrines
  ALTER COLUMN visualizacoes SET NOT NULL,
  ALTER COLUMN cliques_whatsapp SET NOT NULL;

-- Validação de tipo via trigger (CHECK constraints podem ser engessadas; trigger é mais flexível)
CREATE OR REPLACE FUNCTION public.vitrines_validate_tipo()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.tipo NOT IN ('property_selection', 'product_page', 'anuncio', 'melnick_day', 'mega_cyrela') THEN
    RAISE EXCEPTION 'Tipo de vitrine inválido: %', NEW.tipo;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_vitrines_validate_tipo ON public.vitrines;
CREATE TRIGGER trg_vitrines_validate_tipo
BEFORE INSERT OR UPDATE OF tipo ON public.vitrines
FOR EACH ROW EXECUTE FUNCTION public.vitrines_validate_tipo();

-- Documentação
COMMENT ON COLUMN public.vitrines.tipo IS
  'Tipo de vitrine: property_selection (padrão), product_page, anuncio, melnick_day, mega_cyrela.';
COMMENT ON COLUMN public.vitrines.dados_custom IS
  'Payload JSON livre para vitrines com dados embutidos (ex: Melnick Day) que não dependem de imovel_codigos.';
COMMENT ON COLUMN public.vitrines.expires_at IS
  'Data/hora de expiração opcional da vitrine.';
COMMENT ON COLUMN public.vitrines.pipeline_lead_id IS
  'Soft reference ao pipeline_leads.id no Supabase do CRM (uhomesales). Sem FK por ser cross-project.';
COMMENT ON COLUMN public.vitrines.mensagem_corretor IS
  'Alias compatível com schema antigo do CRM. Frontend deve preferir "mensagem".';

-- Atualizar guard trigger para incluir novas colunas imutáveis publicamente
CREATE OR REPLACE FUNCTION public.vitrines_guard_immutable_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean := has_role(auth.uid(), 'admin'::app_role);
  is_owner boolean := (NEW.corretor_id IS NOT NULL AND NEW.corretor_id = auth.uid())
                   OR (NEW.created_by IS NOT NULL AND NEW.created_by = auth.uid());
BEGIN
  IF is_admin OR is_owner THEN
    RETURN NEW;
  END IF;

  IF NEW.id              IS DISTINCT FROM OLD.id
  OR NEW.created_at      IS DISTINCT FROM OLD.created_at
  OR NEW.created_by      IS DISTINCT FROM OLD.created_by
  OR NEW.corretor_id     IS DISTINCT FROM OLD.corretor_id
  OR NEW.corretor_slug   IS DISTINCT FROM OLD.corretor_slug
  OR NEW.lead_id         IS DISTINCT FROM OLD.lead_id
  OR NEW.pipeline_lead_id IS DISTINCT FROM OLD.pipeline_lead_id
  OR NEW.lead_nome       IS DISTINCT FROM OLD.lead_nome
  OR NEW.lead_telefone   IS DISTINCT FROM OLD.lead_telefone
  OR NEW.titulo          IS DISTINCT FROM OLD.titulo
  OR NEW.subtitulo       IS DISTINCT FROM OLD.subtitulo
  OR NEW.mensagem        IS DISTINCT FROM OLD.mensagem
  OR NEW.mensagem_corretor IS DISTINCT FROM OLD.mensagem_corretor
  OR NEW.imovel_codigos  IS DISTINCT FROM OLD.imovel_codigos
  OR NEW.tipo            IS DISTINCT FROM OLD.tipo
  OR NEW.dados_custom    IS DISTINCT FROM OLD.dados_custom
  OR NEW.expires_at      IS DISTINCT FROM OLD.expires_at
  THEN
    RAISE EXCEPTION 'Apenas visualizacoes e cliques_whatsapp podem ser alterados publicamente';
  END IF;

  RETURN NEW;
END;
$$;

-- Revisar policies de vitrines: garantir UPDATE para owner via created_by também
DROP POLICY IF EXISTS "Corretores can update own vitrines" ON public.vitrines;
CREATE POLICY "Owners can update own vitrines"
ON public.vitrines
FOR UPDATE
TO authenticated
USING (corretor_id = auth.uid() OR created_by = auth.uid())
WITH CHECK (corretor_id = auth.uid() OR created_by = auth.uid());

-- 2. Criar tabela vitrine_interacoes
CREATE TABLE IF NOT EXISTS public.vitrine_interacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vitrine_id uuid NOT NULL REFERENCES public.vitrines(id) ON DELETE CASCADE,
  imovel_id text,
  tipo text NOT NULL,
  lead_nome text,
  lead_telefone text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vitrine_interacoes_vitrine_created
  ON public.vitrine_interacoes (vitrine_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vitrine_interacoes_tipo_created
  ON public.vitrine_interacoes (tipo, created_at DESC);

COMMENT ON TABLE public.vitrine_interacoes IS
  'Eventos de interação em vitrines: view, favorite, whatsapp_click, schedule_click, compare_open.';

-- Validação do tipo de evento via trigger
CREATE OR REPLACE FUNCTION public.vitrine_interacoes_validate_tipo()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.tipo NOT IN ('view', 'favorite', 'whatsapp_click', 'schedule_click', 'compare_open') THEN
    RAISE EXCEPTION 'Tipo de interação inválido: %', NEW.tipo;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_vitrine_interacoes_validate_tipo ON public.vitrine_interacoes;
CREATE TRIGGER trg_vitrine_interacoes_validate_tipo
BEFORE INSERT OR UPDATE OF tipo ON public.vitrine_interacoes
FOR EACH ROW EXECUTE FUNCTION public.vitrine_interacoes_validate_tipo();

-- 3. RLS em vitrine_interacoes
ALTER TABLE public.vitrine_interacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert interacoes" ON public.vitrine_interacoes;
CREATE POLICY "Public can insert interacoes"
ON public.vitrine_interacoes
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Owner can read interacoes" ON public.vitrine_interacoes;
CREATE POLICY "Owner can read interacoes"
ON public.vitrine_interacoes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vitrines v
    WHERE v.id = vitrine_interacoes.vitrine_id
      AND (v.created_by = auth.uid() OR v.corretor_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Admins can read all interacoes" ON public.vitrine_interacoes;
CREATE POLICY "Admins can read all interacoes"
ON public.vitrine_interacoes
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage interacoes" ON public.vitrine_interacoes;
CREATE POLICY "Admins can manage interacoes"
ON public.vitrine_interacoes
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));