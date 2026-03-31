
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  titulo text NOT NULL,
  resumo text NOT NULL,
  conteudo text NOT NULL,
  categoria text NOT NULL DEFAULT 'Mercado',
  imagem text,
  autor text NOT NULL DEFAULT 'Equipe Uhome',
  publicado_em date NOT NULL DEFAULT CURRENT_DATE,
  tempo_leitura integer NOT NULL DEFAULT 5,
  tags text[] DEFAULT '{}',
  ativo boolean NOT NULL DEFAULT true,
  gerado_por_ia boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active blog posts"
  ON public.blog_posts FOR SELECT
  TO anon, authenticated
  USING (ativo = true);

CREATE POLICY "Admins can manage blog posts"
  ON public.blog_posts FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
