# Página do imóvel no celular: fotos, mapa, simulador e topo

## Uso do simulador (dados reais, últimos 60 dias)
Foram 16 simulações, contra mais de 228 mil visualizações de imóveis. Quase ninguém usa, então ele passa a ficar recolhido.

## O que vou mudar
1. **Tocar na foto abre as fotos.** Hoje só o botão "35 Fotos" abre a galeria. Um toque simples na foto grande vai abrir a galeria na foto que está aparecendo. Arrastar para o lado continua passando as fotos, sem abrir a galeria.
2. **Mapa aparece na hora.** O mapa passa a carregar quando a pessoa chega perto dele ao rolar a página, e não só quando ele já está na tela. Enquanto carrega, aparece uma imagem fixa do local no lugar do bloco cinza, então nunca fica vazio.
3. **Simulador recolhido.** Fica um cartão "Simular financiamento", que abre ao tocar. O link "Simular" que já existe no topo da página abre o simulador e rola até ele.
4. **Topo limpo, como no Airbnb.** Na página do imóvel, no celular, saem as abas Imóveis, Lançamentos e Investir e também a barra de busca. Ficam só voltar, compartilhar e salvar por cima da foto. As abas continuam no menu e nas outras páginas.
5. Testar em 360, 390 e 430 px: toque na foto, deslizar as fotos, o mapa aparecendo e o simulador abrindo e fechando.

## Detalhes técnicos
- `PropertyDetail` (carrossel mobile): `onClick` no slide com proteção contra arraste (se o deslocamento for maior que 8 px, não abre), chamando `setCurrentImage(i)` e `setGalleryOpen(true)`.
- O mapa usa um `IntersectionObserver` com `rootMargin` de 800 px, mais um `import()` antecipado do `PropertyMap` e do Mapbox quando a página fica ociosa. Enquanto carrega, mostra uma imagem estática da Mapbox (Static Images API, com o token público já usado).
- `FinancingSimulator` vai dentro de um `Collapsible` fechado. O link `#simulador` abre o `Collapsible` antes de rolar.
- `Navbar`: esconder `.uhs-mobile-header` nas rotas de detalhe do imóvel no celular, porque o hero já tem os botões próprios. Ajustar o espaço do topo para a foto encostar no alto.
