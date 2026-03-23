export interface BlogPost {
  slug: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  categoria: string;
  imagem: string;
  autor: string;
  publicadoEm: string; // ISO date
  tempoLeitura: number; // minutos
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "melhores-bairros-para-morar-em-porto-alegre-2026",
    titulo: "Melhores bairros para morar em Porto Alegre em 2026: ranking atualizado",
    resumo: "Ranking completo dos bairros mais desejados de Porto Alegre em 2026, com análise de segurança, infraestrutura, preço do m² e qualidade de vida.",
    conteudo: `Escolher o bairro certo em Porto Alegre pode definir sua qualidade de vida pelos próximos anos. Com dados atualizados de 2026, analisamos cada região considerando segurança, acesso a serviços, transporte e custo-benefício.

## 1. Moinhos de Vento — o endereço mais valorizado

O bairro mais nobre de Porto Alegre combina gastronomia de alto nível, boutiques e o Parcão. O metro quadrado gira em torno de R$ 15.000 a R$ 18.000. Ideal para quem busca sofisticação e não abre mão de conveniência — supermercados, farmácias e restaurantes estão sempre a poucos passos.

**Ponto forte:** infraestrutura completa e valorização constante.
**Ponto de atenção:** trânsito intenso nos horários de pico.

## 2. Petrópolis — famílias e tradição

Colégios tradicionais, ruas arborizadas e comércio variado fazem de Petrópolis a escolha favorita de famílias. O metro quadrado fica entre R$ 9.000 e R$ 13.000, com forte demanda por apartamentos de 3 quartos.

**Ponto forte:** escolas renomadas e acesso ao Parcão.
**Ponto de atenção:** poucos empreendimentos novos, estoque limitado.

## 3. Bela Vista — panorama e praticidade

Com vista para o Guaíba em vários pontos, Bela Vista oferece edifícios mais recentes e infraestrutura moderna. O metro quadrado varia entre R$ 10.000 e R$ 14.000. A proximidade com shoppings e hospitais é um diferencial.

**Ponto forte:** empreendimentos novos com lazer completo.
**Ponto de atenção:** pouca vida noturna comparada a outros bairros nobres.

## 4. Menino Deus — o equilíbrio perfeito

Localização estratégica entre o centro e a Zona Sul, com o Parque Marinha do Brasil como quintal. O metro quadrado fica entre R$ 8.500 e R$ 11.000. Ótimo transporte público e ciclovia ao longo da orla.

**Ponto forte:** acesso fácil a qualquer região da cidade.
**Ponto de atenção:** barulho em vias principais como a Getúlio Vargas.

## 5. Jardim Botânico — natureza e universidade

A presença da UFRGS e do Jardim Botânico garante demanda constante. O metro quadrado fica entre R$ 7.500 e R$ 10.000. É o bairro preferido de estudantes, professores e profissionais remotos que valorizam um entorno verde.

**Ponto forte:** área verde preservada e atmosfera tranquila.
**Ponto de atenção:** opções de lazer noturno limitadas.

## 6. Floresta — o bairro que mais cresce

A Floresta se consolidou como polo criativo com cafés especiais, coworkings e galerias. O metro quadrado — entre R$ 6.000 e R$ 8.500 — ainda é acessível, mas a valorização anual supera 12%. Ideal para quem quer comprar antes que os preços subam mais.

**Ponto forte:** valorização acelerada e vida cultural intensa.
**Ponto de atenção:** infraestrutura urbana ainda em desenvolvimento em algumas ruas.

## 7. Tristeza — a Zona Sul acessível

Bairro residencial com forte identidade local, bons restaurantes e acesso ao Guaíba. O metro quadrado fica entre R$ 6.500 e R$ 9.000. Ideal para quem busca tranquilidade sem se afastar demais do centro.

**Ponto forte:** comunidade forte e preços competitivos.
**Ponto de atenção:** distância maior do centro comercial.

## Como escolher seu bairro ideal?

Considere três critérios: proximidade do trabalho ou escola dos filhos, perfil de vida (agitado vs. tranquilo) e orçamento real. Na Uhome, você pode filtrar imóveis por bairro e comparar opções lado a lado.`,
    categoria: "Cidade",
    imagem: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop",
    autor: "Equipe Uhome",
    publicadoEm: "2026-03-20",
    tempoLeitura: 9,
    tags: ["bairros", "Porto Alegre", "qualidade de vida", "ranking 2026"],
  },
  {
    slug: "guia-completo-comprar-apartamento-2026",
    titulo: "Guia completo para comprar apartamento em 2026: do planejamento às chaves",
    resumo: "Passo a passo atualizado com tudo que você precisa saber para comprar seu apartamento: orçamento, financiamento, documentação, vistoria e negociação.",
    conteudo: `Comprar um apartamento é a maior decisão financeira da maioria das pessoas. Este guia reúne tudo que você precisa saber em 2026 — das primeiras contas até o dia da mudança.

## Etapa 1: Planejamento financeiro

Antes de olhar qualquer anúncio, faça as contas. A parcela do financiamento não deve ultrapassar 30% da renda bruta familiar. Além do valor do imóvel, reserve entre 5% e 8% para custos extras: ITBI (3% em Porto Alegre), escritura, registro e eventuais reformas.

**Exemplo prático:** para um apartamento de R$ 600.000 com 20% de entrada, você precisa de R$ 120.000 de entrada + R$ 36.000 de ITBI + R$ 8.000 de cartório = R$ 164.000 antes do financiamento.

## Etapa 2: Defina o que você precisa

Faça uma lista com itens obrigatórios e desejáveis:

- **Obrigatórios:** número mínimo de quartos, bairro, vaga de garagem
- **Desejáveis:** andar alto, varanda, academia, vista
- **Inegociáveis:** pet-friendly, acessibilidade, proximidade de metrô/ônibus

## Etapa 3: Pesquisa de mercado

Compare pelo menos 15 a 20 imóveis antes de visitar qualquer um. Use a busca da Uhome para filtrar por bairro, preço, tamanho e número de quartos. Salve os favoritos e compare.

## Etapa 4: Visitas inteligentes

Visite os finalistas em horários diferentes — manhã, tarde e noite. Observe:

- Iluminação natural em cada cômodo
- Barulho do trânsito e dos vizinhos
- Estado de conservação das áreas comuns
- Fluxo de pessoas e segurança no entorno

## Etapa 5: Análise financeira do imóvel

Além do preço de venda, calcule o custo mensal total:

- Condomínio (peça o histórico dos últimos 12 meses — assembleia pode aprovar aumento)
- IPTU mensal
- Parcela do financiamento
- Seguro obrigatório

## Etapa 6: Financiamento

Em 2026, as taxas de juros variam entre 9% e 11,5% ao ano. Compare ao menos 3 bancos. O sistema SAC (parcelas decrescentes) costuma ser mais vantajoso no longo prazo, mas exige parcela inicial maior.

**Dica:** use o simulador de financiamento da Uhome, disponível na página de cada imóvel.

## Etapa 7: Documentação

Reúna: RG, CPF, comprovante de renda (3 meses), declaração de IR, certidões negativas, comprovante de estado civil e extrato do FGTS. Do vendedor, exija: matrícula atualizada, certidão de ônus reais e quitação de condomínio e IPTU.

## Etapa 8: Negociação

Imóveis há mais de 90 dias no mercado geralmente têm margem de negociação de 5% a 10%. Use dados comparativos de preço do bairro como argumento — a Uhome mostra o preço médio por metro quadrado de cada região.

## Etapa 9: Fechamento

Após acordo de preço: assinatura do contrato, avaliação do banco (se financiado), pagamento de ITBI, lavratura de escritura e registro no cartório de imóveis. Todo o processo leva de 45 a 90 dias.

## Erros mais comuns

- Não calcular custos extras além do valor do imóvel
- Visitar apenas uma vez e em horário favorável
- Não pesquisar o histórico do condomínio
- Comprometer mais de 35% da renda com parcelas
- Ignorar a localização em favor do acabamento interno`,
    categoria: "Guias",
    imagem: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=450&fit=crop",
    autor: "Equipe Uhome",
    publicadoEm: "2026-03-15",
    tempoLeitura: 11,
    tags: ["comprar apartamento", "guia completo", "financiamento", "2026"],
  },
  {
    slug: "quanto-custa-metro-quadrado-porto-alegre-2026",
    titulo: "Preço do metro quadrado em Porto Alegre em 2026: mapa por bairro",
    resumo: "Análise atualizada do preço do m² em cada bairro de Porto Alegre, com tendências de valorização e dicas de onde investir.",
    conteudo: `O preço do metro quadrado em Porto Alegre varia até 180% entre bairros — saber onde cada região se posiciona é essencial para tomar uma decisão inteligente, seja para morar ou investir.

## Panorama geral

O metro quadrado médio da cidade em 2026 está em R$ 9.200, uma valorização de 8% em relação ao ano anterior. A tendência de alta é puxada pela escassez de terrenos em bairros centrais e pelo aumento de custos de construção.

## Bairros mais caros (acima de R$ 12.000/m²)

- **Moinhos de Vento:** R$ 15.000 – R$ 18.000/m²
- **Bela Vista:** R$ 11.500 – R$ 14.500/m²
- **Três Figueiras:** R$ 12.000 – R$ 16.000/m²
- **Mont'Serrat:** R$ 11.000 – R$ 14.000/m²

Esses bairros oferecem infraestrutura consolidada, baixa criminalidade e alta liquidez — imóveis vendem mais rápido e mantêm valor em períodos de crise.

## Bairros intermediários (R$ 7.500 – R$ 11.000/m²)

- **Petrópolis:** R$ 9.000 – R$ 13.000/m²
- **Menino Deus:** R$ 8.500 – R$ 11.000/m²
- **Jardim Botânico:** R$ 7.500 – R$ 10.000/m²
- **Higienópolis:** R$ 8.000 – R$ 10.500/m²
- **Rio Branco:** R$ 7.500 – R$ 9.500/m²

A faixa intermediária concentra o melhor custo-benefício para famílias e apresenta valorização consistente.

## Bairros em valorização acelerada (abaixo de R$ 8.500/m²)

- **Floresta:** R$ 6.000 – R$ 8.500/m² (valorização anual: ~12%)
- **Cidade Baixa:** R$ 6.500 – R$ 8.500/m²
- **Tristeza:** R$ 6.500 – R$ 9.000/m²
- **Auxiliadora:** R$ 7.000 – R$ 9.000/m²

Esses bairros atraem investidores por terem preços ainda acessíveis com forte tendência de alta.

## O que faz um bairro valorizar?

Três fatores principais determinam a valorização:

- **Infraestrutura de transporte:** proximidade de estações de metrô, corredores de ônibus e ciclovias
- **Novos empreendimentos:** quando construtoras investem, o bairro se transforma
- **Transformação cultural:** cafés, restaurantes e espaços de coworking atraem público jovem e elevam o perfil do bairro

## Como usar esses dados na prática

Na Uhome, cada imóvel mostra o preço por metro quadrado calculado. Compare com as médias do bairro para identificar oportunidades — imóveis abaixo da média do bairro podem ser boas compras, desde que não haja razões estruturais para o desconto.`,
    categoria: "Investimento",
    imagem: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop",
    autor: "Equipe Uhome",
    publicadoEm: "2026-03-10",
    tempoLeitura: 8,
    tags: ["metro quadrado", "preço m²", "investimento", "bairros"],
  },
  {
    slug: "apartamento-ou-casa-porto-alegre",
    titulo: "Apartamento ou casa em Porto Alegre? Comparativo honesto para 2026",
    resumo: "Prós e contras de cada tipo de moradia em Porto Alegre: custos, segurança, manutenção, valorização e estilo de vida.",
    conteudo: `A eterna dúvida de quem está comprando um imóvel em Porto Alegre: apartamento ou casa? Não existe resposta universal — depende do seu momento de vida, orçamento e prioridades.

## Custos de aquisição

Em Porto Alegre, o metro quadrado de apartamentos tende a ser 15-25% mais caro que o de casas na mesma região. Porém, casas geralmente têm metragem maior, o que eleva o valor absoluto. Um apartamento de 70m² em Petrópolis custa cerca de R$ 700.000. Uma casa de 150m² na mesma região pode chegar a R$ 1.200.000.

## Custos mensais

**Apartamento:**
- Condomínio: R$ 600 a R$ 2.500/mês (dependendo da estrutura)
- IPTU: geralmente menor (unidade menor)
- Manutenção: rateada no condomínio

**Casa:**
- Sem condomínio (em rua) ou taxa de condomínio fechado
- IPTU: geralmente maior (terreno maior)
- Manutenção: 100% por sua conta (telhado, pintura externa, jardim, portão)

Na prática, os custos mensais tendem a ser similares — o que você economiza em condomínio de apartamento, gasta em manutenção de casa.

## Segurança

Porto Alegre tem índices de criminalidade que tornam a segurança um fator decisivo. Apartamentos em prédios com portaria 24h oferecem uma camada adicional de proteção. Casas em condomínios fechados oferecem segurança similar, mas casas em ruas abertas exigem investimento em câmeras, alarme e cerca elétrica.

## Espaço e flexibilidade

Casas vencem em espaço externo — quintal, churrasqueira, possibilidade de ampliação. Apartamentos compensam com áreas comuns (piscina, academia, salão de festas) que seriam caras demais para manter individualmente.

## Valorização

Historicamente em Porto Alegre, apartamentos em bairros nobres têm valorização mais previsível e liquidez maior (vendem mais rápido). Casas em condomínios fechados valorizaram fortemente no pós-pandemia, mas o mercado é mais nichado.

## Para quem é cada opção?

**Escolha apartamento se:** você trabalha no centro, valoriza praticidade, quer portaria 24h e não precisa de muito espaço externo.

**Escolha casa se:** tem família com crianças ou pets que precisam de espaço, trabalha remotamente, gosta de personalizar o ambiente e não se importa de cuidar da manutenção.

## Busque as duas opções

Na Uhome você pode filtrar por tipo de imóvel e comparar apartamentos e casas na mesma região — veja o que faz mais sentido para o seu momento.`,
    categoria: "Guias",
    imagem: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=450&fit=crop",
    autor: "Equipe Uhome",
    publicadoEm: "2026-02-28",
    tempoLeitura: 8,
    tags: ["apartamento vs casa", "comparativo", "moradia"],
  },
  {
    slug: "financiamento-imobiliario-2026-taxas-e-dicas",
    titulo: "Financiamento imobiliário em 2026: taxas atualizadas e como conseguir a melhor",
    resumo: "Panorama completo do crédito imobiliário em 2026: taxas por banco, SAC vs PRICE, uso do FGTS e estratégias para aprovação rápida.",
    conteudo: `O financiamento imobiliário continua sendo o principal caminho para a compra da casa própria no Brasil. Em 2026, as condições mudaram — entenda o cenário atual e como tirar o melhor proveito.

## Taxas de juros por banco em 2026

As taxas variam conforme seu perfil de crédito, relacionamento com o banco e valor de entrada. Média do mercado:

- **Caixa Econômica:** 8,99% a 10,49% ao ano (SFH)
- **Banco do Brasil:** 9,36% a 10,99% ao ano
- **Itaú:** 9,50% a 11,20% ao ano
- **Bradesco:** 9,49% a 11,00% ao ano
- **Santander:** 9,99% a 11,50% ao ano

**Dica:** bancos digitais e fintechs como Inter e C6 estão oferecendo taxas competitivas para imóveis até R$ 800.000.

## SAC vs. PRICE: simulação real

Para um financiamento de R$ 500.000 em 30 anos a 9,5% ao ano:

**SAC (parcelas decrescentes):**
- Primeira parcela: ~R$ 5.600
- Parcela após 15 anos: ~R$ 3.200
- Última parcela: ~R$ 1.500
- Total de juros pagos: ~R$ 620.000

**PRICE (parcelas fixas):**
- Parcela fixa: ~R$ 4.200
- Total de juros pagos: ~R$ 800.000

**Diferença:** R$ 180.000 a menos em juros no SAC. Se sua renda comporta a parcela inicial maior, o SAC é quase sempre a melhor escolha.

## FGTS: regras atualizadas

Você pode usar o FGTS para:
- Dar entrada (parcial ou total)
- Amortizar o saldo devedor (a cada 2 anos)
- Pagar parte das parcelas mensais

**Requisitos:** 3 anos de trabalho com FGTS, imóvel residencial urbano até R$ 1,5 milhão (SFH), sem outro financiamento ativo pelo SFH e sem imóvel no mesmo município.

## Como preparar sua aprovação

Comece 3 a 6 meses antes de solicitar o crédito:

- Quite pendências no SPC/Serasa
- Evite novos parcelamentos (cartão, carnê)
- Concentre recebimentos em uma conta para demonstrar renda
- Mantenha movimentação bancária regular
- Guarde os últimos 6 holerites ou pró-labores

**Autônomos:** reúna as últimas 2 declarações de IR, extratos bancários de 6 meses e contratos de prestação de serviço.

## Portabilidade: vale a pena?

Se você já tem um financiamento com taxa acima de 10,5%, a portabilidade para um banco com taxa menor pode economizar dezenas de milhares de reais. O processo é gratuito e o banco original não pode recusar.

## Simule antes de decidir

Use o simulador de financiamento da Uhome na página de cada imóvel — compare cenários com diferentes entradas e prazos para encontrar a parcela ideal.`,
    categoria: "Finanças",
    imagem: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop",
    autor: "Equipe Uhome",
    publicadoEm: "2026-02-20",
    tempoLeitura: 10,
    tags: ["financiamento", "taxas de juros", "FGTS", "2026"],
  },
  {
    slug: "como-negociar-preco-imovel",
    titulo: "Como negociar o preço de um imóvel: 8 técnicas que funcionam",
    resumo: "Estratégias testadas para conseguir desconto na compra do seu imóvel sem parecer agressivo ou perder a oportunidade.",
    conteudo: `Negociar é parte natural da compra de imóveis, mas muita gente não sabe como fazer isso de forma eficaz. Estas 8 técnicas são usadas por investidores experientes e funcionam em qualquer faixa de preço.

## 1. Pesquise o preço justo antes de tudo

Compare o preço por metro quadrado do imóvel com a média do bairro. A Uhome mostra essa informação. Se o imóvel está acima da média, você tem um argumento objetivo para negociar. Se está abaixo, pode ser uma oportunidade — não force demais.

## 2. Descubra há quanto tempo o imóvel está à venda

Imóveis há mais de 90 dias no mercado geralmente têm margem de 5% a 10%. Acima de 6 meses, a margem pode chegar a 15%. Pergunte diretamente ao corretor ou observe a data de publicação.

## 3. Identifique a motivação do vendedor

Vendedores com urgência (divórcio, mudança de cidade, necessidade financeira) são mais flexíveis. Isso não é exploração — é ajustar a negociação à realidade do mercado.

## 4. Apresente proposta por escrito

Uma proposta formal demonstra seriedade e compromisso. Inclua: valor oferecido, condições de pagamento, prazo para fechamento e validade da proposta (7 dias é razoável).

## 5. Use defeitos como argumento (com moderação)

Se a vistoria revelou problemas — infiltração, pintura desgastada, encanamento antigo — peça orçamentos de reparo e apresente ao vendedor. Não é reclamação, é realidade.

## 6. Ofereça condições favoráveis ao vendedor

Às vezes o desconto não vem do preço, mas das condições. Pagamento à vista (mesmo com financiamento, o vendedor recebe integralmente), prazo curto para escritura ou flexibilidade na data de desocupação podem valer mais que 3% de desconto.

## 7. Nunca aceite a primeira contra-proposta

Se o vendedor contrapropõe, sempre peça um tempo para pensar. A negociação é um processo — respostas imediatas sugerem que você pagaria mais.

## 8. Tenha uma alternativa (BATNA)

A melhor posição de negociação é quando você tem outras opções. Visite vários imóveis e deixe claro (sem ser agressivo) que está avaliando alternativas.

## Quanto de desconto é razoável?

Em Porto Alegre em 2026, a margem média de negociação é de 5% a 8% sobre o preço anunciado. Imóveis muito procurados (andar alto, vista, reformados) têm margem menor. Imóveis com defeitos visíveis ou em bairros com muita oferta permitem mais flexibilidade.`,
    categoria: "Guias",
    imagem: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop",
    autor: "Equipe Uhome",
    publicadoEm: "2026-02-10",
    tempoLeitura: 7,
    tags: ["negociação", "desconto", "compra de imóvel"],
  },
  {
    slug: "guia-compra-primeiro-imovel-porto-alegre",
    titulo: "Guia completo para comprar seu primeiro imóvel em Porto Alegre",
    resumo: "Tudo que você precisa saber antes de dar o primeiro passo: documentação, financiamento, bairros e dicas práticas para quem está comprando pela primeira vez.",
    conteudo: `Comprar o primeiro imóvel é uma das decisões financeiras mais importantes da vida. Em Porto Alegre, o mercado oferece oportunidades interessantes para quem está começando — mas exige planejamento.

## Defina seu orçamento real

Antes de visitar qualquer imóvel, entenda quanto você pode comprometer. A regra geral é que a parcela do financiamento não ultrapasse 30% da sua renda bruta familiar. Considere também os custos extras: ITBI (3% em POA), escritura, registro e mudança.

## Escolha o bairro certo para seu momento de vida

Porto Alegre tem perfis muito distintos de bairro. Para jovens profissionais, Cidade Baixa e Floresta oferecem vida cultural e preços acessíveis. Famílias com filhos tendem a preferir Petrópolis, Higienópolis ou Três Figueiras, onde há escolas e áreas verdes.

## Documentação necessária

Você vai precisar de: RG, CPF, comprovante de renda dos últimos 3 meses, declaração de IR, certidões negativas de débitos, comprovante de estado civil e extrato do FGTS (se pretende usá-lo).

## Financiamento: SAC ou PRICE?

No sistema SAC, as parcelas começam maiores e diminuem ao longo do tempo. No PRICE, elas são fixas. O SAC costuma ser mais vantajoso no longo prazo porque você paga menos juros totais — mas a parcela inicial é mais alta.

## Visite em horários diferentes

Um erro comum é visitar o imóvel apenas uma vez. Vá em horários diferentes — manhã, tarde e noite — para entender a iluminação natural, o barulho do trânsito e o movimento do bairro.

## Conte com apoio profissional

Uma imobiliária digital como a Uhome simplifica todo o processo: você filtra por critérios reais, agenda visitas sem burocracia e tem acompanhamento do início ao fim.`,
    categoria: "Guias",
    imagem: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=450&fit=crop",
    autor: "Equipe Uhome",
    publicadoEm: "2026-01-25",
    tempoLeitura: 7,
    tags: ["primeiro imóvel", "financiamento", "documentação"],
  },
  {
    slug: "checklist-vistoria-imovel-usado",
    titulo: "Checklist: 15 itens para verificar na vistoria de um imóvel usado",
    resumo: "Não feche negócio sem conferir esses pontos. Um guia prático para identificar problemas ocultos antes de assinar o contrato.",
    conteudo: `A vistoria é o momento mais importante da compra de um imóvel usado. Problemas não detectados podem custar milhares de reais em reformas.

## Estrutura e fundação

1. **Rachaduras nas paredes** — fissuras horizontais podem indicar problemas estruturais sérios
2. **Piso nivelado** — leve uma bolinha de gude e observe se rola para algum canto
3. **Teto e laje** — procure manchas de umidade, especialmente em apartamentos do último andar

## Hidráulica

4. **Pressão da água** — abra todas as torneiras simultaneamente e acione a descarga
5. **Infiltrações** — verifique embaixo de pias, próximo ao box e nas paredes do banheiro
6. **Aquecedor** — teste o aquecimento em todos os pontos de água quente

## Elétrica

7. **Quadro de disjuntores** — deve estar organizado e com identificação dos circuitos
8. **Tomadas** — leve um carregador de celular e teste todas as tomadas
9. **Fiação** — pergunte se é de cobre e quando foi feita a última manutenção

## Esquadrias e acabamentos

10. **Janelas** — abra e feche todas, verifique vedação e trincos
11. **Portas** — devem abrir e fechar sem arrastar no piso
12. **Azulejos** — bata com os nós dos dedos para detectar peças "ocas"

## Externos e documentação

13. **Fachada do prédio** — observe o estado geral e pergunte sobre reformas recentes
14. **Garagem** — teste manobra com seu carro, verifique se a vaga é demarcada
15. **Documentação** — solicite matrícula atualizada, certidão de ônus reais e nada consta de condomínio

## Dica final

Leve alguém de confiança — um engenheiro ou pedreiro experiente — para uma segunda opinião. O custo de uma avaliação técnica é muito menor que o de uma surpresa depois da compra.`,
    categoria: "Guias",
    imagem: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=450&fit=crop",
    autor: "Equipe Uhome",
    publicadoEm: "2026-01-15",
    tempoLeitura: 6,
    tags: ["vistoria", "imóvel usado", "checklist"],
  },
  {
    slug: "documentos-necessarios-compra-imovel",
    titulo: "Lista completa de documentos para comprar um imóvel em 2026",
    resumo: "Do comprador ao vendedor, do imóvel ao cartório: todos os documentos que você vai precisar reunir, organizados por etapa.",
    conteudo: `A burocracia é uma das partes mais temidas da compra de um imóvel. Com esta lista organizada, você evita atrasos e surpresas.

## Documentos do comprador (pessoa física)

- RG e CPF (originais e cópias)
- Comprovante de estado civil (certidão de casamento ou nascimento)
- Comprovante de renda dos últimos 3 meses
- Última declaração de Imposto de Renda com recibo
- Comprovante de residência atualizado
- Extrato do FGTS (se for usar)
- Certidão negativa de débitos federais

## Documentos do vendedor

- RG e CPF
- Certidão de casamento (se casado)
- Certidões negativas de débitos municipais, estaduais e federais
- Certidão negativa de ações cíveis e criminais
- Certidão negativa de protestos

## Documentos do imóvel

- Matrícula atualizada (máximo 30 dias)
- Certidão de ônus reais
- IPTU do ano corrente
- Certidão negativa de débitos condominiais
- Habite-se (para imóveis novos)
- Planta aprovada pela prefeitura

## Etapas do processo

1. **Proposta e negociação** — definição de preço e condições
2. **Análise de crédito** — se houver financiamento (7-15 dias)
3. **Avaliação do imóvel** — perito do banco verifica o valor (3-7 dias)
4. **Contrato** — assinatura do contrato de compra e venda
5. **Escritura** — lavrada em cartório de notas
6. **Registro** — averbação no Registro de Imóveis (15-30 dias)
7. **ITBI** — pagamento do imposto de transmissão (3% em POA)

## Quanto tempo leva tudo?

De proposta aceita a chaves na mão: 45 a 90 dias, dependendo do financiamento e da documentação. Com tudo organizado previamente, é possível encurtar para 30 dias.`,
    categoria: "Guias",
    imagem: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop",
    autor: "Equipe Uhome",
    publicadoEm: "2025-12-18",
    tempoLeitura: 6,
    tags: ["documentação", "cartório", "processo de compra"],
  },
  {
    slug: "morar-em-porto-alegre-vale-a-pena",
    titulo: "Morar em Porto Alegre em 2026: custo de vida, qualidade e o que esperar",
    resumo: "Uma análise honesta sobre o custo de vida, mobilidade, segurança e qualidade dos bairros de Porto Alegre para quem está pensando em se mudar.",
    conteudo: `Porto Alegre é a capital mais ao sul do Brasil e oferece uma combinação única de cultura, gastronomia e contato com a natureza. Mas como é realmente morar aqui em 2026?

## Custo de vida

Comparada a São Paulo e Rio, Porto Alegre tem um custo de vida 20-30% menor. Um apartamento de 2 quartos em bairro nobre como Moinhos de Vento ou Bela Vista custa entre R$ 2.800 e R$ 4.500 de aluguel. Em bairros como Cidade Baixa ou Floresta, o valor cai para R$ 1.500 a R$ 2.500.

## Mobilidade

A cidade investiu em ciclovias e corredores de ônibus nos últimos anos. O aeroporto Salgado Filho está em fase final de reabertura completa, reconectando Porto Alegre ao restante do país. O trensurb liga o centro à região metropolitana norte.

## Gastronomia e cultura

Porto Alegre tem uma cena gastronômica forte — de churrascarias tradicionais a restaurantes contemporâneos premiados. A cidade abriga o maior festival de cinema da América Latina e tem uma agenda cultural consistente ao longo do ano.

## Clima

Prepare-se para os extremos: verões acima de 35°C e invernos com mínimas próximas de 0°C. A cidade tem as quatro estações bem definidas, o que agrada quem gosta de variação climática.

## Mercado imobiliário

O metro quadrado médio está em torno de R$ 9.200, com variações significativas por bairro. Moinhos de Vento ultrapassa R$ 15.000/m², enquanto bairros emergentes como Floresta ficam em torno de R$ 7.000/m².

## Para quem é Porto Alegre?

A cidade funciona especialmente bem para famílias que buscam qualidade de vida, profissionais remotos que querem menor custo sem abrir mão de infraestrutura, e investidores atentos a mercados em valorização.`,
    categoria: "Cidade",
    imagem: "https://images.unsplash.com/photo-1598971861713-54ad09c93b3e?w=800&h=450&fit=crop",
    autor: "Equipe Uhome",
    publicadoEm: "2025-12-05",
    tempoLeitura: 7,
    tags: ["Porto Alegre", "custo de vida", "qualidade de vida"],
  },
];

export const blogCategorias = [...new Set(blogPosts.map((p) => p.categoria))];
