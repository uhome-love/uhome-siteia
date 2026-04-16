
## Plano: Separar filtro de Área Útil (Privativa) e Área Total

### Diagnóstico
Hoje o filtro **Área** existe como um único par (`areaMin`/`areaMax`) e filtra apenas pela coluna `area_total`. O banco já tem ambas as colunas (`area_total` e `area_util`), e a regra do projeto é **priorizar Área Privativa**. O usuário quer poder filtrar pelos dois separadamente.

### Mudanças

**1. Store (`src/stores/searchStore.ts`)**
- Renomear `areaMin`/`areaMax` → `areaTotalMin`/`areaTotalMax` (área total).
- Adicionar `areaUtilMin`/`areaUtilMax` (área privativa).
- Manter defaults `0` para todos.

**2. Serviço (`src/services/imoveis.ts`)**
- Atualizar `BuscaFilters` com os 4 novos campos.
- Em `fetchImoveis`: aplicar `gte/lte` em `area_total` (totais) e em `area_util` (privativa).
- Em `fetchMapPins` / contagem RPC: passar `p_area_min`/`p_area_max` baseado em **área privativa quando preenchida**, senão área total (a RPC só aceita um par hoje — manteremos compatibilidade priorizando a privativa).

**3. Filtros desktop (`src/components/SearchFiltersBar.tsx`)**
- Substituir o pill único "Área" por **dois pills**: **"Área privativa"** e **"Área total"**.
- Cada pill com seus próprios ranges sugeridos + inputs personalizados (mín/máx em m²).
- Atualizar `hasAny`, `advancedActive` e badges ativos para considerar os 4 campos.

**4. Filtros mobile (`src/components/MobileFiltersSheet.tsx`)**
- Substituir a seção "Área" por **duas seções**: "Área privativa" e "Área total", cada uma com mín/máx.
- Atualizar contador de filtros ativos.

**5. URL sync**
- Atualizar leitura/escrita de query params (`areaMin`/`areaMax` antigos → `areaUtilMin`, `areaUtilMax`, `areaTotalMin`, `areaTotalMax`). Manter compatibilidade lendo o param antigo `areaMin/areaMax` como `areaTotalMin/Max` para não quebrar links existentes.

**6. Edge function `ai-search`**
- Atualizar schema/prompt para a IA distinguir “área útil/privativa” vs “área total” e devolver os campos corretos.

### Resultado esperado
- Na busca (desktop e mobile), o usuário vê **dois filtros separados**: um para Área privativa e outro para Área total.
- Cada filtro funciona de forma independente, podendo combinar (ex.: privativa ≥ 70m² **e** total ≤ 120m²).
- Cards continuam exibindo Área Privativa como prioridade (regra existente preservada).
- Links antigos com `areaMin/areaMax` continuam funcionando (mapeados para Área Total).
