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
