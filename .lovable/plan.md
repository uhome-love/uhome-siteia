

## Corrigir descrições dos imóveis e erro de build

### Problema
- **13.118 imóveis** têm `descricao = NULL` no banco, mas possuem texto no campo `jetimob_raw->>'observacoes'` (onde a Jetimob armazena a descrição real).
- Isso aconteceu porque a sincronização anterior não incluía o fallback para `observacoes`. O código atual já foi corrigido, mas os dados existentes não foram atualizados.
- O erro de build do `PortoAlegrePilar.tsx` persiste no sandbox (arquivo existe no projeto).

### Plano

**1. Backfill das descrições via migration SQL**

Executar um UPDATE em massa para preencher `descricao` a partir de `jetimob_raw->>'observacoes'` nos 13k registros que estão sem descrição:

```sql
UPDATE imoveis
SET descricao = jetimob_raw->>'observacoes',
    updated_at = now()
WHERE descricao IS NULL
  AND jetimob_raw->>'observacoes' IS NOT NULL
  AND length(jetimob_raw->>'observacoes') > 10;
```

Isso resolve imediatamente o problema sem precisar rodar uma nova sincronização completa (que levaria muito tempo).

**2. Garantir que futuras syncs mantenham a descrição**

O código em `sync-jetimob/index.ts` linha 144 já usa `j.observacoes || j.descricao_anuncio || ...` — nenhuma mudança necessária no Edge Function.

**3. Fix do build — PortoAlegrePilar**

O arquivo `src/pages/PortoAlegrePilar.tsx` existe e está correto. Vou garantir que o import em `src/App.tsx` use o formato `@/pages/PortoAlegrePilar` (alias path sem extensão), consistente com os demais lazy imports do arquivo.

### Resultado esperado
- Todos os 13k+ imóveis sem descrição passarão a exibir o texto descritivo na página de detalhes.
- O build passará sem erros.

