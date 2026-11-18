# Fechar as pendências do mapa e do chip de cidade

## O que vai mudar

1. **Chip da cidade com o nome certo**
   - O chip mostra o nome oficial da cidade ("Xangri-Lá"), mesmo quando a pessoa digitou "xangri-la".
   - O título da busca já faz isso; o chip passa a usar o mesmo nome.

2. **Pontinha do mini card apontando para o preço**
   - Quando o mini card abre para cima, a pontinha fica embaixo, apontando para baixo (como hoje).
   - Quando abre para baixo, a pontinha vai para o topo e aponta para cima, na direção do preço.
   - A pontinha acompanha a posição do preço também perto das bordas da tela (hoje fica sempre no centro do card, mesmo quando o card é empurrado para dentro da tela).

3. **Selo "Novo" / "Lançamento" no mini card**
   - Conferir se os pinos do mapa recebem a data de publicação e a etapa da obra. Se não receberem, completar esses dados para o selo aparecer.
   - Testar com um imóvel novo de verdade (publicado nos últimos 30 dias) e com um lançamento.

4. **Imóvel já visto**
   - Conferir que o preço no mapa fica cinza depois de abrir a página do imóvel e voltar para a busca (hoje a cor só é calculada quando o mapa monta).
   - Atualizar a cor quando a pessoa volta para a busca, sem recarregar a página.
   - Mostrar no mini card um aviso discreto "Você já viu" em cinza, no mesmo padrão.

5. **Teste do mini card em 360, 390 e 430 px**
   - Abrir o mini card em preços no alto e embaixo do mapa, nas três larguras.
   - Conferir: foto, setas, selo, preço, botão "Ver imóvel", pontinha certa, nada cortado nas bordas e sem cobrir o preço tocado.
   - Repetir no computador.

## Detalhes técnicos

- `SearchExperience.tsx`: `rotuloChip('cidade', ...)` passa a receber `cidadeNome` (primeira linha cujo `norm(cidade)` bate com o filtro).
- `SearchMap.tsx`: variável `abreBaixo = previewPos.y < 270`; renderizar o triângulo antes do card com `rotate-[225deg]` / borda superior quando `abreBaixo`; posição horizontal do triângulo = `previewPos.x - left` limitada a 16..244 px.
- Selo: checar se `busca_site` devolve `publicado_em` e `fase` nas linhas usadas pelos pinos; o `selosDoCard` lê de `pins.find(...)`; se faltar, incluir na lista de campos retornados (sem mudar contagens nem filtros).
- Visto: recalcular `visto` no GeoJSON ao focar a janela / voltar para a rota (`visibilitychange` + `pageshow`) e via `setData` na fonte; ids salvos em `imoveis_vistos` são `data.id`, iguais aos do pino.
- Validação com Playwright nas larguras 360/390/430 e 1280, com screenshots do mini card aberto para cima e para baixo; rodar os testes existentes.
