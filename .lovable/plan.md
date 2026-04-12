

# Uhome Collection — Plano de Implementação

## Resumo
Criar a experiência "Uhome Collection": uma curadoria premium de imóveis selecionados manualmente, com página dedicada, filtro especial na busca, e priorização automática nos resultados.

## O que será feito

### 1. Página dedicada `/collection`
- Nova página `src/pages/Collection.tsx` com header premium (ícone de estrela/diamante, título "Uhome Collection", subtítulo "Imóveis selecionados a dedo pela nossa equipe")
- Grid de cards usando `SearchPropertyCard` existente
- Busca via `fetchImoveis({ destaque: true })` — já suportado
- SEO: meta title/description otimizados

### 2. Destaques sempre primeiro na busca geral
- Em `src/services/imoveis.ts`, adicionar `.order("destaque", { ascending: false })` como **primeiro** critério de ordenação antes da ordem escolhida pelo usuário
- Assim, imóveis Collection aparecem no topo automaticamente

### 3. Filtro "Uhome Collection" na barra de busca
- Adicionar `destaque: boolean` ao `SearchFilters` no Zustand store (`searchStore.ts`)
- Novo pill/botão com ícone de estrela na `SearchFiltersBar.tsx` (desktop) e toggle no `MobileFiltersSheet.tsx` (mobile)
- Ao ativar, filtra apenas imóveis `destaque=true`
- Sincronizar com URL param `?collection=true`

### 4. Rotas e navegação
- Registrar rota `/collection` no `App.tsx` (principal + corretor)
- Adicionar link "Uhome Collection" na `Navbar.tsx` (com ícone de estrela, estilo diferenciado)
- Adicionar link no `Footer.tsx`
- Alterar "Ver todos →" do `FeaturedProperties.tsx` para apontar para `/collection`

### 5. SSR para SEO
- Adicionar renderização de `/collection` no `ssr-render` Edge Function

## Arquivos

| Ação | Arquivo |
|------|---------|
| Criar | `src/pages/Collection.tsx` |
| Editar | `src/stores/searchStore.ts` — adicionar `destaque` |
| Editar | `src/services/imoveis.ts` — ordenação `destaque DESC` primeiro |
| Editar | `src/pages/Search.tsx` — mapear param `collection` |
| Editar | `src/components/SearchFiltersBar.tsx` — pill Collection |
| Editar | `src/components/MobileFiltersSheet.tsx` — toggle Collection |
| Editar | `src/App.tsx` — rota `/collection` |
| Editar | `src/components/Navbar.tsx` — link Collection |
| Editar | `src/components/Footer.tsx` — link Collection |
| Editar | `src/components/FeaturedProperties.tsx` — "Ver todos" → `/collection` |
| Editar | `supabase/functions/ssr-render/index.ts` — SSR da página |

## Banco de dados
Nenhuma alteração necessária — o campo `destaque` já existe na tabela `imoveis` e já é gerenciado pelo admin.

