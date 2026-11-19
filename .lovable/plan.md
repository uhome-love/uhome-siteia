# Busca do topo no celular: etapa "Mais filtros"

Sim, faz sentido no celular. Hoje o painel que abre pela pílula do topo tem só 3 etapas (Onde, Tipo, Valor). Quartos e comodidades existem, mas só no botão "Filtros" da busca.

## O que muda
1. Uma 4ª etapa opcional, depois de "Valor": **"Mais filtros"**. Recolhida, ela mostra o resumo do que foi escolhido (ex.: "2+ quartos · Piscina") ou "Opcional".
2. Quando aberta, ela mostra, nesta ordem:
   - Quartos, banheiros e vagas (botões + e −)
   - Recomendados (os ícones 3D: piscina, pet etc.)
   - Comodidades (botões com a contagem)
   - Área privativa e etapa da obra (pronto, em obras, na planta)
3. O botão **"Buscar"** aparece já na etapa "Valor", e também em "Mais filtros". Quem não quiser mais filtros não precisa passar por ela. Ao lado dele fica um link "Mais filtros" que abre a 4ª etapa.
4. As contagens ao vivo continuam: o botão mostra "Buscar" e fica desligado quando não há nenhum imóvel com aqueles filtros.
5. No computador, nada muda: a pílula já abre o painel completo.

## Como vou conferir
- Celular (390px): abrir pela pílula do topo da Home, escolher 2 quartos + piscina, tocar em Buscar e ver a busca filtrada com imóveis.
- Um teste do resumo da etapa recolhida.

## Detalhes técnicos
- `BuscaEtapas.tsx`: nova etapa `mais` com as seções `['quartos','recomendados','comodidades','area','etapa']`, reaproveitando `FiltroSecoes`. `resumoEtapa('mais')` monta o texto. `ultima` passa a considerar as etapas `valor` e `mais` como prontas para buscar.
