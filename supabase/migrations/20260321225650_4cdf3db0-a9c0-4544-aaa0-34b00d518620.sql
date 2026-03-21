CREATE TABLE public.agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  nome text NOT NULL,
  telefone text NOT NULL,
  imovel_id text,
  imovel_slug text,
  imovel_titulo text,
  data_visita date,
  horario text,
  status text DEFAULT 'confirmado'
);

ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert agendamentos" ON public.agendamentos FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can read agendamentos" ON public.agendamentos FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update agendamentos" ON public.agendamentos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));