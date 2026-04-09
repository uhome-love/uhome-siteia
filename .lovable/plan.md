

## Separar Imóveis por Fase (Usado / Novo / Em Obras / Lançamento)

### Dados confirmados no banco

| jetimob_raw->>'status' | Quantidade |
|------------------------|-----------|
| Usado                  | 19.296    |
| Novo                   | 2.440     |
| Em construção          | 2.055     |
| Na planta              | 37        |
| NULL                   | 2.238     |

### Passo 1 — Migration: nova coluna + índice

```sql
ALTER TABLE imoveis ADD COLUMN fase text DEFAULT 'usado';
CREATE INDEX idx_imoveis_fase ON imoveis (fase) WHERE status = 'disponivel';
```

### Passo 2 — Popular dados existentes (via insert tool)

```sql
UPDATE imoveis SET fase = CASE
  WHEN jetimob_raw->>'status' = 'Em construção' THEN 'em_construcao'
  WHEN jetimob_raw->>'status' = 'Na planta' THEN 'na_planta'
  WHEN jetimob_raw->>'status' = 'Novo' THEN 'novo'
  ELSE 'usado'
END WHERE origem = 'jetimob';
```

### Passo 3 — Atualizar sync-jetimob

No `mapImovel()` (linha ~120 de `sync-jetimob/index.ts`), adicionar campo `fase`:

```typescript
fase: mapFase(j.status),
```

Nova função `mapFase`:
```typescript
function mapFase(s?: string): string {
  if (!s) return "usado";
  if (s === "Em construção") return "em_construcao";
  if (s === "Na planta") return "na_planta";
  if (s === "Novo") return "novo";
  return "usado";
}
```

### Passo 4 — Atualizar RPCs (migration)

**count_imoveis**: adicionar `p_fase text DEFAULT NULL` e cláusula `AND (p_fase IS NULL OR i.fase = p_fase)`.

**get_map_pins**: idem — novo parâmetro `p_fase` com mesma cláusula.

### Passo 5 — Código frontend

| Arquivo | Mudança |
|---------|---------|
| `src/stores/searchStore.ts` | Novo campo `fase: string` (default `""`) |
| `src/services/imoveis.ts` | `LISTING_COLUMNS` inclui `fase`; `fetchImoveis` adiciona `.eq("fase", ...)` quando preenchido; passa `p_fase` ao RPC |
| `src/components/SearchFiltersBar.tsx` | Nova pill "Fase" com opções: Todos / Pronto / Novo / Em Obras / Lançamento |
| `src/components/MobileFiltersSheet.tsx` | Seção "Fase do imóvel" com botões |
| `src/components/AdvancedFiltersModal.tsx` | Incluir fase na contagem de filtros ativos |
| `src/components/SearchPropertyCard.tsx` | Badge visual: `em_construcao` → "Em obras" (laranja), `na_planta` → "Lançamento" (verde), `novo` → "Novo" (azul) |
| `src/pages/admin/AdminImoveis.tsx` | Coluna "Fase" na tabela + filtro no select |

### Passo 6 — Deploy e teste

- Deploy edge function `sync-jetimob`
- Verificar que a coluna `fase` aparece nos cards
- Testar filtro de fase na busca desktop e mobile

### Arquivos afetados (7 arquivos + 2 migrations + 1 update)

1. `supabase/functions/sync-jetimob/index.ts`
2. `src/stores/searchStore.ts`
3. `src/services/imoveis.ts`
4. `src/components/SearchFiltersBar.tsx`
5. `src/components/MobileFiltersSheet.tsx`
6. `src/components/SearchPropertyCard.tsx`
7. `src/pages/admin/AdminImoveis.tsx`

