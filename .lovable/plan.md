# Busca padrão Airbnb: limpeza do topo, filtros, mapa, cards e categorias

## 1. Topo da busca sem espaços vazios e sem repetição
- Remover a faixa de chips rápidos (Aceita pet, Piscina, Com pátio...) e o botão "Filtros" duplicado: esses itens viram categorias com ícone 3D ou ficam só dentro do painel de Filtros.
- Uma linha de categorias + pílula de busca com botão "Filtros" ao lado, como no Airbnb. Sem blocos brancos altos.
- Setas da faixa ficam centralizadas na altura dos ícones, em círculo pequeno com sombra, só quando há mais itens (hoje aparecem soltas no canto).
- Categorias com altura fixa compacta (ícone 24-28px + rótulo), sublinhado na selecionada.

## 2. Painel "Filtros" igual ao Airbnb
- Janela central (~780px) com título "Filtros", X, conteúdo rolável e rodapé fixo "Remover filtros" / "Mostrar N imóveis" escuro.
- Seções separadas por linha fina: Tipo, Faixa de preço, Quartos/Banheiros/Vagas com botões − Qualquer +, Comodidades em pílulas com ícone e "Mostrar mais", Etapa da obra.
- Fundo escurecido atrás, sem o visual quebrado atual.

## 3. Slider de preço
- Histograma acima, trilho fino, alças redondas brancas com sombra, campos Mínimo/Máximo em caixas arredondadas abaixo, igual à referência.

## 4. Mapa colorido
- Trocar o mapa claro cinza pelo estilo colorido (verdes, água azul, estradas), etiquetas de preço brancas com sombra; selecionado em grafite; vistos em cinza.

## 5. Padrão de card
- Foto quadrada com cantos 12px, pontos e setas no hover, coração no canto, selo discreto no canto superior esquerdo.
- Texto abaixo: tipo · bairro (negrito), linha de quartos/área/vagas em cinza, preço em negrito. Grade 3 colunas ao lado do mapa no computador.

## 6. Mais categorias com ícones 3D
Novas, todas mapeadas para filtros reais já validados:
- Com piscina, Vista panorâmica, Aceita pet (ícones já existem)
- Novas: Com churrasqueira, Com sacada, Pronto pra morar, Na planta/lançamento, Frente mar (litoral), Na Serra, 3+ quartos, Alto padrão (acima de R$ 1,5 mi), Casas
- Gerar ícones novos no mesmo estilo 3D dos atuais; mostrar só categorias com pelo menos 8 imóveis.

## Detalhes técnicos
- `SearchExperience.tsx`: remover render de `filtrosRapidos` na faixa; categorias passam a cobrir esses atalhos (`homeVitrine`/categorias lib).
- `SearchFilterDialog.tsx`: novo layout de seções e rodapé fixo; contagem do botão usa a mesma `busca_site`.
- `SearchMap.tsx`: estilo `mapbox://styles/mapbox/streets-v12` com ajustes de camadas ou outdoors; etiquetas mantidas.
- `CatalogCard`/`FotosCard`: ajustes visuais apenas.
- Ícones em `public/categorias/*.webp` (≤15 KB cada).
- Validar com Playwright em 1296px e 390px: painel aberto, mapa, cards, setas; testes existentes de filtros continuam passando.
