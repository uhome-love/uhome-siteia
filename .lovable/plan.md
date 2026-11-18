# Categorias da Home com ícones 3D no estilo Airbnb

Troca os ícones de traço atuais por ícones 3D próprios da Uhome, como os de "Imóveis / Lançamentos / Investir" do topo. Cada categoria tem o seu desenho.

## As 7 categorias, na ordem
| Categoria | Ícone 3D | Abre |
|---|---|---|
| Apartamentos garden | prédio baixo com um jardim gramado na frente | imóveis do tipo garden |
| Studios | apartamento pequeno com cama e janela grande | studios e lofts |
| Casas em condomínio | duas casinhas com um portão de condomínio | casas em condomínio |
| Terrenos | lote gramado com estacas e plaquinha | terrenos |
| Até R$ 400 mil | casinha com uma etiqueta de preço | imóveis até R$ 400 mil |
| Em Canoas | alfinete de mapa sobre um pedaço de cidade | imóveis em Canoas |
| Coberturas | topo de prédio com terraço e guarda-sol | coberturas |

"Apartamentos" e "Pronto pra morar" saem da faixa, para ficar só com essas 7, como você pediu.

## Visual
- Estilo dos ícones do topo do site: 3D suave e arredondado, luz clara, fundo transparente, cores da Uhome (azul Uhome, grafite, verde suave nos jardins, branco).
- Os 7 ícones são feitos na mesma leva e com o mesmo pedido de estilo, para parecerem da mesma família. Antes de usar, confiro cada um em tamanho real.
- Tamanho na faixa: 32 px no computador e 28 px no celular, com o nome embaixo. A categoria aberta fica com um traço grafite embaixo, como no Airbnb.
- Arquivos leves (WebP pequeno, menos de 6 KB cada), carregados só depois da primeira foto, para não pesar na velocidade.

## Regra mantida
- Uma categoria só aparece se tiver pelo menos 8 imóveis.
- Na busca do celular, as categorias continuam como estão. Esta troca vale só para a faixa da Home.

## Observação
- Agora a geração de imagens da Lovable está com instabilidade. Se falhar, espero voltar e tento de novo uma única vez.

## Detalhes técnicos
- Nova lista `CATEGORIAS_HOME` em `buscaConfig.ts` (garden, studio/loft, casa_condominio, terreno, precoMax 400000, cidade Canoas, cobertura), com contagem pela `busca_site` (o campo `categorias` ganha os ids novos no SQL, sem mexer nos existentes).
- Ícones gerados com a ferramenta de imagem, enviados como Lovable Assets (WebP 96 px) e mapeados em `src/components/home/iconesCategorias.ts`.
- `HomeVitrine` usa `<img width=32 height=32 loading="lazy">`, para não haver salto na tela.

---

# Parte 2: página de busca no estilo Airbnb (computador)

## Topo (igual às duas telas do Airbnb enviadas)
- **Antes de rolar:** logo, abas Imóveis / Lançamentos / Investir com os ícones 3D atuais e, logo abaixo, a pílula grande Onde · Tipo · Quartos · Valor até, com o botão azul. É a mesma pílula da Home.
- **Ao rolar:** o topo encolhe para uma linha só, com a pílula compacta no centro ("Porto Alegre · Apartamento · 3+ · até R$ 700 mil", com a lupa) e o botão "Filtros" ao lado, como no Airbnb. Tocar na pílula a abre de novo, grande.
- A linha atual "Bairro, endereço ou código" + Filtros + ordenação sai. A busca por endereço ou código fica no campo "Onde". A ordenação ("Mais recentes") vai para a linha do título dos resultados, à direita.
- Logo abaixo do topo fica a faixa de categorias com os mesmos ícones 3D da Home. A categoria aberta fica com um traço grafite embaixo.

## Total de imóveis nos resultados
- O título passa a mostrar o total da busca, como o "Mais de mil acomodações" do Airbnb: "1.284 imóveis à venda em Porto Alegre". Acima de 1.000, mostra "Mais de 1.000 imóveis à venda em Porto Alegre".
- O total muda junto com os filtros e com o mapa.
- **Isto muda uma regra que o site tinha** ("não mostrar total de imóveis"). Ela passa a valer para tudo, menos para o título dos resultados da busca e das páginas prontas. Home, prévias de link e Google continuam sem total.

## Acabamento (sem cara de amador)
- Grade de 2 colunas ao lado do mapa, fotos com cantos 16 px e espaços iguais entre os cards, coração branco com sombra. Selos claros sobre a foto ("Lançamento", "Novo desde a sua última visita").
- No card: tipo · bairro em negrito, quartos · área · vagas em cinza e o preço em negrito embaixo.
- Mapa arredondado, com margem, preços em pílulas brancas (como o Airbnb) no lugar dos círculos com número, quando o zoom permitir.
- Mesma letra, mesmos cinzas e mesmo azul Uhome em toda a página.

## Celular
- Fica como acabou de ser ajustado (pílula no topo, chips, categorias). Só troca para os ícones 3D, e o título ganha o total.

## Tela pronta e velocidade
- O molde da busca (site-v3) recebe o topo novo e o título com total, atrás de uma nova chave de versão, para o site publicado antigo não misturar telas. A primeira foto continua sendo a foto conservada, e o Worker não é alterado.
- Meta: LCP até 2,5 s e CLS abaixo de 0,1, nas páginas /busca, /lancamentos-porto-alegre e /imoveis-canoas.

## Detalhes técnicos (parte 2)
- `PilulaBusca` sai da Home para um componente compartilhado, com modo grande e modo compacto. A Navbar usa o modo compacto nas URLs de catálogo ao rolar, ligada ao estado `rolou` que já existe.
- Título: `tituloBuscaComTotal(count, cidade)` em `buscaConfig.ts`, usado pelo app e pelo molde, com teste para 0, 1, 999 e 1.000+.
- Atualizar a memória "Sem vitrine de totais" com a exceção do título da busca.
- Pins de preço: camada de símbolos do Mapbox com texto de preço quando o zoom ≥ 13, e grupos como hoje abaixo disso.
