
CREATE TABLE imoveis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  jetimob_id text UNIQUE,
  slug text UNIQUE NOT NULL,
  tipo text NOT NULL,
  finalidade text NOT NULL,
  status text DEFAULT 'disponivel',
  destaque boolean DEFAULT false,
  preco numeric NOT NULL,
  preco_condominio numeric,
  preco_iptu numeric,
  area_total numeric,
  area_util numeric,
  quartos integer,
  banheiros integer,
  vagas integer,
  andar integer,
  bairro text NOT NULL,
  cidade text DEFAULT 'Porto Alegre',
  uf text DEFAULT 'RS',
  cep text,
  endereco_completo text,
  latitude numeric,
  longitude numeric,
  titulo text NOT NULL,
  descricao text,
  diferenciais text[],
  fotos jsonb DEFAULT '[]',
  video_url text,
  corretor_id uuid,
  origem text DEFAULT 'manual',
  jetimob_raw jsonb,
  publicado_em timestamptz DEFAULT now()
);

CREATE INDEX idx_imoveis_busca ON imoveis(finalidade, tipo, bairro, status);
CREATE INDEX idx_imoveis_preco ON imoveis(preco);
CREATE INDEX idx_imoveis_quartos ON imoveis(quartos);
CREATE INDEX idx_imoveis_destaque ON imoveis(destaque, status);
CREATE INDEX idx_imoveis_slug ON imoveis(slug);

ALTER TABLE imoveis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "imoveis_public_read" ON imoveis
  FOR SELECT TO anon, authenticated
  USING (status = 'disponivel');

CREATE POLICY "imoveis_auth_manage" ON imoveis
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER imoveis_updated_at
  BEFORE UPDATE ON imoveis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
