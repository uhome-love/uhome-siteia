
CREATE TABLE public.empreendimentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  slug text NOT NULL UNIQUE,
  descricao text,
  localizacao text,
  bairro text,
  cidade text DEFAULT 'Porto Alegre',
  tipologias jsonb DEFAULT '[]'::jsonb,
  preco_a_partir numeric,
  preco_ate numeric,
  diferenciais text[] DEFAULT '{}',
  imagem_principal text,
  imagens jsonb DEFAULT '[]'::jsonb,
  logo_url text,
  previsao_entrega text,
  construtora text,
  ativo boolean DEFAULT true,
  destaque_home boolean DEFAULT false,
  ordem integer DEFAULT 0,
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.empreendimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active empreendimentos"
  ON public.empreendimentos FOR SELECT
  TO anon, authenticated
  USING (ativo = true);

CREATE POLICY "Admins can manage empreendimentos"
  ON public.empreendimentos FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_empreendimentos_updated_at
  BEFORE UPDATE ON public.empreendimentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
