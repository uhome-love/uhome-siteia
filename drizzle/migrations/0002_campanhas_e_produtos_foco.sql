CREATE TABLE public.produtos_foco (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  nome text NOT NULL,
  incorporadora text,
  bairro text,
  cidade text,
  endereco text,
  segmento text,
  tipo text,
  status_obra text,
  entrega text,
  preco_a_partir numeric,
  preco_texto text,
  resumo text,
  capa_url text,
  logo_url text,
  galeria jsonb NOT NULL DEFAULT '[]'::jsonb,
  plantas jsonb NOT NULL DEFAULT '[]'::jsonb,
  mapas jsonb NOT NULL DEFAULT '[]'::jsonb,
  ficha jsonb NOT NULL DEFAULT '{}'::jsonb,
  em_foco boolean NOT NULL DEFAULT true,
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.produtos_foco TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.produtos_foco TO authenticated;
GRANT ALL ON public.produtos_foco TO service_role;
ALTER TABLE public.produtos_foco ENABLE ROW LEVEL SECURITY;
CREATE POLICY "produtos_foco leitura publica" ON public.produtos_foco FOR SELECT USING (ativo = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "produtos_foco admin escreve" ON public.produtos_foco FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_produtos_foco_updated BEFORE UPDATE ON public.produtos_foco FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.campanhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  nome text NOT NULL,
  tema text NOT NULL DEFAULT 'padrao',
  titulo text,
  subtitulo text,
  descricao text,
  banner_url text,
  inicio date,
  fim date,
  destaque_home boolean NOT NULL DEFAULT true,
  ativo boolean NOT NULL DEFAULT true,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campanhas TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.campanhas TO authenticated;
GRANT ALL ON public.campanhas TO service_role;
ALTER TABLE public.campanhas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campanhas leitura publica" ON public.campanhas FOR SELECT USING (ativo = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "campanhas admin escreve" ON public.campanhas FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_campanhas_updated BEFORE UPDATE ON public.campanhas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.campanha_produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campanha_id uuid NOT NULL REFERENCES public.campanhas(id) ON DELETE CASCADE,
  produto_id uuid NOT NULL REFERENCES public.produtos_foco(id) ON DELETE CASCADE,
  ordem integer NOT NULL DEFAULT 0,
  condicao jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campanha_id, produto_id)
);
GRANT SELECT ON public.campanha_produtos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.campanha_produtos TO authenticated;
GRANT ALL ON public.campanha_produtos TO service_role;
ALTER TABLE public.campanha_produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campanha_produtos leitura publica" ON public.campanha_produtos FOR SELECT USING (true);
CREATE POLICY "campanha_produtos admin escreve" ON public.campanha_produtos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));