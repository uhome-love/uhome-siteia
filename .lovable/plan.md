# Página de produto do Natal no modelo da referência (Open Arvoredo)

Vale para os 10 produtos do Natal em /em-foco/:slug, inclusive pelo link do corretor.

## Ordem das seções
1. **Topo enxuto (adaptado da referência):** logo Uhome, botão "Agendar visita" e um menu de atalhos que fica preso ao rolar: Fotos, Plantas, Pagamento, Localização, Visita, Dúvidas. Sai o menu completo do site.
2. **Abertura com galeria:** fotos que se deslizam com contador (1/12), selo "Condição de Natal até 18/12" e atalhos para fotos, plantas e mapa. Abaixo: incorporadora, nome, bairro e frase curta, dormitórios, metragem, vagas, entrega, "a partir de R$ X" e "Entrada a partir de 10%".
3. **Confiança:** incorporadora e obra, 4,9 no Google com 68 avaliações, CRECI-RS 25682J.
4. **Por que o [produto]:** 3 motivos numerados, com título curto e uma linha cada.
5. **Como é:** galeria com abas Fachada, Lazer, Apartamento e Vista, a partir das legendas das fotos. Aba vazia não aparece.
6. **Escolha a planta:** um cartão por planta com metragem, vagas, preço e botão "Quero esta planta", que abre o agendamento já com a planta escolhida.
7. **Pagamento:** a condição de Natal, financiamento conforme o perfil, "Comprou, ganhou" e o aviso de valores.
8. **Onde fica:** endereço, 6 pontos próximos com o tempo de carro e "Abrir no mapa".
9. **Agende sua visita (pedido principal):** escolha do dia e do período (manhã, tarde ou noite), nome e telefone. A visita entra na agenda e no CRM pelo caminho que já existe. A mensagem de sucesso diz que um especialista confirma pelo WhatsApp.
10. **Dúvidas:** perguntas abertas e fechadas: quando fica pronto, vagas, o que vem no apartamento, pagamento e ficha técnica.
11. **Também na região:** até 3 outros produtos do Natal, primeiro os do mesmo bairro ou cidade.
12. **Rodapé curto:** Uhome Imóveis, CRECI e política de privacidade. Sai o rodapé com links.

- **Barra fixa no celular:** "Agendar visita" e "WhatsApp".
- **Fora do Natal:** a página aparece sem selo e sem condição, e "Pagamento" mostra só os preços.
- **Link do corretor:** "Agendar visita" e "WhatsApp" vão para o corretor, como hoje.

## Conteúdo
- Usar só fotos e dados oficiais já cadastrados.
- Os "3 motivos", as abas das fotos e as dúvidas são escritos produto a produto a partir dos dados da incorporadora. Valores não confirmados, como "parcelas a partir de R$ —/mês", não aparecem.
- Ao final, prints no celular de 2 produtos.

## Detalhes técnicos
- Novos campos opcionais em `produtos_foco.ficha`: `motivos[] {titulo, texto}`, `faq[] {p, r}`, `frase`, e `categoria` em cada foto da galeria (fachada/lazer/apartamento/vista). Sem mudança de tabela, só atualização dos dados dos 10 produtos.
- Topo e rodapé próprios só nesta página. As outras páginas continuam com o menu e o rodapé atuais.
- O agendamento reaproveita a gravação de `agendamentos` usada em `AgendamentoVisita`, com rastreio de origem (`leadTracking`) e os eventos do funil.
- Os eventos do funil e a captura de cliques no WhatsApp continuam funcionando.
