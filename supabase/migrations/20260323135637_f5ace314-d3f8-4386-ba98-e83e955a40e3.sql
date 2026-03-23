-- Table: lead_events — rastreamento de eventos do visitante
CREATE TABLE public.lead_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  tipo text NOT NULL,
  corretor_slug text,
  corretor_id uuid,
  pagina text,
  imovel_slug text,
  imovel_titulo text,
  busca_query text,
  busca_filtros jsonb,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lead_events_visitor ON public.lead_events (visitor_id);
CREATE INDEX idx_lead_events_tipo ON public.lead_events (tipo);
CREATE INDEX idx_lead_events_corretor ON public.lead_events (corretor_slug);
CREATE INDEX idx_lead_events_created ON public.lead_events (created_at DESC);

ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert lead_events"
  ON public.lead_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read lead_events"
  ON public.lead_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Corretores can read own events"
  ON public.lead_events FOR SELECT
  TO authenticated
  USING (corretor_id = auth.uid());

-- Table: notificacoes — notificações em tempo real para corretores
CREATE TABLE public.notificacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tipo text NOT NULL,
  titulo text NOT NULL,
  mensagem text,
  lead_id uuid,
  imovel_slug text,
  lida boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notificacoes_user ON public.notificacoes (user_id);
CREATE INDEX idx_notificacoes_lida ON public.notificacoes (user_id, lida) WHERE lida = false;
CREATE INDEX idx_notificacoes_created ON public.notificacoes (created_at DESC);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notificacoes"
  ON public.notificacoes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notificacoes"
  ON public.notificacoes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can insert notificacoes"
  ON public.notificacoes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read all notificacoes"
  ON public.notificacoes FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;