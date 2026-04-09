

## Fix: Filtro de Fase não atualiza pins e contagem ao limpar

### Problema

Na linha 414 de `Search.tsx`, o `useEffect` que recarrega os pins do mapa quando filtros mudam **não inclui `filters.fase`** na lista de dependências. Quando o filtro "Fase" é selecionado e depois limpo, os pins não recarregam e o contador fica em "0 imóveis".

### Correção

**Arquivo: `src/pages/Search.tsx`, linha 414**

Adicionar `filters.fase` ao array de dependências do `useEffect` que recarrega os pins:

```typescript
// Antes (linha 414):
], [filters.tipo, filters.bairro, filters.precoMin, filters.precoMax, filters.quartos, filters.areaMin, filters.areaMax, filters.vagas, filters.banheiros, filters.andarMin, filters.condominioMax, filters.iptuMax, filters.diferenciais, filters.codigo]);

// Depois:
], [filters.tipo, filters.bairro, filters.precoMin, filters.precoMax, filters.quartos, filters.areaMin, filters.areaMax, filters.vagas, filters.banheiros, filters.andarMin, filters.condominioMax, filters.iptuMax, filters.diferenciais, filters.codigo, filters.fase]);
```

Isso é uma única linha. O `buildFilters()` já inclui `fase` corretamente (linha 327), e o `queryFilters` do React Query também (linha 333). O único lugar que faltou foi esse array de dependências dos pins do mapa.

