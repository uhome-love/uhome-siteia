# LIA do site: respostas melhores, do começo ao fim

## Objetivo
A LIA tem que responder como uma corretora experiente: saber de verdade sobre o imóvel que a pessoa está vendo, achar o imóvel certo quando a pessoa pede pelo nome, e levar à visita sem parecer robô.

## Etapa 1 - Medir antes de mexer
- Ler as conversas reais da LIA dos últimos 30 dias e marcar onde ela foi fraca (não soube responder, respondeu genérico, não achou o imóvel, perdeu o lead).
- Montar 25 conversas de teste com perguntas reais (ex.: "quanto é o condomínio do Golden Lake?", "tem studio para investir?", "aceita FGTS?", "quero 3 quartos no Petrópolis até 900 mil").
- Dar nota para as respostas de hoje. Essa nota é a base para comparar depois.

## Etapa 2 - Dar mais conhecimento para ela
- **Ficha completa do imóvel:** nova consulta com descrição, condomínio, IPTU, vagas, área, andar, diferenciais, fase da obra e entrega. Hoje ela só vê título, bairro e preço.
- **Busca pelo nome:** achar por nome de empreendimento, condomínio, endereço e construtora (hoje só por bairro, tipo e preço). "Golden Lake" e "Boa Vista Country Club" passam a ser encontrados.
- **Imóveis parecidos:** quando a pessoa gostar de um, sugerir até 3 parecidos (mesmo bairro, faixa de preço e quartos).
- **Investimento em studios:** consulta própria com os studios da página de investimento.
- Resultados ordenados pelo que mais combina com o pedido, não só pelo mais novo.

## Etapa 3 - Jeito de conversar
- Ajustar as instruções: responder primeiro a pergunta com o dado real, depois uma pergunta só; mais exemplos de boas respostas para as dúvidas mais comuns (preço, condomínio, entrega, financiamento, entrada, localização).
- Respeitar as regras de qualidade: sem destacar Minha Casa Minha Vida, preço baixo ou FGTS como chamariz; foco em Porto Alegre e Canoas.
- Quando a pessoa chega por anúncio de um imóvel, a LIA já abre falando daquele imóvel.
- Mensagem de abertura que muda conforme a página (imóvel, campanha de Natal, studios, busca).

## Etapa 4 - Chat na tela
- Mostrar "LIA está digitando" e as bolhas aparecendo uma a uma.
- Cartões clicáveis com foto, preço e link quando ela sugerir imóveis.
- Botões rápidos ("Quero visitar", "Ver parecidos", "Falar no WhatsApp").
- Se der erro, mensagem amigável com botão de WhatsApp, nunca tela travada.

## Etapa 5 - Conferir e entregar
- Rodar as 25 conversas de teste de novo e comparar as notas com a Etapa 1.
- Testar uma conversa completa no celular até a visita chegar no CRM com todo o contexto, depois apagar os dados de teste.
- Te mostrar exemplos de antes e depois.

## Detalhes técnicos
- Função `lia-chat`: novas ferramentas `detalhe_imovel`, `imoveis_parecidos`, `studios_investimento`; `buscar_imoveis` ganha busca textual (titulo, condominio, endereco_completo, incorporadora) e ordenação por relevância.
- Prompt em `prompt.ts` com exemplos (few-shot) e abertura por contexto de página/UTM; testes em `src/test/liaRegras.test.ts` ampliados.
- `LiaChat.tsx`: indicador de digitação, cartões de imóvel, botões rápidos, fallback de erro.
- Leads continuam indo ao CRM só pelos gatilhos atuais do banco.
