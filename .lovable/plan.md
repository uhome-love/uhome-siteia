

## Plano: Auto-zoom do mapa ao filtrar por bairro ou collection

### Problema
Quando o usuário filtra por bairro ou ativa a Collection, os **pins já são filtrados corretamente** no mapa, mas o mapa **não faz zoom para enquadrar** os pins filtrados — ele continua mostrando a visão geral de Porto Alegre.

### Solução

**1. Adicionar prop `fitToPins` no `SearchMap`**
- Nova prop booleana opcional que, quando `true`, faz o mapa executar `fitBounds` automaticamente sempre que os pins mudarem.
- No `useEffect` que atualiza o GeoJSON dos pins (linha ~626), após `setData`, calcular o bounding box dos pins e chamar `map.fitBounds(bounds, { padding: 60, maxZoom: 15 })`.
- Só executar o fitBounds quando há pins (>0) e a prop está ativa.

**2. Ativar `fitToPins` no `Search.tsx` quando há filtro de localização ou collection**
- Computar uma variável `shouldFitMap` baseada em:
  - `filters.bairro` não vazio
  - `filters.destaque === true` (collection)
  - `filters.condominio` não vazio
- Passar `fitToPins={shouldFitMap}` ao `<SearchMap>`.

**3. Lógica de fitBounds no SearchMap**
- Dentro do effect de atualização de pins (~linha 626-645):
  ```
  if (fitToPins && pins.length > 0) {
    const lngs = pins.map(p => Number(p.longitude));
    const lats = pins.map(p => Number(p.latitude));
    const sw = [Math.min(...lngs), Math.min(...lats)];
    const ne = [Math.max(...lngs), Math.max(...lats)];
    map.fitBounds([sw, ne], { padding: 60, maxZoom: 15, duration: 800 });
  }
  ```
- Usar um ref para evitar re-fit a cada micro-atualização (só fitar quando a lista de pins muda significativamente, ex: o set de IDs muda).

### Arquivos modificados
- `src/components/SearchMap.tsx` — nova prop + lógica fitBounds
- `src/pages/Search.tsx` — computar `shouldFitMap` e passar como prop

### Build fix incluído
- Corrigir o import de `Collection.tsx` em `lazyPages.ts` removendo a extensão `.tsx` que causa falha no Rollup, ou verificar que o arquivo existe no path correto.

