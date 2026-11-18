# Rodada final: celular, mapa, calendário, selos e contagens

## 1. Página do imóvel e calendário (360, 390, 430 px e desktop)
- Abrir 3 imóveis reais em cada largura; corrigir cortes, quebras de título, botões sobrepostos (Lia, cookies, barra inferior).
- Calendário de visita: conferir mês inteiro visível, dias de 44 px, domingos e passados bloqueados, horários em chips, botão final sempre visível; ajustar onde quebrar.
- Comodidades: comparar a lista da página com o cadastro de 5 imóveis no banco (comodidades + diferenciais) e corrigir qualquer ausência ou repetição.

## 2. Mapa no celular (360/390/430 px)
- Gaveta arrastável: posições recolhida / meio / cheia, arraste suave sem travar a rolagem da lista.
- Toque no preço abre mini card com fotos deslizáveis, preço, quartos e selo ("Novo" ou outro); toque fora fecha; toque no card abre o imóvel.
- Etiqueta cinza para imóvel já visto; zoom sem pins sumirem; mapa indo até a cidade buscada.

## 3. Visual geral do celular (conforme o print)
- Home: tirar a faixa "Imóveis / Lançamentos / Investir" do topo no celular (fica no menu), deixando pílula + Filtros + categorias 3D com seta/rolagem visível.
- Conferir ícones, tamanhos de toque (44 px), botões e barra inferior em todas as larguras.

## 4. Selos
- Um selo na foto por imóvel, com prioridade: Novo > Lançamento > Em obras. O selo que não couber na foto vai para a linha de informações do card ("Lançamento · 3 quartos").
- Mesma regra no mini card do mapa.

## 5. Home com a regra nova
- Fileira "Novos no site" usa os mesmos 30 dias da busca (filtro Novidades) e "Ver todos" abre `/busca?novidades=30`.
- "Novo desde a sua última visita" passa a usar a mesma data de entrada (`publicado_em`).

## 6. Contagem por cidade
- Comparar, para Porto Alegre, Capão da Canoa, Canoas e Xangri-lá, o total mostrado no título, a contagem da categoria e o número de imóveis realmente listados (paginando); corrigir divergências e garantir que o título mostre a cidade escolhida.

## Validação
- Playwright em 360/390/430/1280 com capturas de cada item; testes automáticos da regra de prioridade de selo e dos 30 dias; build sem erros. Worker não é alterado.
