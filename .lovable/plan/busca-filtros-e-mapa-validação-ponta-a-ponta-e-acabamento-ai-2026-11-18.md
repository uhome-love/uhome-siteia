# Busca, filtros e mapa: validação ponta a ponta e acabamento Airbnb

## Respostas diretas
- **Aceita pet:** vem do cadastro do imóvel na Jetimob (comodidade "Pet friendly", 2.245 imóveis). Hoje "Pet care" (378, serviço do condomínio) não conta. O filtro passa a valer para "Pet friendly" **ou** "Pet care". "Espaço pet" (7) fica fora, porque não garante que o imóvel aceita animal.
- **Vista panorâmica:** também vem do cadastro (2.290 imóveis) e já filtra imóveis reais. Vou reconferir na validação.

## O que será corrigido
1. **Pílula igual ao Airbnb:** cada campo abre só o seu painel pequeno logo abaixo dele — **Onde** (digitar bairro, cidade, rua ou código, com sugestões), **Tipo** (cartões com ícone), **Quartos** (contadores de quartos, banheiros e vagas), **Valor** (faixa com barras e controle de arrastar). O campo ativo fica destacado e dá para pular de um para outro sem fechar. **Buscar** faz a busca direto (hoje abre o filtro). O botão **Filtros** abre o painel completo com tudo. No celular, a pílula abre a tela cheia com os mesmos passos em blocos que se expandem.
2. **Faixa de preço:** a ponta da direita não chega ao fim. O controle vai até "R$ 3 mi+" (sem limite), o máximo aparece certo, e os campos Mínimo/Máximo ficam digitáveis.
3. **Busca por rua:** digitar o nome de uma rua passa a encontrar os imóveis pelo endereço, sem acentos nem "Av./Rua" atrapalharem. As sugestões também mostram ruas.
4. **Mapa no padrão Airbnb:** etiqueta de preço cinza nos imóveis já vistos, etiqueta escura ao passar o mouse no card, mini card com fotos que passam ao clicar na etiqueta, botão "Buscar nesta área" ao mover o mapa e, no celular, a gaveta de arrastar entre lista e mapa.
5. **Acabamento:** pílula que encolhe ao rolar, setas laterais na faixa de categorias, painel com abrir/fechar suave.

## Validação ponta a ponta
- No banco: cada filtro (cidades, bairros, rua, tipos, garden, preço mínimo/máximo, quartos, banheiros, vagas, área, etapa, as 16 comodidades e combinações) conferido imóvel por imóvel contra a regra.
- Pílula: cada campo abre o painel certo, troca entre campos, Buscar leva aos resultados certos, Filtros abre tudo.
- No site, com navegador automático, no computador e no celular: escolher cada filtro, conferir que o número do botão "Mostrar N" bate com o total da página de resultados, e que os cards e o mapa mostram só imóveis que cumprem o filtro.
- Corrigir os 2 testes antigos do "Ver mais".
- Relatório final com cada filtro e o resultado.

## Detalhes técnicos
- `busca_site`: aceita alias de comodidade (pet = Pet friendly OU Pet care); `q` com `unaccent` e normalização de prefixos de logradouro sobre `endereco_completo`.
- `PilulaBusca`: botão Buscar navega via `urlDeFiltros`; partes abrem o `SearchFilterDialog` com âncora de seção.
- Slider: `max` = teto do histograma, último passo = sem limite; inputs editáveis com parse.
- Mapa: estado de vistos via histórico local, popup com `FotosCard`, bounds para `busca_site`.
- Testes novos: pet alias, URL do Buscar, preço sem limite, busca por rua.
