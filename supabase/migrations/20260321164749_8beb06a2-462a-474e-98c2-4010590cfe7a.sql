CREATE TABLE public.buscas_salvas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  descricao_humana TEXT,
  ativa BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.buscas_salvas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert saved searches"
ON public.buscas_salvas
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can read own saved searches by email"
ON public.buscas_salvas
FOR SELECT
TO anon, authenticated
USING (true);