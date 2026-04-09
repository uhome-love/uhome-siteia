

## Fix: "Ver mais" causa scroll bouncing

### Problema

No `ProgressiveGrid` (linhas 91-93 de `Search.tsx`), existe um `useEffect` que reseta `visibleCount` para 12 sempre que `imoveis.length` muda:

```typescript
useEffect(() => {
  setVisibleCount(INITIAL_VISIBLE);
}, [imoveis.length]);
```

Quando o usuário clica "Ver mais":
1. `imoveis` cresce de 40 para 80
2. `visibleCount` reseta de ~40 para 12
3. Grid encolhe — scroll pula para cima
4. IntersectionObserver dispara repetidamente: 12 → 18 → 24 → 30... 
5. Scroll fica "pulando" até estabilizar

### Correção

**Arquivo: `src/pages/Search.tsx`, linhas 85-109 (dentro de `ProgressiveGrid`)**

Duas mudanças:

1. **Não resetar `visibleCount` em load more** — usar um ref para rastrear o comprimento anterior. Se `imoveis.length` cresceu (load more), não reseta. Se mudou para um valor diferente (nova busca), reseta.

2. **Quando é load more, definir `visibleCount` para o comprimento anterior** — assim os novos cards são revelados progressivamente sem afetar os já visíveis.

```typescript
const prevLengthRef = useRef(imoveis.length);

useEffect(() => {
  const prev = prevLengthRef.current;
  prevLengthRef.current = imoveis.length;
  
  // New search (length decreased or jumped to a different set)
  if (imoveis.length < prev || (imoveis.length > 0 && prev === 0)) {
    setVisibleCount(INITIAL_VISIBLE);
  }
  // Load more (length grew) — keep current visible count, 
  // IntersectionObserver will grow it naturally
}, [imoveis.length]);
```

### Resultado

- "Ver mais" não causa mais scroll bouncing — cards existentes permanecem, novos aparecem conforme o scroll
- Nova busca (filtros mudam) continua resetando para 12 como antes
- Zero impacto em outros componentes

### Arquivos afetados

1. **`src/pages/Search.tsx`** — ~10 linhas alteradas no `ProgressiveGrid`

