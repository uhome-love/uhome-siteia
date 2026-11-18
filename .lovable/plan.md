# Busca, filtros e mapa no padrão Airbnb (celular e computador)

## O que muda para o visitante

### 1. Filtros completos e organizados (janela estilo Airbnb)
Uma janela única, com seções separadas por linhas finas, e o rodapé fixo "Limpar tudo" + "Mostrar 1.284 imóveis" (o número atualiza enquanto a pessoa escolhe).
0. **Recomendados para você** – 4 cartões grandes com ícone 3D (Pátio, Piscina, Pet friendly, Vista panorâmica).
1. **Tipo de imóvel** – cartões grandes com os ícones 3D: Apartamento, Casa, Casa em condomínio, Apartamento garden, Cobertura, Studio, Terreno.
2. **Faixa de preço** – gráfico de barras com a distribuição dos preços, controle deslizante com duas pontas e campos "mínimo / máximo".
3. **Quartos, banheiros e vagas** – botões redondos "Qualquer · 1 · 2 · 3 · 4+" (contador estilo Airbnb).
4. **Área privativa** – mínimo e máximo em m².
5. **Etapa** – Pronto pra morar · Em obras · Na planta.
6. **Comodidades** (cartões com ícone, "Mostrar mais"), só com o que existe nos nossos imóveis:
   - Lazer: Piscina, Churrasqueira, Espaço gourmet, Lareira
   - Espaço externo: Pátio, Sacada, Terraço, Quintal, Vista panorâmica
   - Conforto: Ar condicionado, Móveis planejados, Lavabo, Escritório
   - Prédio: Elevador, Pet friendly, Acessibilidade
7. **Cidade e bairros** – busca por nome com sugestões.
No celular a janela ocupa a tela toda, desliza de baixo para cima e o rodapé fica fixo.

### 1b. Pílula "Onde vai ser seu novo lar?" com painel completo
Tocar na pílula (celular e computador) abre o mesmo painel completo, em etapas como no Airbnb:
- **Onde:** campo de texto com sugestões de bairros, cidades e condomínios enquanto digita, e atalhos ("Perto de mim", Porto Alegre, Litoral, Serra).
- **Valor:** gráfico de barras + slider de arrastar com duas pontas.
- **Quartos, banheiros, vagas:** contadores.
- **Tipo:** cartões com os ícones 3D.
- **Detalhes:** comodidades em botões com ícone e "Mostrar mais".
- Rodapé fixo "Limpar tudo" + "Mostrar N imóveis", com número atualizando ao vivo.
O painel de filtros e o da pílula são o mesmo componente, para nunca ficarem diferentes.

### 2. Apartamento garden = apartamento com pátio
A categoria e o filtro "Apartamento garden" passam a incluir apartamentos do tipo garden e também apartamentos que têm "Pátio". O ícone será refeito mostrando claramente um apartamento térreo com pátio/jardim privativo.

### 3. Acabamento visual Airbnb no site inteiro
- Sombras suaves em camadas na pílula de busca, nos cards ao passar o mouse e nas janelas; cantos 12–16 px.
- Pílula de busca: cada parte (Onde, Tipo, Quartos, Valor) acende ao ser escolhida, com painel suspenso logo abaixo (lista de bairros, botões de tipo, contador de quartos, faixas de valor), em vez de caixas de seleção simples.
- Ao rolar, a pílula grande encolhe suavemente para a versão compacta no topo; clicar nela abre de novo.
- Categorias: ícone levemente apagado; ao passar o mouse fica nítido; escolhida ganha traço preto embaixo. Faixa com setas laterais no computador.
- Cards: foto quadrada arredondada, coração no canto, pontinhos, setas que surgem suavemente, leve aumento da foto ao passar o mouse; textos em 3 linhas curtas (título, detalhes, preço em negrito).
- Transições de 150–250 ms em tudo; esqueletos de carregamento com brilho.
- Celular: barra inferior, pílula "Onde vai ser seu novo lar?" com sombra, filtros em tela cheia, botão flutuante "Mapa" / "Lista".

### 4. Mapa como o do Airbnb
- Etiquetas de preço brancas e arredondadas ("R$ 720 mil") em vez de bolinhas com números; a etiqueta escura indica o imóvel que está sob o mouse na lista; as já vistas ficam cinza.
- Clicar numa etiqueta abre um mini card flutuante com fotos que passam, preço e coração.
- Ao mexer no mapa, a lista atualiza sozinha ("Buscar ao mover o mapa" ligado por padrão) e o título mostra o total da área.
- Mapa mais claro e limpo, botões de zoom e "tela cheia" no canto em estilo Airbnb.
- Celular: lista por cima do mapa como uma gaveta que se arrasta para cima e para baixo.

## O que não muda
- Regras de lead, CRM, rastreamento e corretor seguem como estão.
- Velocidade: ícones e fotos extras continuam carregando só quando necessários; meta LCP até 2,5 s e CLS abaixo de 0,1.

## Detalhes técnicos
- Comodidades vêm de `jetimob_raw->>'imovel_comodidades'` (texto separado por vírgula). Adicionar coluna gerada/indexada `comodidades text[]` em `imoveis` (preenchida pelo sync/trigger) e o parâmetro `comodidades` + `banheiros`, `vagas`, `preco_min`, `area_util_min/max` em `busca_site`, mais `contagem_comodidades` e histograma de preços no retorno.
- Garden: `tipo='garden' OR (tipo='apartamento' AND 'Pátio' = ANY(comodidades))` em `busca_site`, `get_map_pins` e na contagem da categoria.
- Novo `SearchFilterDialog` com seções; `PilulaBusca` com painéis suspensos (Popover); tokens de sombra `--sombra-1/2/3` em `index.css`.
- Mapa: marcadores HTML de preço no Mapbox acima do zoom 12 (agrupamento só abaixo), popup com `FotosCard`, gaveta móvel com arraste.
- Molde da tela pronta (site-dobra) ganha nova versão de layout atrás da meta, sem mexer no Worker.
- Testes: regra do garden (pátio entra), contagem por comodidade e número do botão "Mostrar N imóveis".
