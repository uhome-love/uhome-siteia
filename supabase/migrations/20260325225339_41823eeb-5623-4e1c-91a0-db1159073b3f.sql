
DROP POLICY IF EXISTS "imoveis_public_read" ON public.imoveis;

CREATE POLICY "imoveis_public_read" ON public.imoveis
  FOR SELECT
  TO anon, authenticated
  USING (true);
