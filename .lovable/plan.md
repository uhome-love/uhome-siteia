

## Plano: Corrigir 3 problemas de filtros e área

### Problema 1: "Casa em Condomínio" sem resultados
O banco de dados só tem `tipo = "casa"` (6.891 imóveis). Não existe `"casa em condominio"` como tipo separado. Quando o filtro usa `eq("tipo", "casa em condominio")`, nada aparece.

**Solução**: Remover "Casa em Condomínio" da lista `propertyTypes` em `src/data/properties.ts`. Manter apenas "Casa" que já cobre todos os imóveis do tipo casa. Caso no futuro o Jetimob envie esse tipo, ele será mapeado automaticamente.

**Arquivo**: `src/data/properties.ts` — remover a linha `{ value: "casa em condominio", label: "Casa em Condomínio" }`

---

### Problema 2: Características/Diferenciais não funcionam
Todos os 25.325 imóveis disponíveis têm `diferenciais = []` (array vazio). O Jetimob não está populando esse campo. O filtro `.contains("diferenciais", [...])` sempre retorna 0 resultados.

**Solução**: Ocultar temporariamente a seção "Características" dos filtros até que o campo seja populado pelo sync. Isso evita confusão do usuário.

**Arquivos**:
- `src/components/AdvancedFiltersModal.tsx` — envolver a seção de Características em um condicional que só mostra se houver dados (ou comentar/remover temporariamente)
- `src/components/MobileFiltersSheet.tsx` — mesmo tratamento na seção de diferenciais

---

### Problema 3: Mostrar área privativa (area_util) ao invés de área total
O banco tem `area_util` para 23k imóveis e `area_total` para 23k. Muitas vezes são diferentes (ex: 616m² total vs 175m² útil). Atualmente mostra `area_total` primeiro.

**Solução**: Priorizar `area_util` (área privativa) nos cards de listagem. Na página de detalhe, mostrar ambas separadamente quando disponíveis.

**Arquivos**:
- `src/components/SearchPropertyCard.tsx` — trocar a linha `const area = imovel.area_total ?? imovel.area_util ?? 0` para `const area = imovel.area_util ?? imovel.area_total ?? 0` e ajustar o label para "m² priv." quando usar area_util
- `src/services/imoveis.ts` — adicionar `area_util` ao `LISTING_COLUMNS` para que esteja disponível nos cards
- `src/pages/PropertyDetail.tsx` — mostrar ambas as áreas separadamente (área privativa e área total) quando ambas existirem

---

### Validação
- Build dev para confirmar sem erros
- Testar filtro "Casa" retornando resultados
- Confirmar que seção Características não aparece nos filtros

