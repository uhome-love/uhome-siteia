

## Ocultar imóveis sem fotos do site

### Problema
106 imóveis ativos não têm fotos. Quando aparecem na busca, mostram uma imagem genérica do Unsplash — confunde o usuário e prejudica a experiência.

### Solução
Filtrar imóveis sem fotos diretamente na query do banco, em 3 pontos:

### Passo 1 — Filtro na query principal (`src/services/imoveis.ts`)

Na função `fetchImoveis`, adicionar filtro após os filtros existentes:

```typescript
// After existing filters, add:
query = query.not('fotos', 'is', null)
             .neq('fotos', '[]');
```

Mesmo filtro na query de contagem (`count_imoveis` ou inline count).

### Passo 2 — Filtro nos map pins (RPC `get_map_pins`)

Adicionar `AND fotos IS NOT NULL AND fotos::text != '[]'` no WHERE da função `get_map_pins` via migration SQL.

### Passo 3 — Filtro na contagem (RPC `count_imoveis`)

Adicionar a mesma condição no WHERE da função `count_imoveis` via migration SQL.

### Passo 4 — Filtro nos destaques e similares

- `fetchImoveisDestaque` — adicionar `.not('fotos', 'is', null)`
- `SimilarProperties` — já usa `fetchImoveis`, herda o filtro

### Arquivos afetados

1. **`src/services/imoveis.ts`** — filtro em `fetchImoveis` e `fetchImoveisDestaque`
2. **Migration SQL** — atualizar RPCs `get_map_pins` e `count_imoveis`

### Resultado
- Imóveis sem fotos não aparecem em busca, mapa, destaques nem similares
- Quando as fotos forem adicionadas no Jetimob e sincronizadas, o imóvel volta a aparecer automaticamente
- Zero impacto no admin (admin continua vendo todos)

