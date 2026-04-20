-- 1. Schema: novas colunas (idempotente)
ALTER TABLE public.vitrines
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS subtitulo text,
  ADD COLUMN IF NOT EXISTS lead_id uuid,
  ADD COLUMN IF NOT EXISTS cliques_whatsapp integer NOT NULL DEFAULT 0;

-- 2. Documentação (COMMENT ON COLUMN)
COMMENT ON COLUMN public.vitrines.created_by IS
  'User ID de quem criou a vitrine. No fluxo atual, igual ao corretor_id; mantido separado para auditoria e futuras integrações (admin criando em nome de corretor).';

COMMENT ON COLUMN public.vitrines.lead_id IS
  'Soft reference para pipeline_leads.id no Supabase do CRM (uhomecrm). Sem foreign key por ser cross-project. Usado apenas pelo CRM para resgate/analytics.';

COMMENT ON COLUMN public.vitrines.subtitulo IS
  'Subtítulo opcional exibido abaixo do título na página /vitrine/:id.';

COMMENT ON COLUMN public.vitrines.cliques_whatsapp IS
  'Contador público incrementável por anon via trigger guard. Mede engajamento da vitrine.';

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_vitrines_created_by
  ON public.vitrines (created_by);

CREATE INDEX IF NOT EXISTS idx_vitrines_created_at
  ON public.vitrines (created_at DESC);

-- 4. RLS: substituir INSERT permissivo
DROP POLICY IF EXISTS "Anyone can insert vitrines" ON public.vitrines;

CREATE POLICY "Public can insert vitrines with created_by"
ON public.vitrines
FOR INSERT
TO anon, authenticated
WITH CHECK (created_by IS NOT NULL);

-- 5. RLS: UPDATE público (validado pela trigger guard)
DROP POLICY IF EXISTS "Public can increment vitrine counters" ON public.vitrines;

CREATE POLICY "Public can increment vitrine counters"
ON public.vitrines
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 6. Trigger guard de imutabilidade
CREATE OR REPLACE FUNCTION public.vitrines_guard_immutable_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean := has_role(auth.uid(), 'admin'::app_role);
  is_owner boolean := (NEW.corretor_id IS NOT NULL AND NEW.corretor_id = auth.uid());
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
  OR NEW.lead_nome       IS DISTINCT FROM OLD.lead_nome
  OR NEW.lead_telefone   IS DISTINCT FROM OLD.lead_telefone
  OR NEW.titulo          IS DISTINCT FROM OLD.titulo
  OR NEW.subtitulo       IS DISTINCT FROM OLD.subtitulo
  OR NEW.mensagem        IS DISTINCT FROM OLD.mensagem
  OR NEW.imovel_codigos  IS DISTINCT FROM OLD.imovel_codigos
  THEN
    RAISE EXCEPTION 'Apenas visualizacoes e cliques_whatsapp podem ser alterados publicamente';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_vitrines_guard_immutable ON public.vitrines;
CREATE TRIGGER trg_vitrines_guard_immutable
BEFORE UPDATE ON public.vitrines
FOR EACH ROW EXECUTE FUNCTION public.vitrines_guard_immutable_fields();