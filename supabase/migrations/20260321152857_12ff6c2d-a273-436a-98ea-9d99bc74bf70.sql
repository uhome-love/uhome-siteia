CREATE TABLE public.captacao_imoveis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  nome text NOT NULL,
  telefone text NOT NULL,
  tipo_imovel text,
  bairro text,
  valor_pretendido text,
  mensagem text,
  status text DEFAULT 'novo',
  utm_source text,
  utm_campaign text,
  atribuido_a uuid
);

ALTER TABLE public.captacao_imoveis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "captacao_insert_public" ON public.captacao_imoveis
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);