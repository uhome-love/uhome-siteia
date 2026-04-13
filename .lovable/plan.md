

## Plano: Busca por rua no MobileFiltersSheet

### O que muda

No sub-page de "Localização" do mobile, quando o texto digitado não bate com nenhum bairro, mostrar uma opção "Buscar por [texto digitado]" (igual ao desktop). Ao clicar, define `filters.q` com o texto e fecha o sub-page.

### Alterações em `src/components/MobileFiltersSheet.tsx`

1. **Placeholder do input** (linha 150): trocar de `"Bairro em Porto Alegre"` para `"Bairro, rua ou endereço..."`.

2. **Função `searchByAddress`**: nova função que faz `setFilter("q", text.trim())`, limpa `locationInput` e fecha o sub-page.

3. **Opção "Buscar por endereço" no dropdown** (após linha 205, antes do "Nenhum bairro encontrado"): quando `locationInput.trim()` tem texto e não bate exatamente com um bairro, renderizar um botão com ícone `Search` e texto `Buscar por "${locationInput}"` que chama `searchByAddress`.

4. **Chip de busca ativa na seção Localização** (após linha 250): se `filters.q` estiver preenchido, mostrar um chip removível com o texto da busca (igual ao desktop), com `X` para limpar via `setFilter("q", "")`.

5. **Incluir `filters.q` no `activeCount`** (linha 92): adicionar à lista de filtros contados.

6. **Incluir `filters.q` no `locationDisplay`** (linha 110): se `filters.q` estiver ativo, incluir na descrição.

7. **Enter no input** dispara `searchByAddress` se não houver sugestão exata.

### Validação
- Build dev + produção para confirmar sem erros.

