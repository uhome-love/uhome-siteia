## Problema

Na busca aparece **9 de 19 imóveis** e o botão "Ver mais" não traz nada novo.

### Causa raiz

Em `src/pages/Search.tsx`:

1. `imoveis` é a lista **já filtrada** (após `brokenPhotoIds` esconder cards cuja foto principal falhou no carregamento).
2. O botão "Ver mais" usa `imoveis.length < total` como gate, e `loadMore` no modo IA usa `imoveis.length` como `offset`.
3. No caso reportado, a IA retorna **19 imóveis**, mas **10 têm foto quebrada** (placeholder Jetimob), então só 9 aparecem.
4. Ao clicar em "Ver mais":
   - `offset = 9`, `limit = 40` → o servidor devolve os mesmos itens 10–19 (que já tínhamos e que continuam com foto quebrada).
   - Eles são anexados ao `aiOverrideData.imoveis` (sem dedup no branch IA), mas ainda são filtrados → **nada muda visualmente**.
   - O contador continua "9 de 19" e o ciclo se repete a cada clique.

O mesmo padrão acontece no modo normal: o gate `imoveis.length < total` fica preso quando muitos itens da última página são escondidos.

## Correção

### 1. Gate do botão por itens **carregados do servidor**, não por visíveis

Em `ProgressiveGrid`, receber `loadedCount` (raw, antes do filtro de fotos quebradas) e usar:

```tsx
{loadedCount < total && ( ... botão Ver mais ... )}
```

Mantém o texto "X de Y" mostrando `imoveis.length` (visíveis) ou alternativamente `loadedCount`. Manteremos `imoveis.length` para não confundir o usuário com itens que ele não vê.

### 2. Offset correto no modo IA

Em `loadMore`, branch IA, trocar:
```ts
offset: currentCount,                       // imoveis.length (filtrado)
```
por:
```ts
offset: aiOverrideData.imoveis.length,      // total carregado do servidor
```

E adicionar dedup por `id` ao anexar (paridade com o branch normal).

### 3. Gate de "carregou tudo" em `loadMore`

Substituir `if (currentCount >= total) return;` por:
```ts
const loadedCount = aiOverrideData
  ? aiOverrideData.imoveis.length
  : queryImoveis.length + appendedImoveis.length;
if (loadedCount >= total) return;
```

### 4. Propagar `loadedCount` ao `ProgressiveGrid`

Passar a prop nova no único uso em `Search.tsx` (linha ~935) e tipar em `ProgressiveGrid`.

## Arquivos afetados

- `src/pages/Search.tsx` — única alteração.

## Teste de regressão

Estender `src/test/search-ver-mais.test.tsx` com cenário: total=19, `loadedCount=19`, `imoveis.length=9` (10 escondidos por foto quebrada) → botão "Ver mais" **não** deve ser renderizado.

## Fora de escopo

- Não alterar a lógica de detecção de foto quebrada (`brokenPhotoIds`) nem o `SearchPropertyCard`.
- Não mexer em filtros, mapa, modo IA de interpretação.
