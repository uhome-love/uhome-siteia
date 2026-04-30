# Integração CRM ↔ Site: ajustes na tabela `vitrines`, página `/vitrine` e RPCs

## ⚠️ Conflitos detectados no prompt do CRM (não vou aplicar como veio)

O prompt do CRM assume um schema que **não é** o do Site. Se eu rodar como veio, quebra a `/vitrine/:id` que já existe e que está em produção. Correções aplicadas:

| O CRM pediu | Realidade do Site | Decisão |
|---|---|---|
| `vitrines.slug` (coluna + índice + rota `/vitrine/:slug`) | **Não existe.** Site usa `/vitrine/:id` (UUID) | Mantenho `:id`. Não crio coluna `slug`. |
| `vitrines.imoveis_ids` (índice GIN) | **Não existe.** Site usa `imovel_codigos TEXT[]` | Crio índice GIN em `imovel_codigos` |
| `vitrines.descricao` | **Não existe.** Site usa `mensagem` e `subtitulo` | Uso `mensagem`/`subtitulo` no SEO |
| `imoveis.imovel_codigo` (RPC `get_imoveis_by_codigos`) | Coluna se chama `jetimob_id` | RPC busca por `jetimob_id` |
| `profiles.telefone_whatsapp` | Coluna se chama `telefone` | Uso `telefone` |
| `profiles` tem `email`, `foto_url`, `nome`, `role`, `uhomesales_id` ✅ | OK | RPC `upsert_corretor_from_crm` funciona |
| Trigger valida `corretor_id NOT NULL` | Vitrines do `WhatsAppLeadModal` e fluxos públicos não têm corretor | Validação só exige `created_by` (que já é NOT NULL pela RLS); `corretor_id` continua opcional |

Vou avisar o pessoal do CRM dessas correções pra eles ajustarem a `vitrine-bridge` deles.

---

## 1. Migration no banco do Site

```sql
-- Snapshot dos imóveis (fallback se imóvel for removido)
ALTER TABLE public.vitrines
  ADD COLUMN IF NOT EXISTS imoveis_resolvidos JSONB DEFAULT '[]'::jsonb;

-- Índices
CREATE INDEX IF NOT EXISTS idx_vitrines_corretor_id
  ON public.vitrines(corretor_id);
CREATE INDEX IF NOT EXISTS idx_vitrines_imovel_codigos_gin
  ON public.vitrines USING GIN(imovel_codigos);
CREATE INDEX IF NOT EXISTS idx_profiles_uhomesales_id
  ON public.profiles(uhomesales_id);

-- Trigger de validação (NÃO exige corretor_id; só valida se vier preenchido)
CREATE OR REPLACE FUNCTION public.validate_vitrine_corretor()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.corretor_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.corretor_id) THEN
    RAISE EXCEPTION 'Corretor % não existe em profiles', NEW.corretor_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_vitrine ON public.vitrines;
CREATE TRIGGER trg_validate_vitrine
  BEFORE INSERT OR UPDATE ON public.vitrines
  FOR EACH ROW EXECUTE FUNCTION public.validate_vitrine_corretor();

-- RPC: resolver imóveis por jetimob_id (códigos)
CREATE OR REPLACE FUNCTION public.get_imoveis_by_codigos(codigos TEXT[])
RETURNS SETOF public.imoveis
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM public.imoveis WHERE jetimob_id = ANY(codigos);
$$;

-- RPC: upsert corretor vindo do CRM
CREATE OR REPLACE FUNCTION public.upsert_corretor_from_crm(
  _crm_user_id UUID, _email TEXT, _nome TEXT,
  _telefone TEXT, _foto_url TEXT
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _profile_id UUID;
BEGIN
  SELECT id INTO _profile_id FROM public.profiles
    WHERE uhomesales_id = _crm_user_id OR email = _email LIMIT 1;

  IF _profile_id IS NULL THEN
    INSERT INTO public.profiles
      (uhomesales_id, email, nome, telefone, foto_url, role, ativo)
    VALUES (_crm_user_id, _email, _nome, _telefone, _foto_url, 'corretor', true)
    RETURNING id INTO _profile_id;
  ELSE
    UPDATE public.profiles SET
      uhomesales_id = COALESCE(_crm_user_id, uhomesales_id),
      nome = COALESCE(_nome, nome),
      telefone = COALESCE(_telefone, telefone),
      foto_url = COALESCE(_foto_url, foto_url),
      sincronizado_em = now()
    WHERE id = _profile_id;
  END IF;
  RETURN _profile_id;
END;
$$;
```

RLS de leitura pública em `vitrines` **já existe** (`Anyone can read vitrines`), não preciso recriar.

## 2. Atualizar `crm-bridge` edge function

Adicionar 2 actions na função que já criei:

- `upsert_corretor` → chama `upsert_corretor_from_crm`
- `resolve_imoveis_by_codigos` → chama `get_imoveis_by_codigos`

E na action `create_vitrine` existente: depois de inserir, chamar `get_imoveis_by_codigos` e popular `imoveis_resolvidos` com snapshot mínimo (id, jetimob_id, titulo, preco, foto_principal, bairro, quartos, area_total, slug). Assim o snapshot fica preenchido automaticamente sem o CRM precisar mandar.

## 3. Refatorar `src/pages/Vitrine.tsx`

- Buscar vitrine por `id` (continua UUID, mantém `/vitrine/:id`)
- Selecionar também `subtitulo`, `imoveis_resolvidos`, `mensagem_corretor`
- **Resolução de imóveis em camadas:**
  1. Buscar `imoveis` ao vivo por `jetimob_id IN (imovel_codigos)` com `status='disponivel'`
  2. Para códigos sem match (imóvel removido/indisponível), usar `imoveis_resolvidos` como fallback
  3. Cards do snapshot recebem badge "Indisponível" e não linkam pra `/imovel/:slug`
- **Bloco do corretor** (novo): se `corretor_id` preenchido, fazer join com `profiles` (`nome, foto_url, telefone, creci, slug_ref`) e renderizar card no topo com botão WhatsApp em `wa.me/55<telefone-só-dígitos>`
- **SEO**: `<title>` usa `titulo`, description usa `mensagem ?? subtitulo`, og:image usa primeira foto do primeiro imóvel resolvido
- **Fallback de vitrine inexistente**: já existe (mantém tela "Vitrine não encontrada"). Não vou fazer redirect+toast porque destrói SEO de links compartilhados antigos.

## 4. Não vou fazer (e por quê)

- **Service role key**: continua impossível extrair pela UI do Lovable. Você não tem acesso ao Supabase. A `crm-bridge` com `x-crm-token` resolve isso — o CRM não precisa de service role do Site.
- **Rota `/vitrine/:slug`**: criar coluna `slug` em `vitrines` agora quebraria todas as vitrines existentes (que só têm `id`). Se quiserem URLs amigáveis no futuro, faço numa segunda etapa com migração de dados.
- **Coluna `descricao` em vitrines**: redundante com `mensagem`. Se o CRM precisa de um campo separado, uso `subtitulo` que já existe.

## 5. Mensagem que vou preparar pra você mandar ao CRM

Texto pronto explicando o schema real do Site (nomes de colunas corretos, endpoint da bridge, token compartilhado, lista de actions disponíveis), pra eles ajustarem a `vitrine-bridge` lado deles. Sem service role key, sem URL crua do Supabase — só a URL da edge function.

## Resumo técnico

- 1 migration (colunas + índices + trigger + 2 RPCs)
- Update em `supabase/functions/crm-bridge/index.ts` (2 actions novas + snapshot automático no create)
- Refator de `src/pages/Vitrine.tsx` (corretor + snapshot fallback + SEO)
- Sem mudanças em rotas, sem deletar nada existente
