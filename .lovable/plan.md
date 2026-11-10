# Finalizar pendências do plano

## 1. Conferir páginas publicadas com fotos
- Abrir no celular (390px) e computador: Home, Natal, 3 produtos, busca, imóvel e link de corretor no endereço publicado.
- Checar fotos, logos, galerias, botões e LIA; corrigir o que estiver quebrado.

## 2. Comparador dos 10 empreendimentos do Natal
- Nova seção na página do Natal: tabela (computador) e cartões deslizáveis (celular) com cidade, preço "a partir de", dormitórios, entrega e condição.
- Botão "Quero as condições" por produto abre a LIA com contexto. Dados reais do cadastro, nada inventado.

## 3. Teste de contato completo
- Enviar 1 lead e 1 visita de teste ("TESTE LIA NAO LIGAR") pelo formulário e pela LIA.
- Confirmar gravação no banco, envio ao CRM (fila do CEO, com contexto) e disparo das metas do Google Ads/Analytics.
- Apagar os testes do site ao final; avisar o que precisa ser apagado no CRM.

## 4. Home e busca no celular
- Revisar 390px e 360px: primeira tela, filtros, mapa, cards, LIA, barra inferior. Corrigir desalinhamentos.

## 5. Campanha Google Search pausada
- Rascunho com: foco Natal + imóveis à venda em Porto Alegre/RS, palavras-chave (com negativas como "aluguel"), 15 títulos e 4 descrições, página de destino /campanha do Natal, meta "Lead site" e "Visita agendada".
- Apresentar para sua aprovação; só criar no Google Ads depois do ok, sempre PAUSADA (sem gasto).

## Detalhes técnicos
- Comparador em `CampanhaPage.tsx` lendo `produtos_foco`/`ficha`.
- Verificação de conversões via logs de rede no Playwright (gtag `send_to` AW-18567893155).
- Campanha via ferramenta de criação Google Ads, status PAUSED.
