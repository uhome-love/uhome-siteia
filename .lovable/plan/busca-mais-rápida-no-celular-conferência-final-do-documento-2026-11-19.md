# Busca mais rápida no celular + conferência final do documento Airbnb

## O que já sei
- Nos visitantes reais, a busca no celular leva 4,7 s para mostrar o conteúdo principal (o bom é até 2,5 s). A primeira tela em si aparece rápido. A demora vem do que chega depois dela.
- No teste local, as fotos dos cards somam só cerca de 200 KB. A foto não parece ser o maior peso. Também baixam 7 arquivos de letra, quando o site precisa de 2 ou 3.
- O documento enviado agora é igual ao anterior, que já foi aplicado em grande parte.

## Parte 1 — Descobrir o que atrasa (antes de mexer)
- Medir no celular simulado (4G + processador lento) a busca já publicada, com uma cópia exata dela: qual item é o "conteúdo principal", quando ele aparece e o que disputa o carregamento com ele.
- Separar os visitantes reais por tipo de página (busca com e sem cidade) para achar onde dói mais.

## Parte 2 — Fotos dos imóveis
- Primeira foto do 1º card: prioridade máxima e tamanho certo para a tela do celular (versão leve, cerca de 30–50 KB).
- Demais cards: fotos só quando chegam perto da tela.
- Fotos extras do deslize (que acabei de fazer): só baixar depois que a página estiver pronta, nunca junto com a primeira tela.
- Conferir se nenhuma foto baixa duas vezes (versão leve + original).

## Parte 3 — O que carrega depois da primeira tela
- Letras: deixar só os pesos usados de verdade (cortar os 7 arquivos para 2–3).
- Atrasar o que não aparece na hora: mapa, filtros, aviso de cookies, Lia, contagens e categorias.
- Conferir se a lista não pede os dados duas vezes ao abrir.
- Reduzir o tempo de resposta ao toque (hoje 0,42 s): achar o que trava ao tocar em filtro ou card.

## Parte 4 — Conferir o documento item por item
- Fazer uma tabela com cada item do documento: pronto / parcial / falta. Mostrar como prova o print no celular e no computador.
- Corrigir o que estiver parcial e for pequeno. Listar à parte o que for grande ou não fizer sentido para venda de imóveis (por exemplo datas e hóspedes).

## Teste
- Medir antes e depois no celular simulado, com os mesmos imóveis.
- Rodar os testes do projeto.
- O resultado nos visitantes reais só aparece alguns dias depois de publicar.

## Detalhes técnicos
- Lab: Playwright + CDP (Network/CPU throttling 4x, Slow 4G), PerformanceObserver de LCP com elemento e tempo de rede. Rodar no build de produção local (`vite build && vite preview`) em /tmp, não no servidor de desenvolvimento.
- Fotos: `fetchpriority="high"` só no 1º card, `sizes` correto no srcset do `cardFotoUrl`, extras do `FotosCard` apenas após `load` + idle.
- Fontes: auditar o @font-face em index.css e o preload, mantendo a regra de fonte própria.
- Respeitar as regras do projeto: sem manualChunks, molde da primeira dobra (site-dobra) intacto, gtag/Lia depois do load.
