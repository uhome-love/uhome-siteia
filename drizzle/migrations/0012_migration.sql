ALTER TABLE public.captacao_imoveis
 ADD COLUMN IF NOT EXISTS finalidade text DEFAULT 'venda',
 ADD COLUMN IF NOT EXISTS cidade text,
 ADD COLUMN IF NOT EXISTS endereco text,
 ADD COLUMN IF NOT EXISTS pagina_url text,
 ADD COLUMN IF NOT EXISTS origem_componente text,
 ADD COLUMN IF NOT EXISTS formulario text,
 ADD COLUMN IF NOT EXISTS device text,
 ADD COLUMN IF NOT EXISTS utm_medium text,
 ADD COLUMN IF NOT EXISTS utm_content text,
 ADD COLUMN IF NOT EXISTS utm_term text,
 ADD COLUMN IF NOT EXISTS gclid text,
 ADD COLUMN IF NOT EXISTS gbraid text,
 ADD COLUMN IF NOT EXISTS wbraid text,
 ADD COLUMN IF NOT EXISTS fbclid text,
 ADD COLUMN IF NOT EXISTS referrer text,
 ADD COLUMN IF NOT EXISTS landing_url text,
 ADD COLUMN IF NOT EXISTS contexto jsonb;
NOTIFY pgrst, 'reload schema';