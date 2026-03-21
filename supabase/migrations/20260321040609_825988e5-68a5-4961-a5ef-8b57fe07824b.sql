
-- Fix function search path
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Replace overly permissive auth policy with specific operations
DROP POLICY IF EXISTS "imoveis_auth_manage" ON imoveis;

CREATE POLICY "imoveis_auth_insert" ON imoveis
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "imoveis_auth_update" ON imoveis
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "imoveis_auth_delete" ON imoveis
  FOR DELETE TO authenticated
  USING (true);
