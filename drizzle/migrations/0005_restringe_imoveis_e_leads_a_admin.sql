DROP POLICY IF EXISTS imoveis_auth_delete ON public.imoveis;
DROP POLICY IF EXISTS imoveis_auth_insert ON public.imoveis;
DROP POLICY IF EXISTS imoveis_auth_update ON public.imoveis;
CREATE POLICY imoveis_admin_delete ON public.imoveis FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY imoveis_admin_insert ON public.imoveis FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY imoveis_admin_update ON public.imoveis FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Authenticated can read leads" ON public.public_leads;
CREATE POLICY "Admins can read leads" ON public.public_leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));