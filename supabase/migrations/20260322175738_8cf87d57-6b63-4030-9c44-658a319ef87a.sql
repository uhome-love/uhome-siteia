
-- Slug único por corretor + flag ativo
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS slug_ref text UNIQUE,
ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true;

-- Colunas de rastreio em public_leads
ALTER TABLE public_leads
ADD COLUMN IF NOT EXISTS corretor_ref_id uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS corretor_ref_slug text,
ADD COLUMN IF NOT EXISTS origem_ref text DEFAULT 'organico';

-- Tabela de visitas por link de corretor
CREATE TABLE IF NOT EXISTS corretor_visitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  corretor_id uuid REFERENCES profiles(id),
  corretor_slug text,
  user_agent text,
  referrer text
);

ALTER TABLE corretor_visitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_public" ON corretor_visitas FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "select_own" ON corretor_visitas FOR SELECT TO authenticated USING (corretor_id = auth.uid());
CREATE POLICY "admin_select_all" ON corretor_visitas FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
