CREATE TABLE public.diagnostico_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  total_testes integer NOT NULL DEFAULT 0,
  ok integer NOT NULL DEFAULT 0,
  avisos integer NOT NULL DEFAULT 0,
  erros integer NOT NULL DEFAULT 0,
  resultados jsonb NOT NULL DEFAULT '[]'::jsonb,
  origem text NOT NULL DEFAULT 'cron'
);

ALTER TABLE public.diagnostico_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read diagnostico_log" ON public.diagnostico_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service can insert diagnostico_log" ON public.diagnostico_log
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);