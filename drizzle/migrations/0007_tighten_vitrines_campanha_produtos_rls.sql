DROP POLICY IF EXISTS "campanha_produtos leitura publica" ON public.campanha_produtos;
CREATE POLICY "campanha_produtos leitura publica" ON public.campanha_produtos FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.campanhas c WHERE c.id = campanha_id AND c.ativo = true)
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Public can increment vitrine counters" ON public.vitrines;
DROP POLICY IF EXISTS "Anyone can read vitrines" ON public.vitrines;
CREATE POLICY "Anyone can read active vitrines" ON public.vitrines FOR SELECT TO anon, authenticated
USING (expires_at IS NULL OR expires_at > now() OR corretor_id = auth.uid() OR created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.increment_vitrine_counter(_vitrine_id uuid, _tipo text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _tipo = 'whatsapp' THEN
    UPDATE public.vitrines SET cliques_whatsapp = cliques_whatsapp + 1 WHERE id = _vitrine_id;
  ELSIF _tipo = 'view' THEN
    UPDATE public.vitrines SET visualizacoes = visualizacoes + 1 WHERE id = _vitrine_id;
  END IF;
END; $$;
REVOKE ALL ON FUNCTION public.increment_vitrine_counter(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.increment_vitrine_counter(uuid, text) TO anon, authenticated;