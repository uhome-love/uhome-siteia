
-- Índices críticos para performance na tabela imoveis
CREATE INDEX IF NOT EXISTS idx_imoveis_disponivel_cidade_pub 
ON public.imoveis (cidade, publicado_em DESC) 
WHERE status = 'disponivel';

CREATE INDEX IF NOT EXISTS idx_imoveis_disponivel_bairro 
ON public.imoveis (bairro) 
WHERE status = 'disponivel';

CREATE INDEX IF NOT EXISTS idx_imoveis_disponivel_geo 
ON public.imoveis (latitude, longitude) 
WHERE status = 'disponivel' AND latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_imoveis_disponivel_tipo_preco 
ON public.imoveis (tipo, preco) 
WHERE status = 'disponivel';

CREATE INDEX IF NOT EXISTS idx_imoveis_slug 
ON public.imoveis (slug);

CREATE INDEX IF NOT EXISTS idx_imoveis_disponivel_bairro_tipo 
ON public.imoveis (bairro, tipo) 
WHERE status = 'disponivel';

CREATE INDEX IF NOT EXISTS idx_imoveis_disponivel_created 
ON public.imoveis (created_at DESC) 
WHERE status = 'disponivel';

CREATE INDEX IF NOT EXISTS idx_imoveis_disponivel_quartos_preco 
ON public.imoveis (quartos, preco) 
WHERE status = 'disponivel';

CREATE INDEX IF NOT EXISTS idx_favoritos_user_id 
ON public.favoritos (user_id);
