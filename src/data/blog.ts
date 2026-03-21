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
    publicadoEm: "2025-03-15",
    tempoLeitura: 7,
    tags: ["primeiro imóvel", "financiamento", "documentação"],
  },
  {
    slug: "melhores-bairros-para-investir-2025",
    titulo: "Os 5 bairros de Porto Alegre com maior valorização em 2025",
    resumo: "Dados do mercado mostram quais regiões estão se valorizando mais rápido e por quê. Veja onde investir com inteligência.",
    conteudo: `O mercado imobiliário de Porto Alegre vive um momento de reconfiguração. Alguns bairros tradicionais mantêm seu valor, enquanto outros estão surpreendendo com taxas de valorização acima da média.

## 1. Floresta — o bairro que mais cresce

A Floresta deixou de ser apenas "promessa" e se consolidou como polo criativo e gastronômico. Novos empreendimentos mistos (residencial + comercial) estão atraindo um público jovem e profissional. Valorização estimada: 12% ao ano.

## 2. Menino Deus — equilíbrio perfeito

Localização central, parque Marinha do Brasil e infraestrutura completa. Menino Deus combina qualidade de vida com acesso rápido ao centro. Imóveis com 2 e 3 quartos lideram a demanda.

## 3. Petrópolis — tradição que não envelhece

O bairro mantém sua posição como um dos mais desejados para famílias. A proximidade com colégios tradicionais e o comércio consolidado sustentam a demanda constante.

## 4. Cidade Baixa — resiliência e cultura

Apesar de momentos de oscilação, a Cidade Baixa segue atraindo investidores que apostam em aluguel por temporada e studios compactos. O perfil boêmio garante alta taxa de ocupação.

## 5. Jardim Botânico — natureza e universidade

A presença da UFRGS e do Jardim Botânico criam uma demanda perene por moradia. Apartamentos de 1 quarto são os mais procurados nesta região.

## Como escolher onde investir?

Avalie três fatores: infraestrutura existente, projetos de urbanização em andamento e perfil de demanda (moradia vs. investimento). A Uhome pode ajudar com dados reais do mercado.`,
    categoria: "Investimento",
    imagem: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop",
    autor: "Equipe Uhome",
    publicadoEm: "2025-02-28",
    tempoLeitura: 6,
    tags: ["investimento", "valorização", "bairros"],
  },
  {
    slug: "financiamento-imobiliario-tudo-que-voce-precisa-saber",
    titulo: "Financiamento imobiliário: taxas, prazos e como se preparar",
    resumo: "Entenda como funciona o financiamento bancário, quais as melhores taxas do mercado e o que fazer para ter seu crédito aprovado rapidamente.",
    conteudo: `O financiamento imobiliário é o caminho mais comum para a compra de imóveis no Brasil. Em 2025, as condições estão competitivas, mas exigem preparação.

## Como funciona o financiamento

Você paga uma entrada (geralmente 20% do valor) e financia o restante em até 35 anos. O banco usa o imóvel como garantia (alienação fiduciária), o que reduz o risco e permite taxas menores.

## Taxas de juros atuais

As taxas variam entre 8,5% e 11% ao ano, dependendo do banco e do seu perfil de crédito. Quem tem relacionamento com o banco e boa pontuação de crédito consegue condições melhores.

## FGTS: quando e como usar

Você pode usar o FGTS para dar entrada, amortizar ou liquidar o financiamento, desde que: o imóvel seja residencial, urbano, até R$ 1,5 milhão (para SFH), e você não tenha outro financiamento ativo pelo SFH.

## Preparação para aprovação

Três meses antes de solicitar o crédito: quite dívidas pendentes, mantenha seu nome limpo, evite parcelamentos novos e organize seus comprovantes de renda. Autônomos devem preparar declarações de IR e extratos bancários.

## SAC vs. PRICE na prática

Com um financiamento de R$ 500 mil em 30 anos a 9,5% ao ano:
- **SAC**: primeira parcela ~R$ 5.600, última ~R$ 1.500
- **PRICE**: parcela fixa ~R$ 4.200

No SAC você paga ~R$ 180 mil a menos em juros totais.

## Simulação gratuita

A Uhome oferece um simulador de financiamento integrado na página de cada imóvel. Teste diferentes cenários antes de visitar o banco.`,
    categoria: "Finanças",
    imagem: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop",
    autor: "Equipe Uhome",
    publicadoEm: "2025-02-10",
    tempoLeitura: 8,
    tags: ["financiamento", "FGTS", "taxas de juros"],
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
    publicadoEm: "2025-01-22",
    tempoLeitura: 6,
    tags: ["vistoria", "imóvel usado", "checklist"],
  },
  {
    slug: "morar-em-porto-alegre-vale-a-pena",
    titulo: "Morar em Porto Alegre em 2025: custo de vida, qualidade e o que esperar",
    resumo: "Uma análise honesta sobre o custo de vida, mobilidade, segurança e qualidade dos bairros de Porto Alegre para quem está pensando em se mudar.",
    conteudo: `Porto Alegre é a capital mais ao sul do Brasil e oferece uma combinação única de cultura, gastronomia e contato com a natureza. Mas como é realmente morar aqui em 2025?

## Custo de vida

Comparada a São Paulo e Rio, Porto Alegre tem um custo de vida 20-30% menor. Um apartamento de 2 quartos em bairro nobre como Moinhos de Vento ou Bela Vista custa entre R$ 2.500 e R$ 4.000 de aluguel. Em bairros como Cidade Baixa ou Floresta, o valor cai para R$ 1.200 a R$ 2.200.

## Mobilidade

A cidade investiu em ciclovias e corredores de ônibus nos últimos anos. O aeroporto Salgado Filho, após reformas, reconectou Porto Alegre ao restante do país. O trensurb liga o centro à região metropolitana norte.

## Gastronomia e cultura

Porto Alegre tem uma cena gastronômica forte — de churrascarias tradicionais a restaurantes contemporâneos premiados. A cidade abriga o maior festival de cinema da América Latina e tem uma agenda cultural consistente ao longo do ano.

## Clima

Prepare-se para os extremos: verões acima de 35°C e invernos com mínimas próximas de 0°C. A cidade tem as quatro estações bem definidas, o que agrada quem gosta de variação climática.

## Mercado imobiliário

O metro quadrado médio está em torno de R$ 8.500, com variações significativas por bairro. Moinhos de Vento ultrapassa R$ 14.000/m², enquanto bairros emergentes como Floresta ficam em torno de R$ 6.500/m².

## Para quem é Porto Alegre?

A cidade funciona especialmente bem para famílias que buscam qualidade de vida, profissionais remotos que querem menor custo sem abrir mão de infraestrutura, e investidores atentos a mercados em valorização.`,
    categoria: "Cidade",
    imagem: "https://images.unsplash.com/photo-1598971861713-54ad09c93b3e?w=800&h=450&fit=crop",
    autor: "Equipe Uhome",
    publicadoEm: "2025-01-08",
    tempoLeitura: 7,
    tags: ["Porto Alegre", "custo de vida", "qualidade de vida"],
  },
  {
    slug: "documentos-necessarios-compra-imovel",
    titulo: "Lista completa de documentos para comprar um imóvel em 2025",
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
    publicadoEm: "2024-12-18",
    tempoLeitura: 6,
    tags: ["documentação", "cartório", "processo de compra"],
  },
];

export const blogCategorias = [...new Set(blogPosts.map((p) => p.categoria))];
