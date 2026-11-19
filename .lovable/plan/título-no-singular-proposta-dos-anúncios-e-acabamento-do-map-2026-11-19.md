# Título no singular, proposta dos anúncios e acabamento do mapa

## 1. Título da busca no singular
- Com 1 imóvel, o título fica "1 apartamento à venda em Porto Alegre". Com 2 ou mais, fica "2 apartamentos...". Vale para todos os tipos (casa, cobertura, studio, terreno, garden, sobrado) e para "imóvel/imóveis".
- **Venda e aluguel:** o site é só de venda. Vou confirmar que:
  - uma busca com `finalidade=aluguel` na barra de endereço não mostra "para alugar" nem nenhum imóvel de aluguel;
  - o título continua "à venda";
  - nenhum imóvel de aluguel aparece na lista ou no mapa.
- Testes automáticos para: 0, 1 e 2 imóveis, com e sem tipo, e o caso de aluguel.

## 2. Proposta para os anúncios do Google (sem alterar nada)
Para cada um dos 18 grupos de anúncios das 3 campanhas, entrego:
- página de destino recomendada (a atual ou uma melhor, já conferida e abrindo);
- 15 títulos (até 30 caracteres) e 4 descrições (até 90 caracteres) no tom do visual novo: busca no mapa, fotos reais, agendar visita online, atendimento de corretor;
- o que manter, pausar ou juntar, com base nos cliques, conversões e gasto dos últimos 30 dias.

Regras:
- Sem MCMV, preço baixo ou FGTS, sem nota do Google e sem número de corretores. Só venda.
- As condições do Natal seguem o que está na campanha (entrada a partir de 10%, válido até 18/12).

A proposta fica salva num arquivo para você revisar e aprovar grupo por grupo. Nada é enviado ao Google Ads antes do seu ok.

## 3. Acabamento do mapa
1. **Card do preço:** fotos com setas e pontinhos, coração para salvar, X para fechar, cantos de 16 px e sombra suave. No computador ele abre perto do preço. No celular fica preso embaixo da tela, acima da gaveta.
2. **Gaveta do celular com 3 posições:** só a alça (mapa quase inteiro), metade e lista inteira. Arrastar encaixa na posição mais próxima, e o botão "Mapa" na lista volta para o mapa.
3. **Tela de carregamento da Home** com o mesmo espaçamento da busca, para a página não pular ao abrir.
4. **Testes em 360, 390, 430 e 1440 px:** arrastar, aproximar, ampliar, tocar no preço, abrir o card, salvar, fechar, usar a gaveta e voltar à lista. Corrijo o que falhar e mostro as fotos do resultado.

## Detalhes técnicos
- `comTipo` passa a receber o total: singular quando `count===1` (mapa `TIPO_SINGULAR`/`TIPO_PLURAL`). `busca_site` já filtra por venda; o teste confere que `finalidade` é ignorada.
- `SearchMap`: o mini card ganha `SalvarNaPasta` e um botão de fechar. No celular (`max-width:1023px`) usa `fixed` com `bottom` igual à altura atual da gaveta.
- `GavetaMapa`: pontos de encaixe em 12%, 50% e 92% da altura, com `pointer` events e momentum simples. O estado expõe a altura para o mapa calcular o padding.
- Molde da Home em `site-dobra`: `padding` igual ao CSS novo (12 px embaixo do topo, 80 px nas categorias), depois a função é publicada.
- Google Ads: só leitura (`google_ads--search`). A proposta fica em `/mnt/documents/proposta-google-ads.md`.
