
Objetivo

Corrigir o blocker de build sem mexer na lógica das páginas.

Diagnóstico

1. `src/pages/Collection.tsx` e `src/pages/PortoAlegrePilar.tsx` existem no projeto.
2. `AppRoutes.tsx` consome essas páginas apenas via `src/routes/lazyPages.ts`.
3. O erro está isolado nas duas linhas atuais de `lazyPages.ts`:
   ```ts
   export const Collection = lazyRetry(() => import("../pages/Collection.tsx"));
   export const PortoAlegrePilar = lazyRetry(() => import("../pages/PortoAlegrePilar.tsx"));
   ```
4. A implementação atual entra em conflito com a convenção já usada no projeto para rotas-chave: `/collection` e `/imoveis-porto-alegre` devem ficar em import estático/eager para evitar falhas de resolução no publish.
5. O aviso do Browserslist não é a causa do build failure; é apenas manutenção pendente.

Plano de implementação

1. Em `src/routes/lazyPages.ts`, reverter somente `Collection` e `PortoAlegrePilar` para export estático com caminho explícito:
   ```ts
   export { default as Collection } from "../pages/Collection.tsx";
   export { default as PortoAlegrePilar } from "../pages/PortoAlegrePilar.tsx";
   ```
2. Manter `Index` eager e todas as demais rotas com `lazyRetry`, sem alterar a arquitetura do restante das páginas.
3. Corrigir o comentário do topo de `lazyPages.ts` para refletir a regra real:
   - homepage eager
   - `/collection` e `/imoveis-porto-alegre` eager
   - restante lazy
4. Não alterar `AppRoutes.tsx`, porque a API exportada por `lazyPages.ts` continuará igual.
5. Validar em sequência:
   - `npm run build`
   - `npm run build:dev`
   - abrir `/collection` e `/imoveis-porto-alegre` no preview para confirmar carregamento, cards, favoritos e navegação

Fallback se ainda houver falha no publish

Se a resolução relativa continuar instável, trocar apenas esses 2 imports para alias explícito no topo do arquivo e reexportar:
```ts
import Collection from "@/pages/Collection.tsx";
import PortoAlegrePilar from "@/pages/PortoAlegrePilar.tsx";

export { Collection, PortoAlegrePilar };
```

Resultado esperado

- remover o erro `Could not resolve "../pages/Collection.tsx"`
- não alterar UI nem lógica de filtros/favoritos
- separar o warning do Browserslist do blocker real de build
