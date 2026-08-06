CREATE TABLE public.sync_state (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  iniciado_em timestamp with time zone NOT NULL DEFAULT now(),
  finalizado_em timestamp with time zone,
  pagina_atual integer NOT NULL DEFAULT 0,
  paginas_totais integer,
  total_processado integer NOT NULL DEFAULT 0,
  total_esperado integer,
  desativados integer,
  status text NOT NULL DEFAULT 'rodando',
  erro text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.sync_state TO authenticated;
GRANT ALL ON public.sync_state TO service_role;

ALTER TABLE public.sync_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver o estado da sincronizacao"
  ON public.sync_state FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER sync_state_updated_at
  BEFORE UPDATE ON public.sync_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_sync_state_status_iniciado ON public.sync_state (status, iniciado_em DESC);
CREATE INDEX IF NOT EXISTS idx_imoveis_origem_status_updated ON public.imoveis (origem, status, updated_at);