# Análise do Google Ads (últimos 14 dias) e próximos passos

## Como está hoje
| Campanha | Impressões | Cliques | Taxa de clique | Custo/clique | Gasto | Contatos |
|---|---|---|---|---|---|---|
| Natal Chave de Ouro | 337 | 40 | 11,9% | R$ 2,37 | R$ 94,70 | 0 |
| Investimento em Studios | 127 | 12 | 9,4% | R$ 3,31 | R$ 39,75 | 0 |
| Imóveis do Site | 763 | 54 | 7,1% | R$ 1,15 | R$ 61,87 | 1 |
| **Total** | **1.227** | **106** | **8,6%** | **R$ 1,85** | **R$ 196,32** | **1** |

## O que está bom
- Taxa de clique alta (8–12%): os anúncios por imóvel estão funcionando.
- Quem clica no Natal busca o nome do imóvel (Open Arvoredo, Golden Lake, Casa Tua, Boa Vista). É o público certo.
- Custo por clique baixo no Site (R$ 1,15).

## O que está ruim
1. **1 contato em 106 cliques (0,9%).** Para imóveis, o esperado é de 3% a 8%. A maior parte dos cliques veio antes das melhorias na página e na LIA. Ainda preciso confirmar se elas já foram publicadas.
2. **O Site perde 89% das buscas porque a verba acaba cedo.** Ele mostra o anúncio em só 10% das buscas.
3. **O Natal perde 30% das buscas por verba.** O Studios perde 23% por verba e 24% por pagar pouco por clique.
4. **Buscas ruins ainda passam:** "casas à venda em porto alegre até 200 mil", "quinto andar porto alegre comprar" e "house flipping".
5. **Grupos sem resultado:** Skyglass e Orygem tiveram impressões e nenhum clique. O Open Bosque teve 49 impressões e só 3 cliques.
6. **Studios:** 12 cliques a R$ 3,31 e nenhum contato. Parte das buscas não é de studio, como "skyglass moinhos".

## Plano
1. **Confirmar o caminho do contato.** Testar no celular o site publicado, do anúncio ao formulário, à LIA e ao CRM, e conferir se o Google registra o contato. Se o site não estiver publicado, publicar antes.
2. **Bloquear buscas ruins:** "até 200 mil", "200 mil", "quinto andar", "house" e "flipping" no Studios, além de "endereço", "vaga" e "planta baixa pdf". Com sua aprovação.
3. **Ajustar os grupos fracos.** Reescrever os anúncios do Open Bosque, do Skyglass e do Orygem com nome, bairro e oferta de Natal. No Studios, separar as buscas de investimento das buscas de nome de prédio.
4. **Extensões de ligação e de formulário** nas 3 campanhas. São mais formas de contato direto no anúncio.
5. **Mandar de volta ao Google os contatos que viraram visita.** O CRM avisa o Google, que passa a buscar pessoas parecidas com quem visitou.
6. **Verba:** não vou mexer sem um número seu. Preciso saber quanto vale para você um contato bom.
7. **Nova leitura em 7 dias**, comparando com estes números.

## Detalhes técnicos
- Números de LAST_14_DAYS. A parcela de impressões perdida vem de search_budget_lost_impression_share e search_rank_lost_impression_share.
- Negativas e anúncios entram por google_ads mutate, com cartão de aprovação. As extensões de ligação e de formulário usam assets ligados à campanha.
- O envio de visitas ao Google usa o gclid guardado no lead (já chega ao CRM) e o upload de conversões offline.

## Parte 2: páginas que convertem (celular primeiro)
As pessoas clicam, mas a página que abre não convence. Vou melhorar as 4 páginas que recebem os anúncios: página de cada imóvel do Natal, campanha Natal Chave de Ouro, Investir em Studios e busca de Porto Alegre.

**Gancho logo na primeira tela (celular)**
- Título com benefício e oferta: "Open Arvoredo: entrada a partir de 10% no Natal Chave de Ouro". Hoje o título é só o nome do imóvel.
- 3 selos curtos: bairro, fase da obra e "a partir de R$ X" (só se o imóvel tiver preço cadastrado).
- Chamada de urgência real: "Condição válida até 18/12" e o sorteio da urna com 30 presentes.
- Botão grande, fixo no rodapé do celular: "Receber tabela e condição" ao lado de um WhatsApp menor.

**Material atrativo**
- Foto principal mais leve e nítida no celular. Mostrar 3 fotos deslizáveis logo abaixo da oferta, antes de qualquer texto longo.
- "Por que este imóvel": 3 motivos curtos tirados da ficha (localização, lazer, planta). Fica no lugar do texto corrido.
- Plantas com metragem e quartos em cartões fáceis de ler.

**Oferta e motivo para deixar o contato**
- Formulário curto, só com nome e WhatsApp, e uma promessa clara: "Receba em 2 minutos a tabela atualizada, as plantas e a simulação da entrada".
- Prova de confiança perto do formulário: nota 4,9 no Google, 68 avaliações e CRECI. Preciso que você me passe o número do CRECI.
- Depois do envio: tela de obrigado com a próxima etapa ("um consultor chama você no WhatsApp") e um botão para agendar visita.

**Recuperar quem ia sair**
- Ao rolar 60% da página sem converter: um cartão discreto "Quer a tabela do [imóvel]?". Aparece uma vez por visita.
- A LIA abre já falando do imóvel e da oferta da página.

**Studios e busca de Porto Alegre**
- Studios: primeira tela com o ganho para o investidor (renda de aluguel por temporada não entra, pois o site é só de venda; usar valorização e localização), mais o formulário "Receber estudo de investimento".
- Busca: faixa no topo com "Receba os imóveis que combinam com você" e formulário curto.

**Desktop**
- Mesmo conteúdo, com o formulário fixo ao lado enquanto a pessoa rola.

**Regras mantidas**
- Nada de MCMV, preço baixo ou FGTS.
- Só imóveis da campanha.
- Contatos seguem para a Fila do CEO no CRM e contam como conversão no Google Ads.

**Como confiro**
- Teste no celular (390px) e no computador, com fotos de tela de cada página.
- Envio real até o CRM, depois apagado.
- Comparação da taxa de contato em 7 dias.

## Parte 3: imagens e materiais
- Conferir a foto principal de cada um dos 10 imóveis do Natal e da página de Studios: nitidez, enquadramento no celular, peso do arquivo e se abre rápido.
- Foto escura, cortada ou de baixa qualidade: primeiro procuro outra foto real entre as que já temos. Se não houver, faço só ajuste de luz e recorte. Nunca invento detalhes do imóvel.
- Criar uma imagem de destaque padrão para a oferta de Natal, com o selo, "entrada a partir de 10%" e a urna, usando a arte oficial da campanha. Ela vai na primeira tela e no cartão de obrigado.
- Peso das imagens: versões menores para o celular, para a primeira foto aparecer em menos de 2,5 segundos.

## Validação de ponta a ponta
1. Páginas dos 10 imóveis, Natal, Studios e busca no celular (390px) e no computador, com foto de tela antes e depois.
2. Medir a velocidade e a estabilidade da tela no celular em cada página.
3. Simular um clique do Google, com o código do anúncio, e seguir o caminho: página, formulário, LIA e WhatsApp.
4. Conferir que o contato chega ao CRM na Fila do CEO, com campanha, palavra buscada e imóvel. Conferir também que a conversão dispara para o Google Ads.
5. Apagar os dados de teste e mostrar o relatório com o que mudou.
