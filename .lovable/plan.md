# Tela inicial no estilo Airbnb (design "Home" e "Home no celular")

A Home deixa de ter a foto grande do Gasômetro e passa a ser uma vitrine limpa: título, barra de busca e logo abaixo fileiras de imóveis com fotos, como no airbnb.com.

## Computador
1. Topo: logo, abas Imóveis / Lançamentos / Investir (com os ícones atuais), "Falar com a Lia", favoritos e menu.
2. Título centralizado "Você e seu novo **lar**." ("novo lar" em azul).
3. Barra de busca em pílula com 4 campos: Onde · Tipo · Quartos · Valor até, e botão azul "Buscar". Cada campo abre a sua escolha logo abaixo, e a busca leva para /busca com os filtros escolhidos.
4. Faixa de categorias com ícones (Vista pro Guaíba, Lançamentos, Casas em condomínio, Pronto pra morar, Com piscina, Coberturas, Studios, Até R$ 400 mil, Aceita pet, Imóveis de luxo) e botão "Filtros" à direita. Cada uma leva à página pronta correspondente. Categorias com menos de 8 imóveis não aparecem.
5. Fileiras, nesta ordem:
   - **Continue de onde parou**: só aparece para quem já viu imóveis no aparelho (até 3, com "Ver histórico").
   - **Novos no site em Porto Alegre**: 5 cards com foto, coração, quartos, área e preço. O selo "Novo desde a sua última visita" aparece só nos que chegaram depois da visita anterior.
   - **Banner Natal Chave de Ouro** e **Empreendimentos com condição de Natal**: enquanto a campanha estiver valendo.
   - **Até R$ 700 mil**: 5 cards.
   - Bairros em destaque, "Não achou? Um corretor busca para você", perguntas e rodapé, como hoje.

## Celular
- Topo: a pílula "Onde vai ser seu novo lar?", com "Bairro · Tipo · Quartos · Valor" embaixo, e o botão de filtros. Depois as abas e a faixa de categorias, que se rola para o lado.
- Sem título grande: "Continue de onde parou" em cards horizontais e "Novos no site" com fotos grandes já na primeira tela.
- Natal e "Até R$ 700 mil" em fileiras que se rolam para o lado. A barra inferior fica como está (Explorar, Favoritos, Lia, Entrar).

## O que fica de fora do design (regras do site)
- A linha "21.400+ imóveis à venda · Nota 4,9 no Google" não entra: o site não mostra o total de imóveis nem a nota do Google.
- A contagem de imóveis por bairro também não entra (ex.: "Petrópolis 925 imóveis").

## Velocidade
- A foto do primeiro card de "Novos no site" é a maior imagem da primeira tela: ela vem em tamanho reduzido, com prioridade alta, e as demais só carregam perto da tela.
- Nesta etapa a tela pronta da Home continua descartada para o site novo, como já ficou combinado. Montar a tela pronta da Home nova fica para o passo seguinte, depois da primeira medição.
- O Worker não é alterado.

## Entrega
Prints 1440 px e 390 × 844, antes e depois, e o que precisa ser publicado.

## Detalhes técnicos
- Novo `HomeVitrine` (pílula de busca com 4 campos, categorias, fileiras) substitui o `HeroSection` na página inicial. `HeroSection` fica sem uso, para a tela pronta antiga continuar compatível.
- Categorias e URLs vêm de `BUSCA_URLS` / `categoriasVisiveis` (já existem para a busca). Os ícones vêm dos ícones de categoria da busca no celular, para manter um desenho único.
- "Continue de onde parou" vem do histórico de vistos no aparelho (localStorage). "Novos desde a última visita" compara `publicado_em` com a última visita, também guardada no aparelho.
- As fileiras usam `busca_site` com limite 5 (Novos: ordenados por `publicado_em`; Até R$ 700 mil: `preco_max=700000`) e fotos `cardFotoUrl`.
- Teste: a busca da pílula gera a URL /busca certa a partir de Onde/Tipo/Quartos/Valor, e "novo desde a última visita" só marca os imóveis publicados depois dela.
