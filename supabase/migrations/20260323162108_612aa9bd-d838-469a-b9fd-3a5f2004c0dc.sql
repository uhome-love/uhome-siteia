
-- FIX: buscas_salvas - restringir SELECT por email do usuário logado
DROP POLICY IF EXISTS "Anyone can read own saved searches by email" ON public.buscas_salvas;

CREATE POLICY "Users read own saved searches by email"
ON public.buscas_salvas FOR SELECT
TO authenticated
USING (email = auth.jwt()->>'email');
