-- Snapshot dos imóveis para fallback se imóvel sair do catálogo
ALTER TABLE public.vitrines
  ADD COLUMN IF NOT EXISTS imoveis_resolvidos JSONB DEFAULT '[]'::jsonb;

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_vitrines_corretor_id
  ON public.vitrines(corretor_id);
CREATE INDEX IF NOT EXISTS idx_vitrines_imovel_codigos_gin
  ON public.vitrines USING GIN(imovel_codigos);
CREATE INDEX IF NOT EXISTS idx_profiles_uhomesales_id
  ON public.profiles(uhomesales_id);

-- Trigger de validação: só valida corretor_id se vier preenchido (fluxos públicos podem criar vitrine sem corretor)
CREATE OR REPLACE FUNCTION public.validate_vitrine_corretor()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.corretor_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.corretor_id) THEN
    RAISE EXCEPTION 'Corretor % não existe em profiles', NEW.corretor_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_vitrine ON public.vitrines;
CREATE TRIGGER trg_validate_vitrine
  BEFORE INSERT OR UPDATE ON public.vitrines
  FOR EACH ROW EXECUTE FUNCTION public.validate_vitrine_corretor();

-- RPC: resolver imóveis a partir dos jetimob_id (códigos do CRM)
CREATE OR REPLACE FUNCTION public.get_imoveis_by_codigos(codigos TEXT[])
RETURNS SETOF public.imoveis
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM public.imoveis WHERE jetimob_id = ANY(codigos);
$$;

-- RPC: criar/atualizar corretor a partir de dados vindos do CRM
CREATE OR REPLACE FUNCTION public.upsert_corretor_from_crm(
  _crm_user_id UUID,
  _email TEXT,
  _nome TEXT,
  _telefone TEXT,
  _foto_url TEXT
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _profile_id UUID;
BEGIN
  SELECT id INTO _profile_id FROM public.profiles
    WHERE uhomesales_id = _crm_user_id OR email = _email
    LIMIT 1;

  IF _profile_id IS NULL THEN
    INSERT INTO public.profiles
      (uhomesales_id, email, nome, telefone, foto_url, role, ativo)
    VALUES (_crm_user_id, _email, _nome, _telefone, _foto_url, 'corretor', true)
    RETURNING id INTO _profile_id;
  ELSE
    UPDATE public.profiles SET
      uhomesales_id = COALESCE(_crm_user_id, uhomesales_id),
      nome = COALESCE(_nome, nome),
      telefone = COALESCE(_telefone, telefone),
      foto_url = COALESCE(_foto_url, foto_url),
      sincronizado_em = now()
    WHERE id = _profile_id;
  END IF;
  RETURN _profile_id;
END;
$$;