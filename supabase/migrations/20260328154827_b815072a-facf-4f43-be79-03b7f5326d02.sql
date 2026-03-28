
CREATE TABLE public.vitrines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  corretor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  corretor_slug text,
  lead_nome text,
  lead_telefone text,
  imovel_codigos text[] NOT NULL DEFAULT '{}',
  titulo text,
  mensagem text,
  visualizacoes integer NOT NULL DEFAULT 0
);

ALTER TABLE public.vitrines ENABLE ROW LEVEL SECURITY;

-- Anyone can read vitrines (public sharing link)
CREATE POLICY "Anyone can read vitrines" ON public.vitrines
  FOR SELECT TO anon, authenticated
  USING (true);

-- Anyone can insert (CRM webhook)
CREATE POLICY "Anyone can insert vitrines" ON public.vitrines
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Corretores can update own vitrines
CREATE POLICY "Corretores can update own vitrines" ON public.vitrines
  FOR UPDATE TO authenticated
  USING (corretor_id = auth.uid())
  WITH CHECK (corretor_id = auth.uid());

-- Admins full access
CREATE POLICY "Admins can manage vitrines" ON public.vitrines
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
