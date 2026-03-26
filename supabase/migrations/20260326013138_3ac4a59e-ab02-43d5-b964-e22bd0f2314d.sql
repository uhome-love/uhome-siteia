
CREATE TABLE public.page_404_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.page_404_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_can_insert_404" ON public.page_404_log
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "admin_can_read_404" ON public.page_404_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_404_path ON public.page_404_log(path);
CREATE INDEX idx_404_created ON public.page_404_log(created_at DESC);
