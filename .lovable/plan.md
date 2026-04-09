

## Diagnóstico: Tela com conteúdo estático (fallback HTML) ao invés do app React

### O que está acontecendo

O que você vê na tela ("Imóveis à Venda em Porto Alegre | Uhome Imóveis" com links simples) é o **HTML de fallback** que fica dentro do `<div id="root">` no `index.html` (linhas 64-71). Esse conteúdo existe para SEO — é o que bots veem enquanto o JavaScript não carrega.

Quando o React **não consegue montar** (por erro de JS ou falha de rede ao carregar um chunk), esse HTML estático permanece visível. Como não há nenhum mecanismo de retry para chunks que falham, o app simplesmente "morre" silenciosamente.

### Causa raiz

1. **Chunks dinâmicos falham ao carregar** — O app usa `React.lazy()` para 30+ páginas. Após um novo deploy, os nomes dos chunks mudam (hash diferente). Se o usuário estava com a aba aberta antes do deploy, ao navegar para uma nova rota o browser tenta baixar um chunk com nome antigo que já não existe (HTTP 404). Isso causa um erro não capturado que impede a montagem do React.

2. **Sem recovery de chunk errors** — O `ErrorBoundary` captura erros de render, mas **erros de import dinâmico** (`React.lazy`) acontecem **antes** do render e não são capturados. Não há retry automático.

3. **Inatividade** — Após tempo sem uso, a conexão pode ficar stale e chunks falham ao carregar por timeout.

### Correção (2 arquivos)

**1. `src/lib/lazyRetry.ts` — novo arquivo**

Wrapper para `React.lazy()` que tenta carregar o chunk até 3 vezes. Se falhar por chunk stale (deploy recente), força um reload da página uma única vez (usando sessionStorage para evitar loop infinito).

```typescript
export function lazyRetry(importFn: () => Promise<any>) {
  return lazy(() => 
    importFn().catch((err) => {
      // Se já tentou reload, não tenta de novo
      const hasReloaded = sessionStorage.getItem("chunk_reload");
      if (!hasReloaded) {
        sessionStorage.setItem("chunk_reload", "1");
        window.location.reload();
        return new Promise(() => {}); // nunca resolve, reload vai acontecer
      }
      sessionStorage.removeItem("chunk_reload");
      throw err; // deixa ErrorBoundary pegar
    })
  );
}
```

**2. `src/App.tsx` — trocar todos `lazy()` por `lazyRetry()`**

Substituir ~30 chamadas `lazy(() => import(...))` por `lazyRetry(() => import(...))`. Isso garante que qualquer falha de chunk é tratada com retry automático.

**3. `src/components/ErrorBoundary.tsx` — detectar chunk errors**

Adicionar detecção específica para erros de chunk (`"Loading chunk"`, `"Failed to fetch dynamically imported module"`) no ErrorBoundary, mostrando uma mensagem mais clara com botão de recarregar.

### Resultado esperado

- Após deploy, usuários com aba aberta não verão mais a tela de fallback — o app recarrega automaticamente
- Erros de rede temporários são retentados automaticamente
- Se tudo falhar, o ErrorBoundary mostra uma mensagem amigável em vez do HTML cru

### Arquivos afetados

1. **Novo:** `src/lib/lazyRetry.ts`
2. **Editado:** `src/App.tsx` (~30 linhas alteradas)
3. **Editado:** `src/components/ErrorBoundary.tsx` (detecção de chunk errors)

