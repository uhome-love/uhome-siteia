# Topo do computador no estilo Airbnb, com o que a Uhome já tem

## Recomendação: fazer, porque reaproveita o que já criamos
O topo do Airbnb funciona porque as abas ficam centralizadas, têm ícone 3D e ficam **acima** da busca, sem disputar com ela. O que tínhamos antes era só texto preso à esquerda. Dá para ter o mesmo resultado usando os ícones 3D que já existem.

```text
[Logo Uhome]   [casa 3D] Imóveis   [prédio 3D] Lançamentos   [studio 3D] Investir     Anunciar imóvel  [♡] [Entrar] [≡]
                         ─────
              [  Onde  |  Tipo  |  Quartos  |  Valor   (Buscar) ]
                    [foto] Continue sua busca  Canoas · até R$ 800 mil  →
```

1. **Abas centralizadas com ícone 3D**, só na página inicial e só no computador, antes de rolar:
   - Imóveis (ícone de apartamento): busca completa.
   - Lançamentos (ícone de lançamento): na planta e em obras.
   - Investir (ícone de studio): página de investimento.
   A aba ativa ganha um sublinhado. Ao rolar, as abas somem e a busca compacta fica no centro, como já está hoje.
2. **"Anunciar imóvel" à direita**, como o "Torne-se um anfitrião": é o caminho para quem quer vender (página que já existe).
3. **Faixa "Continue sua busca"** logo abaixo da pílula, para quem já buscou, com a foto do último imóvel visto e o resumo da busca. Um toque retoma a busca. Quem nunca buscou não vê a faixa.
4. Celular continua igual: só a busca e os ícones 3D.

## Alternativa
Deixar como está (topo limpo). Também funciona, mas perde o caminho rápido para Lançamentos e Investir na primeira tela do computador.

## Detalhes técnicos
- `Navbar.tsx`: em `uhs-desktop-tabs`, na Home e sem rolar, renderizar as abas com `<img>` 32px de `/categorias/apartamento|lancamento|studio.webp` (lazy, com tamanho fixo); mantendo a `pilula-compacta` ao rolar ou fora da Home. Link "Anunciar imóvel" em `uhs-header-actions` (só a partir de 1024px).
- `HomeVitrine.tsx`: componente `ContinueSuaBusca` abaixo da `PilulaBusca`, usando `lerBuscas()[0]` + primeira foto de `imoveis_vistos`; evento `categoria_tocada` com `continue_busca`.
- CSS com tokens existentes; sem mudança de altura que cause salto na tela (reservar a altura da faixa só quando existir busca salva, calculado já na 1ª pintura via localStorage).
- Validar em 1280/1440 (topo e rolado) e 390 px (sem mudança).
