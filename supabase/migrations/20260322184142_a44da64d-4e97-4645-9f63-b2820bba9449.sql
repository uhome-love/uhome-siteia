
-- 1. Allow profiles.id to have a default for corretores synced from CRM (no auth account)
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Allow anon users to read active corretor profiles (needed for /c/:slug route)
CREATE POLICY "Anyone can read active corretores"
  ON public.profiles
  FOR SELECT
  TO anon
  USING (role = 'corretor' AND ativo = true);

-- 3. Allow authenticated users to also read corretor profiles (for lead forms)
CREATE POLICY "Authenticated can read corretores"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (role = 'corretor' AND ativo = true);
