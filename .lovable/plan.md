
Objetivo

Corrigir o build de forma definitiva sem remover funcionalidades nem alterar a lógica das páginas.

Diagnóstico confirmado

- `src/pages/Collection.tsx` existe em `src/pages/`.
- `src/pages/PortoAlegrePilar.tsx` existe em `src/pages/`.
- Ambos têm `export default` válido:
  - `Collection.tsx`: final do arquivo
  - `PortoAlegrePilar.tsx`: final do arquivo
- O problema atual está em `src/routes/lazyPages.ts`, linhas 32-33:
  ```ts
  export const Collection = lazyRetry(() => import("../pages/Collection.tsx"));
  export const PortoAlegrePilar = lazyRetry(() => import("../pages/PortoAlegrePilar.tsx"));
  ```
- Essas duas páginas estão registradas corretamente em `src/routes/AppRoutes.tsx` nas rotas:
  - `/collection`
  - `/imoveis-porto-alegre`
- Também existem links ativos para `/collection` em `Navbar`, `Footer` e `FeaturedProperties`, então remover a rota não é a correção ideal.

Causa raiz

As páginas existem, mas a resolução via `lazyRetry` + `import()` dinâmico está sendo a origem do erro de build para esses dois módulos. O próprio padrão salvo na memória do projeto diz que `Collection` e `PortoAlegrePilar` devem ser carregadas de forma eager para evitar esse tipo de falha de resolução.

Correção definitiva

1. Ajustar apenas `src/routes/lazyPages.ts`
- Remover o `lazyRetry` dessas duas páginas.
- Trocar por export estático/eager, mantendo todo o resto igual.
- Exemplo da mudança:
  ```ts
  export { default as Collection } from "../pages/Collection.tsx";
  export { default as PortoAlegrePilar } from "../pages/PortoAlegrePilar.tsx";
  ```
- Manter as demais páginas com `lazyRetry` como estão.

2. Não mexer em `AppRoutes.tsx`
- As rotas já estão corretas.
- Não remover `/collection` nem `/imoveis-porto-alegre`.

3. Atualizar o warning do Browserslist
- Rodar:
  ```bash
  npx update-browserslist-db@latest
  ```
- Isso trata o warning do `caniuse-lite`, mas é separado do blocker real.

4. Validar completamente
- Rodar:
  ```bash
  npm run build
  npm run build:dev
  ```
- Depois testar navegação real:
  - abrir `/collection`
  - abrir `/imoveis-porto-alegre`
  - clicar nos links da navbar/rodapé/home que apontam para Collection
  - confirmar que o app continua abrindo normalmente

Escopo exato da implementação

- Alterar: `src/routes/lazyPages.ts`
- Atualizar metadados do Browserslist
- Validar build e navegação
- Não alterar:
  - conteúdo de `Collection.tsx`
  - conteúdo de `PortoAlegrePilar.tsx`
  - lógica de busca, favoritos, filtros, auth, SEO ou CRM

Detalhes técnicos

- O erro não é mais “arquivo inexistente”; os arquivos estão presentes.
- O erro atual é de estratégia de import/resolução no build.
- A correção permanente é: para essas duas páginas, usar import/export estático em vez de `lazyRetry(import(...))`.
- Remover as rotas agora seria um workaround destrutivo, não uma correção definitiva, porque o site já referencia essas páginas em múltiplos pontos.

Resultado esperado

- `vite build` passa sem:
  - `Could not resolve "../pages/Collection.tsx"`
  - `Could not resolve "../pages/PortoAlegrePilar.tsx"`
- O warning de Browserslist deixa de aparecer após o update.
- `/collection` e `/imoveis-porto-alegre` continuam funcionando normalmente.
